import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "vote就活 - 就活生のための投票アプリ",
  description: "就活生のための投票・アンケートアプリ。企業選び、業界研究、ES対策など、就活に関する疑問をみんなで解決しよう。",
  openGraph: {
    title: "vote就活 - 就活生のための投票アプリ",
    description: "就活生のための投票・アンケートアプリ。企業選び、業界研究、ES対策など、就活に関する疑問をみんなで解決しよう。",
    url: "https://voteapp-4pn3.vercel.app",
    siteName: "vote就活",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "vote就活 - 就活生のための投票アプリ",
    description: "就活生のための投票・アンケートアプリ。企業選び、業界研究、ES対策など、就活に関する疑問をみんなで解決しよう。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
