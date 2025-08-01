#!/bin/bash

echo "🛑 Restarter 服務器停止腳本"
echo "================================"

echo "🛑 停止後端服務器..."
pkill -f "node server.js" 2>/dev/null

echo "🛑 停止前端服務器..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "⏳ 等待進程完全停止..."
sleep 3

echo "🔍 檢查剩餘進程..."
REMAINING=$(ps aux | grep -E "(server.js|vite|npm run dev)" | grep -v grep | wc -l)
if [ $REMAINING -eq 0 ]; then
    echo "✅ 所有服務器已停止"
else
    echo "⚠️  還有 $REMAINING 個進程在運行："
    ps aux | grep -E "(server.js|vite|npm run dev)" | grep -v grep
fi

echo "🔧 停止完成！" 