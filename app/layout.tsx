import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vote - 投票アプリ",
  description: "シンプルで使いやすい投票アプリケーション。投票を作成・管理して、みんなの意見を集めよう。",
  openGraph: {
    title: "vote - 投票アプリ",
    description: "シンプルで使いやすい投票アプリケーション。投票を作成・管理して、みんなの意見を集めよう。",
    url: "https://voteapp-4pn3.vercel.app",
    siteName: "vote",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "vote - 投票アプリ",
    description: "シンプルで使いやすい投票アプリケーション。投票を作成・管理して、みんなの意見を集めよう。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
