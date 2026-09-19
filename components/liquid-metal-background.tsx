"use client";

import { LiquidMetal } from "@paper-design/shaders-react";

/**
 * 全站固定液态金属背景：深色底 + 单个柔和银色液滴（metaballs）。
 * fixed + zIndex -10 铺满视口，随滚动保持可见；上方内容需使用
 * 半透明深色玻璃面板 + 白色文字保证可读性。
 * maxPixelCount 把渲染缓冲压到 720p：柔焦画面放大后几乎无差，
 * 相比默认的 4K 级缓冲（1920*1080*4）可省约 89% 的片元着色量。
 */
export default function LiquidMetalBackground() {
  return (
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
      maxPixelCount={1280 * 720}
      style={{ position: "fixed", inset: 0, zIndex: -10 }}
    />
  );
}
