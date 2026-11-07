"use client";

/**
 * ForJiang · https://forjiang.github.io
 * © 2026 ForJiang. 个人主页项目源码。
 */

import type { ReactNode } from "react";
import { useInViewOnce } from "@/lib/use-in-view";

/**
 * 图片擦除揭示包装（方法引用自 AL-1S 项目 components/img-reveal.tsx）：进入
 * 视口挂 play 类，globals.css 的 .img-reveal 规则让 img 的 clip-path 从左到
 * 右扫出、缩放 1.06→1 回落。懒加载 img 的「加载」与「揭示」由此解耦——图
 * 已就绪但未进视口时保持隐藏，进视口才开始揭示，不会露出加载到一半的半张图。
 * 触发用站内 useInViewOnce（阈值 0，与 EnterBlock 同拍），无 IO 环境直接
 * 显示；prefers-reduced-motion 下由 globals.css 降级为直接显示。
 * 注意：本包装层接管画廊卡的悬停放大（group-hover:scale-105 从 img 外移到
 * 这里）——transform 留在 img 上会和揭示缩放互写，0.9s 揭示过渡会吞掉悬停
 * 0.5s 的手感。
 */
export default function ImgReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`img-reveal ${inView ? "img-reveal-play" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
