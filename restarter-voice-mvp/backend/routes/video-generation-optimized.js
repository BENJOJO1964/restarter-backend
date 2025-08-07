const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const router = express.Router();

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    cb(null, `${file.fieldname}-${timestamp}-${randomId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// 優化的視頻生成端點
router.post('/generate-video-optimized', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text, pose_style = 0, size_of_image = 64, preprocess_type = 'crop' } = req.body;
    
    if (!req.files || (!req.files.image && !req.files.audio)) {
      return res.status(400).json({ error: '請上傳圖片和音頻' });
    }

    const imagePath = req.files.image ? req.files.image[0].path : null;
    const audioPath = req.files.audio ? req.files.audio[0].path : null;

    // 使用優化的參數
    const optimizedArgs = [
      path.join(__dirname, '../../SadTalker/inference.py'),
      '--source_image', imagePath,
      '--driven_audio', audioPath,
      '--result_dir', path.join(__dirname, '../uploads', `video_${Date.now()}`),
      '--pose_style', pose_style.toString(),
      '--size', size_of_image.toString(),
      '--preprocess', preprocess_type,
      '--expression_scale', '1.0',
      '--batch_size', '1',  // 最小批次大小
      '--cpu'
    ];

    console.log('使用優化設置生成視頻:', optimizedArgs);

    // 調用優化的SadTalker
    const videoPath = await generateOptimizedVideo(optimizedArgs);
    
    res.json({
      success: true,
      videoUrl: `/api/download-video/${path.basename(videoPath)}`,
      message: '視頻生成成功（優化模式）',
      optimization: {
        size: size_of_image,
        batch_size: 1,
        estimated_time: getEstimatedTime(size_of_image)
      }
    });

  } catch (error) {
    console.error('優化視頻生成錯誤:', error);
    res.status(500).json({ error: '視頻生成失敗', details: error.message });
  }
});

// 優化的視頻生成函數
async function generateOptimizedVideo(args) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', args, { 
      cwd: path.join(__dirname, '../../SadTalker'),
      env: {
        ...process.env,
        OMP_NUM_THREADS: '1',  // 限制線程數
        MKL_NUM_THREADS: '1',
        NUMEXPR_NUM_THREADS: '1'
      }
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      console.log('優化輸出:', data.toString());
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('優化錯誤:', data.toString());
    });

    process.on('close', (code) => {
      console.log('優化進程結束，代碼:', code);
      if (code === 0) {
        // 查找生成的視頻文件
        const resultDir = args[args.indexOf('--result_dir') + 1];
        const videoFile = `${resultDir}.mp4`;
        if (fs.existsSync(videoFile)) {
          resolve(videoFile);
        } else {
          reject(new Error('無法找到生成的視頻文件'));
        }
      } else {
        reject(new Error(`優化生成失敗: ${errorOutput}`));
      }
    });
  });
}

// 獲取預估時間
function getEstimatedTime(size) {
  const timeMap = {
    64: '30秒-1分鐘',
    128: '1-2分鐘', 
    256: '2-4分鐘',
    512: '4-8分鐘'
  };
  return timeMap[size] || '2-4分鐘';
}

// 獲取優化建議
router.get('/optimization-tips', (req, res) => {
  res.json({
    tips: [
      {
        title: '快速模式（64x64）',
        description: '適合測試和快速分享',
        time: '30秒-1分鐘',
        quality: '基礎'
      },
      {
        title: '標準模式（128x128）',
        description: '平衡速度和品質',
        time: '1-2分鐘', 
        quality: '良好'
      },
      {
        title: '高品質模式（256x256）',
        description: '更好的視覺效果',
        time: '2-4分鐘',
        quality: '優秀'
      }
    ],
    recommendations: [
      '使用64x64分辨率進行快速測試',
      '選擇較小的音頻文件（<10MB）',
      '使用JPG格式的圖片（<5MB）',
      '避免複雜的背景和多人臉圖片'
    ]
  });
});

module.exports = router;
