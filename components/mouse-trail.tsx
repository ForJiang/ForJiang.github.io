"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  life: number;
  decay: number;
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

const LIFE = 260; // 轨迹拖尾存续时长(毫秒)

/**
 * 白色鼠标流光轨迹。
 * 白色光晕 + 白色亮芯 + 水晶碎粒，全部使用叠加发光混合（lighter），
 * 在深色液态金属背景上呈现纯净的白色流光。
 */
export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 按 devicePixelRatio 渲染，上限 2：光标轨迹是全屏 2D canvas，Retina 上
    // 若低于原生分辨率会被拉伸，光晕和亮芯明显发糊；2 已覆盖绝大多数屏幕
    // （3x 的 iPhone 上再往上收益很小），同时 bounding 绘制与显存成本
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let pts: TrailPoint[] = [];
    let particles: Particle[] = [];
    let last: TrailPoint | null = null;
    let raf = 0;
    let running = false;

    const diamond = (x: number, y: number, size: number, rot: number, fill: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.62, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.62, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const burst = (x: number, y: number, count: number, power: number) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > 140) break;
        const a = Math.random() * Math.PI * 2;
        const sp = (40 + Math.random() * 110) * power;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 26,
          size: 2.5 + Math.random() * 4.5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 7,
          life: 1,
          decay: 1.5 + Math.random() * 1.6,
        });
      }
      start();
    };

    const frame = (now: number): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.globalCompositeOperation = "lighter";

      if (pts.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const fade = 1 - (now - p1.t) / LIFE;
          if (fade <= 0) continue;
          /* 光晕层 */
          ctx.strokeStyle = `rgba(255,255,255,${(0.16 * fade).toFixed(3)})`;
          ctx.lineWidth = 11 * fade;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          /* 亮芯层 */
          ctx.strokeStyle = `rgba(255,255,255,${(0.85 * fade).toFixed(3)})`;
          ctx.lineWidth = 2.6 * fade;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
        /* 头部光点 */
        const head = pts[pts.length - 1];
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 24);
        g.addColorStop(0, "rgba(255,255,255,.9)");
        g.addColorStop(0.4, "rgba(255,255,255,.3)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 水晶碎粒 */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay / 60;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx / 60;
        p.y += p.vy / 60;
        p.vy += 1;
        p.rot += p.vr / 60;
        const a = Math.max(0, p.life);
        diamond(
          p.x,
          p.y,
          p.size * a,
          p.rot,
          `rgba(255,255,255,${(a * 0.9).toFixed(3)})`
        );
      }

      ctx.globalCompositeOperation = "source-over";

      if (pts.length || particles.length) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const onMove = (e: PointerEvent) => {
      const p = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (last) {
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        if (d < 2) return;
        if (d > 30) burst(p.x, p.y, 2, 0.8);
        else if (d > 14) burst(p.x, p.y, 1, 0.6);
      }
      last = p;
      pts.push(p);
      if (pts.length > 40) pts.shift();
      start();
    };

    const onDown = (e: PointerEvent) => burst(e.clientX, e.clientY, 12, 1);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-screen w-screen"
    />
  );
}
