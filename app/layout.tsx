import '@/app/globals.css';
import '@/styles/mana-symbols.css';
import 'keyrune/css/keyrune.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: "十七地 - MTG轮抽数据分析",
  description: "Magic: The Gathering轮抽数据分析平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
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
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
} 