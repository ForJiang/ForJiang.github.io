import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForJiang · 个人主页",
  description: "ForJiang 的个人主页 —— 高中生，热爱编程的学习者。",
  icons: {
    // public/favicon.png，256×256，源图由 IMG_3964 转换而来
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  other: {
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
