require('dotenv').config({ path: __dirname + '/.env' });
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_dLgquqs9_PhX32DutRnPrtSgJP35kNCiy');
    console.log('✅ Resend 郵件服務已初始化');
  }

  async sendEmail(mailOptions) {
    try {
      console.log('📤 準備發送郵件...');
      console.log('發送者:', mailOptions.from);
      console.log('收件者:', mailOptions.to);
      console.log('主旨:', mailOptions.subject);
      
      // 使用 Resend API 發送郵件
      const result = await this.resend.emails.send({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });

      console.log('📊 Resend API 回應:');
      console.log('完整回應:', JSON.stringify(result, null, 2));
      console.log('回應類型:', typeof result);
      console.log('是否有 data 屬性:', 'data' in result);
      console.log('data 內容:', result.data);
      console.log('郵件ID:', result.data?.id);
      console.log('錯誤:', result.error);
      
      if (result.data?.id) {
        console.log('✅ 郵件發送成功 (Resend)');
        console.log('郵件ID:', result.data.id);
        
        return {
          success: true,
          service: 'Resend',
          messageId: result.data.id
        };
      } else if (result.error) {
        console.log('❌ Resend API 錯誤:', result.error);
        return {
          success: false,
          service: 'Resend',
          error: result.error
        };
      } else {
        console.log('⚠️ 郵件可能發送成功，但沒有返回 ID');
        return {
          success: true,
          service: 'Resend',
          messageId: 'unknown'
        };
      }
    } catch (error) {
      console.error('❌ Resend 郵件發送失敗:', error.message);
      console.error('錯誤類型:', error.constructor.name);
      console.error('錯誤堆疊:', error.stack);
      
      // 記錄到本地文件作為備用
      this.logFailedEmail(mailOptions, error.message);
      
      return {
        success: false,
        service: 'Resend',
        error: error.message
      };
    }
  }

  async testAllServices() {
    console.log('🧪 測試 Resend 郵件服務...');
    
    const testMailOptions = {
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'rbben521@gmail.com',
      subject: '🧪 Resend 郵件服務測試',
      html: `
        <div style="font-size:16px;line-height:1.7;max-width:600px;margin:0 auto;">
          <h2 style="color:#6B5BFF;margin-bottom:20px;">🧪 郵件服務測試</h2>
          <div style="background:#f7f8fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 15px 0;"><strong>服務：</strong>Resend</p>
            <p style="margin:0 0 15px 0;"><strong>時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
            <p style="margin:0 0 15px 0;"><strong>狀態：</strong>測試中</p>
          </div>
          <div style="text-align:center;color:#666;font-size:14px;">
            此郵件由 Restarter 郵件服務測試系統自動發送
          </div>
        </div>
      `
    };

    return await this.sendEmail(testMailOptions);
  }

  logFailedEmail(mailOptions, error) {
    try {
      const fs = require('fs');
      const path = require('path');
      const failedEmailsFile = path.join(__dirname, '../data/failed-emails.json');
      
      const failedEmail = {
        timestamp: new Date().toISOString(),
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        error: error,
        service: 'Resend'
      };

      let failedEmails = [];
      if (fs.existsSync(failedEmailsFile)) {
        const fileContent = fs.readFileSync(failedEmailsFile, 'utf8');
        failedEmails = JSON.parse(fileContent);
      }

      failedEmails.push(failedEmail);
      fs.writeFileSync(failedEmailsFile, JSON.stringify(failedEmails, null, 2));
      
      console.log('📝 失敗的郵件已記錄到本地文件');
    } catch (logError) {
      console.error('❌ 記錄失敗郵件時出錯:', logError.message);
    }
  }
}

module.exports = EmailService; 