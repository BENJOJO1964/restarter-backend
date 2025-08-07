#!/usr/bin/env python3
"""
Render GPU Service for SadTalker
專門在Render GPU實例上運行的SadTalker服務
"""

import os
import sys
import json
import time
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
from pathlib import Path

# 添加SadTalker路徑
sys.path.append('/opt/render/project/src/SadTalker')

from src.utils.preprocess import CropAndExtract
from src.facerender.animate import AnimateFromCoeff
from src.utils.init_path import init_path
from src.utils.safetensor_helper import load_x_from_safetensor
import safetensors.torch

app = Flask(__name__)
CORS(app)

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局變量
device = 'cuda' if torch.cuda.is_available() else 'cpu'
sadtalker_paths = None
preprocess_model = None
animate_from_coeff = None

def init_models():
    """初始化模型"""
    global sadtalker_paths, preprocess_model, animate_from_coeff
    
    logger.info("正在初始化模型...")
    
    # 初始化路徑
    sadtalker_paths = init_path()
    
    # 初始化預處理模型
    preprocess_model = CropAndExtract(sadtalker_paths, device)
    
    # 初始化動畫模型
    animate_from_coeff = AnimateFromCoeff(sadtalker_paths, device)
    
    logger.info("模型初始化完成！")

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查"""
    return jsonify({
        'status': 'ok',
        'device': device,
        'gpu_available': torch.cuda.is_available(),
        'gpu_name': torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'
    })

@app.route('/generate', methods=['POST'])
def generate_video():
    """生成視頻的API端點"""
    try:
        # 獲取請求數據
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有收到數據'}), 400
        
        # 提取參數
        image_path = data.get('image_path')
        audio_path = data.get('audio_path')
        result_dir = data.get('result_dir')
        pose_style = data.get('pose_style', 0)
        size = data.get('size', 128)  # 默認使用快速模式
        preprocess = data.get('preprocess', 'crop')
        
        if not all([image_path, audio_path, result_dir]):
            return jsonify({'error': '缺少必要參數'}), 400
        
        logger.info(f"開始生成視頻: {image_path} + {audio_path}")
        
        # 創建結果目錄
        os.makedirs(result_dir, exist_ok=True)
        
        # 預處理圖片
        logger.info("正在預處理圖片...")
        first_coeff_path, crop_pic_path, crop_info = preprocess_model.generate(
            image_path, 
            result_dir, 
            preprocess, 
            source_image_flag=True, 
            pic_size=size
        )
        
        # 生成動畫
        logger.info("正在生成動畫...")
        animate_from_coeff.generate(
            {
                'source_image': crop_pic_path,
                'source_semantics': first_coeff_path,
                'target_semantics': first_coeff_path,
                'audio_path': audio_path,
                'video_name': 'generated_video',
                'frame_num': 25 * 10  # 10秒視頻
            },
            result_dir,
            crop_pic_path,
            crop_info,
            enhancer=None,  # 禁用增強器以提高速度
            background_enhancer=None,
            preprocess=preprocess,
            img_size=size
        )
        
        # 返回結果
        video_path = os.path.join(result_dir, 'generated_video.mp4')
        
        if os.path.exists(video_path):
            return jsonify({
                'success': True,
                'video_path': video_path,
                'message': '視頻生成成功'
            })
        else:
            return jsonify({'error': '視頻生成失敗'}), 500
            
    except Exception as e:
        logger.error(f"生成視頻時發生錯誤: {str(e)}")
        return jsonify({'error': f'生成失敗: {str(e)}'}), 500

@app.route('/optimize', methods=['POST'])
def optimize_settings():
    """優化設置的API端點"""
    try:
        data = request.get_json()
        size = data.get('size', 128)
        
        # 根據大小返回優化建議
        if size == 64:
            return jsonify({
                'speed': '極快',
                'quality': '基礎',
                'time': '30秒-1分鐘'
            })
        elif size == 128:
            return jsonify({
                'speed': '快速',
                'quality': '良好',
                'time': '1-3分鐘'
            })
        elif size == 256:
            return jsonify({
                'speed': '標準',
                'quality': '優秀',
                'time': '3-5分鐘'
            })
        else:
            return jsonify({
                'speed': '慢',
                'quality': '最佳',
                'time': '5-10分鐘'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 初始化模型
    init_models()
    
    # 啟動服務
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
