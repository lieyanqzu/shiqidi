# 十七地微信小程序

十七地微信小程序是十七地的原生移动端版本，面向万智牌：竞技场玩家提供轮抽数据、日程提醒、概率计算、赛季规划和开包模拟等核心功能。小程序资源受限，只保留适合移动端原生体验的功能；完整功能和更多资料可访问网页版。

## 导入方式

1. 使用微信开发者工具导入 `wxapp` 目录。
2. 确认 `project.config.json` 中的 `appid` 是目标小程序 AppID。
3. 关闭“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”后编译、预览和真机测试。

## 发布脚本

在仓库根目录执行：

```bash
pnpm release:wxapp -- --version 0.1.0 --desc "发布说明"
```

发布脚本的 `prebuild` 阶段会自动完成：

- 同步 Keyrune / Mana 字体和符号映射到 `wxapp/data`。
- 执行小程序静态检查，包括页面四件套、路由、底部导航、WXML 事件、样式兼容、合法域名、共享数据结构、远程卡图兜底、包体大小、API 封装和发布文案检查。

检查通过后，脚本会通过 `miniprogram-ci` 上传体验版。首次使用前需要在微信公众平台下载“代码上传密钥”，默认放到：

```text
wxapp/keys/private.<appid>.key
```

也可以通过环境变量或参数指定其他路径：

```powershell
$env:WXAPP_PRIVATE_KEY_PATH="C:\path\private.key"
pnpm release:wxapp -- --version 0.1.0 --desc "发布说明"
```

也可以直接传入密钥路径：

```bash
pnpm release:wxapp -- --private-key C:\path\private.key --version 0.1.0 --desc "发布说明"
```

只执行同步和检查、不上传时：

```bash
pnpm release:wxapp -- --prebuild-only
```

上传完成后仍需在微信公众平台确认体验版，并提交审核、发布。

## 合法域名

`request 合法域名`：

```text
https://shiqidi.lenitatis.com
https://www.17lands.com
https://mtgch.com
https://api.scryfall.com
https://magicthegatheringarena.statuspage.io
```

`downloadFile 合法域名`：

```text
https://shiqidi.lenitatis.com
https://cards.scryfall.io
https://images.mtgch.com
https://media.wizards.com
```

`外部复制链接域名`：

```text
https://magic.wizards.com
```

## 当前功能范围

- 首页：核心功能分组入口和底部功能导航。
- 轮抽卡牌数据：系列、赛制、日期、用户组、套牌颜色查询，中文名回填，中文/英文搜索，颜色和稀有度筛选，评分视图、指标切换、卡图背景列表、卡牌详情、法术力符号和中文规则文本。
- 色组数据：直连 17Lands 色组胜率接口，复用轮抽筛选条件，支持是否区分混色。
- 赛制速度：直连 17Lands 赛制速度接口，多系列/多赛制筛选，纯视图散点图、Keyrune 系列符号、点选提示和数据列表。
- MTGA 活动日历：完整活动表，类型筛选，按类型分组，活动状态提示，卡片点击菜单，复制活动信息，活动分享图，未开始活动可添加到系统日历。
- 标准轮替日程：当前标准系列、未来系列、下一轮替提示、系列中文名回填、Keyrune 系列标识、无疆新宇宙/数字版本标签和标准禁牌卡图预览。
- MTGA 服务状态：总体状态、组件分组、突发事件、计划维护和自动刷新倒计时。
- 炼金系列预览：中文预览列表、懒加载卡图、卡牌详情、法术力符号、内联异能/相关卡牌处理、关联卡牌预览和卡牌信息分享图。
- 抽卡概率计算器：单牌概率、多牌概率、BO1 地牌优化、常用参数快捷输入和结果自动定位。
- 精研通行证计算器：当前通行证系列、赛季时间、等级/经验/任务/胜场输入，经验汇总和预期等级估算。
- 开包模拟器：共享静态出率数据、完整系列范围、单包模拟、中文系列名和稀有度、Web 版卡背、卡图大图浏览和闪卡效果。
- 关于页：数据来源、更多信息和版权声明。

不纳入小程序范围：

- 桌面端专用工具：`/mod` 和 `/script`。
- 资源受限或不适合移动端原生体验的完整网页版功能。

## 数据策略

- 动态接口直接请求 17Lands、mtgch、Scryfall 和 Statuspage。
- 活动日历、标准轮替、炼金预览、通行证配置、开包配置、开包出率和筛选配置统一维护在 `public/data`。
- Web 端读取 `/data/*.json`，微信小程序请求 `https://shiqidi.lenitatis.com/data/*.json`，双端不再各自维护业务数据副本。
- `public/data/filter.json` 是 Web 端使用的 17Lands 筛选元数据缓存；小程序筛选元数据直接请求 17Lands。
- `public/data/speed-data.json` 是 Web 端使用的 17Lands 赛制速度缓存；小程序赛制速度直接请求 17Lands。
- `wxapp/data` 只保留 Keyrune / Mana 字体和符号映射，不打包活动、轮替、预览、开包出率或筛选配置等业务数据。
- 更新 `public/data` 后重新部署 Web 静态资源即可，不需要重新提审小程序。

## 上线检查

1. 运行 `pnpm release:wxapp -- --prebuild-only`。
2. 使用微信开发者工具导入 `wxapp`，关闭域名豁免后编译。
3. 使用 iPhone 模拟器和 Android 真机检查首页、底部导航、轮抽数据、色组数据、赛制速度、活动日历、炼金预览、开包模拟器和关于页。
4. 检查所有远程卡图都有加载中、失败占位或可用回退，不出现空白区域。
5. 运行 `pnpm release:wxapp -- --version 0.1.0 --desc "发布说明"` 上传体验版。
6. 体验版走一次完整核心路径后，在微信公众平台提交审核。
