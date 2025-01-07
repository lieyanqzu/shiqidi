let cachedIP: string | null = null;

// IP 获取服务列表
const IP_APIS = [
  'https://api.ipify.org?format=json',
  'https://api.ip.sb/geoip',
  'https://ipapi.co/json/',
  'https://api.myip.com'
];

// 获取IP地址（带缓存）
async function getClientIP(): Promise<string> {
  if (cachedIP) return cachedIP;

  for (const apiUrl of IP_APIS) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const ip = data.ip || data.query;
      if (ip) {
        cachedIP = ip;
        return ip;
      }
    } catch (error) {
      console.error(`Failed to get IP from ${apiUrl}:`, error);
      continue;
    }
  }
  
  cachedIP = 'unknown';
  return 'unknown';
}

// 记录单次访问
export async function trackPageView(page: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const ip = await getClientIP();
    
    await fetch(`${process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL}/1.1/classes/PageView`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LC-Id': process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID!,
        'X-LC-Key': process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY!
      },
      body: JSON.stringify({
        page,
        ip,
        userAgent: window.navigator.userAgent,
        timestamp: { 
          __type: 'Date',
          iso: new Date().toISOString()
        }
      })
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}
