import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 徽章只剩「胶囊外形」这一层职责：颜色（底、字、边）全站各处都不一样
 * （区块徽章 bg-white/10、技能标签 GLASS_TAG、Hero 徽章 bg-black/40），一律
 * 由调用方的 className 提供，基础样式里不再带 bg-secondary 之类的默认色——
 * 否则每次都被 tailwind-merge 覆盖，纯多余，还让 cva 变体系统和一串从未
 * 使用的主题变量（primary/secondary）为它们陪葬。徽章是纯展示 div，不可
 * 聚焦，旧默认样式里的 focus:ring 全是死代码，一并去掉。
 */
function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors",
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
