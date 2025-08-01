require('dotenv').config({ path: __dirname + '/.env' });
const EmailService = require('./services/email-service');

console.log('=== 郵件服務測試 ===');
console.log('環境變數檢查:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***已設定***' : '未設定');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***已設定***' : '未設定');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '***已設定***' : '未設定');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***已設定***' : '未設定');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

async function testEmailService() {
  try {
    console.log('\n🧪 初始化郵件服務...');
    const emailService = new EmailService();
    
    console.log('\n🧪 測試所有郵件服務...');
    const result = await emailService.testAllServices();
    
    console.log('\n📊 測試結果:');
    console.log('成功:', result.success);
    console.log('服務:', result.service);
    if (result.messageId) {
      console.log('郵件ID:', result.messageId);
    }
    if (result.error) {
      console.log('錯誤:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 郵件服務測試失敗:', error);
    return { success: false, error: error.message };
  }
}

testEmailService(); 