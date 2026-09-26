import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { INLINE_ICON_32 } from "@/lib/favicon-inline";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForJiang · 个人主页",
  description:
    "ForJiang 的个人主页：五个纯静态、可离线使用的网页工具——RVC 声音克隆、图片元数据清除器、图生 3D 高斯泼溅、函数图像生成器、hello 手写动画，另有 AI 插画作品。高中生，热爱编程的学习者。",
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
        {/*
          给 WebKit（Safari 及 iOS 上的全部浏览器）打类，供 globals.css 做
          引擎降级：卡片的大面积 backdrop-filter 在滚动时每帧都要重滤背景，
          是 Safari 滚动掉帧的主要来源之一。必须是 head 内联脚本——class 要在
          首帧渲染前就位；React 不管理 <html> 的 className，注水不会冲掉它。
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/AppleWebKit/.test(navigator.userAgent)&&!/Chrom(e|ium)|Edg\\//.test(navigator.userAgent))document.documentElement.classList.add('webkit');",
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
