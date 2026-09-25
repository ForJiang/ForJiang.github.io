"use client";

import * as React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { cn } from "@/lib/utils";

const FILL_DURATION = 0.5;
const FILL_EASE = [0.16, 1, 0.3, 1] as const;

type Tone = "solid" | "glass";

/** 圆形填充的直径：取指针位置到按钮四个角的最大距离 ×2，保证铺满整个按钮 */
function getCoverDiameter(width: number, height: number, x: number, y: number) {
  return Math.ceil(
    2 *
      Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      )
  );
}

function hasTextContent(node: React.ReactNode): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim().length > 0;
  }
  if (Array.isArray(node)) return node.some(hasTextContent);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return hasTextContent(node.props.children);
  }
  return false;
}

/** 原生拖拽/动画事件名与 framer-motion 的 HTMLMotionProps 冲突，需剔除 */
type ButtonHTMLAttributesForMotion = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | "onAnimationEnd" | "onAnimationIteration" | "onAnimationStart"
  | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragExit"
  | "onDragLeave" | "onDragOver" | "onDragStart" | "onDrop"
>;

type AnchorHTMLAttributesForMotion = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  | "onAnimationEnd" | "onAnimationIteration" | "onAnimationStart"
  | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragExit"
  | "onDragLeave" | "onDragOver" | "onDragStart" | "onDrop"
>;

interface OriginButtonProps extends ButtonHTMLAttributesForMotion {
  /**
   * solid＝白底深字，悬停时深色圆从指针处扩散、文字转白；
   * glass＝深玻璃白字，悬停时白色圆扩散、文字转深。
   */
  tone?: Tone;
  /** 传了 href 就渲染成真实 <a>（可中键/右键新标签、可被爬取） */
  href?: string;
  children?: React.ReactNode;
}

/**
 * 悬停/按下时，圆形背景从指针位置扩散铺满按钮，同时文字反色。
 * 用 m.* 而非 motion.*：配合外层 LazyMotion+domAnimation，避免把 framer-motion
 * 里未使用的 drag/layout 代码重新打进包。
 */
export default function OriginButton({
  tone = "glass",
  href,
  className,
  children,
  disabled = false,
  onBlur,
  onClick,
  onFocus,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...props
}: OriginButtonProps) {
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 0, y: 0 });
  const [coverSize, setCoverSize] = React.useState(0);
  const isDisabled = Boolean(disabled);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    return;
  }, []);

  const updateOrigin = React.useCallback((x: number, y: number) => {
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setOrigin({ x, y });
    setCoverSize(getCoverDiameter(rect.width, rect.height, x, y));
  }, []);

  const updateOriginFromPointer = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      updateOrigin(event.clientX - rect.left, event.clientY - rect.top);
    },
    [updateOrigin]
  );

  const updateOriginFromCenter = React.useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    updateOrigin(rect.width / 2, rect.height / 2);
  }, [updateOrigin]);

  const showFill = !isDisabled && (hovered || isPressed);

  // 按钮尺寸可能随字体加载/布局变化，填充圆要跟着重算
  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!(node && showFill)) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      setCoverSize(getCoverDiameter(rect.width, rect.height, origin.x, origin.y));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const fonts = document.fonts;
    if (fonts?.ready) fonts.ready.then(measure).catch(() => undefined);
    return () => observer.disconnect();
  }, [showFill, origin.x, origin.y]);

  const fillTransition = { duration: FILL_DURATION, ease: FILL_EASE };

  const toneClasses =
    tone === "solid"
      ? "border-transparent bg-white text-zinc-950 shadow-2xl"
      : "border-white/40 bg-black/40 text-white";
  const fillClasses =
    tone === "solid"
      ? "bg-zinc-950 dark:bg-neutral-950"
      : "bg-white dark:bg-neutral-50";
  const filledTextClasses = tone === "solid" ? "text-white" : "text-zinc-950";

  const shared = {
    "aria-label": props["aria-label"],
    className: cn(
      "relative inline-flex h-11 cursor-pointer touch-manipulation select-none items-center justify-center overflow-hidden rounded-md px-8 text-sm font-medium",
      "border transition-[color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      "disabled:pointer-events-none disabled:opacity-50",
      toneClasses,
      showFill && filledTextClasses,
      className
    ),
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      onBlur?.(event as React.FocusEvent<HTMLButtonElement>);
      setIsPressed(false);
      setHovered(false);
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
      if (isDisabled) return;
      if (event.currentTarget.matches(":focus-visible")) {
        updateOriginFromCenter();
        setHovered(true);
      }
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>);
      if (
        event.defaultPrevented ||
        isDisabled ||
        event.repeat ||
        (event.key !== " " && event.key !== "Enter")
      ) {
        return;
      }
      if (event.key === " ") event.preventDefault();
      updateOriginFromCenter();
      setIsPressed(true);
      setHovered(true);
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyUp?.(event as React.KeyboardEvent<HTMLButtonElement>);
      if (event.key === " " || event.key === "Enter") {
        setIsPressed(false);
        if (!event.currentTarget.matches(":focus-visible")) setHovered(false);
      }
    },
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
      onPointerCancel?.(event as React.PointerEvent<HTMLButtonElement>);
      setIsPressed(false);
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(event as React.PointerEvent<HTMLButtonElement>);
      if (isDisabled || event.button !== 0) return;
      updateOriginFromPointer(event as React.PointerEvent<HTMLElement>);
      setIsPressed(true);
      setHovered(true);
    },
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
      if (isDisabled) return;
      updateOriginFromPointer(event as React.PointerEvent<HTMLElement>);
      setHovered(true);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);
      setHovered(false);
      setIsPressed(false);
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      onPointerUp?.(event as React.PointerEvent<HTMLButtonElement>);
      setIsPressed(false);
    },
  };

  const fill = (
    <m.span
      aria-hidden
      animate={{ scale: showFill && coverSize > 0 ? 1 : 0 }}
      className={cn("pointer-events-none absolute rounded-full", fillClasses)}
      initial={false}
      /*
       * 居中必须走 framer-motion 的 x/y（百分比按元素自身尺寸解析），由它在同一个
       * transform 里和 scale 一起管理。不能用 Tailwind 的 -translate-x-1/2 ——
       * framer-motion 为播放 scale 会覆写 transform 属性，导致圆形丢失居中、
       * 只从左上角展开。
       */
      style={{
        x: "-50%",
        y: "-50%",
        height: coverSize,
        left: origin.x,
        top: origin.y,
        width: coverSize,
      }}
      transition={fillTransition}
    />
  );

  const inner = (
    <span className="relative z-10 inline-flex items-center justify-center gap-2">
      {children}
    </span>
  );

  const extraProps = { ...props };
  delete (extraProps as { "aria-label"?: string })["aria-label"];

  return (
    <LazyMotion features={domAnimation}>
      {href ? (
        <m.a
          {...(extraProps as AnchorHTMLAttributesForMotion)}
          {...shared}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          ref={nodeRef as React.Ref<HTMLAnchorElement>}
          whileTap={isDisabled ? undefined : { scale: 0.985 }}
        >
          {fill}
          {inner}
        </m.a>
      ) : (
        <m.button
          {...extraProps}
          {...shared}
          ref={nodeRef as React.Ref<HTMLButtonElement>}
          type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
          whileTap={isDisabled ? undefined : { scale: 0.985 }}
        >
          {fill}
          {inner}
        </m.button>
      )}
    </LazyMotion>
  );
}
