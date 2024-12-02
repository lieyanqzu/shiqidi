# 十七地

十七地是一个专注于万智牌：竞技场的工具平台，旨在帮助玩家提升游玩体验。本站的轮抽数据功能基于17Lands提供的数据，同时也整合了一些实用工具以提升游戏体验。

## 功能特点

- **轮抽数据**
  - 卡牌数据：查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计
  - 色组数据：分析不同色组组合的胜率和选用率（跳转至17Lands）
  - 赛制速度：了解各个系列限制赛的速度和先手胜率（跳转至17Lands）

- **万智日程**
  - MTGA活动日历：查看MTGA活动日程，包括周中万智牌、快速轮抽、资格赛等赛事安排
  - 标准轮替日程：了解标准赛制的系列轮替时间表，掌握当前可用系列和即将轮替的系列

- **其他工具**
  - MTGA汉化MOD：下载并安装MTGA游戏界面汉化MOD
  - Scryfall汉化脚本：为Scryfall卡牌数据库添加中文翻译支持

## 技术栈

- [Next.js](https://nextjs.org) - React框架，提供了服务端渲染、路由等功能
- [React](https://react.dev) - 用于构建用户界面的JavaScript库
- [Tailwind CSS](https://tailwindcss.com) - CSS框架，提供了现代化的样式系统
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理库
- [React Query](https://tanstack.com/query) - 用于数据获取和缓存的库
- [React Table](https://tanstack.com/table) - 用于构建强大的表格组件
- [Recharts](https://recharts.org) - 基于React的图表库
- [Lucide Icons](https://lucide.dev) - 图标库，提供了界面中使用的各种图标
- [Keyrune](https://keyrune.andrewgioia.com) - 提供万智牌系列图标的字体库

## 数据来源

- [17Lands](https://www.17lands.com) - 提供轮抽数据分析的核心数据
- [大学院废墟](https://www.sbwsz.com) - 提供万智牌的中文翻译数据

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 改进本站

本项目代码采用 MIT 协议开源，欢迎提交 Issue 或 Pull Request 来帮助改进本站。
