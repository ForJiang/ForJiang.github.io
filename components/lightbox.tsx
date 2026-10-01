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
 * 全屏原图查看器。遮罩点击 / Esc 关闭，左右方向键或底部的按钮切换，
 * 图片本身支持左右滑动切换（pointer 拖拽，松手超过阈值即翻页）。
 * 不自动播放：切换只由用户操作触发，看多久都不会被抢走。
 * z 轴必须高于鼠标轨迹画布（z-9999），否则会被轨迹层盖住。
 *
 * 原图是 2400px 无损 WebP（每张 ~3MB），点开才开始下载会白等数秒。
 * 因此展示分两层：thumb 封面变体立即显示（缓存命中、零等待），
 * 原图 onLoad 后淡入盖住它；同时预载相邻两张，翻页时无需再等。
 *
 * 没有两侧的悬浮箭头：竖屏手机上它们会被系统工具栏 / 手势区挡住
 * （用户实测），切换入口改为底部按钮 + 图片滑动。信息与控件各自
 * 水平居中，整组内容在遮罩里垂直居中：pb 只留 iOS 工具栏的余量，
 * 不再为旧版自动轮播预留大段空白。
 */
export default function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const current = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fullLoaded, setFullLoaded] = useState(false);
  // 拖拽状态：区分「点按」与「真的拖了」只需 startX 与指针 id 即可判断
  const dragRef = useRef<{ id: number; startX: number } | null>(null);
  // 滑动翻页会让带 key 的舞台重挂载，浏览器随后派发的 click 会落到遮罩上
  // （down/up 的目标节点已不是同一个）——吞掉这一次 click 防止误关。但不能
  // 用一个常驻的布尔标记：万一那一次 click 没来（指针取消、手指滑出屏幕），
  // 残留的 true 会把用户接下来点「下一张」的那一下也吞掉——按钮看得见、
  // 点得住、就是没反应。改成时间窗：浏览器补发的 click 就在翻页后几毫秒，
  // 而人不可能在同一瞬间又去点按钮。
  const suppressClickUntilRef = useRef(0);

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
      if (e.key === "Escape") { onClose(); }
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

  const onStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // 落在按钮/链接上的按下不是拖拽：一旦这里捕获指针，整颗指针序列（含兼容
    // 鼠标事件与最终 click）都会被重定向到 stage 元素，按钮永远收不到 click
    // （实测点「下一张」毫无反应即此原因）。stage 里只有图片，这条是兜底。
    if ((e.target as Element | null)?.closest?.("button, a")) return;
    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* 指针已释放时无需捕获 */
    }
    dragRef.current = { id: e.pointerId, startX: e.clientX };
    const s = stageRef.current;
    if (s) s.style.transition = "none";
  };

  const onStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const s = stageRef.current;
    if (s) s.style.transform = `translateX(${e.clientX - d.startX}px)`;
  };

  const endStageDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    const dx = e.clientX - d.startX;
    const s = stageRef.current;
    if (Math.abs(dx) > 60) {
      // 翻页：index 变化会让带 key 的舞台重挂载，位移自然归零
      suppressClickUntilRef.current = e.timeStamp + 700;
      step(dx < 0 ? 1 : -1);
    } else if (s) {
      s.style.transition = "transform 0.2s ease";
      s.style.transform = "translateX(0)";
    }
  };

  if (!current) return null;

  return (
    <m.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-black/90 p-4 pb-8 backdrop-blur-md [touch-action:pan-y]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        // 翻页后浏览器补发的那一次 click 落在遮罩上，不吞就会误关灯箱；
        // 窗口只有 700ms，正常点击不会受影响（见 suppressClickUntilRef）
        if (e.timeStamp < suppressClickUntilRef.current) return;
        onClose();
      }}
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

      {/* stopPropagation：点图片 itself 不关闭，只有点遮罩才关。
          尺寸由 thumb 撑起，原图绝对定位铺在其上——两者长宽比相同
          （同一母版缩出），淡入时几何完全重合。 */}
      <m.div
        key={current.src}
        className="relative max-h-[80vh] max-w-[92vw] shadow-2xl"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 滑动手势面只覆盖图片本身，绝不铺满整个遮罩：捕获指针会把随后的
            click 一起重定向到这个元素，而它外层的图片容器上有 stopPropagation
            ——于是点遮罩暗处的按下会被当成「在拖图」，关闭逻辑永远收不到那次
            click（实测点暗处毫无反应，必须按 Esc 或点右上角 X 才关）。
            在这里起手拖拽，图片左右滑动切换；遮罩其余地方的点击照常关闭。 */}
        <div
          ref={stageRef}
          className="relative [touch-action:pan-y]"
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={endStageDrag}
          onPointerCancel={endStageDrag}
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
            draggable={false}
            className={`absolute inset-0 h-full w-full rounded-lg object-contain transition-opacity duration-500 ${
              fullLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!fullLoaded && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" aria-hidden="true" />
            </span>
          )}
        </div>
      </m.div>

      <div
        className="max-w-[92vw] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-semibold text-white">{current.title}</p>
        <p className="mt-1 text-sm text-white/70">{current.desc}</p>
      </div>

      {/* 底部控制条：切换按钮与页码合成一行，整组水平居中；
          pb-8 让控件避开 iOS 底部工具栏 */}
      {items.length > 1 && (
        <div
          className="flex items-center justify-center gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => step(-1)}
            aria-label="上一张"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="min-w-[3rem] text-center text-xs text-white/45">
            {index + 1} / {items.length}
          </p>
          <button
            onClick={() => step(1)}
            aria-label="下一张"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </m.div>
  );
}
