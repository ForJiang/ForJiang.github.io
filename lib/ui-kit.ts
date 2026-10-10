import type { PointerEvent as ReactPointerEvent } from "react";

/**
 * 单页各区块（Hero 之外的六个 section）共用的样式片段与交互辅助。
 * 原先是 page.tsx 里的模块级常量；注意 tailwind.config.ts 的 content 必须
 * 扫到 lib/，这里的类字符串才会进产物（见该文件内的说明）。
 */

export const SECTION_BADGE = "bg-white/10 text-white border-white/25";
export const TEXT_SHADOW = "[text-shadow:0_2px_18px_rgba(0,0,0,0.78),0_0_8px_rgba(0,0,0,0.55)]";
export const BODY_SHADOW = "[text-shadow:0_1px_12px_rgba(0,0,0,0.72),0_0_6px_rgba(0,0,0,0.45)]";
// glass-soft：globals.css 里 WebKit 的降级钩子（Safari 去掉 backdrop-filter）
export const GLASS_CARD = "glass-soft border-white/15 bg-black/40 backdrop-blur-sm";
export const GLASS_TAG = "bg-white/10 text-white/85 border-transparent";

/** 区块标题组的统一样式：徽章 + 逐字标题 + 副标题，各区块一致 */
export const SECTION_SHELL = "min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16";

/**
 * 平滑滚动到锚点区块（导航链接与 Hero CTA 共用）。
 * 两件事原先只有一半站点做了：① 减少动态效果偏好下瞬移——滚动也是动效，
 * 与 globals.css 里成片的 prefers-reduced-motion 降级同一立场（此前
 * page.tsx 的 scrollTo 有、site-nav 的 anchorClick 没有）；② 把 hash 写进
 * 地址栏——链接用 preventDefault 自行滚动，Next 的 Link 会整体跳过导航，
 * 地址栏不留痕，与「可刷新、可分享」的承诺不符；replaceState 补上 hash，
 * 不触发原生跳转、也不添历史记录。
 */
export const scrollToSection = (id: string) => {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  if (typeof window !== "undefined" && window.history?.replaceState) {
    window.history.replaceState(null, "", `#${id}`);
  }
};

/**
 * 卡片 hover 光晕跟随指针：只写 CSS 变量，不 setState——每次 pointermove
 * 触发一次重渲染会让卡片里的逐字 span 全部重新 diff，代价不值。
 */
export const trackSpotlight = (e: ReactPointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
  el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
};
