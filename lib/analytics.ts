let AV: any = null;
let initialized = false;
let cachedIP: string | null = null;  // 缓存的IP地址

// 初始化 LeanCloud（只在客户端执行）
async function initAV() {
  if (typeof window === 'undefined' || initialized) return;
  
  try {
    // 动态导入浏览器版本的 SDK
    const AVModule = await import('leancloud-storage/dist/av-min.js');
    AV = AVModule.default;
    
    AV.init({
      appId: process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID,
      appKey: process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY,
      serverURL: process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL
    });
    
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize LeanCloud:', error);
  }
}

// IP 获取服务列表
const IP_APIS = [
  'https://api.ipify.org?format=json',
  'https://api.ip.sb/geoip',
  'https://ipapi.co/json/',
  'https://api.myip.com'
];

// 获取IP地址（带缓存）
async function getClientIP(): Promise<string> {
  if (cachedIP) return cachedIP;  // 如果已有缓存，直接返回

  for (const apiUrl of IP_APIS) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const ip = data.ip || data.query;
      if (ip) {
        cachedIP = ip;  // 缓存获取到的IP
        return ip;
      }
    } catch (error) {
      console.error(`Failed to get IP from ${apiUrl}:`, error);
      continue;
    }
  }
  
  cachedIP = 'unknown';  // 缓存失败结果
  return 'unknown';
}

// 记录单次访问
export async function trackPageView(page: string) {
  if (typeof window === 'undefined') return;
  
  try {
    if (!initialized) {
      await initAV();
    }
    
    if (!AV) return;
    
    const ip = await getClientIP();
    const PageView = AV.Object.extend('PageView');
    const pageView = new PageView();
    
    pageView.set('page', page);
    pageView.set('ip', ip);
    pageView.set('userAgent', window.navigator.userAgent);
    pageView.set('timestamp', new Date());
    
    await pageView.save();
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}
