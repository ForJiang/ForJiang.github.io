import Link from "next/link";

/**
 * 自定义 404 页。App Router 静态导出下，未匹配路径由 Pages 返回本页
 * （out/404.html）。默认页是白底黑字的 Next 错误页，和全站深色主题
 * 完全割裂——访客点错链接时会以为跳到了别的站。这里用站点自己的
 * 深色底 + 回首页入口，保持体感一致。
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0c] px-6 text-center text-white">
      <p className="text-6xl font-bold tracking-tight sm:text-7xl">404</p>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold sm:text-2xl">页面走丢了</h1>
        <p className="text-sm text-white/60 sm:text-base">
          你要找的内容不在这里，回首页看看吧。
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        返回首页
      </Link>
    </div>
  );
}
