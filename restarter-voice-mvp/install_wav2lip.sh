#!/bin/bash

echo "🔧 開始安裝Wav2Lip（輕量級對嘴方案）..."

# 創建Wav2Lip目錄
mkdir -p wav2lip
cd wav2lip

# 克隆Wav2Lip
echo "📥 下載Wav2Lip..."
git clone https://github.com/Rudrabha/Wav2Lip.git .

# 安裝依賴
echo "📦 安裝依賴..."
pip install torch==1.12.1+cu113 torchvision==0.13.1+cu113 torchaudio==0.12.1 --extra-index-url https://download.pytorch.org/whl/cu113
pip install opencv-python
pip install scipy
pip install tqdm
pip install numpy
pip install librosa
pip install face-alignment
pip install dlib

# 下載預訓練模型
echo "📥 下載Wav2Lip模型..."
mkdir -p checkpoints
wget -nc https://github.com/Rudrabha/Wav2Lip/releases/download/v1.0/wav2lip.pth -O checkpoints/wav2lip.pth
wget -nc https://github.com/Rudrabha/Wav2Lip/releases/download/v1.0/wav2lip_gan.pth -O checkpoints/wav2lip_gan.pth

echo "✅ Wav2Lip安裝完成！"
echo "📝 注意：Wav2Lip比SadTalker更輕量，適合免費平台"
