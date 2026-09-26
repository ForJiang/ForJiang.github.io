"use client";

import { useEffect, useRef } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";

/**
 * 全站固定液态金属背景：深色底 + 单个柔和银色液滴（metaballs）。
 *
 * 渲染精度：库默认按 max(dpr, 2) 倍渲染（minPixelRatio=2，同时承担超采样抗
 * 锯齿），再把总像素数压进 maxPixelCount。所以 cap 一旦低于「CSS 尺寸 × 4」，
 * 画面就会被降采样拉虚——Retina 上尤其明显。最高档取库默认的 1920×1080×4
 * (≈8.3MP)，正好覆盖 1440p 级 Retina 屏的原生精度；往下三档留给自适应降档。
 *
 * 自适应画质：从最高档起步，实测帧时间不达标就逐级降档，采样周期刻意短
 * （0.5s 稳定 + 60 帧采样），让带不动的设备在一秒出头就落回能 hold 住的档位，
 * 避免加载头几秒掉帧。抗锯齿依赖超采样，因此档位只影响边缘锐度、不产生锯齿；
 * 快设备自动停留在最高档。fixed + zIndex -10 铺满视口；上方内容需使用半透明
 * 深色玻璃面板 + 白色文字保证可读性。
 */
const QUALITY_TIERS = [
  1920 * 1080 * 4, // ≈8.3MP：1440p 级 Retina 的原生精度
  2560 * 1440, //    ≈3.7MP
  1920 * 1080, //    ≈2.1MP
  1280 * 720, //     ≈0.9MP：弱设备兜底
];
const TARGET_FRAME_MS = 17.5; // ≈57fps 的帧时间预算，留出余量保持满帧观感

interface ShaderMountLike {
  setMaxPixelCount?: (count?: number) => void;
}

export default function LiquidMetalBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;

    const getMount = (): ShaderMountLike | undefined => {
      const el = wrapRef.current?.firstElementChild as
        | (HTMLElement & { paperShaderMount?: ShaderMountLike })
        | null;
      return el?.paperShaderMount;
    };

    /**
     * 采样帧时间判档。setMaxPixelCount 每次都会触发画布 resize / 重新编译，
     * 紧跟其后的几帧是几十毫秒的长帧——不剔掉的话 p95 会被污染，每一档都会被
     * 误判成「带不动」而一路降到底（实测过）。所以先等连续 8 帧回到正常时长
     * 再正式采样 60 帧，判档值取中位数与 p90×0.8 的较大者：中位数抗个别毛刺，
     * p90 项保留对持续卡顿的惩罚。稳定等待超过 ~4s（8×30 次）视为该档完全
     * 带不动，直接判失败。
     */
    const measureFrameTime = () =>
      new Promise<number>((resolve) => {
        const deltas: number[] = [];
        let last = performance.now();
        let stable = 0;
        let ticks = 0;
        const tick = (now: number) => {
          const d = now - last;
          last = now;
          if (++ticks > 240) {
            resolve(999); // 始终稳定不下来，按最差处理触发降档
            return;
          }
          if (d > 33) {
            stable = 0;
            raf = requestAnimationFrame(tick);
            return;
          }
          if (++stable < 8) {
            raf = requestAnimationFrame(tick);
            return;
          }
          deltas.push(d);
          if (deltas.length <= 60) {
            raf = requestAnimationFrame(tick);
          } else {
            deltas.shift();
            deltas.sort((a, b) => a - b);
            const median = deltas[Math.floor(deltas.length / 2)];
            const p90 = deltas[Math.floor(deltas.length * 0.9)];
            resolve(Math.max(median, p90 * 0.8));
          }
        };
        raf = requestAnimationFrame(tick);
      });

    (async () => {
      // 等待 shader 挂载完成
      for (let i = 0; i < 40 && !getMount(); i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (cancelled) return;
      }
      for (const tier of QUALITY_TIERS) {
        if (cancelled) return;
        getMount()?.setMaxPixelCount?.(tier);
        await new Promise((r) => setTimeout(r, 500)); // 等 resize 与合成稳定
        if (cancelled) return;
        const effectiveMs = await measureFrameTime();
        if (cancelled) return;
        if (effectiveMs <= TARGET_FRAME_MS) return; // 该档位能稳住满帧，停在这里
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      /*
       * 滚动时背景必须纹丝不动：高度用 100lvh（工具栏收起后的视口高，全程恒定），
       * canvas 不会因地址栏伸缩而反复 resize——dvh 会在每次滚动时触发 canvas 重建，
       * 表现为背景滑动 + 卡顿，故不能用 dvh。
       * 只锚 top 不锚 bottom：地址栏收起时视口变高，锚 bottom 会把背景往下拽。
       * 不加 will-change/translateZ：把 fixed 提成合成层在 iOS 上反致滚动抖动。
       * 工具栏展开时底部多出的部分被视口裁掉，收起时正好铺满，不会露黑边。
       */
      className="shader-bg fixed left-0 right-0 top-0 -z-10 overflow-hidden"
    >
      <LiquidMetal
        colorBack="#0a0a0c"
        colorTint="#ced2da"
        shape="metaballs"
        repetition={1}
        /*
         * scale 控制液滴场相对视口的大小，不是整体缩放画面：
         * metaballs 的场是边长 1 的正方形，视口短边只覆盖 0.65/scale 个 shapeUV
         * 单位，而 5 个球的轨道(0.566)+影响半径(1.0)可达 1.566，scale < 1 会放大
         * 液滴、超出视口短边被硬切出直边。0.5 使液滴直径约为短边的 67%、四周留
         * 33% 余量，漂移全程不触边。
         * offsetX/offsetY 默认 0：液滴群在视口正中央漂移——那会压在 Hero 标题和
         * 副标题上。曾按「文字不要被遮挡」的要求把它们改成缩小下移（scale 0.38 /
         * offsetY 0.3），后用户明确「不用考虑阅读性，居中播放」，故恢复原值。
         */
        scale={0.5}
        softness={0.45}
        distortion={0.12}
        contour={0.35}
        shiftRed={0.15}
        shiftBlue={0.15}
        speed={0.7}
        maxPixelCount={QUALITY_TIERS[0]}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
