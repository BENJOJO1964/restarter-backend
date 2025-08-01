#!/bin/bash

echo "📱 Restarter 手機版連接性測試"
echo "================================"

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📱 本機IP地址: $LOCAL_IP"

echo ""
echo "🔍 測試手機版連接性..."

# 測試後端API
echo "1. 測試後端API (手機版IP)..."
if curl -s --connect-timeout 5 http://$LOCAL_IP:3001/health > /dev/null; then
    echo "   ✅ 後端API可訪問"
    HEALTH_RESPONSE=$(curl -s http://$LOCAL_IP:3001/health)
    echo "   📊 健康檢查回應: $HEALTH_RESPONSE"
else
    echo "   ❌ 後端API無法訪問"
fi

# 測試前端頁面
echo ""
echo "2. 測試前端頁面 (手機版IP)..."
if curl -s --connect-timeout 5 http://$LOCAL_IP:5173 > /dev/null; then
    echo "   ✅ 前端頁面可訪問"
    PAGE_TITLE=$(curl -s http://$LOCAL_IP:5173 | grep -o '<title>[^<]*</title>' | head -1)
    echo "   📄 頁面標題: $PAGE_TITLE"
else
    echo "   ❌ 前端頁面無法訪問"
fi

# 測試API代理
echo ""
echo "3. 測試API代理..."
if curl -s --connect-timeout 5 http://$LOCAL_IP:5173/api/tts > /dev/null; then
    echo "   ✅ API代理正常工作"
else
    echo "   ❌ API代理無法訪問"
fi

# 測試WebSocket連接
echo ""
echo "4. 測試WebSocket連接..."
if nc -z $LOCAL_IP 3001 2>/dev/null; then
    echo "   ✅ WebSocket端口可訪問"
else
    echo "   ❌ WebSocket端口無法訪問"
fi

echo ""
echo "📋 手機版訪問地址："
echo "   📱 前端: http://$LOCAL_IP:5173"
echo "   🔧 後端: http://$LOCAL_IP:3001"
echo ""
echo "📱 Flutter應用配置檢查："
echo "   ✅ API服務器地址已配置為: $LOCAL_IP:3001"
echo ""
echo "🔧 測試完成！" 