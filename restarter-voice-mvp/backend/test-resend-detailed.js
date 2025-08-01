require('dotenv').config({ path: __dirname + '/.env' });
const { Resend } = require('resend');

console.log('=== Resend API 詳細診斷 ===');
console.log('環境變數檢查:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已設定' : '未設定');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

async function testResendDetailed() {
  try {
    console.log('\n🧪 初始化 Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY || 're_dLgquqs9_PhX32DutRnPrtSgJP35kNCiy');
    
    console.log('✅ Resend 實例創建成功');
    
    console.log('\n🧪 測試發送郵件...');
    const mailOptions = {
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'rbben521@gmail.com',
      subject: '🧪 Resend 詳細診斷測試',
      html: `
        <div style="font-size:16px;line-height:1.7;max-width:600px;margin:0 auto;">
          <h2 style="color:#6B5BFF;margin-bottom:20px;">🧪 Resend 詳細診斷</h2>
          <div style="background:#f7f8fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 15px 0;"><strong>測試時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
            <p style="margin:0 0 15px 0;"><strong>API Key：</strong>${process.env.RESEND_API_KEY ? '已設定' : '未設定'}</p>
            <p style="margin:0 0 15px 0;"><strong>收件者：</strong>${process.env.ADMIN_EMAIL || 'rbben521@gmail.com'}</p>
          </div>
          <div style="text-align:center;color:#666;font-size:14px;">
            此郵件由 Resend 詳細診斷測試發送
          </div>
        </div>
      `
    };
    
    console.log('📤 發送郵件選項:', JSON.stringify(mailOptions, null, 2));
    
    const result = await resend.emails.send(mailOptions);
    
    console.log('\n📊 Resend API 回應:');
    console.log('完整回應:', JSON.stringify(result, null, 2));
    console.log('回應類型:', typeof result);
    console.log('是否有 data 屬性:', 'data' in result);
    console.log('data 內容:', result.data);
    console.log('郵件ID:', result.data?.id);
    console.log('錯誤:', result.error);
    
    if (result.data?.id) {
      console.log('✅ 郵件發送成功，ID:', result.data.id);
    } else if (result.error) {
      console.log('❌ Resend API 錯誤:', result.error);
    } else {
      console.log('⚠️ 郵件可能發送成功，但沒有返回 ID');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Resend 測試失敗:');
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤堆疊:', error.stack);
    
    if (error.response) {
      console.error('API 回應狀態:', error.response.status);
      console.error('API 回應資料:', error.response.data);
    }
    
    return { error: error.message };
  }
}

testResendDetailed().then(result => {
  console.log('\n🏁 測試完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
}); 