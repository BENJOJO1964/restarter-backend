#!/bin/bash

echo "🚀 Restarter 全面測試腳本"
echo "================================"
echo "📅 測試時間: $(date)"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 獲取本機IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo -e "${CYAN}📱 本機IP地址: ${YELLOW}$LOCAL_IP${NC}"
echo ""

# 測試函數
test_service() {
    local name=$1
    local url=$2
    local description=$3
    local timeout=${4:-5}
    
    echo -n "🔍 測試 $name... "
    if curl -s --connect-timeout $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 失敗${NC}"
        return 1
    fi
}

test_api_response() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "🔍 測試 $name API回應... "
    response=$(curl -s --connect-timeout 5 "$url" 2>/dev/null)
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        if echo "$response" | grep -q "$expected_field"; then
            echo -e "${GREEN}✅ 正常${NC}"
            echo "   📊 回應: $response"
            return 0
        else
            echo -e "${YELLOW}⚠️  回應異常${NC}"
            echo "   📊 回應: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ 失敗${NC}"
        return 1
    fi
}

# ==================== 1. 服務器狀態檢查 ====================
echo -e "${BLUE}🔧 1. 服務器狀態檢查${NC}"
echo "----------------------------------------"

# 檢查進程
echo -e "\n${YELLOW}📊 進程狀態檢查:${NC}"
if pgrep -f "server.js" > /dev/null; then
    echo -e "   ${GREEN}✅ 後端服務器運行中${NC}"
    BACKEND_PID=$(pgrep -f "server.js")
    echo "   📋 PID: $BACKEND_PID"
else
    echo -e "   ${RED}❌ 後端服務器未運行${NC}"
fi

if pgrep -f "vite" > /dev/null; then
    echo -e "   ${GREEN}✅ 前端服務器運行中${NC}"
    FRONTEND_PID=$(pgrep -f "vite")
    echo "   📋 PID: $FRONTEND_PID"
else
    echo -e "   ${RED}❌ 前端服務器未運行${NC}"
fi

# 檢查端口
echo -e "\n${YELLOW}🔌 端口檢查:${NC}"
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ 後端端口 3001 開放${NC}"
else
    echo -e "   ${RED}❌ 後端端口 3001 未開放${NC}"
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ 前端端口 5173 開放${NC}"
else
    echo -e "   ${RED}❌ 前端端口 5173 未開放${NC}"
fi

# ==================== 2. 電腦版測試 ====================
echo -e "\n${BLUE}💻 2. 電腦版測試${NC}"
echo "----------------------------------------"

test_service "後端健康檢查" "http://localhost:3001/health" "健康檢查API"
test_api_response "後端健康檢查" "http://localhost:3001/health" "status"

test_service "前端頁面" "http://localhost:5173" "React應用"
test_service "前端API代理" "http://localhost:5173/api/tts" "API代理"

# ==================== 3. 手機版IP測試 ====================
echo -e "\n${BLUE}📱 3. 手機版IP測試${NC}"
echo "----------------------------------------"

test_service "後端API (手機版IP)" "http://$LOCAL_IP:3001/health" "手機版後端訪問"
test_api_response "後端API (手機版IP)" "http://$LOCAL_IP:3001/health" "status"

test_service "前端頁面 (手機版IP)" "http://$LOCAL_IP:5173" "手機版前端訪問"
test_service "前端API代理 (手機版IP)" "http://$LOCAL_IP:5173/api/tts" "手機版API代理"

# 測試WebSocket連接
echo -e "\n${YELLOW}🔌 WebSocket連接測試:${NC}"
if nc -z $LOCAL_IP 3001 2>/dev/null; then
    echo -e "   ${GREEN}✅ WebSocket端口可訪問${NC}"
else
    echo -e "   ${RED}❌ WebSocket端口無法訪問${NC}"
fi

# ==================== 4. API功能測試 ====================
echo -e "\n${BLUE}🔧 4. API功能測試${NC}"
echo "----------------------------------------"

# 測試主要API端點
test_service "語音轉文字API" "http://localhost:3001/api/whisper" "語音處理"
test_service "AI諮商API" "http://localhost:3001/api/gpt" "AI聊天"
test_service "語音日記API" "http://localhost:3001/api/voice-diary" "語音日記"
test_service "社群貼文API" "http://localhost:3001/api/posts" "社群功能"
test_service "里程碑API" "http://localhost:3001/api/milestones" "里程碑系統"

# ==================== 5. 手機應用配置檢查 ====================
echo -e "\n${BLUE}📱 5. 手機應用配置檢查${NC}"
echo "----------------------------------------"

# 檢查Flutter應用配置
if [ -f "mobile_app/lib/services/api_service.dart" ]; then
    echo -e "${GREEN}✅ Flutter應用配置文件存在${NC}"
    
    # 檢查API服務器地址配置
    if grep -q "$LOCAL_IP:3001" mobile_app/lib/services/api_service.dart; then
        echo -e "   ${GREEN}✅ API服務器地址已配置為: $LOCAL_IP:3001${NC}"
    else
        echo -e "   ${YELLOW}⚠️  API服務器地址可能需要更新${NC}"
    fi
else
    echo -e "${RED}❌ Flutter應用配置文件不存在${NC}"
fi

# 檢查Flutter依賴
if [ -f "mobile_app/pubspec.yaml" ]; then
    echo -e "${GREEN}✅ Flutter項目配置存在${NC}"
    
    # 檢查關鍵依賴
    if grep -q "record:" mobile_app/pubspec.yaml; then
        echo -e "   ${GREEN}✅ 音頻錄製依賴已配置${NC}"
    else
        echo -e "   ${RED}❌ 音頻錄製依賴未配置${NC}"
    fi
    
    if grep -q "http:" mobile_app/pubspec.yaml; then
        echo -e "   ${GREEN}✅ HTTP請求依賴已配置${NC}"
    else
        echo -e "   ${RED}❌ HTTP請求依賴未配置${NC}"
    fi
else
    echo -e "${RED}❌ Flutter項目配置不存在${NC}"
fi

# ==================== 6. 網絡連接性測試 ====================
echo -e "\n${BLUE}🌐 6. 網絡連接性測試${NC}"
echo "----------------------------------------"

# 測試網絡連接
echo -e "\n${YELLOW}📡 網絡連接測試:${NC}"
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ 互聯網連接正常${NC}"
else
    echo -e "   ${RED}❌ 互聯網連接異常${NC}"
fi

# 測試DNS解析
if nslookup google.com > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ DNS解析正常${NC}"
else
    echo -e "   ${RED}❌ DNS解析異常${NC}"
fi

# ==================== 7. 性能測試 ====================
echo -e "\n${BLUE}⚡ 7. 性能測試${NC}"
echo "----------------------------------------"

# 測試響應時間
echo -e "\n${YELLOW}⏱️  響應時間測試:${NC}"

# 後端響應時間
start_time=$(date +%s%N)
curl -s http://localhost:3001/health > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
echo "   📊 後端健康檢查響應時間: ${response_time}ms"

# 前端響應時間
start_time=$(date +%s%N)
curl -s http://localhost:5173 > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
echo "   📊 前端頁面響應時間: ${response_time}ms"

# ==================== 8. 測試總結 ====================
echo -e "\n${BLUE}📋 8. 測試總結${NC}"
echo "----------------------------------------"

echo -e "\n${YELLOW}📱 訪問地址:${NC}"
echo "   💻 電腦版："
echo "      - 前端: http://localhost:5173"
echo "      - 後端: http://localhost:3001"
echo ""
echo "   📱 手機版："
echo "      - 前端: http://$LOCAL_IP:5173"
echo "      - 後端: http://$LOCAL_IP:3001"

echo -e "\n${YELLOW}🔧 測試命令:${NC}"
echo "   - 啟動服務器: ./start-servers.sh"
echo "   - 停止服務器: ./stop-servers.sh"
echo "   - 快速測試: ./test-server-status.sh"

echo -e "\n${YELLOW}📱 手機版測試步驟:${NC}"
echo "   1. 確保手機和電腦在同一WiFi網絡"
echo "   2. 在手機瀏覽器中訪問: http://$LOCAL_IP:5173"
echo "   3. 測試所有功能是否正常"

echo -e "\n${GREEN}🎉 全面測試完成！${NC}"
echo "📅 測試時間: $(date)"
