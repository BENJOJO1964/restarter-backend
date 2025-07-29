const express = require('express');
const emailVerificationRouter = require('./routes/email-verification');

const app = express();
app.use(express.json());
app.use('/api/email-verification', emailVerificationRouter);

// 測試路由
app.get('/test', (req, res) => {
  res.json({ message: 'Email verification router loaded successfully' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Email verification routes:');
  console.log('- POST /api/email-verification/send-code');
  console.log('- POST /api/email-verification/verify-code');
}); 