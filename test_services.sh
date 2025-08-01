#!/bin/bash

echo "🚀 Restarter 服務測試腳本"
echo "=========================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試函數
test_service() {
    local name=$1
    local url=$2
    local description=$3
    
    echo -n "測試 $name... "
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 失敗${NC}"
        return 1
    fi
}

# 測試後端 API
echo -e "\n${YELLOW}📡 後端服務測試${NC}"
test_service "後端 API" "http://localhost:3001/health" "健康檢查"
test_service "後端根路徑" "http://localhost:3001/" "API 根路徑"

# 測試前端 Web
echo -e "\n${YELLOW}🌐 前端服務測試${NC}"
test_service "前端 Web" "http://localhost:5173" "React 應用"

# 測試手機版
echo -e "\n${YELLOW}📱 手機版測試${NC}"
test_service "手機版 Web" "http://localhost:8080" "Flutter Web 應用"

# 檢查進程
echo -e "\n${YELLOW}🔍 進程狀態檢查${NC}"
echo "後端進程:"
if pgrep -f "server.js" > /dev/null; then
    echo -e "  ${GREEN}✅ 後端服務器運行中${NC}"
else
    echo -e "  ${RED}❌ 後端服務器未運行${NC}"
fi

echo "前端進程:"
if pgrep -f "vite" > /dev/null; then
    echo -e "  ${GREEN}✅ 前端服務器運行中${NC}"
else
    echo -e "  ${RED}❌ 前端服務器未運行${NC}"
fi

echo "手機版進程:"
if pgrep -f "flutter" > /dev/null; then
    echo -e "  ${GREEN}✅ Flutter 應用運行中${NC}"
else
    echo -e "  ${RED}❌ Flutter 應用未運行${NC}"
fi

# 端口檢查
echo -e "\n${YELLOW}🔌 端口檢查${NC}"
echo "端口 3001 (後端):"
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 後端端口開放${NC}"
else
    echo -e "  ${RED}❌ 後端端口未開放${NC}"
fi

echo "端口 5173 (前端):"
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 前端端口開放${NC}"
else
    echo -e "  ${RED}❌ 前端端口未開放${NC}"
fi

echo "端口 8080 (手機版):"
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 手機版端口開放${NC}"
else
    echo -e "  ${RED}❌ 手機版端口未開放${NC}"
fi

echo -e "\n${YELLOW}📋 測試總結${NC}"
echo "• 後端 API: http://localhost:3001"
echo "• 前端 Web: http://localhost:5173"
echo "• 手機版 Web: http://localhost:8080"
echo ""
echo "💡 測試建議:"
echo "1. 在瀏覽器中打開前端地址測試功能"
echo "2. 使用手機或模擬器測試手機版"
echo "3. 檢查 API 端點是否正常響應" 