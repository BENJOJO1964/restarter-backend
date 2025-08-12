#!/bin/bash

echo "🚀 Restarter 本地環境測試腳本"
echo "================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo -e "${BLUE}📱 本機IP地址: $LOCAL_IP${NC}"

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ 錯誤：請在 restarter-voice-mvp 目錄下運行此腳本${NC}"
    exit 1
fi

# 停止現有的進程
echo -e "\n${YELLOW}🛑 停止現有進程...${NC}"
pkill -f "node server.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 檢查依賴
echo -e "\n${BLUE}📦 檢查依賴...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  後端依賴未安裝，正在安裝...${NC}"
    cd backend && npm install && cd ..
else
    echo -e "${GREEN}✅ 後端依賴已安裝${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  前端依賴未安裝，正在安裝...${NC}"
    cd frontend && npm install && cd ..
else
    echo -e "${GREEN}✅ 前端依賴已安裝${NC}"
fi

# 啟動後端服務器
echo -e "\n${BLUE}🔧 啟動後端服務器...${NC}"
cd backend
PORT=3001 NODE_ENV=development TEST_MODE=true node server.js &
BACKEND_PID=$!
cd ..

# 等待後端啟動
echo "⏳ 等待後端服務器啟動..."
sleep 5

# 檢查後端是否正常運行
echo -e "\n${BLUE}🔍 測試後端服務...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ 後端服務器啟動成功 (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}   - 本地訪問: http://localhost:3001${NC}"
    echo -e "${GREEN}   - 手機訪問: http://$LOCAL_IP:3001${NC}"
else
    echo -e "${RED}❌ 後端服務器啟動失敗${NC}"
    exit 1
fi

# 測試後端API端點
echo -e "\n${BLUE}🔍 測試後端API端點...${NC}"
API_ENDPOINTS=(
    "/api/quotes"
    "/api/scenarios"
    "/api/coaching"
    "/api/mind-garden"
    "/api/mission-ai"
    "/api/story"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    if curl -s "http://localhost:3001$endpoint" > /dev/null; then
        echo -e "${GREEN}✅ $endpoint - 正常${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint - 可能需要配置${NC}"
    fi
done

# 啟動前端服務器
echo -e "\n${BLUE}🔧 啟動前端服務器...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端啟動
echo "⏳ 等待前端服務器啟動..."
sleep 8

# 檢查前端是否正常運行
echo -e "\n${BLUE}🔍 測試前端服務...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端服務器啟動成功 (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}   - 本地訪問: http://localhost:5173${NC}"
    echo -e "${GREEN}   - 手機訪問: http://$LOCAL_IP:5173${NC}"
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
    echo -e "${YELLOW}   請檢查防火牆設置${NC}"
fi

if curl -s http://$LOCAL_IP:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端頁面 (手機版IP) - 可訪問${NC}"
else
    echo -e "${RED}❌ 前端頁面 (手機版IP) - 無法訪問${NC}"
    echo -e "${YELLOW}   請檢查防火牆設置${NC}"
fi

# 檢查Flutter應用配置
echo -e "\n${BLUE}📱 檢查Flutter應用配置...${NC}"
if [ -f "mobile_app/lib/services/api_service.dart" ]; then
    if grep -q "$LOCAL_IP:3001" mobile_app/lib/services/api_service.dart; then
        echo -e "${GREEN}✅ Flutter API配置正確${NC}"
    else
        echo -e "${YELLOW}⚠️  Flutter API配置需要更新${NC}"
        echo -e "${YELLOW}   當前配置: $(grep 'baseUrl' mobile_app/lib/services/api_service.dart)${NC}"
        echo -e "${YELLOW}   建議更新為: $LOCAL_IP:3001${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Flutter配置文件不存在${NC}"
fi

# 測試WebSocket連接
echo -e "\n${BLUE}🔌 測試WebSocket連接...${NC}"
if command -v websocat >/dev/null 2>&1; then
    echo -e "${GREEN}✅ WebSocket工具可用${NC}"
    echo -e "${YELLOW}   可以測試: websocat ws://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  WebSocket工具未安裝${NC}"
    echo -e "${YELLOW}   可以安裝: brew install websocat${NC}"
fi

# 顯示測試結果摘要
echo ""
echo -e "${GREEN}🎉 本地環境測試完成！${NC}"
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
echo -e "${YELLOW}🔧 其他測試命令：${NC}"
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
echo "   4. 檢查語音錄製、AI對話等功能"
echo ""
echo -e "${YELLOW}🔍 故障排除：${NC}"
echo "   - 如果手機無法訪問，檢查防火牆設置"
echo "   - 確保端口3001和5173未被其他程序佔用"
echo "   - 檢查網絡連接是否正常"
echo ""

# 保存進程ID到文件
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid
echo -e "${GREEN}✅ 進程ID已保存到 .backend_pid 和 .frontend_pid${NC}"
