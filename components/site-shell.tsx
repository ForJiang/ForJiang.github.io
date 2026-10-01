"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import SiteNav from "./site-nav";

/*
 * 液态金属背景异步加载：@paper-design/shaders-react 体积大且纯装饰，
 * 拆出首屏关键路径后文字先出图，shader 随后补上（body 已是纯黑，无闪屏）。
 */
const LiquidMetalBackground = dynamic(
  () => import("@/components/liquid-metal-background")
);

/*
 * 鼠标流光轨迹同样是纯装饰，且要在 hydration 后才开始跑：拆成独立 chunk，
 * 不占首屏 JS，页面文字可更早达到可交互。
 */
const MouseTrail = dynamic(() => import("@/components/mouse-trail"));

/**
 * 页面外框：固定液态金属背景 + 鼠标轨迹 + 全站导航。
 * 历史上这里包过一层 LazyMotion + domAnimation——那时入场动画靠
 * framer-motion 的 m.*，LazyMotion 能把动画库的 drag/layout 代码挡在包外。
 * 后来入场/填充/灯箱动画全部改成纯 CSS（globals.css 的 .enter-block /
 * .rise-in / .origin-fill / .lb-*），framer-motion 依赖整个移除，这层包装
 * 随之退场。
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen text-white">
      <LiquidMetalBackground />
      <MouseTrail />
      <SiteNav />
      {children}
    </main>
  );
}
