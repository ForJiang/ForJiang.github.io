"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TransitionEvent as ReactTransitionEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 无限循环的横向卡片轨道（transform 驱动，无原生滚动）。
 *
 * 为什么不用 overflow 滚动 + 克隆跳位：那是「伪无限」——scrollLeft 有物理
 * 边界，触屏上用力一甩的惯性会撞到边界（橡皮筋卡住），而惯性途中程序化
 * 改 scrollLeft 在 iOS 上要么被忽略要么掐断惯性，防抖归位又等不到事件
 * 停歇。transform 方案里位置是无界的：轨道按 renderPos 平移，越过一份
 * 宽度就静默回绕（内容几份完全相同，肉眼不可见），物理上不存在边界。
 *
 * 交互模型：
 * - 拖拽：pointerdown 冻结当前过渡并从 computed transform 反推真实位置，
 *   move 直接改 renderPos（无过渡、途中越界即回绕），up 按速度投影甩动
 *   距离后过渡吸附到最近的卡片；
 * - 箭头 / 键盘左右：从当前吸附位前进 / 后退一张；
 * - 每次 transform 过渡结束都把 renderPos 回绕到 [0, W)：窗口在任何位置都
 *   完整落在三份轨道内，两侧永远有整份缓冲，单次手势（手指行程 + 吸附动画）
 *   物理上不可能触底。
 *
 * 为什么是 3 份而不是更多：renderPos 全程被 normalize 压在 [0, W)，拖拽
 * 结束的甩动投影又被 endDrag 限幅到 ±2 张——单侧最大越界 2 张 < 一份缓冲
 * （count 张），所以两侧各一份缓冲就够。份数直接决定 SSR 出多少张卡的
 * DOM（每张卡上百个逐字 span，8 个项目 ×3 份时占整页 HTML 的 74%），少两份就省一半轮播
 * 体积。三份在超宽屏下也成立：可见窗口宽 vw ≤ 3W 才不会露边，W = 卡宽
 * 30rem 时 3W = 7.5K px，远超任何在售显示器。
 *
 * 卡片的入场揭示（RevealText / whileInView）基于 IntersectionObserver，
 * 对 transform 位移同样生效，无需感知轨道机制。touch-action: pan-y 让
 * 纵向页面滚动照常、横向手势归轨道。
 */

const COPIES = 3; // 内容克隆份数：中间份常驻视区，两侧各一份缓冲
const MID = 1; // 常驻份的下标

interface ProjectCarouselProps {
  /** 单份的项目数（一份宽度 = count × 卡片步长） */
  count: number;
  prevLabel: string;
  nextLabel: string;
  /** 渲染好的卡片数组（copy-major 平铺，长度 = COPIES × count） */
  children: ReactNode;
}

export default function ProjectCarousel({ count, prevLabel, nextLabel, children }: ProjectCarouselProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // 渲染位置：0 = 中间份第一张恰好居中；正数朝「下一张」方向
  const posRef = useRef(0);
  const movedRef = useRef(false); // 本次手势是否发生过拖拽（抑制拖后的 click）
  const dragRef = useRef<{
    id: number;
    startX: number;
    startPos: number;
    lastX: number;
    lastT: number;
    v: number;
  } | null>(null);

  const metrics = useRef({ step: 0, base: 0, W: 0 });

  const setX = useCallback((animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.style.transition =
      animate && !reduced ? "transform 0.45s cubic-bezier(0.215, 0.61, 0.355, 1)" : "none";
    track.style.transform = `translateX(${metrics.current.base - posRef.current}px)`;
  }, []);

  /**
   * 把 renderPos 回绕到 [0, W) 并静默重贴轨道：各份内容相同，零视觉差。
   *
   * 区间必须是 [0, W) 而不是 [-W, W)——窗口在轨道坐标下的范围是
   * [pos - base, pos - base + wrapW]，而 base = wrapW/2 - trackLeft - W -
   * cardW/2，代入得左缘 = pos - wrapW/2 + W + cardW/2。桌面视口下
   * wrapW/2 > cardW/2，所以 pos 一旦小于 wrapW/2 - W - cardW/2（≈ -W +
   * 400px，[-W, W) 区间内完全可以到达），左缘就跌破轨道起点 trackLeft，
   * 左侧露出空白——实测向右慢拖超过约 7 张卡，左缘从满覆盖掉到 0。
   * 改成 [0, W) 后 pos 恒非负，左缘恒 ≥ W + cardW/2 - wrapW/2 ≥ 0（W 是
   * 一份的宽度，远大于视口），内容按 W 周期重复，换归位区间不改变任何
   * 可见内容，只是让窗口始终完整落在轨道内。
   */
  const normalize = useCallback(() => {
    const { step, W } = metrics.current;
    if (!W) return;
    let p = posRef.current;
    while (p >= W) p -= W;
    while (p < 0) p += W;
    // 已在区间内就什么都不做：setX(false) 会写 transition:none，无条件调用
    // 会把在途的滑动过渡打断、瞬移到目标位（连点时观感发滞）
    if (p === posRef.current) return;
    posRef.current = p;
    setX(false);
  }, [setX]);

  /** 量尺寸：step（卡片步长）、base（中间份第一张居中所需的 translateX） */
  const measure = useCallback(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap || !track.firstElementChild) return;
    const kids = Array.from(track.children) as HTMLElement[];
    if (kids.length < 2) return;
    const step = kids[1].offsetLeft - kids[0].offsetLeft;
    const W = step * count;
    // 轨道 layout 左缘相对裁剪容器的偏移（offsetLeft 是布局值，不受 transform 影响）
    const trackLeft = track.offsetLeft - wrap.offsetLeft;
    const cardW = kids[0].offsetWidth;
    // 中间份第一张的几何中心对齐容器中心：X + trackLeft + MID*W + cardW/2 = clientW/2
    const base = wrap.clientWidth / 2 - trackLeft - MID * W - cardW / 2;
    metrics.current = { step, base, W };
  }, [count]);

  useEffect(() => {
    measure();
    normalize();
    const onResize = () => {
      measure();
      normalize();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, normalize, count]);

  /** 前进 / 后退一张（箭头与键盘共用） */
  const go = useCallback(
    (dir: 1 | -1) => {
      const { step } = metrics.current;
      if (!step) return;
      // 先把位置压回 [0, W) 再前进一张。两个触发面同一根因：posRef 只被
      // transitionend 收尾的 normalize 和拖拽时每个 move 的 normalize 压回
      // 区间——连点箭头时每次点击都重启 0.45s 过渡，transitionend 在连击
      // 期间不派发，normalize 完全不运行，posRef 无界累积会把轨道推出三份
      // 克隆的缓冲（实测连点约 24 次整个轮播变空白，按住方向键 1 秒即复现）；
      // reduced-motion 下过渡为 none、transitionend 永不派发，慢按同样中招。
      // 内容按 W 周期重复，回绕的渲染画面不变。
      const before = posRef.current;
      normalize();
      const rebased = posRef.current !== before;
      posRef.current = (Math.round(posRef.current / step) + dir) * step;
      if (rebased) {
        // 回绕把 transform 平移了整整一个 W：若同一任务里紧接着启动过渡，
        // 浏览器不会渲染中间态，过渡会从回绕前的位置出发、跨 7 张反向长滑。
        // 双 rAF 越过一帧，让回绕后的画面先上屏（视觉零变化），动画位移量
        // 从而恰好是一张。
        requestAnimationFrame(() => requestAnimationFrame(() => setX(true)));
      } else {
        setX(true);
      }
    },
    [setX, normalize],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // 新手势先清「本次是否拖过」的标记——它还决定 onClickCapture 要不要吞掉
    // 随后的 click。必须放在链接守卫之前：守卫会提前 return，若把清理留在
    // 后面，上一次甩动留下的 true 就一直挂着，之后每一下点链接都被当成
    // 「拖后的点击」吞掉，而点链接自己走的也是同一条提前 return，永远清不掉
    // 它——表现为滑过一次之后卡片链接全灭、过一会又莫名其妙好了。
    movedRef.current = false;
    // 卡片里的 GitHub / Demo 链接与按钮：按下即激活，不进拖拽分支。否则
    // wrap 一旦捕获指针，整颗指针序列（含最终 click）都会被重定向到卡片
    // 元素，链接永远收不到 click——实测点卡片链接毫无反应即此原因。
    if ((e.target as Element | null)?.closest?.("a, button")) return;
    const track = trackRef.current;
    if (!track) return;
    // 若吸附过渡正在进行，冻结在当前真实画面位置（从 computed transform 反推）
    const tx = getComputedStyle(track).transform;
    if (tx && tx !== "none") {
      posRef.current = metrics.current.base - new DOMMatrixReadOnly(tx).m41;
    }
    try {
      wrapRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* 指针已释放时无需捕获 */
    }
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
    };
    setX(false);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.abs(e.clientX - d.startX) > 8) movedRef.current = true;
    d.v = (e.clientX - d.lastX) / Math.max(1, e.timeStamp - d.lastT);
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    posRef.current = d.startPos - (e.clientX - d.startX);
    normalize();
    setX(false);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    const { step } = metrics.current;
    if (!step) return;
    // 速度投影：v 为指针速度 px/ms（向左甩 v<0 → renderPos 前进）；单次限 ±2 张
    const projected = posRef.current - d.v * 180;
    const cur = Math.round(posRef.current / step);
    const target = Math.min(cur + 2, Math.max(cur - 2, Math.round(projected / step)));
    posRef.current = target * step;
    setX(true);
  };

  const onTransitionEnd = (e: ReactTransitionEvent<HTMLDivElement>) => {
    if (e.target === trackRef.current && e.propertyName === "transform") normalize();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // 拖拽过的手势不触发内部链接 / 按钮点击（原生滚动里浏览器代劳，这里自己做）
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div>
      {/*
        py-4 与 overflow-hidden：卡片 hover 要上浮 4px，裁剪容器没有纵向
        内边距时那 4px 会被裁掉；touch-action: pan-y 让纵向页面滚动照常、
        横向手势交给我们（iOS 上原生滚动由此彻底退场，也就没有了边界）。
      */}
      <div
        ref={wrapRef}
        tabIndex={0}
        onClickCapture={onClickCapture}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="-mx-2 cursor-grab overflow-hidden py-4 active:cursor-grabbing [touch-action:pan-y] [&_*]:select-none"
      >
        <div ref={trackRef} className="relative flex gap-6" onTransitionEnd={onTransitionEnd}>
          {children}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => go(-1)}
          aria-label={prevLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label={nextLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
