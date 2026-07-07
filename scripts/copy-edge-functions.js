// 构建后处理：将源码根目录的 api/ 复制到静态导出产物的 edge-functions/ 下
// EdgeOne Makers Edge Functions 按部署根目录下的 edge-functions/ 结构生成路由，
// 源码里直接放在根目录 api/ 下（避免项目根多一层 edge-functions/），
// 构建后拷贝到 out/edge-functions/api/，使线上路由为 /api/card_data 等。
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'api');
const targetDir = path.join(projectRoot, 'out', 'edge-functions', 'api');

// 递归复制目录
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  console.log('api 目录不存在，跳过复制');
  process.exit(0);
}

copyDirRecursive(sourceDir, targetDir);
console.log('api 已复制到 out/edge-functions/api');

