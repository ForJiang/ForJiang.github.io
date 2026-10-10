import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // 底色与文字色不设默认：全站卡片都经 GLASS_CARD（lib/ui-kit.ts）提供
    // 半透明深色底，shadcn 原版的 bg-card / text-card-foreground 在深色站点
    // 上要么每次被覆盖、要么给出近黑文字色，纯多余
    className={cn("rounded-lg border shadow-sm", className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// CardFooter / CardDescription（shadcn 默认自带）全站未使用，已删——
// 死导出让维护者以为有这两类布局可用，Tailwind 也会为它们的类字符串
// （muted 系文字色等）白生成工具类。

export { Card, CardHeader, CardTitle, CardContent }
