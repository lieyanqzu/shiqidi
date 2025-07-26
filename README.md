# 十七地

十七地是一个专注于万智牌：竞技场的工具平台，旨在帮助玩家提升游玩体验。本站的轮抽数据功能基于17Lands提供的数据，同时也整合了一些实用工具以提升游戏体验。

## 功能特点

- **轮抽数据**
  - 卡牌数据：查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计
  - 赛制速度：了解各个系列限制赛的速度和先手胜率
  - 色组数据：分析不同色组组合的胜率和选用率（跳转至17Lands）


- **万智日程**
  - MTGA活动日历：查看MTGA活动日程，包括周中万智牌、轮抽、资格赛等赛事安排
  - 标准轮替日程：了解标准赛制的系列轮替时间表，掌握当前可用系列和即将轮替的系列
  - MTGA服务状态：查看MTGA的服务器状态、维护信息和各平台运行情况
  - 炼金系列预览：查看即将上线的炼金系列卡牌预览信息和历史预览

- **其他工具**
  - MTGA汉化MOD：下载并安装MTGA游戏界面汉化MOD
  - Scryfall汉化脚本：为Scryfall卡牌数据库添加中文翻译支持
  - 抽卡概率计算器：计算万智牌抽卡概率，基于超几何分布
  - 精研通行证计算器：计算精研通行证等级进度
  - 开包模拟器：模拟开启补充包，体验开包乐趣

## 开源组件

- [Next.js](https://nextjs.org) - React框架，提供了服务端渲染、路由等功能
- [React](https://react.dev) - 用于构建用户界面的JavaScript库
- [Tailwind CSS](https://tailwindcss.com) - CSS框架，提供了现代化的样式系统
- [Radix UI](https://www.radix-ui.com) - 无样式的UI组件库，提供了基础的交互组件
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理库
- [Recharts](https://recharts.org) - 基于React的图表库
- [date-fns](https://date-fns.org) - 现代JavaScript日期工具库
- [React DatePicker](https://reactdatepicker.com) - 灵活的日期选择器组件
- [Lucide Icons](https://lucide.dev) - 图标库，提供了界面中使用的各种图标
- [Keyrune](https://keyrune.andrewgioia.com) - 提供万智牌系列图标的字体库
- [Mana](https://mana.andrewgioia.com) - 提供万智牌法术力符号的字体库

## 数据来源

- [17Lands](https://www.17lands.com) - 提供轮抽数据分析的核心数据
- [大学院废墟](https://mtgch.com) - 提供万智牌的中文翻译数据
- [What's in Standard](https://github.com/glacials/whatsinstandard) - 提供标准赛制轮替数据
- [magic-sealed-data](https://github.com/taw/magic-sealed-data) - 提供补充包开包出率模拟数据

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
