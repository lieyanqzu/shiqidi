# 十七地

一个用于查看和分析万智牌卡牌数据的网站。

## 功能特性

- 卡牌数据查询和筛选
- 高级统计和分析功能
- 响应式设计，支持移动端
- 暗色/亮色主题切换

## 技术栈

- Next.js 15
- React 18
- TailwindCSS
- Zustand (状态管理)
- Recharts (图表)
- React Query (数据获取)
- React Table (表格)

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看运行结果。

## 部署

项目配置为静态导出，构建后的文件在 `out` 目录中。你可以将该目录部署到任何静态文件托管服务。

```bash
# 构建静态文件
pnpm build
```
