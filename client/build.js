const { execSync } = require('child_process');
const path = require('path');

// 设置工作目录为client目录
process.chdir(path.join(__dirname));

console.log('Building React application...');

try {
  // 运行构建命令
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}