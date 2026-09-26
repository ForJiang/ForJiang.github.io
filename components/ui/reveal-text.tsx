"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const WORD_HEAD = /[A-Za-z0-9]/;
// 词内部允许的后续字符：撇号、句读、括号、常见符号与连字符
const WORD_TAIL = /[A-Za-z0-9'’.,!?;:"()[\]/@#$%&*+=<>~`^|_-]/;

/**
 * 超过这个单元数就自动弃用 blur：filter 过渡无法在合成器上运行，只能逐帧
 * 栅格化。实测滚动揭示长段落（~123 个单元同时过渡）在 WebKit 上直接把帧率
 * 拖到 55fps 以下；opacity/transform 是合成器动画不受影响。短标题保留模糊。
 */
const BLUR_UNIT_CAP = 48;

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

type RevealTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

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
  /** 模糊强度（px）。单元数超过 BLUR_UNIT_CAP 时自动降为 0。 */
  blur?: number;
  /** 是否只在首次进入视口时播放。 */
  once?: boolean;
  style?: CSSProperties;
}

/**
 * 逐字 / 逐块的模糊上浮揭示动画：内容被拆成最小单元，各自从「透明 + 下移 + 模糊」
 * 过渡到清晰位置，单元之间按 stagger 错开；滚动进入视口时触发。
 *
 * 动画完全由 CSS transition 驱动（globals.css 的 .reveal-unit / .reveal-play），
 * 而不是 framer-motion：framer 会为每个单元跑一个 JS rAF 循环逐帧写内联样式，
 * 上百个单元同时过渡时主线程每帧要做上百次样式写入 + 重算，Safari 上直接掉帧；
 * 换成 CSS 后主线程只在容器上切换一次 class，opacity/transform 的逐帧工作
 * 全部移到合成器。组件的 props API 与 framer 版本保持一致。
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
  // hidden 起跳，父级已经播放完、不会再切换一次 class，它们就会永远停在隐藏态。
  // 所以重挂载的单元直接以可见状态出现（挂载时容器已带 reveal-play，无过渡）。
  const revealedRef = useRef(false);
  useEffect(() => {
    if (isInView) revealedRef.current = true;
  }, [isInView]);

  const textUnits = items ? [] : splitRevealUnits(collectText(children) || text || "");
  const units: ReactNode[] = items ?? textUnits;
  const unitCount = units.length;
  const effBlur = unitCount > BLUR_UNIT_CAP ? 0 : blur;

  // Safari 上文字后面出现灰色半透明方块，就是残留的 filter。动画播完后单元
  // 还带着 blur(0px)，视觉上等于 none，但 Safari 只要看到 filter 不是 none 就
  // 会给元素建合成层，在那层里显出一块和文字等大的灰色矩形——逐字拆得越散，
  // 灰块越多（用户在 contact 标题上每个词一块）。所以播完就给容器加
  // reveal-done，由 CSS 把 filter 摘掉。切换语言导致单元数变化时也会立刻摘：
  // 那时文字本来就是直接出现的。
  const playedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isInView) return;
    if (playedRef.current) {
      el.classList.add("reveal-done");
      return;
    }
    playedRef.current = true;
    // 最后一个单元的动画结束时刻：delay + (n-1)*stagger + duration
    const total = delay + Math.max(0, unitCount - 1) * stagger + duration;
    const timer = window.setTimeout(
      () => el.classList.add("reveal-done"),
      (total + 0.15) * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [isInView, unitCount, delay, stagger, duration]);

  // span 是 inline，width:100% 会让浏览器把容器算成只有一行的宽度，
  // 里面的 inline-block 单元就会逐个换行，中文逐字直接竖排
  const isInline = as === "span";
  const Tag = as;
  // 动画参数全部走 CSS 变量下发：在 render 里算好，服务端与客户端一致，
  // 每个单元的错峰延迟用 calc(var(--reveal-delay) + var(--ri) * var(--reveal-stagger))
  const hostStyle = {
    ...style,
    "--reveal-delay": `${delay}s`,
    "--reveal-dur": `${duration}s`,
    "--reveal-stagger": `${stagger}s`,
    "--reveal-y": `${yOffset}px`,
    "--reveal-blur": `${effBlur}px`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as never}
      className={cn(
        !isInline && "w-full",
        isInView || revealedRef.current ? "reveal-play" : undefined,
        className,
      )}
      style={hostStyle}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          className={cn("reveal-unit", !items && "reveal-gap")}
          style={{ "--ri": i } as CSSProperties}
        >
          {unit}
        </span>
      ))}
    </Tag>
  );
}
