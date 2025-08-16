module.exports = (req, res) => {
  // CORS 設置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 主頁面
  res.json({ 
    message: 'Restarter Backend API', 
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/api/tts',
      '/api/gpt', 
      '/api/whisper',
      '/api/quotes',
      '/api/coaching'
    ],
    method: req.method,
    url: req.url,
    build: 'success'
  });
};
