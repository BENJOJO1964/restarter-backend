#!/bin/bash

echo "🛑 Restarter 服務器停止腳本"
echo "=============================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止後端服務器
echo -e "\n${YELLOW}🛑 停止後端服務器...${NC}"
if pkill -f "node server.js" 2>/dev/null; then
    echo -e "${GREEN}✅ 後端服務器已停止${NC}"
else
    echo -e "${YELLOW}⚠️  後端服務器未運行或已停止${NC}"
fi

# 停止前端服務器
echo -e "\n${YELLOW}🛑 停止前端服務器...${NC}"
if pkill -f "npm run dev" 2>/dev/null; then
    echo -e "${GREEN}✅ 前端服務器已停止${NC}"
else
    echo -e "${YELLOW}⚠️  前端服務器未運行或已停止${NC}"
fi

# 停止Vite進程
echo -e "\n${YELLOW}🛑 停止Vite進程...${NC}"
if pkill -f "vite" 2>/dev/null; then
    echo -e "${GREEN}✅ Vite進程已停止${NC}"
else
    echo -e "${YELLOW}⚠️  Vite進程未運行或已停止${NC}"
fi

# 等待進程完全停止
echo -e "\n${BLUE}⏳ 等待進程完全停止...${NC}"
sleep 3

# 檢查端口是否已釋放
echo -e "\n${YELLOW}🔍 檢查端口狀態...${NC}"
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${RED}❌ 端口 3001 仍被佔用${NC}"
    lsof -i :3001
else
    echo -e "${GREEN}✅ 端口 3001 已釋放${NC}"
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ 端口 5173 仍被佔用${NC}"
    lsof -i :5173
else
    echo -e "${GREEN}✅ 端口 5173 已釋放${NC}"
fi

# 檢查是否還有相關進程
echo -e "\n${YELLOW}🔍 檢查剩餘進程...${NC}"
REMAINING_PROCESSES=$(pgrep -f "node server.js\|npm run dev\|vite" 2>/dev/null)
if [ -z "$REMAINING_PROCESSES" ]; then
    echo -e "${GREEN}✅ 所有相關進程已停止${NC}"
else
    echo -e "${YELLOW}⚠️  仍有進程運行:${NC}"
    echo "$REMAINING_PROCESSES"
    echo -e "${YELLOW}💡 如需強制停止，請運行: pkill -9 -f 'node server.js\|npm run dev\|vite'${NC}"
fi

echo ""
echo -e "${GREEN}🎉 服務器停止完成！${NC}"
echo ""
echo -e "${YELLOW}📋 下次啟動命令：${NC}"
echo "   ./start-servers-with-mobile.sh"
echo "" 