const clientDataCache = new Map<string, unknown>();

export async function fetchPublicJson<T>(relativePath: string): Promise<T> {
  const normalized = relativePath.replace(/^\/+/, '');
  if (clientDataCache.has(normalized)) {
    return clientDataCache.get(normalized) as T;
  }
  const response = await fetch(`/data/${normalized}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`数据加载失败：${normalized}`);
  }
  const data = await response.json() as T;
  clientDataCache.set(normalized, data);
  return data;
}
