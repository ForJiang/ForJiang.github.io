"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 把文本拆成动画的最小单元。
 * 英文按空白拆词；中日韩按「字」拆——中文没有空格，若按空白拆会把整句当成
 * 一个单元，逐字动画就失效了。混排时两类规则同时生效。
 */
export function splitRevealUnits(input: string): string[] {
  if (!input) return [];
  const units: string[] = [];
  const re = /[A-Za-z0-9][A-Za-z0-9'’.,!?;:"()[\]/@#$%&*+=<>~`^|_-]*|\s+|[\s\S]/g;
  // 用 exec 循环而非 matchAll：项目 tsconfig 的 target 不支持迭代 RegExpStringIterator
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    const unit = match[0];
    // 空白不产生单元，间距由每个单元的 margin-right 提供
    if (unit.trim() === "") continue;
    units.push(unit);
  }
  return units;
}

interface RevealVariantsOptions {
  stagger?: number;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: number;
}

function createRevealVariants({
  stagger = 0.035,
  delay = 0,
  duration = 0.8,
  yOffset = 24,
  blur = 10,
}: RevealVariantsOptions) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: yOffset,
      filter: `blur(${blur}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: [0.215, 0.61, 0.355, 1] },
    },
  };

  return { containerVariants, childVariants };
}

type RevealTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

/** 用 m.* 而非 motion.*：配合 LazyMotion + domAnimation，避免把 framer-motion 里
 *  未使用的 drag / layout 代码拖回包里（见 origin-button.tsx 同样的处理）。 */
const MOTION_ELEMENTS = {
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
  h4: m.h4,
  p: m.p,
  span: m.span,
  div: m.div,
} as const;

export interface RevealTextProps {
  /** 要揭示的文本。传 children 为字符串时优先用 children。 */
  text?: string;
  children?: ReactNode;
  className?: string;
  /** 渲染的 HTML 标签，默认 h2。 */
  as?: RevealTag;
  /** 进入视口前等待的秒数，用于和其它元素串成出场顺序。 */
  delay?: number;
  /** 每个单元的动画时长（秒）。 */
  duration?: number;
  /** 相邻单元的间隔（秒）。中文按字算，长句宜调小。 */
  stagger?: number;
  /** 上浮起始位移（px）。 */
  yOffset?: number;
  /** 模糊强度（px）。 */
  blur?: number;
  /** 是否只在首次进入视口时播放。 */
  once?: boolean;
  style?: CSSProperties;
}

/**
 * 逐字/逐词的模糊上浮揭示动画：文本被拆成最小单元，各自从「透明 + 下移 + 模糊」
 * 过渡到清晰位置，单元之间按 stagger 错开；滚动进入视口时触发。
 */
export default function RevealText({
  text,
  children,
  className,
  as = "h2",
  delay = 0,
  duration = 0.8,
  stagger = 0.035,
  yOffset = 24,
  blur = 10,
  once = true,
  style,
}: RevealTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });

  const rawText = typeof children === "string" ? children : text || "";
  const units = splitRevealUnits(rawText);
  const { containerVariants, childVariants } = createRevealVariants({
    stagger,
    delay,
    duration,
    yOffset,
    blur,
  });

  const MotionComponent = MOTION_ELEMENTS[as] ?? m.h2;

  return (
    <LazyMotion features={domAnimation}>
      <MotionComponent
        ref={ref as never}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={cn("w-full", className)}
        style={style}
      >
        {units.map((unit, i) => (
          <m.span
            key={`${unit}-${i}`}
            variants={childVariants}
            className="inline-block"
            style={{ marginRight: "0.24em", willChange: "transform, opacity, filter" }}
          >
            {unit}
          </m.span>
        ))}
      </MotionComponent>
    </LazyMotion>
  );
}
