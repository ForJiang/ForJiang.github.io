"use client";

import { useEffect, useRef } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";

/**
 * 全站固定液态金属背景：深色底 + 单个柔和银色液滴（metaballs）。
 *
 * 自适应画质：从最高档渲染缓冲起步，实测帧时间不达标才逐级降档。
 * 该着色器的抗锯齿依赖超采样（渲染精度高于 CSS 分辨率），因此
 * 档位只会影响边缘锐度而不会产生锯齿；快设备自动停留在最高档。
 * fixed + zIndex -10 铺满视口；上方内容需使用半透明深色玻璃面板
 * + 白色文字保证可读性。
 */
const QUALITY_TIERS = [2560 * 1440, 1920 * 1080, 1280 * 720];
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

    /** 采样约 1.5 秒帧时间，用 p95 惩罚偶发卡顿后的"有效帧时间" */
    const measureFrameTime = () =>
      new Promise<number>((resolve) => {
        const deltas: number[] = [];
        let last = performance.now();
        const tick = (now: number) => {
          deltas.push(now - last);
          last = now;
          if (deltas.length <= 90) {
            raf = requestAnimationFrame(tick);
          } else {
            deltas.shift();
            deltas.sort((a, b) => a - b);
            const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
            const p95 = deltas[Math.floor(deltas.length * 0.95)];
            resolve(Math.max(avg, p95 * 0.7));
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
        await new Promise((r) => setTimeout(r, 900)); // 等 resize 与合成稳定
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
         * 33% 余量，漂移全程不触边。offsetY 在 /scale 之前叠加，屏幕位移量与 scale
         * 无关，保持 0.18 维持液滴下移避开文字的构图。
         */
        scale={0.5}
        offsetY={0.18}
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
