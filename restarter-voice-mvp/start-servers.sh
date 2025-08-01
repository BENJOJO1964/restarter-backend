#!/bin/bash

echo "🚀 Restarter 服務器啟動腳本"
echo "================================"

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    echo "❌ 錯誤：請在 restarter-voice-mvp 目錄下運行此腳本"
    exit 1
fi

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📱 本機IP地址: $LOCAL_IP"

# 停止現有的進程
echo "🛑 停止現有進程..."
pkill -f "node server.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 啟動後端服務器
echo "🔧 啟動後端服務器..."
cd backend
npm install > /dev/null 2>&1
PORT=3001 NODE_ENV=development TEST_MODE=true node server.js &
BACKEND_PID=$!
cd ..

# 等待後端啟動
echo "⏳ 等待後端服務器啟動..."
sleep 5

# 檢查後端是否正常運行
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 後端服務器啟動成功 (PID: $BACKEND_PID)"
else
    echo "❌ 後端服務器啟動失敗"
    exit 1
fi

# 啟動前端服務器
echo "🔧 啟動前端服務器..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端啟動
echo "⏳ 等待前端服務器啟動..."
sleep 8

# 檢查前端是否正常運行
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服務器啟動成功 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端服務器啟動失敗"
    exit 1
fi

echo ""
echo "🎉 所有服務器啟動完成！"
echo ""
echo "📋 訪問地址："
echo "💻 電腦版："
echo "   - 前端: http://localhost:5173"
echo "   - 後端: http://localhost:3001"
echo ""
echo "📱 手機版："
echo "   - 前端: http://$LOCAL_IP:5173"
echo "   - 後端: http://$LOCAL_IP:3001"
echo ""
echo "🔧 測試命令："
echo "   ./test-server-status.sh"
echo ""
echo "🛑 停止服務器："
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'npm run dev'"
echo ""
echo "📊 進程狀態："
ps aux | grep -E "(server.js|vite)" | grep -v grep | head -5 