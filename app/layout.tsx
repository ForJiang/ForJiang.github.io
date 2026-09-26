import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { INLINE_ICON_32 } from "@/lib/favicon-inline";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForJiang · 个人主页",
  description: "ForJiang 的个人主页 —— 高中生，热爱编程的学习者。",
  // 图标不走 metadata.icons：Next 会把 url 当路径 normalize，data URI 的
  // "data:image/png;base64," 前缀会被剥掉。改用原生 <link>，见下面 <head>。
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
    <html lang="en">
      <head>
        {/* 默认英文，与 page.tsx 的 useState<Lang>("en") 保持一致，避免注水失败 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/*
          图标链接的顺序有意义：浏览器按页面 URL 把 favicon 缓存在自己的图标
          数据库里，只把引用换成新文件路径往往不足以让已经打开着的标签页重取。
          32×32 圆角 PNG 内联成 data URI 放在最前面——图标跟着 HTML 一起到达，
          不存在可被缓存的单独请求。
        */}
        <link rel="icon" type="image/png" sizes="32x32" href={INLINE_ICON_32} />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon-rounded.png" />
        {/*
          apple-touch-icon 保持直角且整幅不透明：iOS 会自己给图标套圆角 mask，
          预先裁圆的源图会被二次裁切，透明角还会透出用户的桌面壁纸。
        */}
        <link rel="apple-touch-icon" href="/favicon.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
