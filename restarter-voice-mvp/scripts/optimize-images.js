const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImageOptimizer {
  constructor() {
    this.imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    this.optimizedDir = 'optimized';
    this.quality = 85; // 壓縮質量
  }

  // 檢查是否安裝了圖片優化工具
  checkDependencies() {
    try {
      execSync('which convert', { stdio: 'ignore' });
      console.log('✅ ImageMagick 已安裝');
      return true;
    } catch (error) {
      console.log('❌ 請先安裝 ImageMagick: brew install imagemagick');
      return false;
    }
  }

  // 獲取所有圖片文件
  getImageFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (this.imageExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    }
    
    scanDirectory.call(this, dir);
    return files;
  }

  // 優化單個圖片
  optimizeImage(inputPath, outputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase();
      let command;
      
      if (ext === '.png') {
        // PNG 優化
        command = `convert "${inputPath}" -strip -quality ${this.quality} "${outputPath}"`;
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        // JPEG 優化
        command = `convert "${inputPath}" -strip -quality ${this.quality} "${outputPath}"`;
      } else if (ext === '.gif') {
        // GIF 優化
        command = `convert "${inputPath}" -strip -coalesce -layers optimize "${outputPath}"`;
      } else {
        // 其他格式直接複製
        fs.copyFileSync(inputPath, outputPath);
        return true;
      }
      
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error(`❌ 優化失敗: ${inputPath}`, error.message);
      return false;
    }
  }

  // 批量優化圖片
  async optimizeImages(sourceDir = '.') {
    if (!this.checkDependencies()) {
      return;
    }

    console.log('🔍 掃描圖片文件...');
    const imageFiles = this.getImageFiles(sourceDir);
    
    if (imageFiles.length === 0) {
      console.log('📭 沒有找到圖片文件');
      return;
    }

    console.log(`📸 找到 ${imageFiles.length} 個圖片文件`);
    
    // 創建優化目錄
    const optimizedPath = path.join(sourceDir, this.optimizedDir);
    if (!fs.existsSync(optimizedPath)) {
      fs.mkdirSync(optimizedPath, { recursive: true });
    }

    let successCount = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const imagePath of imageFiles) {
      const relativePath = path.relative(sourceDir, imagePath);
      const outputPath = path.join(optimizedPath, relativePath);
      
      // 創建輸出目錄
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 獲取原始文件大小
      const originalSize = fs.statSync(imagePath).size;
      totalOriginalSize += originalSize;

      console.log(`🔄 優化: ${relativePath}`);
      
      if (this.optimizeImage(imagePath, outputPath)) {
        const optimizedSize = fs.statSync(outputPath).size;
        totalOptimizedSize += optimizedSize;
        
        const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        console.log(`✅ 完成: ${relativePath} (減少 ${reduction}%)`);
        successCount++;
      }
    }

    // 輸出統計信息
    console.log('\n📊 優化統計:');
    console.log(`✅ 成功優化: ${successCount}/${imageFiles.length} 個文件`);
    console.log(`📦 原始大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 優化後大小: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 節省空間: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 壓縮率: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
    
    console.log(`\n📁 優化後的圖片保存在: ${optimizedPath}`);
  }

  // 生成 WebP 版本
  async generateWebP(sourceDir = '.') {
    console.log('🔄 生成 WebP 版本...');
    
    const imageFiles = this.getImageFiles(sourceDir);
    const webpDir = path.join(sourceDir, 'webp');
    
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true });
    }

    let successCount = 0;
    
    for (const imagePath of imageFiles) {
      const ext = path.extname(imagePath).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const relativePath = path.relative(sourceDir, imagePath);
        const webpPath = path.join(webpDir, relativePath.replace(ext, '.webp'));
        
        // 創建輸出目錄
        const outputDir = path.dirname(webpPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        try {
          const command = `convert "${imagePath}" -quality ${this.quality} "${webpPath}"`;
          execSync(command, { stdio: 'ignore' });
          console.log(`✅ WebP: ${relativePath}`);
          successCount++;
        } catch (error) {
          console.error(`❌ WebP 轉換失敗: ${relativePath}`);
        }
      }
    }
    
    console.log(`✅ 生成 ${successCount} 個 WebP 文件`);
  }
}

// 使用示例
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  
  const args = process.argv.slice(2);
  const sourceDir = args[0] || '.';
  const includeWebP = args.includes('--webp');
  
  console.log('🚀 開始圖片優化...');
  
  optimizer.optimizeImages(sourceDir).then(() => {
    if (includeWebP) {
      return optimizer.generateWebP(sourceDir);
    }
  }).then(() => {
    console.log('🎉 圖片優化完成！');
  }).catch(error => {
    console.error('❌ 優化過程中出現錯誤:', error);
  });
}

module.exports = ImageOptimizer;
