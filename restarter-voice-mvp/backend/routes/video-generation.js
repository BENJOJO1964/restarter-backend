const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const router = express.Router();

// 配置multer用於文件上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 生成對嘴視頻API
router.post('/generate-video', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text, pose_style = 0, size_of_image = 256, preprocess_type = 'crop' } = req.body;
    
    if (!req.files || (!req.files.image && !req.files.audio)) {
      return res.status(400).json({ error: '請上傳圖片和音頻' });
    }

    const imagePath = req.files.image ? req.files.image[0].path : null;
    const audioPath = req.files.audio ? req.files.audio[0].path : null;

    // 調用SadTalker生成視頻
    const videoPath = await generateVideo(imagePath, audioPath, text, {
      pose_style,
      size_of_image,
      preprocess_type
    });

    // 返回生成的視頻URL
    res.json({
      success: true,
      videoUrl: `/api/download-video/${path.basename(videoPath)}`,
      message: '視頻生成成功'
    });

  } catch (error) {
    console.error('視頻生成錯誤:', error);
    res.status(500).json({ error: '視頻生成失敗', details: error.message });
  }
});

// 下載生成的視頻
router.get('/download-video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(videoPath)) {
    res.download(videoPath);
  } else {
    res.status(404).json({ error: '視頻文件不存在' });
  }
});

// 調用SadTalker生成視頻的函數
async function generateVideo(imagePath, audioPath, text, options) {
  return new Promise((resolve, reject) => {
    const sadtalkerScript = path.join(__dirname, '../../SadTalker/inference.py');
    
    // 生成唯一的輸出目錄
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '../uploads', `video_${timestamp}`);
    
    const args = [
      sadtalkerScript,
      '--source_image', imagePath,
      '--driven_audio', audioPath,
      '--result_dir', outputDir,
      '--pose_style', options.pose_style.toString(),
      '--size', '128',
      '--preprocess', options.preprocess_type,
      '--expression_scale', '1.0',
      '--batch_size', '1',
      '--cpu'
    ];

    console.log('Running SadTalker with args:', args);

    const process = spawn('python', args, { cwd: path.join(__dirname, '../../SadTalker') });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      console.log('SadTalker output:', data.toString());
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('SadTalker error:', data.toString());
    });

    process.on('close', (code) => {
      console.log('SadTalker process exited with code:', code);
      if (code === 0) {
        // 查找生成的視頻文件
        const videoFile = `${outputDir}.mp4`;
        if (fs.existsSync(videoFile)) {
          resolve(videoFile);
        } else {
          reject(new Error('無法找到生成的視頻文件'));
        }
      } else {
        reject(new Error(`SadTalker執行失敗: ${errorOutput}`));
      }
    });
  });
}

module.exports = router;
