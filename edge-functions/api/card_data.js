// 允许转发的查询参数白名单
const ALLOWED_PARAMS = ['expansion', 'event_type', 'time_period', 'user_group', 'colors'];

// 上游 17lands 接口
const UPSTREAM_URL = 'https://www.17lands.com/api/card_data';

export async function onRequestGet(context) {
  const { request } = context;

  // 从原始请求中提取白名单参数，避免透传无关字段
  const upstreamParams = new URLSearchParams();
  const sourceParams = new URL(request.url).searchParams;
  for (const key of ALLOWED_PARAMS) {
    const value = sourceParams.get(key);
    if (value) {
      upstreamParams.set(key, value);
    }
  }

  const upstream = `${UPSTREAM_URL}?${upstreamParams.toString()}`;

  try {
    const upstreamResponse = await fetch(upstream, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
      },
    });

    // 解析上游响应，只返回 data 数组（剥离 copyright/notes 外层）
    // 兼容上游返回 { data: [...] } 或直接数组两种格式
    const body = await upstreamResponse.text();
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      return new Response(body, {
        status: upstreamResponse.status,
        headers: {
          'content-type': upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=300',
          'access-control-allow-origin': '*',
        },
      });
    }

    const data = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);

    return new Response(JSON.stringify(data), {
      status: upstreamResponse.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'access-control-allow-origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '上游请求失败', detail: String(error) }), {
      status: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
    });
  }
}

// 处理预检请求
export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type',
      'access-control-max-age': '86400',
    },
  });
}
