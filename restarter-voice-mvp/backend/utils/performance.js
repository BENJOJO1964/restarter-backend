const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      startTime: Date.now()
    };
    
    this.logFile = path.join(__dirname, '../logs/performance.log');
    this.ensureLogDirectory();
  }

  // 確保日誌目錄存在
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // 記錄請求開始
  startRequest(req, res, next) {
    req.startTime = Date.now();
    req.requestId = this.generateRequestId();
    
    // 添加請求ID到響應頭
    res.setHeader('X-Request-ID', req.requestId);
    
    // 記錄請求信息
    this.logRequest(req);
    
    next();
  }

  // 記錄請求結束
  endRequest(req, res, next) {
    const endTime = Date.now();
    const responseTime = endTime - req.startTime;
    
    // 更新指標
    this.metrics.requests++;
    this.metrics.responseTimes.push(responseTime);
    
    // 記錄響應信息
    this.logResponse(req, res, responseTime);
    
    // 如果響應時間超過閾值，記錄警告
    if (responseTime > 2000) {
      this.logWarning(`Slow response: ${responseTime}ms for ${req.method} ${req.path}`);
    }
    
    next();
  }

  // 記錄錯誤
  logError(error, req) {
    this.metrics.errors++;
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      requestId: req?.requestId || 'unknown',
      method: req?.method || 'unknown',
      path: req?.path || 'unknown',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      userAgent: req?.headers['user-agent'],
      ip: req?.ip || req?.connection?.remoteAddress
    };
    
    this.writeLog(errorLog);
  }

  // 記錄請求
  logRequest(req) {
    const requestLog = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'REQUEST',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection?.remoteAddress
    };
    
    this.writeLog(requestLog);
  }

  // 記錄響應
  logResponse(req, res, responseTime) {
    const responseLog = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'RESPONSE',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: responseTime,
      contentLength: res.get('content-length') || 0
    };
    
    this.writeLog(responseLog);
  }

  // 記錄警告
  logWarning(message) {
    const warningLog = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: message
    };
    
    this.writeLog(warningLog);
  }

  // 寫入日誌
  writeLog(logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(this.logFile, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  // 生成請求ID
  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 獲取性能統計
  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    const avgResponseTime = this.metrics.responseTimes.length > 0 
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length 
      : 0;
    
    const sortedTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
    
    return {
      uptime: {
        total: uptime,
        formatted: this.formatUptime(uptime)
      },
      requests: {
        total: this.metrics.requests,
        errors: this.metrics.errors,
        successRate: this.metrics.requests > 0 
          ? ((this.metrics.requests - this.metrics.errors) / this.metrics.requests * 100).toFixed(2) + '%'
          : '0%'
      },
      responseTime: {
        average: Math.round(avgResponseTime),
        p95: p95,
        p99: p99,
        min: Math.min(...this.metrics.responseTimes) || 0,
        max: Math.max(...this.metrics.responseTimes) || 0
      },
      requestsPerMinute: this.calculateRequestsPerMinute()
    };
  }

  // 格式化運行時間
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // 計算每分鐘請求數
  calculateRequestsPerMinute() {
    const uptimeMinutes = (Date.now() - this.metrics.startTime) / 1000 / 60;
    return uptimeMinutes > 0 ? (this.metrics.requests / uptimeMinutes).toFixed(2) : '0';
  }

  // 重置指標
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      startTime: Date.now()
    };
  }

  // 清理舊日誌
  cleanupOldLogs(daysToKeep = 7) {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    if (fs.existsSync(this.logFile)) {
      const stats = fs.statSync(this.logFile);
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(this.logFile);
        console.log('Old performance log cleaned up');
      }
    }
  }

  // 獲取健康檢查數據
  getHealthCheck() {
    const stats = this.getStats();
    const isHealthy = stats.requests.successRate > 95 && stats.responseTime.average < 2000;
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: stats,
      checks: {
        successRate: stats.requests.successRate > 95,
        responseTime: stats.responseTime.average < 2000,
        uptime: (Date.now() - this.metrics.startTime) > 60000 // 至少運行1分鐘
      }
    };
  }
}

// 創建單例實例
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
