require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

console.log('=== 註冊頁面 Email 配置測試 ===');
console.log('環境變數檢查:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***已設定***' : '未設定');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***已設定***' : '未設定');

// 模擬註冊頁面的 email 配置
const createTransporter = () => {
  // 如果設定了自定義 SMTP 設定，使用自定義設定
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    console.log('使用自定義 SMTP 配置');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // 預設使用 Gmail 專業設定
  console.log('使用 Gmail 服務配置');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'noreply.restarter@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });
};

async function testRegistrationEmail() {
  try {
    const transporter = createTransporter();
    
    console.log('\n正在測試 SMTP 連接...');
    
    // 驗證連接
    await transporter.verify();
    console.log('✅ SMTP 連接成功！');

    // 發送測試郵件
    const mailOptions = {
      from: `Restarter <${process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply.restarter@gmail.com'}>`,
      to: 'rbben521@gmail.com',
      subject: '🧪 註冊頁面 Email 測試 - Restarter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Restarter</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">您的個人成長夥伴</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">🧪 註冊頁面 Email 測試</h2>
            <p style="color: #666; line-height: 1.6;">
              這是一封測試郵件，用於驗證註冊頁面的 email 配置是否正常。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">123456</span>
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              <strong>測試時間：</strong>${new Date().toLocaleString('zh-TW')}<br>
              <strong>配置方式：</strong>${process.env.SMTP_HOST ? '自定義 SMTP' : 'Gmail 服務'}<br>
              <strong>發送者：</strong>${process.env.SMTP_USER || process.env.EMAIL_USER}
            </p>
          </div>
        </div>
      `
    };

    console.log('\n正在發送測試郵件...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 註冊頁面測試郵件發送成功！');
    console.log('郵件ID:', result.messageId);
    console.log('收件者:', result.accepted);
    
  } catch (error) {
    console.error('❌ 註冊頁面郵件發送失敗:');
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤代碼:', error.code);
    console.error('完整錯誤:', error);
  }
}

testRegistrationEmail(); 