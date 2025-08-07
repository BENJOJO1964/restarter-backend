#!/bin/bash

echo "🔧 開始安裝SadTalker..."

# 進入SadTalker目錄
cd SadTalker

# 檢查Python版本
python_version=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+')
echo "Python版本: $python_version"

# 安裝PyTorch (CPU版本，適合Render免費版)
echo "📦 安裝PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 安裝SadTalker依賴
echo "📦 安裝SadTalker依賴..."
pip install -r requirements.txt

# 安裝額外的依賴
echo "📦 安裝額外依賴..."
pip install opencv-python
pip install scipy
pip install tqdm
pip install yacs
pip install gfpgan
pip install realesrgan

# 下載模型（如果不存在）
if [ ! -d "checkpoints" ] || [ -z "$(ls -A checkpoints 2>/dev/null)" ]; then
    echo "📥 下載SadTalker模型..."
    bash scripts/download_models.sh
else
    echo "✅ 模型已存在，跳過下載"
fi

echo "✅ SadTalker安裝完成！"
echo "📝 注意：在Render免費版上，視頻生成會比較慢（CPU模式）"
