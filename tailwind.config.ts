import type { Config } from "tailwindcss";

const config: Config = {
  // darkMode 已删：站点是单一深色主题，globals.css 里的 .dark 覆盖块早先
  // 已移除，全站也没有一处挂 dark class 或用 dark: 工具类，留着只会让
  // 人误以为支持主题切换
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // lib/ 必须扫：SECTION_SHELL 等共享样式常量放在 lib/ui-kit.ts，不扫这
    // 一层常量里的类（py-24、bg-black/35）不会进产物——曾因此所有区块丢掉
    // 上下 96px 留白与暗色底色，几大部分挤在一起（用户反馈「靠得太近」）
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 颜色只映射仍在使用的主题变量：站点是白色文字系统，卡片/徽章/按钮的
      // 颜色全由调用方以白色系工具类提供，primary/secondary/card/accent 等
      // shadcn 默认映射没有对应类可用，留着只会诱导重新引入亮色块
      colors: {
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};

export default config;
