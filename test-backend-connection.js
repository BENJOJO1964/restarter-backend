const axios = require('axios');

async function testBackendConnection() {
  console.log('🧪 測試後端連接...\n');
  
  try {
    // 測試健康檢查
    console.log('1. 測試健康檢查端點...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 健康檢查成功:', healthResponse.data);
    
    // 測試API端點
    console.log('\n2. 測試API端點...');
    const apiResponse = await axios.get('http://localhost:3001/api/hello');
    console.log('✅ API端點成功:', apiResponse.data);
    
    console.log('\n🎉 所有測試通過！後端運行正常。');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('\n💡 請確保後端服務器正在運行:');
    console.log('   cd restarter-backend && npm start');
  }
}

testBackendConnection();
