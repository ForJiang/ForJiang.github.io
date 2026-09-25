"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const WORD_HEAD = /[A-Za-z0-9]/;
// 词内部允许的后续字符：撇号、句读、括号、常见符号与连字符
const WORD_TAIL = /[A-Za-z0-9'’.,!?;:"()[\]/@#$%&*+=<>~`^|_-]/;

function collectText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  // 页脚是 `© {new Date().getFullYear()} ForJiang` 这种混合子节点
  if (Array.isArray(node)) return node.map(collectText).join("");
  return "";
}

/**
 * 把文本拆成动画的最小单元。
 * 英文按空白拆词；中日韩按「字」拆——中文没有空格，若按空白拆会把整句当成
 * 一个单元，逐字动画就失效了。混排时两类规则同时生效。
 *
 * 用 Array.from 按码点遍历而不是正则的 [\s\S]：后者按 UTF-16 码元匹配，会把
 * emoji 拆成两个孤立代理项，而孤立代理项在服务端序列化与客户端 hydrate 时
 * 结果不同，直接触发整棵树注水失败。
 */
export function splitRevealUnits(input: string): string[] {
  if (!input) return [];
  const units: string[] = [];
  let word = "";
  for (const ch of Array.from(input)) {
    // 空白不产生单元，间距由每个单元的 margin-right 提供
    if (ch.trim() === "") {
      if (word) {
        units.push(word);
        word = "";
      }
      continue;
    }
    if (WORD_HEAD.test(ch)) {
      word += ch;
      continue;
    }
    if (word && WORD_TAIL.test(ch)) {
      word += ch;
      continue;
    }
    if (word) {
      units.push(word);
      word = "";
    }
    units.push(ch);
  }
  if (word) units.push(word);
  return units;
}

/** 单个单元的两种状态：从「透明 + 下移 + 模糊」过渡到清晰位置。 */
function createUnitVariants({
  duration = 0.65,
  yOffset = 24,
  blur = 10,
  delay = 0,
}) {
  return {
    hidden: {
      opacity: 0,
      y: yOffset,
      filter: `blur(${blur}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: [0.215, 0.61, 0.355, 1], delay },
    },
  };
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
  /**
   * 任意子元素模式：数组里每个元素作为独立动画单元，不再拆字。
   * 用于标签徽章、按钮这类本身是组件的场景。
   */
  items?: ReactNode[];
  children?: ReactNode;
  className?: string;
  /** 渲染的 HTML 标签，默认 h2。 */
  as?: RevealTag;
  /** 进入视口前等待的秒数，用于和其它元素串成出场顺序。 */
  delay?: number;
  /** 每个单元的动画时长（秒）。 */
  duration?: number;
  /** 相邻单元的间隔（秒）。中文按字算，长文本宜调小。 */
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
 * 逐字 / 逐块的模糊上浮揭示动画：内容被拆成最小单元，各自从「透明 + 下移 + 模糊」
 * 过渡到清晰位置，单元之间按 stagger 错开；滚动进入视口时触发。
 *
 * 全站文字共用此效果，单元数量很多，因此刻意不给单个 span 加 will-change：
 * 数百个提升层的开销比不加提示更大，交由浏览器自行决定合成时机。
 */
export default function RevealText({
  text,
  items,
  children,
  className,
  as = "h2",
  delay = 0,
  duration = 0.65,
  stagger = 0.03,
  yOffset = 24,
  blur = 10,
  once = true,
  style,
}: RevealTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  // 不缩放视口边界：缩进会把「已滚到页面最底」的贴底内容（页脚版权文字）
  // 排除在外——用户明明看得见它，IntersectionObserver 却判它不相交，
  // 文字就永远停在隐藏态。顶部同理，fixed 导航会被负的上边距漏掉。
  const isInView = useInView(ref, { once, margin: "0px" });
  // 首次入场播完后置位：切换语言会让文本换成另一套单元，新挂载的单元若再从
  // hidden 起跳，父级已经播放完 visible、不会再广播一次，它们就会永远停在隐藏态。
  // 所以重挂载的单元直接以 visible 出现。
  const revealedRef = useRef(false);
  useEffect(() => {
    if (isInView) revealedRef.current = true;
  }, [isInView]);

  const MotionComponent = MOTION_ELEMENTS[as] ?? m.h2;

  // items 模式：每个子元素一个单元，包一层 inline-block 让它能参与 transform
  const textUnits = items ? [] : splitRevealUnits(collectText(children) || text || "");
  const units: ReactNode[] = items ?? textUnits;

  return (
    <LazyMotion features={domAnimation}>
      <MotionComponent ref={ref as never} className={cn("w-full", className)} style={style}>
        {units.map((unit, i) => (
          <m.span
            key={i}
            // delay 写在 variants 里而不是 transition prop：transition prop 对
            // hidden 的初始应用同样生效，序号大的单元会连「隐藏」都被推迟，
            // 看起来像卡在可见状态一小会儿
            variants={createUnitVariants({
              duration,
              yOffset,
              blur,
              delay: delay + i * stagger,
            })}
            // 每个单元自己驱动动画，不依赖 framer 的父子 variant 传播——传播
            // 只在父级首次切换 variant 时发生，之后新挂载的子元素接不上
            initial={revealedRef.current ? "visible" : "hidden"}
            animate={isInView ? "visible" : "hidden"}
            className="inline-block"
            style={items ? undefined : { marginRight: "0.24em" }}
          >
            {unit}
          </m.span>
        ))}
      </MotionComponent>
    </LazyMotion>
  );
}
