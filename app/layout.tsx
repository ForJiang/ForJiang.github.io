import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { INLINE_ICON_32 } from "@/lib/favicon-inline";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForJiang",
  // metadataBase 把 openGraph/twitter 里的相对图片路径解析成绝对 URL——
  // 链接卡片（iMessage / X / Slack…）抓取时要求绝对地址
  metadataBase: new URL("https://forjiang.github.io"),
  description:
    "ForJiang 的个人主页：五个纯静态、可离线使用的网页工具——RVC 声音克隆、图片元数据清除器、图生 3D 高斯泼溅、函数图像生成器、hello 手写动画，另有 AI 插画作品与演示视频。高中生，热爱编程的学习者。",
  /*
   * Open Graph / Twitter Card：iMessage、X、Slack 等分享链接时的卡片数据源。
   * 没有这组标签时 iMessage 只出「标题 + 小图标」的普通链接泡，出不了
   * apple.com 那种带大图和摘要的预览卡。og:image 用 1200×630（各平台卡片
   * 的通用比例），构图呼应站点 Hero（暗底 + 圆角头像 + 字标），源图由
   * assets/favicon-master.png 合成，脚本见 README「分享卡片」。
   */
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ForJiang",
    title: "ForJiang",
    description:
      "五个纯静态、可离线使用的网页工具 + AI 插画作品与演示视频。高中生，热爱编程的学习者。",
    locale: "zh_CN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ForJiang 个人主页——插画头像与字标",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ForJiang",
    description:
      "五个纯静态、可离线使用的网页工具 + AI 插画作品与演示视频。高中生，热爱编程的学习者。",
    images: ["/og-image.jpg"],
  },
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
        {/* 默认英文，与 language-context.tsx 的 useState<Lang>("en") 保持一致，避免注水失败 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/*
          图标链接的顺序有意义：浏览器按页面 URL 把 favicon 缓存在自己的图标
          数据库里，只把引用换成新文件路径往往不足以让已经打开着的标签页重取。
          32×32 圆角 PNG 内联成 data URI 放在最前面——图标跟着 HTML 一起到达，
          不存在可被缓存的单独请求。
        */}
        <link rel="icon" type="image/png" sizes="32x32" href={INLINE_ICON_32} />
        {/*
          128×128 与 apple-touch-icon 的文件名带内容哈希（favicon-rounded-<hash8>.png
          / favicon-<hash8>.jpg）：浏览器和 Safari 的「触摸图标」数据库都是按 URL
          缓存图标的，同 URL 换内容永远不重取。实测教训——换成新头像后线上字节
          已是新图，Safari 阅读列表的卡片却仍是旧头像，直到 URL 变化才刷新。
          哈希名让「换图」天然等于「换 URL」，各级缓存自动失效；代价是换图后要把
          新哈希名同步进这两行（README 的重生成脚本会打印出来）。
        */}
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon-rounded-6a03c9d9.png" />
        {/*
          apple-touch-icon 保持直角且整幅不透明：iOS 会自己给图标套圆角 mask，
          预先裁圆的源图会被二次裁切，透明角还会透出用户的桌面壁纸。
        */}
        <link rel="apple-touch-icon" href="/favicon-9fc345ee.jpg" />
        {/*
          视频板块的 B 站播放器是懒加载 iframe：滚近视野才发起请求。预连域名
          把 DNS 查询 + TLS 握手提前到页面空闲时段做完，用户滑到视频时播放器
          能立即开始下载，省掉一两百毫秒的连接建立时间。
        */}
        <link rel="preconnect" href="https://player.bilibili.com" />
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
