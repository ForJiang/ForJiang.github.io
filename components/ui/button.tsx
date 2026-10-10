import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 站点对 shadcn Button 的唯一用法是页脚的图标按钮（ghost + icon），因此不再
 * 需要 cva 变体系统：default / secondary 变体与 default 尺寸从未用过，它们的
 * 类字符串（bg-primary、bg-secondary……）却会被 Tailwind 扫进产物 CSS。
 * 全部收敛成一组固定样式，连 cva 依赖也一并省掉（badge 同步简化后整个依赖
 * 就移除了）。颜色全部交给调用方：页脚按钮自带 text-white / hover:bg-white/10。
 * 焦点描边不自己设：原先的 focus-visible:ring-ring 在纯黑底上近黑、几乎看不
 * 见，删掉后走 globals.css 的全站统一白色描边。
 * 另：asChild + @radix-ui/react-slot 早前已清——全站没有一处用 asChild。
 */
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
))
Button.displayName = "Button"

export { Button }
