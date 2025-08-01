require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

console.log('=== SendGrid 註冊驗證測試 ===');
console.log('環境變數檢查:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '***已設定***' : '未設定');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('EMAIL_USER:', process.env.EMAIL_USER);

// 模擬註冊頁面的郵件配置
const createTransporter = () => {
  // 1. 優先使用 SendGrid
  if (process.env.SENDGRID_API_KEY) {
    console.log('✅ 使用 SendGrid 配置');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // 2. 使用自定義 SMTP 設定
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    console.log('✅ 使用自定義 SMTP 配置');
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
  
  // 3. 預設使用 Gmail 專業設定
  console.log('✅ 使用 Gmail 配置');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'noreply.restarter@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });
};

async function testSendGridVerification() {
  try {
    console.log('\n🧪 初始化郵件傳輸器...');
    const transporter = createTransporter();
    
    console.log('\n🧪 測試 SMTP 連接...');
    await transporter.verify();
    console.log('✅ SMTP 連接成功！');

    // 生成測試驗證碼
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('生成測試驗證碼:', verificationCode);
    
    // 發送驗證碼郵件
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply.restarter@gmail.com';
    const mailOptions = {
      from: `Restarter <${fromEmail}>`,
      to: 'rbben521@gmail.com', // 測試收件者
      subject: '🧪 SendGrid 註冊驗證測試 - Restarter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Restarter</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">您的個人成長夥伴</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">🧪 SendGrid 註冊驗證測試</h2>
            <p style="color: #666; line-height: 1.6;">
              這是一封測試郵件，用於驗證 SendGrid 是否可以用於註冊驗證功能。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${verificationCode}</span>
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              <strong>測試時間：</strong>${new Date().toLocaleString('zh-TW')}<br>
              <strong>發送者：</strong>${fromEmail}<br>
              <strong>服務：</strong>SendGrid<br>
              <strong>用途：</strong>註冊驗證測試
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>重要說明：</strong><br>
              • 此郵件用於測試 SendGrid 的註冊驗證功能<br>
              • 如果收到此郵件，說明 SendGrid 配置成功<br>
              • 可以用於實際的用戶註冊驗證
            </p>
          </div>
        </div>
      `
    };

    console.log('\n📤 發送註冊驗證測試郵件...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 註冊驗證測試郵件發送成功！');
    console.log('郵件ID:', result.messageId);
    console.log('收件者:', result.accepted);
    console.log('發送者:', fromEmail);
    
    return {
      success: true,
      messageId: result.messageId,
      service: 'SendGrid',
      verificationCode
    };
    
  } catch (error) {
    console.error('❌ SendGrid 註冊驗證測試失敗:');
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤代碼:', error.code);
    
    return {
      success: false,
      error: error.message,
      service: 'SendGrid'
    };
  }
}

testSendGridVerification(); 