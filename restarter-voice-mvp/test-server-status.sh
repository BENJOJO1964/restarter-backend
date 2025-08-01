#!/bin/bash

echo "🚀 Restarter 服務器狀態測試"
echo "================================"

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📱 本機IP地址: $LOCAL_IP"

echo ""
echo "🔍 檢查後端服務器..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 後端服務器 (localhost:3001) - 正常運行"
else
    echo "❌ 後端服務器 (localhost:3001) - 無法連接"
fi

echo ""
echo "🔍 檢查前端服務器..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服務器 (localhost:5173) - 正常運行"
else
    echo "❌ 前端服務器 (localhost:5173) - 無法連接"
fi

echo ""
echo "📱 檢查手機版IP訪問..."
if curl -s http://$LOCAL_IP:3001/health > /dev/null; then
    echo "✅ 後端服務器 ($LOCAL_IP:3001) - 手機版可訪問"
else
    echo "❌ 後端服務器 ($LOCAL_IP:3001) - 手機版無法訪問"
fi

if curl -s http://$LOCAL_IP:5173 > /dev/null; then
    echo "✅ 前端服務器 ($LOCAL_IP:5173) - 手機版可訪問"
else
    echo "❌ 前端服務器 ($LOCAL_IP:5173) - 手機版無法訪問"
fi

echo ""
echo "🌐 測試API代理..."
if curl -s http://$LOCAL_IP:5173/api/tts > /dev/null; then
    echo "✅ API代理 ($LOCAL_IP:5173/api) - 正常工作"
else
    echo "❌ API代理 ($LOCAL_IP:5173/api) - 無法連接"
fi

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
echo "🔧 測試完成！" 