// 支持者名单
// 由 scripts/fetch-sponsors.js 在构建时拉取爱发电 API 覆盖 public/data/sponsors.json
// 无凭据时脚本会写空数组，构建不会失败
import sponsorsData from '../public/data/sponsors.json';

export interface Sponsor {
  /** 赞助者展示名（爱发电昵称） */
  name: string;
  /** 最近一次赞助时间，YYYY-MM-DD 格式 */
  since: string;
  /** 头像 URL（爱发电 CDN） */
  avatar: string;
  /** 累计赞助金额，单位元（保留原始字符串精度） */
  sumAmount: string;
}

export const sponsors: Sponsor[] = (sponsorsData as Sponsor[] | null) ?? [];
