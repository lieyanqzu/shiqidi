const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.join(__dirname, '..', '..');
const wxappDir = path.join(rootDir, 'wxapp');
const packageJson = require(path.join(rootDir, 'package.json'));
const projectConfigPath = path.join(wxappDir, 'project.config.json');

function readArgValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index >= args.length - 1) return '';
  return args[index + 1];
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    prebuildOnly: args.includes('--prebuild-only'),
    appid: readArgValue(args, '--appid') || process.env.WXAPP_APPID || '',
    privateKeyPath: readArgValue(args, '--private-key')
      || process.env.WXAPP_PRIVATE_KEY_PATH
      || process.env.MINIPROGRAM_PRIVATE_KEY_PATH
      || '',
    version: readArgValue(args, '--version') || packageJson.version || '0.1.0',
    desc: readArgValue(args, '--desc') || `发布 ${packageJson.version || '0.1.0'}`,
    robot: Number(readArgValue(args, '--robot') || process.env.WXAPP_UPLOAD_ROBOT || 1),
  };
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`[release:wxapp] 读取${label}失败：${error.message}`);
    process.exit(1);
  }
}

function runNodeStep(title, scriptPath) {
  const relativePath = scriptPath.replace(/\\/g, '/');
  console.log(`\n[release:wxapp] ${title}`);
  const result = spawnSync(process.execPath, [relativePath], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[release:wxapp] ${title}启动失败：${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[release:wxapp] ${title}未通过，已停止发布。`);
    process.exit(result.status || 1);
  }
}

function loadMiniProgramCi() {
  try {
    return require('miniprogram-ci');
  } catch (error) {
    console.error('\n[release:wxapp] 未能加载 miniprogram-ci。');
    console.error('[release:wxapp] 请先执行 pnpm install，或确认 miniprogram-ci 已安装在 devDependencies 中。');
    console.error(`[release:wxapp] 原始错误：${error.message}`);
    process.exit(1);
  }
}

function resolveAppid(options, projectConfig) {
  const appid = options.appid || projectConfig.appid || '';
  if (!appid) {
    console.error('\n[release:wxapp] 缺少小程序 AppID。');
    console.error('[release:wxapp] 请在 wxapp/project.config.json 写入 appid，或使用 --appid / WXAPP_APPID 指定。');
    process.exit(1);
  }
  return appid;
}

function resolvePrivateKeyPath(options, appid) {
  const defaultPrivateKeyPath = path.join(wxappDir, 'keys', `private.${appid}.key`);
  const configuredPrivateKeyPath = options.privateKeyPath || (fs.existsSync(defaultPrivateKeyPath) ? defaultPrivateKeyPath : '');

  if (!configuredPrivateKeyPath) {
    console.error('\n[release:wxapp] 缺少上传密钥。');
    console.error('[release:wxapp] 请在微信公众平台下载“代码上传密钥”，然后通过以下方式之一指定：');
    console.error(`[release:wxapp] 默认路径：wxapp\\keys\\private.${appid}.key`);
    console.error('[release:wxapp] PowerShell: $env:WXAPP_PRIVATE_KEY_PATH="C:\\path\\private.key"');
    console.error('[release:wxapp] 或执行：pnpm release:wxapp -- --private-key C:\\path\\private.key');
    console.error('[release:wxapp] 只需要同步和检查时可执行：pnpm release:wxapp -- --prebuild-only');
    process.exit(1);
  }

  const privateKeyPath = path.resolve(rootDir, configuredPrivateKeyPath);
  if (!fs.existsSync(privateKeyPath)) {
    console.error(`\n[release:wxapp] 上传密钥不存在：${privateKeyPath}`);
    process.exit(1);
  }

  return privateKeyPath;
}

function createProject(ci, appid, privateKeyPath) {
  return new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: wxappDir,
    privateKeyPath,
    ignores: [
      'node_modules/**/*',
      'scripts/**/*',
      'README.md',
      'data/README.md',
      'project.private.config.json',
    ],
  });
}

function normalizeSetting(setting = {}) {
  return {
    es6: setting.es6 !== false,
    es7: Boolean(setting.es7),
    minify: setting.minified !== false,
    minifyJS: setting.minified !== false,
    minifyWXML: setting.minifyWXML !== false,
    minifyWXSS: setting.minifyWXSS !== false,
    codeProtect: Boolean(setting.codeProtect),
    autoPrefixWXSS: setting.postcss !== false,
    uploadWithSourceMap: setting.uploadWithSourceMap !== false,
  };
}

async function runUpload(options) {
  const projectConfig = readJson(projectConfigPath, '小程序项目配置');
  const appid = resolveAppid(options, projectConfig);
  const privateKeyPath = resolvePrivateKeyPath(options, appid);
  const ci = loadMiniProgramCi();
  const project = createProject(ci, appid, privateKeyPath);

  console.log('\n[release:wxapp] 上传体验版');
  console.log(`[release:wxapp] AppID: ${appid}`);
  console.log(`[release:wxapp] 版本: ${options.version}`);
  console.log(`[release:wxapp] 描述: ${options.desc}`);
  console.log(`[release:wxapp] 机器人: ${options.robot}`);

  try {
    await ci.upload({
      project,
      version: options.version,
      desc: options.desc,
      robot: options.robot,
      setting: normalizeSetting(projectConfig.setting),
      onProgressUpdate: (info) => {
        if (typeof info === 'string') {
          console.log(`[release:wxapp] ${info}`);
          return;
        }
        if (info && info.message) {
          console.log(`[release:wxapp] ${info.message}`);
        }
      },
    });
  } catch (error) {
    console.error('\n[release:wxapp] 上传失败。');
    console.error(`[release:wxapp] ${error.message || error}`);
    console.error('[release:wxapp] 请检查上传密钥、IP 白名单、项目 AppID、体验版机器人编号和微信公众平台权限。');
    process.exit(1);
  }
}

async function main() {
  const options = parseArgs();
  console.log('[release:wxapp] 开始准备十七地微信小程序发布版本。');

  console.log('\n[release:wxapp] prebuild');
  runNodeStep('同步小程序字体和符号数据', 'wxapp/scripts/sync-wxapp-data.js');
  runNodeStep('执行小程序发布前检查', 'wxapp/scripts/check-wxapp.js');

  if (options.prebuildOnly) {
    console.log('\n[release:wxapp] 发布前准备完成，已按 --prebuild-only 跳过上传。');
    return;
  }

  await runUpload(options);

  console.log('\n[release:wxapp] 上传完成。');
  console.log('[release:wxapp] 这一步只上传体验版，仍需在微信公众平台提交审核并发布。');
}

main();
