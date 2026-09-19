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
 * 蔚蓝档案(Blue Archive)风格的鼠标流光轨迹。
 * 深色主题:蓝白发光流光 + 水晶碎粒(叠加发光混合);
 * 浅色主题:蓝色墨水笔触(普通混合,保证可见)。
 */
export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const isDark = () => document.documentElement.classList.contains("dark");

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

    function frame(now: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dark = isDark();
      ctx.clearRect(0, 0, w, h);
      while (pts.length && now - pts[0].t > LIFE) pts.shift();

      if (pts.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (dark) ctx.globalCompositeOperation = "lighter";
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const fade = 1 - (now - p1.t) / LIFE;
          if (fade <= 0) continue;
          /* 光晕层 */
          ctx.strokeStyle = dark
            ? `rgba(96,205,255,${(0.22 * fade).toFixed(3)})`
            : `rgba(59,130,246,${(0.26 * fade).toFixed(3)})`;
          ctx.lineWidth = 11 * fade;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          /* 亮芯层 */
          ctx.strokeStyle = dark
            ? `rgba(255,255,255,${(0.9 * fade).toFixed(3)})`
            : `rgba(23,94,210,${(0.55 * fade).toFixed(3)})`;
          ctx.lineWidth = 2.6 * fade;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
        /* 头部光点 */
        const head = pts[pts.length - 1];
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 24);
        if (dark) {
          g.addColorStop(0, "rgba(255,255,255,.85)");
          g.addColorStop(0.35, "rgba(125,211,252,.35)");
          g.addColorStop(1, "rgba(125,211,252,0)");
        } else {
          g.addColorStop(0, "rgba(37,99,235,.35)");
          g.addColorStop(1, "rgba(37,99,235,0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
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
        if (dark) ctx.globalCompositeOperation = "lighter";
        diamond(
          p.x,
          p.y,
          p.size * a,
          p.rot,
          dark
            ? `rgba(186,230,253,${(a * 0.95).toFixed(3)})`
            : `rgba(37,99,235,${(a * 0.55).toFixed(3)})`
        );
        ctx.globalCompositeOperation = "source-over";
      }

      if (pts.length || particles.length) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    }

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
