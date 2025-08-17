module.exports = (req, res) => {
  // Force new deployment - backend only configuration
  res.json({ 
    message: 'Hello from Vercel Backend!',
    status: 'success',
    timestamp: new Date().toISOString(),
    service: 'restarter-backend-api'
  });
};
