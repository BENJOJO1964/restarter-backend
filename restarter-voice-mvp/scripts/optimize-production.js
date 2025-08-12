#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionOptimizer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.frontendDir = path.join(this.projectRoot, 'frontend');
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // 主優化流程
  async optimize() {
    console.log('🚀 開始生產環境優化...\n');

    try {
      // 1. 前端優化
      await this.optimizeFrontend();
      
      // 2. 後端優化
      await this.optimizeBackend();
      
      // 3. 圖片優化
      await this.optimizeImages();
      
      // 4. 安全檢查
      await this.securityCheck();
      
      // 5. 性能測試
      await this.performanceTest();
      
      console.log('\n✅ 生產環境優化完成！');
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 優化過程中出現錯誤:', error);
      process.exit(1);
    }
  }

  // 前端優化
  async optimizeFrontend() {
    console.log('📱 前端優化...');
    
    // 檢查依賴
    console.log('  🔍 檢查依賴...');
    if (!fs.existsSync(path.join(this.frontendDir, 'node_modules'))) {
      console.log('  📦 安裝前端依賴...');
      execSync('npm install', { cwd: this.frontendDir, stdio: 'inherit' });
    }

    // 構建生產版本
    console.log('  🔨 構建生產版本...');
    execSync('npm run build', { cwd: this.frontendDir, stdio: 'inherit' });
    
    // 分析構建結果
    const distDir = path.join(this.frontendDir, 'dist');
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      const totalSize = this.calculateDirectorySize(distDir);
      console.log(`  📊 構建完成: ${files.length} 個文件, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  // 後端優化
  async optimizeBackend() {
    console.log('🔧 後端優化...');
    
    // 檢查依賴
    console.log('  🔍 檢查依賴...');
    if (!fs.existsSync(path.join(this.backendDir, 'node_modules'))) {
      console.log('  📦 安裝後端依賴...');
      execSync('npm install', { cwd: this.backendDir, stdio: 'inherit' });
    }

    // 檢查環境變數
    console.log('  🔐 檢查環境變數...');
    const envFile = path.join(this.backendDir, '.env');
    if (!fs.existsSync(envFile)) {
      console.log('  ⚠️  警告: 未找到 .env 文件');
    } else {
      console.log('  ✅ 環境變數文件存在');
    }

    // 檢查加密密鑰
    const envContent = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
    if (!envContent.includes('ENCRYPTION_KEY')) {
      console.log('  🔑 生成加密密鑰...');
      const encryptionKey = require('crypto').randomBytes(32).toString('hex');
      fs.appendFileSync(envFile, `\nENCRYPTION_KEY=${encryptionKey}\n`);
    }
  }

  // 圖片優化
  async optimizeImages() {
    console.log('🖼️  圖片優化...');
    
    try {
      // 檢查 ImageMagick
      execSync('which convert', { stdio: 'ignore' });
      console.log('  ✅ ImageMagick 已安裝');
      
      // 運行圖片優化
      const ImageOptimizer = require('./optimize-images.js');
      const optimizer = new ImageOptimizer();
      await optimizer.optimizeImages(this.projectRoot);
      
    } catch (error) {
      console.log('  ⚠️  跳過圖片優化 (需要安裝 ImageMagick)');
    }
  }

  // 安全檢查
  async securityCheck() {
    console.log('🔒 安全檢查...');
    
    // 檢查敏感文件
    const sensitiveFiles = [
      '.env',
      'package-lock.json',
      'yarn.lock',
      'node_modules'
    ];
    
    sensitiveFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} 存在`);
      } else {
        console.log(`  ⚠️  ${file} 不存在`);
      }
    });

    // 檢查開發工具
    console.log('  🔍 檢查開發工具...');
    const hasDevTools = this.checkDevTools();
    if (hasDevTools) {
      console.log('  ⚠️  發現開發工具，生產環境需要移除');
    } else {
      console.log('  ✅ 未發現開發工具');
    }
  }

  // 檢查開發工具
  checkDevTools() {
    const devTools = [
      'TokenTest',
      'test',
      'debug',
      'console.log',
      'debugger'
    ];
    
    let found = false;
    
    // 檢查前端文件
    const frontendFiles = this.getFilesRecursively(this.frontendDir, ['.tsx', '.ts', '.js']);
    frontendFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      devTools.forEach(tool => {
        if (content.includes(tool)) {
          console.log(`    ⚠️  ${file} 包含 ${tool}`);
          found = true;
        }
      });
    });
    
    return found;
  }

  // 性能測試
  async performanceTest() {
    console.log('⚡ 性能測試...');
    
    // 檢查構建大小
    const distDir = path.join(this.frontendDir, 'dist');
    if (fs.existsSync(distDir)) {
      const size = this.calculateDirectorySize(distDir);
      console.log(`  📦 構建大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
      
      if (size > 10 * 1024 * 1024) { // 10MB
        console.log('  ⚠️  構建大小超過 10MB，建議優化');
      } else {
        console.log('  ✅ 構建大小正常');
      }
    }
  }

  // 生成優化報告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: {
        frontend: {
          buildSize: this.getBuildSize(),
          dependencies: this.getDependencyCount(),
        },
        backend: {
          hasEnvFile: fs.existsSync(path.join(this.backendDir, '.env')),
          hasEncryption: true,
        },
        images: {
          optimized: this.getOptimizedImageCount(),
        },
        security: {
          devToolsFound: this.checkDevTools(),
        }
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.projectRoot, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 優化報告已生成: ${reportPath}`);
  }

  // 獲取構建大小
  getBuildSize() {
    const distDir = path.join(this.frontendDir, 'dist');
    if (fs.existsSync(distDir)) {
      return this.calculateDirectorySize(distDir);
    }
    return 0;
  }

  // 獲取依賴數量
  getDependencyCount() {
    const packageJson = path.join(this.frontendDir, 'package.json');
    if (fs.existsSync(packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      return Object.keys(pkg.dependencies || {}).length;
    }
    return 0;
  }

  // 獲取優化圖片數量
  getOptimizedImageCount() {
    const optimizedDir = path.join(this.projectRoot, 'optimized');
    if (fs.existsSync(optimizedDir)) {
      return this.countFilesRecursively(optimizedDir);
    }
    return 0;
  }

  // 生成建議
  generateRecommendations() {
    const recommendations = [];
    
    const buildSize = this.getBuildSize();
    if (buildSize > 10 * 1024 * 1024) {
      recommendations.push('考慮使用代碼分割減少初始包大小');
    }
    
    if (this.checkDevTools()) {
      recommendations.push('移除所有開發工具和調試代碼');
    }
    
    const dependencyCount = this.getDependencyCount();
    if (dependencyCount > 50) {
      recommendations.push('檢查並移除未使用的依賴');
    }
    
    return recommendations;
  }

  // 計算目錄大小
  calculateDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += this.calculateDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    });
    
    return size;
  }

  // 遞歸獲取文件
  getFilesRecursively(dir, extensions = []) {
    const files = [];
    
    function scan(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extensions.length === 0 || extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    }
    
    scan(dir);
    return files;
  }

  // 遞歸計算文件數量
  countFilesRecursively(dir) {
    let count = 0;
    
    function scan(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else {
          count++;
        }
      });
    }
    
    scan(dir);
    return count;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const optimizer = new ProductionOptimizer();
  optimizer.optimize().catch(console.error);
}

module.exports = ProductionOptimizer;
