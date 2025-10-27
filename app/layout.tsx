import '@/app/globals.css';
import '@/styles/mana-symbols.css';
import 'keyrune/css/keyrune.css';
import 'mana-font/css/mana.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Metadata } from 'next';
import { AnalyticsTracker } from '@/components/analytics-tracker';

export const metadata: Metadata = {
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
  verification: {
    google: 'fZE6msqO72ehpDb_NWkNaAe_6-pXGhM_uboivoHBUT8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="baidu-site-verification" content="codeva-KeyiIuwEpJ" />
        <meta name='impact-site-verification' content='c7bc9df3-4c83-49a6-88ce-7972dfc5ffaf' />
        <meta name="application-name" content="十七地" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="十七地" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f6f4f1" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', initialTheme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[--background] font-sans">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <AnalyticsTracker />
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
} 
