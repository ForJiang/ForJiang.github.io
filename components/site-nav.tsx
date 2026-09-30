"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, Languages } from "lucide-react";
import { useLanguage } from "./language-context";

/**
 * 全站导航。站点是单页滚动结构（用户要求技能与实战项目不单独成页，各占
 * 一屏），五个条目都是首页锚点：点下去平滑滚动到对应区块，区块自带
 * scroll-mt-16 避开固定导航的高度。用 Link 而不是 button，地址栏会留下
 * #锚点，可刷新、可分享、可中键新标签。
 */
const NAV_IDS = ["about", "skills", "projects", "videos", "contact"] as const;

export default function SiteNav() {
  const { t, toggleLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const anchorClick = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const langButton = (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
      aria-label="Switch language / 切换语言"
    >
      <Languages className="h-4 w-4" />
      {t.langToggle}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* 导航与页脚不做逐字入场：它们是常驻框架，每字错峰反而显得碎；
              且 RevealText 的 w-full 容器会把 button 的固有宽度算错，中文
              逐字后必然换行成竖排 */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            ForJiang<span className="text-white/60">.</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_IDS.map((id) => (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={anchorClick(id)}
                className="text-sm font-medium text-white/75 hover:text-white transition-colors"
              >
                {t.nav[id]}
              </Link>
            ))}
            {langButton}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            {langButton}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
              aria-label={t.nav.menu}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            {NAV_IDS.map((id) => (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={anchorClick(id)}
                className="text-left text-sm font-medium text-white/75 hover:text-white transition-colors py-2"
              >
                {t.nav[id]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
