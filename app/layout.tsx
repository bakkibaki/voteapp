import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "投票アプリ",
  description: "投票を作成・管理できるアプリケーション",
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
