"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface LightboxItem {
  /** 高清原图地址（public/images 下的母版） */
  src: string;
  /**
   * 低分辨率封面变体：与卡片封面同源，打开灯箱时多半已在浏览器缓存里，
   * 立即上屏撑住版面，原图下载完毕后在其上淡入。
   */
  thumb: string;
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
 *
 * 原图是 2400px 无损 WebP（每张 ~3MB），点开才开始下载会白等数秒。
 * 因此展示分两层：thumb 封面变体立即显示（缓存命中、零等待），
 * 原图 onLoad 后淡入盖住它；同时预载相邻两张，翻页时无需再等。
 */
export default function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const current = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  const [fullLoaded, setFullLoaded] = useState(false);

  const step = (dir: number) => {
    onNavigate((index + dir + items.length) % items.length);
  };

  useEffect(() => {
    // 切换后重置淡入状态；若原图已在上一次预载中就绪（缓存命中），
    // load 事件不会再触发，这里直接按 complete 标记已加载
    setFullLoaded(false);
    if (fullRef.current?.complete && fullRef.current?.naturalWidth > 0) {
      setFullLoaded(true);
    }
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

    // 预载左右相邻的原图：看完当前这张，翻页就是即时的
    [index + 1, index - 1].forEach((i) => {
      const neighbor = items[(i + items.length) % items.length];
      if (neighbor) {
        const im = new Image();
        im.src = neighbor.src;
      }
    });

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

      {/* stopPropagation：点图片 itself 不关闭，只有点遮罩才关。
          尺寸由 thumb 撑起，原图绝对定位铺在其上——两者长宽比相同
          （同一母版缩出），淡入时几何完全重合。 */}
      <m.div
        key={current.src}
        className="relative max-h-[80vh] max-w-[92vw] cursor-zoom-out shadow-2xl"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.thumb}
          alt=""
          aria-hidden="true"
          className="max-h-[80vh] max-w-[92vw] rounded-lg object-contain"
          style={fullLoaded ? { visibility: "hidden" } : { filter: "blur(10px)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={fullRef}
          src={current.src}
          alt={current.title}
          onLoad={() => setFullLoaded(true)}
          className={`absolute inset-0 h-full w-full rounded-lg object-contain transition-opacity duration-500 ${
            fullLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!fullLoaded && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" aria-hidden="true" />
          </span>
        )}
      </m.div>

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
