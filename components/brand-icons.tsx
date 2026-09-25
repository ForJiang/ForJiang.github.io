import type { SVGProps } from "react";

/**
 * 品牌图标。lucide-react 没有 Pixiv / X 的图标（只有已停用的 Twitter 小鸟），
 * 这里按 lucide 的描边风格（24×24、stroke-width 2、round cap/join）自绘，
 * 与站内其它图标视觉一致；均为文字标签旁的辅助图形，非官方标志复刻。
 */
const strokeProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function PixivIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} className={className} {...props}>
      {/* 竖笔 + 右上碗形，对应 Pixiv 标志的 P 字形 */}
      <path d="M9 21V5" />
      <path d="M9 5h5.2a4.3 4.3 0 0 1 0 8.6H9" />
    </svg>
  );
}

export function XIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} className={className} {...props}>
      {/* 两道交叉笔画 */}
      <path d="M4.5 4.5 19.5 19.5" />
      <path d="M19.5 4.5 4.5 19.5" />
    </svg>
  );
}
