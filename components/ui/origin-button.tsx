"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

interface OriginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
 * 全部动画是纯 CSS：填充圆的展开是 transform transition（.origin-fill），
 * 按下缩小是 :active（.origin-press）——此前用 framer-motion 驱动这两处，
 * 为了它一个人把整座动画库拖在首屏，不值得；换成 CSS 后 framer 依赖整个移除。
 * 已知边界：原 whileTap 在禁用态不生效，这里用 isDisabled 不挂
 * .origin-press 类保持一致。
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

  const toneClasses =
    tone === "solid"
      ? "border-transparent bg-white text-zinc-950 shadow-2xl"
      : "border-white/40 bg-black/40 text-white";
  const fillClasses =
    tone === "solid" ? "bg-zinc-950" : "bg-white";
  const filledTextClasses = tone === "solid" ? "text-white" : "text-zinc-950";

  const shared = {
    "aria-label": props["aria-label"],
    className: cn(
      "relative inline-flex h-11 cursor-pointer touch-manipulation select-none items-center justify-center overflow-hidden rounded-md px-8 text-sm font-medium",
      "border transition-[color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      // 不设 focus-visible:outline-none：全站统一的白色描边在 globals.css 的
      // :focus-visible 上，按钮类组件不该自成一套——曾用默认 ring（半透明蓝，
      // 叠黑底对比度约 2.1:1，低于 WCAG 对焦点指示器的 3:1）
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
    <span
      aria-hidden
      className={cn("origin-fill pointer-events-none absolute rounded-full", fillClasses)}
      style={{
        // 平移 -50% 居中与缩放写在同一个 transform 里：CSS transition 对整个
        // transform 插值，展开时圆心始终钉在指针位置（globals.css 的 .origin-fill）
        transform: `translate(-50%, -50%) scale(${showFill && coverSize > 0 ? 1 : 0})`,
        height: coverSize,
        left: origin.x,
        top: origin.y,
        width: coverSize,
      }}
    />
  );

  const inner = (
    <span className="relative z-10 inline-flex items-center justify-center gap-2">
      {children}
    </span>
  );

  const extraProps = { ...props };
  delete (extraProps as { "aria-label"?: string })["aria-label"];

  // 按下缩小反馈交给 CSS :active（globals.css 的 .origin-press），无 JS 参与
  const pressClass = isDisabled ? undefined : "origin-press";

  return href ? (
    <a
      {...(extraProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      {...shared}
      className={cn(shared.className, pressClass)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      ref={nodeRef as React.Ref<HTMLAnchorElement>}
    >
      {fill}
      {inner}
    </a>
  ) : (
    <button
      {...extraProps}
      {...shared}
      className={cn(shared.className, pressClass)}
      ref={nodeRef as React.Ref<HTMLButtonElement>}
      type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
    >
      {fill}
      {inner}
    </button>
  );
}
