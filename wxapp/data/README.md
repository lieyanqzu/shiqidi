# 小程序静态运行资源

此目录只保留必须随小程序包发布的字体和符号映射模块，不再存放活动、轮替、预览、开包出率、筛选配置等业务数据。

## 包内资源

- `keyrune-font.js`：来自 `keyrune` 依赖字体文件的 Base64 模块。
- `set-icons.js`：来自 `keyrune` CSS 的系列符号映射。
- `mana-font.js`：来自 `mana-font` 依赖字体文件的 Base64 模块。
- `mana-symbols.js`：来自 `mana-font` CSS 的法术力符号映射。

## 业务数据

业务数据统一维护在仓库根目录的 `public/data`，Web 端读取 `/data/*.json`，微信小程序请求 `https://shiqidi.lenitatis.com/data/*.json`。更新这些 JSON 后，只需要重新部署 Web 静态资源，不需要重新提交小程序审核。

发布前在仓库根目录运行：

```bash
pnpm release:wxapp -- --prebuild-only
```

发布脚本的 `prebuild` 阶段会更新本目录中的字体和符号映射模块，并执行小程序静态检查。
