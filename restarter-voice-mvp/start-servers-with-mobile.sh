#!/bin/bash

echo "🚀 Restarter 服務器啟動腳本 (含手機版)"
echo "=========================================="

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    echo "❌ 錯誤：請在 restarter-voice-mvp 目錄下運行此腳本"
    exit 1
fi

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📱 本機IP地址: $LOCAL_IP"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止現有的進程
echo -e "\n${YELLOW}🛑 停止現有進程...${NC}"
pkill -f "node server.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 啟動後端服務器
echo -e "\n${BLUE}🔧 啟動後端服務器...${NC}"
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
    echo -e "${GREEN}✅ 後端服務器啟動成功 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ 後端服務器啟動失敗${NC}"
    exit 1
fi

# 啟動前端服務器
echo -e "\n${BLUE}🔧 啟動前端服務器...${NC}"
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
    echo -e "${GREEN}✅ 前端服務器啟動成功 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ 前端服務器啟動失敗${NC}"
    exit 1
fi

# 測試手機版IP訪問
echo -e "\n${BLUE}📱 測試手機版IP訪問...${NC}"
if curl -s http://$LOCAL_IP:3001/health > /dev/null; then
    echo -e "${GREEN}✅ 後端API (手機版IP) - 可訪問${NC}"
else
    echo -e "${RED}❌ 後端API (手機版IP) - 無法訪問${NC}"
fi

if curl -s http://$LOCAL_IP:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端頁面 (手機版IP) - 可訪問${NC}"
else
    echo -e "${RED}❌ 前端頁面 (手機版IP) - 無法訪問${NC}"
fi

# 檢查Flutter應用配置
echo -e "\n${BLUE}📱 檢查Flutter應用配置...${NC}"
if [ -f "mobile_app/lib/services/api_service.dart" ]; then
    if grep -q "$LOCAL_IP:3001" mobile_app/lib/services/api_service.dart; then
        echo -e "${GREEN}✅ Flutter API配置正確${NC}"
    else
        echo -e "${YELLOW}⚠️  Flutter API配置可能需要更新${NC}"
        echo "   建議更新為: $LOCAL_IP:3001"
    fi
else
    echo -e "${YELLOW}⚠️  Flutter配置文件不存在${NC}"
fi

echo ""
echo -e "${GREEN}🎉 所有服務器啟動完成！${NC}"
echo ""
echo -e "${YELLOW}📋 訪問地址：${NC}"
echo -e "${BLUE}💻 電腦版：${NC}"
echo "   - 前端: http://localhost:5173"
echo "   - 後端: http://localhost:3001"
echo ""
echo -e "${BLUE}📱 手機版：${NC}"
echo "   - 前端: http://$LOCAL_IP:5173"
echo "   - 後端: http://$LOCAL_IP:3001"
echo ""
echo -e "${YELLOW}🔧 測試命令：${NC}"
echo "   - 全面測試: ./comprehensive-test.sh"
echo "   - 快速測試: ./test-server-status.sh"
echo "   - 手機版測試: ./test-mobile-connectivity.sh"
echo ""
echo -e "${YELLOW}🛑 停止服務器：${NC}"
echo "   ./stop-servers.sh"
echo ""
echo -e "${YELLOW}📱 手機版測試步驟：${NC}"
echo "   1. 確保手機和電腦在同一WiFi網絡"
echo "   2. 在手機瀏覽器中訪問: http://$LOCAL_IP:5173"
echo "   3. 測試所有功能是否正常"
echo ""
