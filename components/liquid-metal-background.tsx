"use client";

import { LiquidMetal } from "@paper-design/shaders-react";

/**
 * 全站固定液态金属背景：深色底 + 单个柔和银色液滴（metaballs）。
 * fixed + zIndex -10 铺满视口，随滚动保持可见；上方内容需使用
 * 半透明深色玻璃面板 + 白色文字保证可读性。
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
      style={{ position: "fixed", inset: 0, zIndex: -10 }}
    />
  );
}
