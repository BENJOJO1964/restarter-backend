require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

console.log('=== 郵件發送測試 ===');
console.log('環境變數檢查:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***已設定***' : '未設定');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

async function testEmailSend() {
  try {
    // 創建 transporter - 使用與註冊頁面相同的配置
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'noreply.restarter@gmail.com',
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('\n正在測試 SMTP 連接...');
    
    // 驗證連接
    await transporter.verify();
    console.log('✅ SMTP 連接成功！');

    // 發送測試郵件
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply.restarter@gmail.com',
      to: process.env.ADMIN_EMAIL || 'rbben521@gmail.com',
      subject: '🧪 郵件發送測試 - Restarter',
      html: `
        <div style="font-size:16px;line-height:1.7;max-width:600px;margin:0 auto;">
          <h2 style="color:#6B5BFF;margin-bottom:20px;">🧪 郵件發送測試</h2>
          <div style="background:#f7f8fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 15px 0;"><strong>測試時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
            <p style="margin:0 0 15px 0;"><strong>SMTP 主機：</strong>${process.env.SMTP_HOST}</p>
            <p style="margin:0 0 15px 0;"><strong>發送者：</strong>${process.env.EMAIL_USER}</p>
            <p style="margin:0 0 15px 0;"><strong>收件者：</strong>${process.env.ADMIN_EMAIL}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
            <p style="margin:0;"><strong>測試內容：</strong></p>
            <blockquote style="border-left:3px solid #6B5BFF;padding-left:15px;margin:15px 0;font-style:italic;">
              這是一封測試郵件，用於驗證 Restarter 意見箱的郵件發送功能是否正常。
            </blockquote>
          </div>
          <div style="text-align:center;color:#666;font-size:14px;">
            此郵件由 Restarter 郵件測試系統發送
          </div>
        </div>
      `
    };

    console.log('\n正在發送測試郵件...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 測試郵件發送成功！');
    console.log('郵件ID:', result.messageId);
    console.log('收件者:', result.accepted);
    
  } catch (error) {
    console.error('❌ 郵件發送失敗:');
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤代碼:', error.code);
    console.error('完整錯誤:', error);
  }
}

testEmailSend(); 