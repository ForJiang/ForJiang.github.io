"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
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
 * 三个页面共用的外框：固定液态金属背景 + 鼠标轨迹 + 全站导航。
 * 包一层 LazyMotion + domAnimation：页面内容用 m.* 驱动入场动画时不会把
 * framer-motion 里未使用的 drag/layout 代码拖进包（约 22KB）。
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <main className="relative min-h-screen text-white">
        <LiquidMetalBackground />
        <MouseTrail />
        <SiteNav />
        {children}
      </main>
    </LazyMotion>
  );
}
