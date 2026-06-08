import { promises as fs } from 'fs';
import path from 'path';

const publicDataRoot = path.join(process.cwd(), 'public', 'data');

function resolvePublicDataPath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const target = path.join(publicDataRoot, normalized);
  const relative = path.relative(publicDataRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`非法数据路径：${relativePath}`);
  }
  return target;
}

export async function readPublicJson<T>(relativePath: string): Promise<T> {
  const target = resolvePublicDataPath(relativePath);
  const content = await fs.readFile(target, 'utf8');
  return JSON.parse(content) as T;
}

export async function listPublicDataFiles(relativeDir: string): Promise<string[]> {
  const target = resolvePublicDataPath(relativeDir);
  const files = await fs.readdir(target);
  return files.sort();
}
