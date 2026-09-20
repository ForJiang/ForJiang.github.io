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
      className="fixed inset-0 -z-10"
      style={{
        /* dvh 跟随移动端地址栏伸缩，不会像 100vh 那样溢出或留白 */
        width: "100vw",
        height: "100dvh",
        /* GPU 独立合成层：滚动时不触发主线程重绘，消除移动端卡顿 */
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      <LiquidMetal
        colorBack="#0a0a0c"
        colorTint="#ced2da"
        shape="metaballs"
        repetition={1}
        scale={0.75}
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
