const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // 检查是否需要构建
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.log('Building frontend...');
      try {
        execSync('npm run build', { 
          cwd: __dirname, 
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        console.log('Build completed successfully');
      } catch (error) {
        console.error('Build failed:', error);
        return res.status(500).json({ error: 'Build failed', details: error.message });
      }
    }

    // 读取构建后的文件
    const requestPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(distPath, requestPath);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'text/plain';

      res.setHeader('Content-Type', contentType);
      res.send(fs.readFileSync(filePath));
    } else {
      // 对于 SPA 路由，返回 index.html
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(indexContent);
    }
  } catch (error) {
    console.error('Error serving frontend:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
