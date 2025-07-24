#!/bin/bash

echo "🚀 Restarter 部署腳本"
echo "========================"

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    echo "❌ 錯誤：請在 restarter-voice-mvp 目錄下運行此腳本"
    exit 1
fi

echo "📦 構建前端..."
cd frontend
npm install
npm run build
cd ..

echo "✅ 前端構建完成！"
echo ""
echo "📋 部署步驟："
echo "1. 將代碼推送到 GitHub："
echo "   git add ."
echo "   git commit -m 'Deploy to Render'"
echo "   git push origin main"
echo ""
echo "2. 在 Render Dashboard 創建服務："
echo "   - 前端：Static Site"
echo "   - 後端：Web Service"
echo ""
echo "3. 配置環境變量（後端服務）："
echo "   OPENAI_API_KEY=your_key"
echo "   PLAYAI_API_KEY=your_key"
echo "   PLAYAI_USER_ID=your_id"
echo "   PLAYAI_APP_VERSION_ID=your_id"
echo "   DID_API_KEY=your_key"
echo ""
echo "4. 部署完成後測試："
echo "   - 電腦版：https://your-frontend-url.onrender.com"
echo "   - 手機版：同一個 URL"
echo ""
echo "📖 詳細指南請查看 DEPLOYMENT.md" 