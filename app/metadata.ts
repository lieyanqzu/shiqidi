import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: "十七地 - MTGA小助手",
    template: "%s | 十七地"
  },
  description: "你的万智牌：竞技场小助手，提供轮抽数据查询、MTGA活动日历、精研通行证计算器等功能",
  keywords: ["MTGA", "万智牌", "竞技场", "十七地", "MTG", "Magic: The Gathering Arena", "17Lands", "轮抽统计"],
  authors: [{ name: "lieyanqzu" }],
  creator: "十七地",
  publisher: "十七地",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://shiqidi.lenitatis.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "十七地 - MTGA小助手",
    description: "你的万智牌：竞技场小助手，提供轮抽数据查询、MTGA活动日历、精研通行证计算器等功能",
    url: 'https://shiqidi.lenitatis.com',
    siteName: "十七地",
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "十七地 - MTGA小助手",
    description: "你的万智牌：竞技场小助手，提供轮抽数据查询、MTGA活动日历、精研通行证计算器等功能",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const generateMetadata = (
  title: string,
  description: string,
  path: string = '/',
  additionalMetadata: Partial<Metadata> = {}
): Metadata => {
  return {
    ...defaultMetadata,
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url: `https://shiqidi.lenitatis.com${path}`,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    },
    ...additionalMetadata,
  };
}; 