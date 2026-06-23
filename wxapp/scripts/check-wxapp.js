const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.join(__dirname, '..', '..');
const wxappDir = path.join(rootDir, 'wxapp');
const publicDataDir = path.join(rootDir, 'public', 'data');
const errors = [];
const generatedHeader = '// 此文件由 wxapp/scripts/sync-wxapp-data.js 从依赖资源生成，请勿手工修改。';
function fail(message) {
  errors.push(message);
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split(/\r\n|\r|\n/).length;
}

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath, predicate));
      return;
    }
    if (entry.isFile() && predicate(fullPath)) {
      result.push(fullPath);
    }
  });
  return result;
}

function checkSyntax(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    fail(`${relative(filePath)} JS 语法检查失败：${(result.stderr || result.stdout).trim()}`);
  }
}

function checkAppPages() {
  const appJsonPath = path.join(wxappDir, 'app.json');
  const appJson = readJson(appJsonPath);
  const pages = appJson.pages || [];
  if (new Set(pages).size !== pages.length) {
    fail('app.json pages 存在重复页面路径');
  }

  if (appJson.tabBar) {
    fail('app.json 不应再启用原生 tabBar，底部导航必须使用 bottom-nav 组件');
  }
  if (!appJson.usingComponents || appJson.usingComponents['bottom-nav'] !== '/components/bottom-nav/index') {
    fail('app.json 必须全局注册 bottom-nav 组件');
  }

  pages.forEach((pagePath) => {
    ['.js', '.wxml', '.wxss', '.json'].forEach((ext) => {
      const filePath = path.join(wxappDir, `${pagePath}${ext}`);
      if (!fs.existsSync(filePath)) {
        fail(`页面四件套缺失：${relative(filePath)}`);
      }
    });
    const pageJsonPath = path.join(wxappDir, `${pagePath}.json`);
    if (fs.existsSync(pageJsonPath)) {
      const pageJson = readJson(pageJsonPath);
      if (!pageJson.navigationBarTitleText) {
        fail(`${relative(pageJsonPath)} 缺少 navigationBarTitleText`);
      }
    }
  });

  if (!appJson.sitemapLocation || !fs.existsSync(path.join(wxappDir, appJson.sitemapLocation))) {
    fail('app.json sitemapLocation 缺失或指向不存在的文件');
  }

  const toolsDir = path.join(wxappDir, 'pages', 'tools');
  if (fs.existsSync(toolsDir)) {
    fail('wxapp/pages/tools 不应存在，资源工具页已移除');
  }
  const legacyTabBarDir = path.join(wxappDir, 'custom-tab-bar');
  if (fs.existsSync(legacyTabBarDir) && walkFiles(legacyTabBarDir).length) {
    fail('wxapp/custom-tab-bar 不应再保留旧原生 tabBar 组件');
  }
}

function getAppConfig() {
  return readJson(path.join(wxappDir, 'app.json'));
}

function getPackIgnoreRules() {
  const projectConfig = readJson(path.join(wxappDir, 'project.config.json'));
  const ignored = (projectConfig.packOptions && projectConfig.packOptions.ignore) || [];
  return {
    ignoredFiles: new Set(
      ignored
        .filter((item) => item && item.type === 'file')
        .map((item) => String(item.value || '').replace(/\\/g, '/'))
    ),
    ignoredFolders: ignored
      .filter((item) => item && item.type === 'folder')
      .map((item) => String(item.value || '').replace(/\\/g, '/').replace(/\/$/, '')),
  };
}

function isIgnoredByPackOptions(filePath) {
  const relativePath = relative(filePath).replace(/^wxapp\//, '');
  const { ignoredFiles, ignoredFolders } = getPackIgnoreRules();
  if (ignoredFiles.has(relativePath)) return true;
  return ignoredFolders.some((folder) => relativePath === folder || relativePath.startsWith(`${folder}/`));
}

function walkPackagedFiles(predicate = () => true) {
  return walkFiles(wxappDir, (filePath) => !isIgnoredByPackOptions(filePath) && predicate(filePath));
}

function checkProjectConfig() {
  const projectConfigPath = path.join(wxappDir, 'project.config.json');
  const projectConfig = readJson(projectConfigPath);
  if (projectConfig.compileType !== 'miniprogram') {
    fail('project.config.json compileType 必须为 miniprogram');
  }
  if (!projectConfig.setting || projectConfig.setting.urlCheck !== true) {
    fail('project.config.json 必须开启 setting.urlCheck');
  }
  if (!projectConfig.appid || projectConfig.appid === 'touristappid') {
    fail('project.config.json 缺少有效 appid');
  }
  const ignored = (projectConfig.packOptions && projectConfig.packOptions.ignore) || [];
  const ignoresPrivateConfig = ignored.some((item) => item && item.type === 'file' && item.value === 'project.private.config.json');
  if (!ignoresPrivateConfig) {
    fail('project.config.json packOptions.ignore 必须排除 project.private.config.json');
  }
  [
    'README.md',
    'data/README.md',
  ].forEach((value) => {
    const ignoredDoc = ignored.some((item) => item && item.type === 'file' && item.value === value);
    if (!ignoredDoc) {
      fail(`project.config.json packOptions.ignore 必须排除开发文档：${value}`);
    }
  });
  const ignoresScripts = ignored.some((item) => item && item.type === 'folder' && item.value === 'scripts');
  if (!ignoresScripts) {
    fail('project.config.json packOptions.ignore 必须排除小程序维护脚本目录：scripts');
  }
}

function checkJsonFiles() {
  walkFiles(wxappDir, (filePath) => filePath.endsWith('.json')).forEach((filePath) => {
    try {
      readJson(filePath);
    } catch (error) {
      fail(`${relative(filePath)} JSON 解析失败：${error.message}`);
    }
  });
}

function checkGeneratedData() {
  const legacyDataDir = path.join(rootDir, 'data');
  if (fs.existsSync(legacyDataDir)) {
    fail('根目录 data 已废弃，业务数据必须维护在 public/data，不能恢复旧 data 目录');
  }

  const legacySpeedDataPath = path.join(rootDir, 'app', 'speed', 'speed-data.json');
  if (fs.existsSync(legacySpeedDataPath)) {
    fail('app/speed/speed-data.json 已废弃，赛制速度缓存必须维护在 public/data/speed-data.json');
  }

  const jsonDataFiles = walkFiles(path.join(wxappDir, 'data'), (filePath) => filePath.endsWith('.json'));
  jsonDataFiles.forEach((filePath) => {
    fail(`wxapp/data 不应保留重复 JSON 副本：${relative(filePath)}`);
  });

  const generatedNames = new Set([
    'keyrune-font.js',
    'mana-font.js',
    'mana-symbols.js',
    'set-icons.js',
  ]);
  walkFiles(path.join(wxappDir, 'data'), (filePath) => filePath.endsWith('.js')).forEach((filePath) => {
    const name = path.basename(filePath);
    if (!generatedNames.has(name)) {
      fail(`wxapp/data 不应打包业务数据模块：${relative(filePath)}`);
      return;
    }
    const text = readText(filePath);
    if (!text.startsWith(generatedHeader)) {
      fail(`${relative(filePath)} 缺少生成文件头，请通过 wxapp/scripts/sync-wxapp-data.js 维护`);
    }
  });
}

function loadDataModule(relativePath) {
  const modulePath = path.join(rootDir, relativePath);
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function collectCalendarEventsFromGroups(groups, result = []) {
  (Array.isArray(groups) ? groups : []).forEach((group) => {
    if (Array.isArray(group.events)) {
      group.events.forEach((event) => {
        result.push({ group, event });
      });
    }
    if (Array.isArray(group.groups)) {
      collectCalendarEventsFromGroups(group.groups, result);
    }
  });
  return result;
}

function checkDataModuleShape() {
  try {
    const options = readJson(path.join(publicDataDir, 'options.json'));
    [
      'expansionOptions',
      'formatOptions',
      'formatSpeedOptions',
      'userGroupOptions',
      'deckColorOptions',
      'rarityOptions',
      'colorOptions',
    ].forEach((key) => {
      if (!Array.isArray(options[key]) || !options[key].length) {
        fail(`public/data/options.json ${key} 必须是非空数组`);
      }
    });

    const expansionValues = options.expansionOptions;
    const formatValues = options.formatOptions.map((item) => item.value);
    const speedFormatValues = (options.formatSpeedOptions || options.formatOptions).map((item) => item.value);
    const cardDefaults = options.cardDataDefaults || {};
    if (!cardDefaults.expansion || !expansionValues.includes(cardDefaults.expansion)) {
      fail('public/data/options.json cardDataDefaults.expansion 必须存在于 expansionOptions');
    }
    if (!cardDefaults.event_type || !formatValues.includes(cardDefaults.event_type)) {
      fail('public/data/options.json cardDataDefaults.event_type 必须存在于 formatOptions');
    }

    const speedDefaults = options.speedDefaults || {};
    if (!Number.isInteger(speedDefaults.recentExpansionCount) || speedDefaults.recentExpansionCount <= 0) {
      fail('public/data/options.json speedDefaults.recentExpansionCount 必须是正整数');
    }
    if (!Array.isArray(speedDefaults.event_types) || !speedDefaults.event_types.length) {
      fail('public/data/options.json speedDefaults.event_types 必须是非空数组');
    }
    speedDefaults.event_types.forEach((value) => {
      if (!speedFormatValues.includes(value)) {
        fail(`public/data/options.json speedDefaults.event_types 包含未知赛制 ${value}`);
      }
    });
    if (Array.isArray(speedDefaults.expansions)) {
      speedDefaults.expansions.forEach((value) => {
        if (!expansionValues.includes(value)) {
          fail(`public/data/options.json speedDefaults.expansions 包含未知系列 ${value}`);
        }
      });
    }

    const events = readJson(path.join(publicDataDir, 'events.json'));
    const calendarEvents = collectCalendarEventsFromGroups(events.groups);
    if (!events.metadata || !Array.isArray(events.groups) || !events.groups.length || !calendarEvents.length) {
      fail('public/data/events.json 缺少 metadata 或非空 groups 事件分组');
    }
    calendarEvents.forEach(({ group, event }) => {
      if (!group.id || !group.title) {
        fail('public/data/events.json 每个活动分组都必须包含 id 和 title');
      }
      if (!event.title || !event.startTime || !event.endTime) {
        fail('public/data/events.json 每个活动都必须包含 title、startTime 和 endTime');
      }
      if (event.description === '') {
        fail(`public/data/events.json 活动 ${event.title || '未知'} 不应保留空 description 字段`);
      }
      if (String(event.startTime || '').endsWith('Z') || String(event.endTime || '').endsWith('Z')) {
        fail(`public/data/events.json 活动 ${event.title || '未知'} 应保留原始时区偏移格式，不能写成 Z 时间`);
      }
    });

    const speedData = readJson(path.join(publicDataDir, 'speed-data.json'));
    if (!Array.isArray(speedData) || !speedData.length) {
      fail('public/data/speed-data.json 必须是非空数组');
    }
    speedData.forEach((item) => {
      if (!item.expansion || !item.event_type || typeof item.average_game_length !== 'number' || typeof item.win_rate_on_play !== 'number') {
        fail('public/data/speed-data.json 每项都必须包含 expansion、event_type、average_game_length 和 win_rate_on_play');
      }
    });

    const mastery = readJson(path.join(publicDataDir, 'mastery.json'));
    ['setCode', 'startDate', 'endDate', 'maxLevel'].forEach((key) => {
      if (!mastery[key]) fail(`public/data/mastery.json 缺少 ${key}`);
    });

    const rotation = readJson(path.join(publicDataDir, 'rotation.json'));
    if (!Array.isArray(rotation.sets) || !rotation.sets.length) {
      fail('public/data/rotation.json sets 必须是非空数组');
    }

    const boosterConfig = readJson(path.join(publicDataDir, 'booster-config.json'));
    if (!Array.isArray(boosterConfig.sets) || !boosterConfig.sets.length) {
      fail('public/data/booster-config.json sets 必须是非空数组');
    }

    const sealedBasicData = readJson(path.join(publicDataDir, 'sealed-basic-data.json'));
    if (!Array.isArray(sealedBasicData) || !sealedBasicData.length) {
      fail('public/data/sealed-basic-data.json 必须是非空数组');
    }
    const sealedCodeSet = new Set();
    sealedBasicData.forEach((item) => {
      sealedCodeSet.add(item.code);
      if (!item.code || !Array.isArray(item.boosters) || !item.sheets) {
        fail('public/data/sealed-basic-data.json 每项都必须包含 code、boosters 和 sheets');
      }
    });
    boosterConfig.sets.forEach((set) => {
      (set.boosters || []).forEach((booster) => {
        if (!sealedCodeSet.has(booster.code)) {
          fail(`public/data/booster-config.json 包含无开包出率数据的补充包：${booster.code}`);
        }
      });
    });

    const previewFiles = walkFiles(path.join(publicDataDir, 'previews'), (filePath) => /^Y.+\.json$/.test(path.basename(filePath)));
    if (!previewFiles.length) {
      fail('public/data/previews 缺少 Y*.json 预览数据');
    }
    previewFiles.forEach((filePath) => {
      const value = readJson(filePath);
      if (!value.code || !Array.isArray(value.cards)) {
        fail(`${relative(filePath)} 缺少 code 或 cards 数组`);
      }
    });
  } catch (error) {
    fail(`public/data 数据检查失败：${error.message}`);
  }
}

function checkTextRules() {
  const textExtensions = new Set(['.js', '.json', '.wxml', '.wxss', '.md']);
  const files = walkPackagedFiles((filePath) => textExtensions.has(path.extname(filePath)));
  const docNames = new Set(['README.md']);
  const stalePatterns = [
    'pages/tools/index',
    '资源页保留',
    '仅在资源页',
    '继续作为 PC 专用资源链接存在于',
  ];
  const bannedRuntimePatterns = [
    'web-view',
    'Web 版',
    'web 版',
    '开发状态',
    '迁移状态',
    '已接入',
    '零代理',
    '合法域名',
    '小程序主包',
    '资源工具页',
    '外部页面',
    '外部资料',
    '无法直接打开',
    '页面链接',
    '复制链接',
    'mtgch 链接',
    '链接已复制',
    '链接复制失败',
    'HTTP ',
    'new Error(error.errMsg',
  ];

  files.forEach((filePath) => {
    const text = readText(filePath);
    const name = path.basename(filePath);
    if (filePath.endsWith('.wxml') && (text.includes('wx:elif') || text.includes('wx:else'))) {
      fail(`${relative(filePath)} 不应使用 wx:elif 或 wx:else，请改用显式互斥 wx:if`);
    }
    if (filePath.endsWith('.wxml') && text.includes('wx:key="expansion"')) {
      fail(`${relative(filePath)} 不应使用可能重复的 wx:key="expansion"，请使用组合 key`);
    }
    if (!docNames.has(name)) {
      stalePatterns.forEach((pattern) => {
        if (text.includes(pattern)) {
          fail(`${relative(filePath)} 命中旧资源工具口径：${pattern}`);
        }
      });
      bannedRuntimePatterns.forEach((pattern) => {
        if (text.includes(pattern)) {
          fail(`${relative(filePath)} 命中不应出现在运行时代码中的文案：${pattern}`);
        }
      });
    }
  });
}

function checkActionWrappers() {
  const runtimeFiles = walkPackagedFiles((filePath) => filePath.endsWith('.js'));
  const directPattern = /wx\.(setClipboardData|previewImage|navigateTo|switchTab|showActionSheet|showToast|showModal|addPhoneCalendar|pageScrollTo)\b/;
  const storagePattern = /wx\.(getStorageSync|setStorageSync)\b/;
  const fontPattern = /wx\.loadFontFace\b/;
  const canvasPlatformPattern = /wx\.(getWindowInfo|getSystemInfoSync|nextTick|createSelectorQuery)\b/;
  const requestPattern = /wx\.request\b/;
  runtimeFiles.forEach((filePath) => {
    const relativePath = relative(filePath);
    if (relativePath === 'wxapp/utils/wx-actions.js') return;
    const text = readText(filePath);
    if (directPattern.test(text)) {
      fail(`${relative(filePath)} 应通过 utils/wx-actions.js 调用 Toast、复制、预览、页面跳转、操作菜单、提示弹窗或系统日历 API`);
    }
    if (relativePath !== 'wxapp/utils/storage.js' && storagePattern.test(text)) {
      fail(`${relativePath} 应通过 utils/storage.js 读写本地存储`);
    }
    if (relativePath !== 'wxapp/utils/font.js' && fontPattern.test(text)) {
      fail(`${relativePath} 应通过 utils/font.js 加载字体资源`);
    }
    if (relativePath !== 'wxapp/utils/canvas.js' && canvasPlatformPattern.test(text)) {
      fail(`${relativePath} 应通过 utils/canvas.js 处理图表平台能力`);
    }
    if (relativePath !== 'wxapp/utils/api.js' && requestPattern.test(text)) {
      fail(`${relativePath} 应通过 utils/api.js 发起网络请求`);
    }
  });
}

function checkDisplayErrorSanitization() {
  const runtimeFiles = walkPackagedFiles((filePath) => filePath.endsWith('.js'));
  runtimeFiles.forEach((filePath) => {
    if (relative(filePath) === 'wxapp/utils/display-error.js') return;
    const text = readText(filePath);
    if (/\berror\.message\s*\|\|/.test(text)) {
      fail(`${relative(filePath)} 不应直接展示 error.message，请通过 utils/display-error.js 兜底为中文用户文案`);
    }
  });
}

function checkRequireTargets() {
  const jsFiles = walkPackagedFiles((filePath) => filePath.endsWith('.js'));
  const requirePattern = /require\(['"](\.{1,2}\/[^'"]+)['"]\)/g;
  jsFiles.forEach((filePath) => {
    const text = readText(filePath);
    let match = requirePattern.exec(text);
    while (match) {
      const request = match[1];
      const basePath = path.resolve(path.dirname(filePath), request);
      const candidates = [
        basePath,
        `${basePath}.js`,
        `${basePath}.json`,
        path.join(basePath, 'index.js'),
      ];
      if (!candidates.some((candidate) => fs.existsSync(candidate))) {
        fail(`${relative(filePath)} 引用了不存在的模块：${request}`);
      }
      match = requirePattern.exec(text);
    }
  });
}

function collectDeclaredHandlers(jsText) {
  const handlers = new Set();
  const methodPattern = /(?:^|[\s,{])([A-Za-z_$][\w$]*)\s*\([^(){};]*\)\s*\{/g;
  const propertyPattern = /(?:^|[\s,{])([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g;
  const ignoredNames = new Set(['if', 'for', 'while', 'switch', 'catch', 'function']);
  let match = methodPattern.exec(jsText);
  while (match) {
    if (!ignoredNames.has(match[1])) {
      handlers.add(match[1]);
    }
    match = methodPattern.exec(jsText);
  }
  match = propertyPattern.exec(jsText);
  while (match) {
    if (!ignoredNames.has(match[1])) {
      handlers.add(match[1]);
    }
    match = propertyPattern.exec(jsText);
  }
  return handlers;
}

function checkWxmlEventHandlers() {
  const pageWxmlFiles = walkFiles(path.join(wxappDir, 'pages'), (filePath) => filePath.endsWith('.wxml'));
  const componentWxmlFiles = walkFiles(path.join(wxappDir, 'components'), (filePath) => filePath.endsWith('.wxml'));
  const wxmlFiles = [...pageWxmlFiles, ...componentWxmlFiles];
  const eventPattern = /(^|[\s<])((?:bind|catch|capture-bind|capture-catch)(?::?[A-Za-z][\w-]*)?)\s*=\s*(['"])(.*?)\3/g;
  const handlerNamePattern = /^[A-Za-z_$][\w$]*$/;

  wxmlFiles.forEach((wxmlPath) => {
    const jsPath = wxmlPath.replace(/\.wxml$/, '.js');
    if (!fs.existsSync(jsPath)) {
      fail(`${relative(wxmlPath)} 存在事件绑定但缺少对应 JS 文件`);
      return;
    }
    const wxmlText = readText(wxmlPath);
    const jsText = readText(jsPath);
    const declaredHandlers = collectDeclaredHandlers(jsText);
    eventPattern.lastIndex = 0;
    let match = eventPattern.exec(wxmlText);
    while (match) {
      const attribute = match[2];
      const handler = match[4].trim();
      const line = lineNumberAt(wxmlText, match.index + match[1].length);
      if (!handler || handler.includes('{{')) {
        match = eventPattern.exec(wxmlText);
        continue;
      }
      if (!handlerNamePattern.test(handler)) {
        fail(`${relative(wxmlPath)}:${line} ${attribute} 绑定值不是简单处理函数名：${handler}`);
        match = eventPattern.exec(wxmlText);
        continue;
      }
      if (!declaredHandlers.has(handler)) {
        fail(`${relative(wxmlPath)}:${line} ${attribute} 绑定了未定义处理函数：${handler}`);
      }
      match = eventPattern.exec(wxmlText);
    }
  });
}

function checkNavigationReferences() {
  const appJson = getAppConfig();
  const pageSet = new Set((appJson.pages || []).map((pagePath) => `/${pagePath}`));
  const runtimeFiles = walkFiles(wxappDir, (filePath) => (
    ['.js', '.wxml'].includes(path.extname(filePath))
  ));
  const urlPattern = /['"]((?:\/pages\/)[A-Za-z0-9_-]+\/index)['"]/g;

  runtimeFiles.forEach((filePath) => {
    const text = readText(filePath);
    let match = urlPattern.exec(text);
    while (match) {
      const url = match[1];
      if (!pageSet.has(url)) {
        fail(`${relative(filePath)} 引用了未在 app.json 注册的页面：${url}`);
      }
      match = urlPattern.exec(text);
    }
  });
}

function checkHomepageLayoutContract() {
  const indexJsPath = path.join(wxappDir, 'pages', 'index', 'index.js');
  const indexWxmlPath = path.join(wxappDir, 'pages', 'index', 'index.wxml');
  const indexWxssPath = path.join(wxappDir, 'pages', 'index', 'index.wxss');
  if (!fs.existsSync(indexJsPath) || !fs.existsSync(indexWxmlPath) || !fs.existsSync(indexWxssPath)) return;

  const indexJs = readText(indexJsPath);
  const indexWxml = readText(indexWxmlPath);
  const indexWxss = readText(indexWxssPath);
  if (indexJs.includes('heroIcons')) {
    fail('首页 Hero 不应恢复右侧散落图标数据 heroIcons');
  }
  [
    'hero-visual',
    'hero-icon-stack',
    'feature-grid',
    'feature-top',
    'tone-{{item.tone}}',
  ].forEach((token) => {
    if (indexWxml.includes(token)) {
      fail(`首页不应恢复旧卡片/散落图标结构：${token}`);
    }
  });
  if (!indexWxml.includes('feature-list') || !indexWxss.includes('.feature-list')) {
    fail('首页功能入口必须保持分组列表结构 feature-list');
  }
}

function checkTabPageSafeArea() {
  const appJson = getAppConfig();
  (appJson.pages || []).forEach((pagePath) => {
    const wxmlPath = path.join(wxappDir, `${pagePath}.wxml`);
    if (!fs.existsSync(wxmlPath)) return;
    const text = readText(wxmlPath);
    if (!text.includes('<bottom-nav')) {
      fail(`主页面缺少 bottom-nav 导航组件：${relative(wxmlPath)}`);
    }
  });
  const appWxss = readText(path.join(wxappDir, 'app.wxss'));
  if (!/\.page\s*\{[\s\S]*?safe-area-inset-bottom/.test(appWxss)) {
    fail('app.wxss .page 必须为底部导航预留 safe-area 安全区');
  }
}

function checkTabPageSelectionSync() {
  const runtimeFiles = walkPackagedFiles((filePath) => (
    ['.js', '.wxml', '.json'].includes(path.extname(filePath))
  ));
  runtimeFiles.forEach((filePath) => {
    const text = readText(filePath);
    [
      'getTabBar',
      'setSelected',
      'switchTab',
      'tab: true',
      '"tabBar"',
    ].forEach((token) => {
      if (text.includes(token)) {
        fail(`${relative(filePath)} 不应再保留原生 tabBar 导航逻辑：${token}`);
      }
    });
  });
}

function parseObjectStringFields(objectText) {
  const result = {};
  ['key', 'label', 'url', 'icon', 'activeIcon', 'appIcon', 'appActiveIcon'].forEach((field) => {
    const pattern = new RegExp(`${field}\\s*:\\s*['"]([^'"]+)['"]`);
    const match = objectText.match(pattern);
    if (match) result[field] = match[1];
  });
  return result;
}

function checkCustomTabBarConfigConsistency() {
  const appJson = getAppConfig();
  const pageSet = new Set((appJson.pages || []).map((pagePath) => `/${pagePath}`));
  const componentDir = path.join(wxappDir, 'components', 'bottom-nav');
  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((name) => {
    const filePath = path.join(componentDir, name);
    if (!fs.existsSync(filePath)) {
      fail(`底部导航组件缺少文件：${relative(filePath)}`);
    }
  });
  const jsPath = path.join(componentDir, 'index.js');
  const wxmlPath = path.join(componentDir, 'index.wxml');
  if (!fs.existsSync(jsPath) || !fs.existsSync(wxmlPath)) return;

  const jsText = readText(jsPath);
  const wxmlText = readText(wxmlPath);
  ['首页', '轮抽', '日程', '工具', '关于'].forEach((label) => {
    if (!jsText.includes(`label: '${label}'`)) {
      fail(`bottom-nav 必须保留底部分类：${label}`);
    }
  });
  ['/pages/cards/index', '/pages/colors/index', '/pages/calendar/index', '/pages/rotation/index', '/pages/hypergeometric/index', '/pages/info/index'].forEach((url) => {
    if (!jsText.includes(`url: '${url}'`)) {
      fail(`bottom-nav 缺少功能入口：${url}`);
    }
  });
  const routePattern = /url:\s*['"](\/pages\/[A-Za-z0-9_-]+\/index)['"]/g;
  let match = routePattern.exec(jsText);
  while (match) {
    if (!pageSet.has(match[1])) {
      fail(`bottom-nav 引用了未注册页面：${match[1]}`);
    }
    match = routePattern.exec(jsText);
  }
  ['nav-mask', 'nav-drawer', 'nav-shell', 'nav-menu-item'].forEach((token) => {
    if (!wxmlText.includes(token)) {
      fail(`bottom-nav 交互结构缺少：${token}`);
    }
  });
}

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) {
    throw new Error('不是有效 PNG 文件');
  }
  const chunkType = buffer.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') {
    throw new Error('缺少 PNG IHDR 头');
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function checkIconAssets() {
  const files = walkFiles(wxappDir, (filePath) => (
    ['.js', '.json', '.wxml'].includes(path.extname(filePath))
  ));
  const iconPattern = /(?:\.\.\/\.\.\/|\/)?assets\/icons\/[A-Za-z0-9_.-]+\.(?:png|svg)/g;
  files.forEach((filePath) => {
    const text = readText(filePath);
    let match = iconPattern.exec(text);
    while (match) {
      const normalized = match[0].replace(/^(\.\.\/\.\.\/|\/)/, '');
      if (normalized.endsWith('.png')) {
        fail(`${relative(filePath)} 本地 UI 图标必须使用 SVG，不能引用 PNG：${match[0]}`);
      }
      const iconPath = path.join(wxappDir, normalized);
      if (!fs.existsSync(iconPath)) {
        fail(`${relative(filePath)} 引用了不存在的图标：${match[0]}`);
      }
      match = iconPattern.exec(text);
    }
  });
  walkFiles(path.join(wxappDir, 'assets', 'icons'), (filePath) => filePath.endsWith('.png')).forEach((filePath) => {
    fail(`wxapp/assets/icons 不应保留本地 PNG 图标资产：${relative(filePath)}`);
  });
}

function collectCssClasses(cssText) {
  const classes = new Set();
  const text = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const classPattern = /\.([A-Za-z_-][A-Za-z0-9_-]*)/g;
  let match = classPattern.exec(text);
  while (match) {
    classes.add(match[1]);
    match = classPattern.exec(text);
  }
  return classes;
}

function collectLiteralWxmlClasses(wxmlText) {
  const classes = new Set();
  const classPattern = /\bclass\s*=\s*(['"])([\s\S]*?)\1/g;
  let match = classPattern.exec(wxmlText);
  while (match) {
    match[2].split(/\s+/).forEach((token) => {
      const name = token.trim();
      if (!name || name.includes('{{') || name.includes('}}')) return;
      if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(name)) {
        classes.add(name);
      }
    });
    match = classPattern.exec(wxmlText);
  }
  return classes;
}

function checkWxmlClassStyles() {
  const appWxssPath = path.join(wxappDir, 'app.wxss');
  const globalClasses = fs.existsSync(appWxssPath)
    ? collectCssClasses(readText(appWxssPath))
    : new Set();
  const wxmlFiles = [
    ...walkFiles(path.join(wxappDir, 'pages'), (filePath) => filePath.endsWith('.wxml')),
    ...walkFiles(path.join(wxappDir, 'components'), (filePath) => filePath.endsWith('.wxml')),
  ].filter((filePath) => fs.existsSync(filePath));

  wxmlFiles.forEach((wxmlPath) => {
    const wxssPath = wxmlPath.replace(/\.wxml$/, '.wxss');
    const availableClasses = new Set(globalClasses);
    if (fs.existsSync(wxssPath)) {
      collectCssClasses(readText(wxssPath)).forEach((className) => availableClasses.add(className));
    }

    const usedClasses = collectLiteralWxmlClasses(readText(wxmlPath));
    usedClasses.forEach((className) => {
      if (!availableClasses.has(className)) {
        fail(`${relative(wxmlPath)} 使用了未在全局或同目录 WXSS 中定义的字面 class：${className}`);
      }
    });
  });
}

function checkWxssCompatibility() {
  const riskyPatterns = [
    { pattern: /\bfilter\s*:/i, message: '不应使用 filter，避免小程序 WXSS 兼容风险' },
    { pattern: /\bbackdrop-filter\s*:/i, message: '不应使用 backdrop-filter，避免小程序 WXSS 兼容风险' },
    { pattern: /\bbackdrop\b/i, message: '不应使用 backdrop 相关样式，避免小程序 WXSS 兼容风险' },
    { pattern: /\bposition\s*:\s*sticky\b/i, message: '不应使用 position: sticky，避免小程序 WXSS 兼容风险' },
    { pattern: /\binset\s*:/i, message: '不应使用 inset 简写，请改用 top/right/bottom/left' },
    { pattern: /\bcursor\s*:/i, message: '不应使用 cursor，移动端小程序无鼠标指针语义' },
    { pattern: /\b(Inter|Arial|Roboto|Space Grotesk)\b/i, message: '不应使用通用网页字体，请优先使用中文系统 UI 字体' },
  ];

  walkFiles(wxappDir, (filePath) => filePath.endsWith('.wxss')).forEach((filePath) => {
    const text = readText(filePath);
    riskyPatterns.forEach(({ pattern, message }) => {
      const match = text.match(pattern);
      if (match) {
        fail(`${relative(filePath)}:${lineNumberAt(text, match.index)} ${message}`);
      }
    });
  });
}

function checkDomains() {
  const readme = readText(path.join(wxappDir, 'README.md'));
  const files = walkPackagedFiles((filePath) => (
    ['.js', '.wxml', '.wxss', '.json'].includes(path.extname(filePath))
  ));
  const domains = new Set();
  const urlPattern = /https?:\/\/([^/'"`\s)]+)/g;

  files.forEach((filePath) => {
    const text = readText(filePath);
    urlPattern.lastIndex = 0;
    let match = urlPattern.exec(text);
    while (match) {
      domains.add(match[1]);
      match = urlPattern.exec(text);
    }
  });

  domains.forEach((domain) => {
    if (!readme.includes(`https://${domain}`)) {
      fail(`README.md 合法域名清单缺少：https://${domain}`);
    }
  });
}

function checkDynamicImages() {
  walkFiles(path.join(wxappDir, 'pages'), (filePath) => filePath.endsWith('.wxml')).forEach((filePath) => {
    const text = readText(filePath);
    const imageTagPattern = /<image\b[\s\S]*?\/>/g;
    let match = imageTagPattern.exec(text);
    while (match) {
      const tag = match[0];
      const isRemoteCardImage = /src="\{\{[^"]*(imageUrl|card_image_url)[^"]*\}\}"/.test(tag);
      if (isRemoteCardImage && !/\bbinderror=/.test(tag)) {
        fail(`${relative(filePath)} 远程卡图缺少 binderror 兜底：${tag.replace(/\s+/g, ' ').trim()}`);
      }
      if (isRemoteCardImage && !/imageFailed/.test(tag)) {
        fail(`${relative(filePath)} 远程卡图应通过 imageFailed 控制最终占位：${tag.replace(/\s+/g, ' ').trim()}`);
      }
      if (isRemoteCardImage && !text.includes('卡图暂不可用')) {
        fail(`${relative(filePath)} 远程卡图失败后应显示“卡图暂不可用”占位`);
      }
      match = imageTagPattern.exec(text);
    }
  });
}

function checkCanvasFallbacks() {
  walkFiles(path.join(wxappDir, 'pages'), (filePath) => filePath.endsWith('.wxml')).forEach((filePath) => {
    const text = readText(filePath);
    if (!text.includes('<canvas')) return;
    const jsPath = filePath.replace(/\.wxml$/, '.js');
    const jsText = fs.existsSync(jsPath) ? readText(jsPath) : '';
    if (text.includes('eventShareCanvas') && jsText.includes('prepareEventShareImage')) {
      if (!jsText.includes('canvasToTempFilePath') || !jsText.includes('selectedShareImage')) {
        fail(`${relative(jsPath)} 活动分享图 canvas 必须生成临时图片并提供分享图兜底`);
      }
      return;
    }
    if (text.includes('cardShareCanvas') && jsText.includes('prepareCardShareImage')) {
      if (!jsText.includes('canvasToTempFilePath') || !jsText.includes('selectedShareImage') || !jsText.includes('onShareAppMessage')) {
        fail(`${relative(jsPath)} 卡牌分享图 canvas 必须生成临时图片并接入微信分享`);
      }
      return;
    }
    if (text.includes('canvas-id="shareCanvas"') && jsText.includes('prepareShareImage')) {
      if (!jsText.includes('generatePageShareImage') || !jsText.includes('shareImageUrl')) {
        fail(`${relative(jsPath)} 页面分享图 canvas 必须使用 generatePageShareImage 工具并提供兜底`);
      }
      return;
    }
    if (!text.includes('chartStatus')) {
      fail(`${relative(filePath)} 使用 canvas 时必须提供中文状态兜底`);
    }
    if (!fs.existsSync(jsPath)) {
      fail(`${relative(filePath)} 使用 canvas 但缺少对应 JS 页面`);
      return;
    }
    if (!jsText.includes('getContext') || !jsText.includes('图表绘制失败')) {
      fail(`${relative(jsPath)} canvas 绘制失败时必须显示中文降级提示`);
    }
  });
}

function checkCalendarEventActions() {
  const calendarJsPath = path.join(wxappDir, 'pages', 'calendar', 'index.js');
  const calendarWxmlPath = path.join(wxappDir, 'pages', 'calendar', 'index.wxml');
  if (!fs.existsSync(calendarJsPath) || !fs.existsSync(calendarWxmlPath)) return;

  const jsText = readText(calendarJsPath);
  const wxmlText = readText(calendarWxmlPath);
  [
    'openEventActions',
    'addEventToCalendar',
    'addSelectedEventToCalendar',
    'copySelectedEventInfo',
    'buildSharePath',
    'prepareEventShareImage',
    'onShareAppMessage',
  ].forEach((token) => {
    if (!jsText.includes(token)) {
      fail(`活动日历事件交互缺少 ${token}，不能绕过确认菜单或微信原生分享`);
    }
  });
  if (!wxmlText.includes('event-tappable') || !wxmlText.includes('chevron-right.svg')) {
    fail('活动日历事件卡片必须提供可点击视觉提示');
  }
  if (wxmlText.includes('event-tone-') || jsText.includes('event-tone-')) {
    fail('活动日历已按类型分组，事件卡不应再使用左侧类型色条');
  }
  if (!wxmlText.includes('event-action-mask') || !wxmlText.includes('open-type="share"') || !wxmlText.includes('share.svg')) {
    fail('活动日历加入日历、复制信息和分享必须收进点击卡片后的操作菜单');
  }
  if (!wxmlText.includes('复制活动信息') || !wxmlText.includes('分享活动')) {
    fail('活动日历操作菜单必须同时提供文字版复制和活动分享');
  }
  if (wxmlText.includes('class="event-share"')) {
    fail('活动日历卡片内不应直接放分享按钮，分享必须收进点击菜单');
  }
  ['点按操作', '复制官方公告'].forEach((token) => {
    if (wxmlText.includes(token) || jsText.includes(token)) {
      fail(`活动日历不应再保留旧文字入口：${token}`);
    }
  });
  if (!jsText.includes('imageUrl: this.data.selectedShareImage || shareImageUrl') || !jsText.includes('path: this.buildSharePath(item)')) {
    fail('活动日历分享必须使用明确的小程序路径和生成的活动信息图，避免默认截图分享');
  }
  if (!wxmlText.includes('eventShareCanvas')) {
    fail('活动日历必须提供隐藏 canvas 生成活动信息分享图');
  }
  if (!jsText.includes('alarmOffset: defaultAlarmOffset')) {
    fail('活动日历加入系统日历时必须固定使用默认提前 1 小时提醒');
  }
  if (!jsText.includes("calendarActionText: '活动已开始'")) {
    fail('活动日历进行中的活动不能添加到日历，菜单必须显示活动已开始');
  }
  const activeCalendarPattern = /statusClass:\s*['"](?:active|ending)['"][\s\S]{0,180}?canAddCalendar:\s*true/;
  if (activeCalendarPattern.test(jsText)) {
    fail('活动日历进行中或即将结束的活动不能设置 canAddCalendar: true');
  }
}

function checkRotationSetLogos() {
  const rotationJsPath = path.join(wxappDir, 'pages', 'rotation', 'index.js');
  const rotationWxmlPath = path.join(wxappDir, 'pages', 'rotation', 'index.wxml');
  const rotationWxssPath = path.join(wxappDir, 'pages', 'rotation', 'index.wxss');
  if (!fs.existsSync(rotationJsPath) || !fs.existsSync(rotationWxmlPath) || !fs.existsSync(rotationWxssPath)) return;

  const jsText = readText(rotationJsPath);
  const wxmlText = readText(rotationWxmlPath);
  const wxssText = readText(rotationWxssPath);
  ['set-logo', 'set-logo-glyph', 'set-logo-code'].forEach((token) => {
    if (!wxmlText.includes(token) || !wxssText.includes(`.${token}`)) {
      fail(`标准轮替页必须保留左侧系列标识区：${token}`);
    }
  });
  if (!jsText.includes('setGlyph: getSetIconGlyph(code)')) {
    fail('标准轮替页系列标识必须使用 Keyrune 系列符号数据');
  }
  if (!wxmlText.includes('digital-logo') || !jsText.includes('digitalGlyph: getSetIconGlyph(digitalCode)')) {
    fail('标准轮替页数字系列也必须提供系列标识兜底');
  }
  if (wxmlText.includes('class="set-glyph"')) {
    fail('标准轮替页不应再把系列符号挤在标题行，应使用左侧 set-logo 区');
  }
}

function checkRequiredAssets() {
  const keyruneFontModulePath = path.join(wxappDir, 'data', 'keyrune-font.js');
  if (!fs.existsSync(keyruneFontModulePath)) {
    fail('缺少包内 Keyrune 字体模块：wxapp/data/keyrune-font.js');
  } else if (fs.statSync(keyruneFontModulePath).size <= 0) {
    fail('包内 Keyrune 字体模块为空：wxapp/data/keyrune-font.js');
  }

  const manaFontModulePath = path.join(wxappDir, 'data', 'mana-font.js');
  if (!fs.existsSync(manaFontModulePath)) {
    fail('缺少包内 Mana 字体模块：wxapp/data/mana-font.js');
  } else if (fs.statSync(manaFontModulePath).size <= 0) {
    fail('包内 Mana 字体模块为空：wxapp/data/mana-font.js');
  }

  const manaSymbolsPath = path.join(wxappDir, 'data', 'mana-symbols.js');
  if (!fs.existsSync(manaSymbolsPath)) {
    fail('缺少包内 Mana 符号映射：wxapp/data/mana-symbols.js');
  } else if (fs.statSync(manaSymbolsPath).size <= 0) {
    fail('包内 Mana 符号映射为空：wxapp/data/mana-symbols.js');
  }

  const runtimeFiles = walkPackagedFiles((filePath) => (
    ['.js', '.json', '.wxml', '.wxss'].includes(path.extname(filePath))
  ));
  runtimeFiles.forEach((filePath) => {
    const text = readText(filePath);
    [
      '/wxapp/keyrune.woff2',
      '/wxapp/sealed_basic_data.json',
      'public/wxapp',
    ].forEach((pattern) => {
      if (text.includes(pattern)) {
        fail(`${relative(filePath)} 不应再引用站点 wxapp 资源：${pattern}`);
      }
    });
  });
}

function checkPackageSize() {
  const files = walkPackagedFiles();
  const totalSize = files.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
  const maxMainPackageSize = 2 * 1024 * 1024;
  if (totalSize > maxMainPackageSize) {
    fail(`小程序主包估算体积 ${(totalSize / 1024 / 1024).toFixed(2)}MB，超过 2MB 限制`);
  }
}

function main() {
  checkSyntax(path.join(wxappDir, 'scripts', 'sync-wxapp-data.js'));
  walkFiles(wxappDir, (filePath) => filePath.endsWith('.js')).forEach(checkSyntax);
  checkJsonFiles();
  checkAppPages();
  checkProjectConfig();
  checkGeneratedData();
  checkDataModuleShape();
  checkTextRules();
  checkActionWrappers();
  checkDisplayErrorSanitization();
  checkRequireTargets();
  checkWxmlEventHandlers();
  checkNavigationReferences();
  checkHomepageLayoutContract();
  checkTabPageSafeArea();
  checkTabPageSelectionSync();
  checkCustomTabBarConfigConsistency();
  checkIconAssets();
  checkWxmlClassStyles();
  checkWxssCompatibility();
  checkDomains();
  checkDynamicImages();
  checkCanvasFallbacks();
  checkCalendarEventActions();
  checkRotationSetLogos();
  checkRequiredAssets();
  checkPackageSize();

  if (errors.length) {
    console.error('小程序静态检查失败：');
    errors.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }

  console.log('小程序静态检查通过');
}

main();
