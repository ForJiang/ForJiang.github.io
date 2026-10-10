"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useInViewOnce } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

interface EnterBlockProps {
  children: ReactNode;
  className?: string;
  /** 进入视口前等待的秒数，用于和兄弟元素串出场顺序。 */
  delay?: number;
  /** 过渡时长（秒）。 */
  duration?: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
}

/**
 * 区块级入场包装：初始「透明 + 下移 20px」，进入视口后过渡回原位，只播一次。
 * framer-motion 的 whileInView 替身——机制见 lib/use-in-view.ts（IO 钩子）与
 * globals.css 的 .enter-block（过渡本体）。错峰与时长经 CSS 变量下发，
 * 服务端渲染的初始 class 与客户端一致，不影响注水。
 */
export default function EnterBlock({
  children,
  className,
  delay = 0,
  duration = 0.3,
  onMouseEnter,
}: EnterBlockProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("enter-block", inView && "enter-block-play", className)}
      style={
        {
          "--enter-delay": `${delay}s`,
          "--enter-dur": `${duration}s`,
        } as CSSProperties
      }
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}
