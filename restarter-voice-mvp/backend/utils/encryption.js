const crypto = require('crypto');
require('dotenv').config();

class DataEncryption {
  constructor() {
    // 從環境變數獲取加密密鑰，如果沒有則生成一個
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY || this.generateSecretKey();
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // 生成隨機密鑰
  generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 加密數據
  encrypt(text) {
    try {
      if (!text) return null;
      
      const iv = crypto.randomBytes(this.ivLength);
      const key = crypto.scryptSync(this.secretKey, 'salt', 32);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // 返回 iv + encrypted 的組合
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // 解密數據
  decrypt(encryptedData) {
    try {
      if (!encryptedData) return null;
      
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const key = crypto.scryptSync(this.secretKey, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // 加密用戶敏感數據
  encryptUserData(userData) {
    const sensitiveFields = ['email', 'phone', 'address', 'personalNotes', 'moodData', 'voiceRecordings'];
    const encryptedData = { ...userData };
    
    sensitiveFields.forEach(field => {
      if (userData[field]) {
        encryptedData[field] = this.encrypt(userData[field]);
      }
    });
    
    return encryptedData;
  }

  // 解密用戶敏感數據
  decryptUserData(encryptedUserData) {
    const sensitiveFields = ['email', 'phone', 'address', 'personalNotes', 'moodData', 'voiceRecordings'];
    const decryptedData = { ...encryptedUserData };
    
    sensitiveFields.forEach(field => {
      if (encryptedUserData[field]) {
        decryptedData[field] = this.decrypt(encryptedUserData[field]);
      }
    });
    
    return decryptedData;
  }

  // 哈希密碼
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // 驗證密碼
  verifyPassword(password, hashedPassword) {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // 生成安全的隨機令牌
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // 生成安全的會話ID
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }
}

// 創建單例實例
const encryption = new DataEncryption();

module.exports = encryption;
