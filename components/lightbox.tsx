"use client";

import { useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxItem {
  /** 高清原图地址（public/images 下的母版） */
  src: string;
  title: string;
  desc: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * 全屏原图查看器。遮罩点击 / Esc 关闭，左右方向键或箭头切换。
 * z 轴必须高于鼠标轨迹画布（z-9999），否则会被轨迹层盖住。
 */
export default function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const current = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);

  const step = (dir: number) => {
    onNavigate((index + dir + items.length) % items.length);
  };

  useEffect(() => {
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    // 打开期间锁滚动，避免背后的页面跟着滚
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!current) return null;

  return (
    <m.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-black/90 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-4 top-4 rounded-lg border border-white/25 p-2 text-white transition-colors hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="上一张"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2.5 text-white transition-colors hover:bg-white/15 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="下一张"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2.5 text-white transition-colors hover:bg-white/15 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* stopPropagation：点图片 itself 不关闭，只有点遮罩才关 */}
      <m.img
        key={current.src}
        src={current.src}
        alt={current.title}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-[92vw] cursor-zoom-out rounded-lg object-contain shadow-2xl"
      />

      <div
        className="max-w-[92vw] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-semibold text-white">{current.title}</p>
        <p className="mt-1 text-sm text-white/70">{current.desc}</p>
        <p className="mt-2 text-xs text-white/45">
          {index + 1} / {items.length}
        </p>
      </div>
    </m.div>
  );
}
