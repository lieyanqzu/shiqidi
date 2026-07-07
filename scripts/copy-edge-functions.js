// 构建后处理：将 edge-functions 目录复制到静态导出产物中
// EdgeOne Makers Edge Functions 按部署根目录下的 edge-functions/ 结构生成路由，
// Next.js 静态导出（output: 'export'）不会自动复制该目录，需要手动拷贝到 out/。
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'edge-functions');
const targetDir = path.join(projectRoot, 'out', 'edge-functions');

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
  console.log('edge-functions 目录不存在，跳过复制');
  process.exit(0);
}

copyDirRecursive(sourceDir, targetDir);
console.log('edge-functions 已复制到 out/edge-functions');
