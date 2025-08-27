module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'restarter-backend',
    environment: process.env.NODE_ENV || 'development'
  });
};
