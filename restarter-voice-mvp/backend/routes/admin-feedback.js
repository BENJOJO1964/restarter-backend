const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 本地意見文件路徑
const LOCAL_FEEDBACK_FILE = path.join(__dirname, '../data/local-feedback.json');

// GET /api/admin-feedback - 管理員查看本地意見
router.get('/', async (req, res) => {
  const { adminKey } = req.query;
  
  // 簡單的管理員驗證
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: '未授權存取' });
  }

  try {
    let feedbacks = [];
    
    // 從本地檔案讀取意見
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      const localFeedbacks = JSON.parse(fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8'));
      feedbacks = localFeedbacks.map(feedback => ({
        ...feedback,
        timestamp: new Date(feedback.timestamp).toLocaleString('zh-TW'),
        source: 'local'
      }));
    }
    
    // 按時間排序
    feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ 
      feedbacks,
      total: feedbacks.length,
      lastUpdated: new Date().toLocaleString('zh-TW')
    });
  } catch (error) {
    console.error('取得本地意見列表錯誤:', error);
    res.status(500).json({ error: '取得意見列表失敗' });
  }
});

// POST /api/admin-feedback/export - 匯出意見到檔案
router.post('/export', async (req, res) => {
  const { adminKey } = req.body;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: '未授權存取' });
  }

  try {
    let feedbacks = [];
    
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      feedbacks = JSON.parse(fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8'));
    }
    
    // 創建匯出檔案
    const exportData = {
      exportTime: new Date().toLocaleString('zh-TW'),
      totalFeedbacks: feedbacks.length,
      feedbacks: feedbacks.map(f => ({
        ...f,
        timestamp: new Date(f.timestamp).toLocaleString('zh-TW')
      }))
    };
    
    const exportFile = path.join(__dirname, '../data/feedback-export.json');
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    res.json({ 
      success: true, 
      message: '意見已匯出',
      exportFile: 'feedback-export.json',
      totalExported: feedbacks.length
    });
  } catch (error) {
    console.error('匯出意見錯誤:', error);
    res.status(500).json({ error: '匯出失敗' });
  }
});

module.exports = router; 