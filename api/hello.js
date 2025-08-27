module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from Restarter Backend!',
    status: 'working',
    timestamp: new Date().toISOString(),
    service: 'restarter-backend'
  });
};
