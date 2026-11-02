"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, Languages, Check } from "lucide-react";
import { useLanguage } from "./language-context";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/ui-kit";

/**
 * 全站导航。站点是单页滚动结构（用户要求技能与实战项目不单独成页，各占
 * 一屏），五个条目都是首页锚点：点下去平滑滚动到对应区块，区块自带
 * scroll-mt-16 避开固定导航的高度。用 Link 而不是 button，地址栏会留下
 * #锚点，可刷新、可分享、可中键新标签。
 *
 * 背景：标题行与展开的菜单共用外层这一层半透明底 + 毛玻璃，面板自己不再
 * 叠背景——此前面板在 nav 的 /50 上又叠一层 /70，两层合成比标题行黑一截，
 * 交界处一道明显色差（用户截图反馈）。
 *
 * 移动端菜单开合：面板常驻 DOM，用 grid-template-rows 0fr → 1fr 过渡展开
 * （globals.css 的 .menu-collapse）。此前条件渲染瞬现瞬失，非常生硬（用户
 * 反馈）；高度过渡对未知内容高度也天然适配，0fr 态 visibility:hidden，
 * 收起后链接不进 Tab 焦点序。
 */
const NAV_IDS = ["about", "skills", "projects", "videos", "contact"] as const;

/** 语言菜单的固定条目（顺序与轮换顺序一致）：名称用各语言的自我称谓 */
const LANG_ITEMS: { id: Lang; label: string }[] = [
  { id: "zh", label: "简体中文" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "zh-TW", label: "繁體中文" },
];

export default function SiteNav() {
  const { t, lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const anchorClick = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToSection(id);
    setMenuOpen(false);
  };

  // 点外部或按 Esc 关闭语言菜单；语言菜单开着时才挂监听。
  // 语言按钮渲染两份（桌面/移动各一），不能用单一 ref 判内外——两个实例
  // 共享一个 ref 时 ref 指向后渲染的实例，点另一个实例的菜单项会被误判
  // 成「外部点击」而在 click 之前把菜单关掉（实测点击选项永远不生效）。
  // 改用 closest 判定：落点在任何一个打开的菜单或其按钮内都不关。
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.("[role=menu]:not([aria-hidden='true']), [aria-haspopup='menu'][aria-expanded='true']")) return;
      setLangOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const langButton = (extraClass: string, navKind: string) => (
    <div data-nav={navKind} className={cn("relative", extraClass)}>
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
        aria-label="Switch language / 切换语言 / 言語切替 / 切換語言"
        aria-expanded={langOpen}
        aria-haspopup="menu"
      >
        <Languages className="h-4 w-4" />
        {t.langToggle}
      </button>
      {/* 四语下拉：当前语言打勾；点选项切换并收起。常驻渲染（invisible 收起），
          避免挂载时序问题；黑底保证与页面内容叠放时可读 */}
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] min-w-[9rem] rounded-lg border border-white/15 bg-black/90 backdrop-blur-md py-1.5 shadow-2xl transition-opacity duration-150",
          langOpen ? "opacity-100" : "opacity-0 invisible",
        )}
        role="menu"
        aria-hidden={!langOpen}
      >
        {LANG_ITEMS.map((item) => (
          <button
            key={item.id}
            role="menuitem"
            lang={item.id === "zh" ? "zh-CN" : item.id}
            onClick={() => {
              setLang(item.id);
              setLangOpen(false);
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs",
              lang === item.id ? "font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
            {lang === item.id && <Check className="h-3.5 w-3.5 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* 唯一的背景层：标题行与展开菜单同色同模糊，任何状态下都无接缝 */}
      <div className="bg-black/70 backdrop-blur-md border-b border-white/10">
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
              {langButton("hidden md:block", "desktop")}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              {langButton("md:hidden", "mobile")}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                aria-label={t.nav.menu}
                aria-expanded={menuOpen}
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu：常驻 DOM，开合走高度 + 透明度过渡（.menu-collapse） */}
        <div
          className={cn("menu-collapse md:hidden", menuOpen && "menu-collapse-open")}
          aria-hidden={!menuOpen}
        >
          <div className="overflow-hidden min-h-0">
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
        </div>
      </div>
    </nav>
  );
}
