// 拉取爱发电赞助者名单
// 鉴权：MD5 签名
//   sign = md5(token + "params" + params + "ts" + ts + "user_id" + user_id)
// 端点：https://afdian.net/api/open/query-sponsor
// 频率限制：10/s、1000/h；翻页需 sleep(1)
//
// 凭据从环境变量读取（CI 通过 Repo Secrets 注入）：
//   AFDIAN_USER_ID、AFDIAN_TOKEN
// 任一缺失时：写空数组 + warn，不中断构建（保证本地与未配置 CI 也能跑）

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const USER_ID = process.env.AFDIAN_USER_ID;
const TOKEN = process.env.AFDIAN_TOKEN;
const OUTPUT = path.join(__dirname, '../public/data/sponsors.json');
const ENDPOINT_HOST = 'afdian.com';
const ENDPOINT_PATH = '/api/open/query-sponsor';
const PER_PAGE = 100; // 上限
const MAX_PAGES = 200; // 防御性翻页上限
const PAGE_INTERVAL_MS = 1100; // >1s 规避 10/s 限流

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 计算签名：md5(token + "params" + params + "ts" + ts + "user_id" + user_id)
 * 字符串直接拼接，无任何连接符
 */
function buildSign({ token, params, ts, userId }) {
  return crypto
    .createHash('md5')
    .update(token + 'params' + params + 'ts' + ts + 'user_id' + userId)
    .digest('hex');
}

/**
 * 调用一次 query-sponsor
 */
function fetchPage({ page, perPage }) {
  const params = JSON.stringify({ page, per_page: perPage });
  const ts = Math.floor(Date.now() / 1000);
  const sign = buildSign({ token: TOKEN, params, ts, userId: USER_ID });

  const body = JSON.stringify({
    user_id: USER_ID,
    params, // 必须是 JSON 字符串
    ts,
    sign,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: ENDPOINT_HOST,
        port: 443,
        path: ENDPOINT_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'shiqidi-build/1.0',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`响应非 JSON: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error(`请求 ${ENDPOINT_HOST} 超时`)));
    req.write(body);
    req.end();
  });
}

/**
 * 拉取全量赞助者，按 user_id 去重
 */
async function fetchAllSponsors() {
  const map = new Map(); // user_id -> { name, since, avatar, sumAmount }

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await fetchPage({ page, perPage: PER_PAGE });

    if (res.ec !== 200) {
      const debug = res.data?.debug ? ` debug=${JSON.stringify(res.data.debug)}` : '';
      throw new Error(`ec=${res.ec} em=${res.em || '未知错误'}.${debug}`);
    }

    const list = Array.isArray(res.data?.list) ? res.data.list : [];
    for (const item of list) {
      const uid = item.user?.user_id;
      if (!uid) continue;
      const name = item.user?.name || '匿名用户';
      const avatar = item.user?.avatar || '';
      // since 字段：最近一次赞助时间（last_pay_time），回退 first_pay_time / create_time
      const rawTs = item.last_pay_time ?? item.first_pay_time ?? item.create_time;
      const sinceTs = Number(rawTs);
      const since = Number.isFinite(sinceTs) && sinceTs > 0
        ? new Date(sinceTs * 1000).toISOString().slice(0, 10)
        : '未知';
      const sumAmount = typeof item.all_sum_amount === 'string' ? item.all_sum_amount : '';
      map.set(uid, { name, since, avatar, sumAmount });
    }

    const totalPage = Number(res.data?.total_page) || 0;
    const totalCount = Number(res.data?.total_count) || map.size;

    console.log(
      `[fetch-sponsors] page ${page}/${totalPage || '?'} 已累计 ${map.size}/${totalCount} 位`
    );

    if (totalPage && page >= totalPage) break;
    if (list.length === 0) break; // 兜底：返回空也停
    if (page < MAX_PAGES) await sleep(PAGE_INTERVAL_MS);
  }

  // 按 since 倒序
  return Array.from(map.values()).sort((a, b) => (a.since < b.since ? 1 : -1));
}

async function main() {
  // 缺 token 走兜底：写空数组 + warn，不失败
  if (!USER_ID || !TOKEN) {
    console.warn(
      '[fetch-sponsors] 未配置 AFDIAN_USER_ID 或 AFDIAN_TOKEN，跳过拉取，使用空名单。' +
        '本地开发无需配置；如需自动拉取，请在 GitHub Repo Secrets 中配置这两个值。'
    );
    fs.writeFileSync(OUTPUT, '[]\n');
    return;
  }

  try {
    console.log('[fetch-sponsors] 正在拉取爱发电赞助者名单...');
    const sponsors = await fetchAllSponsors();
    fs.writeFileSync(OUTPUT, `${JSON.stringify(sponsors, null, 2)}\n`);
    console.log(
      `[fetch-sponsors] 成功，已写入 ${sponsors.length} 位支持者到 public/data/sponsors.json`
    );
  } catch (err) {
    // 拉取失败时保留旧文件，仅 warn，不中断构建
    console.warn(
      `[fetch-sponsors] 拉取失败: ${err.message || err}。保留旧名单文件。`
    );
  }
}

main();
