# 项目接力文档 — Personal Website

> 最后更新：2026-10-01 | 模式A 快速源码测绘（随每次大改动同步刷新）
> Commit: 见 git log（本文末「Git 历史摘要」）

---

## 1. 项目概览

| 属性 | 值 |
|------|----|
| 项目名 | personal-website |
| 仓库 | `ForJiang/ForJiang.github.io` |
| 线上地址 | https://forjiang.github.io |
| 框架 | Next.js 14.2.35 (App Router, 静态导出，`output: "export"`) |
| 语言 | TypeScript 5 |
| UI 库 | shadcn/ui (default style, slate color) + Tailwind CSS 3.4 |
| 视觉特效 | `@paper-design/shaders-react` 0.0.81 (LiquidMetal shader) + Canvas 鼠标轨迹 |
| 动画 | 无动画库——全部纯 CSS transition/animation（globals.css）+ 自写 IO 钩子（lib/use-in-view.ts） |
| 国际化 | 客户端中英双语切换，默认英文，localStorage 记住手动选择（`components/language-context.tsx`） |
| 部署 | GitHub Actions → GitHub Pages (静态导出 `out/`)，用户主站根路径，无 basePath |
| 包管理 | npm (有 package-lock.json，`--no-save` 装 sharp / playwright 不写进依赖) |
| Git 分支 | main |

## 2. 目录结构

```
personal-website/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── app/                           # Next.js App Router (无 src/ 前缀)
│   ├── layout.tsx                 # 根布局: Inter 字体, metadata, lang="en", favicon 内联 data URI, 播放器 preconnect, WebKit 打类脚本
│   ├── page.tsx                   # 整站单页(约 690 行): Hero/关于/技能/实战项目/插画/视频/联系/页脚 + 灯箱
│   └── globals.css               # Tailwind directives + shadcn CSS 变量 + 行距收口 + .shader-bg + reveal 动画
├── components/
│   ├── brand-icons.tsx           # Bilibili / Pixiv / X 官方标志 (simple-icons, CC0)
│   ├── enter-block.tsx           # 区块级入场包装（IO 触发一次 + CSS 过渡）
│   ├── language-context.tsx      # 全站语言状态 (Provider + useLanguage)
│   ├── lightbox.tsx              # 全屏原图查看器 (dynamic 按需加载)
│   ├── liquid-metal-background.tsx # 全站固定液态金属背景 + 画质自适应
│   ├── mouse-trail.tsx           # 鼠标流光轨迹
│   ├── site-nav.tsx              # 全站导航 (锚点 + 平滑滚动 + 语言按钮)
│   ├── site-shell.tsx            # 页面外框 (背景 + 轨迹 + 导航)
│   └── ui/
│       ├── badge.tsx / button.tsx / card.tsx   # shadcn/ui 组件 (已裁掉未用变体)
│       ├── liquid-metal-hero.tsx               # Hero 区 (标题先出、徽章后出)
│       ├── origin-button.tsx                   # 指针扩散填充按钮
│       ├── project-carousel.tsx                # transform 驱动的无限轮播轨道
│       └── reveal-text.tsx                     # 逐字模糊上浮揭示动画 (纯 CSS transition)
├── lib/
│   ├── favicon-inline.ts         # 主图标的圆角 PNG 内联 data URI
│   ├── i18n.ts                   # 中英双语文案字典 + 实战项目数据 (260 行)
│   ├── image-variants.ts         # 由脚本生成的图片变体清单
│   ├── ui-kit.ts                 # 全站共用样式常量 + 卡片 spotlight 指针追踪
│   ├── use-in-view.ts            # 自写 IntersectionObserver「进入视口一次」钩子
│   └── utils.ts                  # cn() 工具函数
├── public/
│   ├── favicon.jpg / favicon-rounded.png
│   └── images/                   # 4 张插画的 2400px 无损原图 + AVIF/WebP 变体
├── assets/
│   └── favicon-master.png       # 图标/分享卡源图（故意不进 public/：运行时无请求）
├── scripts/generate-images.mjs   # 母版 → 响应式变体生成脚本 (需 --no-save 装 sharp)
├── docs/deploy-workflow.yml     # 部署工作流模板副本
├── README.md / RELAY.md          # 项目文档 (README 是主文档，坑与实测都在里面)
├── components.json                # shadcn/ui 配置
├── next.config.js                 # output:"export", images.unoptimized
├── tailwind.config.ts             # content 必须含 app/ components/ lib/ 三处
├── postcss.config.js              # tailwindcss + autoprefixer
├── tsconfig.json                  # strict, @/* → ./*
└── package.json
```

## 3. 架构分析

### 3.1 单页滚动架构

整站是单页（`app/page.tsx` 顶部 `"use client"`），`Home()` 包 `LanguageProvider` → `HomeContent` 渲染 `SiteShell`（固定背景 + 鼠标轨迹 + 导航）+ 六个锚点区块：

| 锚点 | 内容 |
|------|------|
| `about` | 玻璃拟态自我介绍面板，高中生/学习者身份 |
| `skills` | 技术栈分组卡片（前端与可视化 / 浏览器端 AI 与媒体 / 工程与算法） |
| `projects` | 实战项目横向无限轮播（5 个项目 × 3 份克隆 + 静默归位；甩动限幅 ±2 张 < 一份缓冲，3 份即够） |
| `gallery` | AI 插画卡片（4 张，封面固定 16:9，点击开灯箱） |
| `videos` | B 站外链播放器（协议相对地址 + lazy + preconnect，1440px 上限） |
| `contact` | 邮件 / GitHub / Bilibili / Pixiv / X 五个按钮 + 页脚同款图标 |

导航常驻但**不参与逐字动画**（反复进入视口，错峰显碎）。Hero 两个按钮平滑滚动到 `projects` / `contact`。**用户明确要求过：技能与实战项目不拆子路由**（曾拆成 /skills、/projects 又合并回来，不要重做）。

### 3.2 视觉系统

**核心设计不变量** (不可破坏):
1. 液态金属 shader 是全站 **fixed 固定背景** (`-z-10`), 不在 Hero 内部
2. 全站 **单一深色主题**, 暗色/亮色切换已移除
3. 所有内容区使用 **半透明深色玻璃面板** (`bg-black/35~40 + backdrop-blur`), 不能用不透明背景
4. 文字系统全部 **白色** + text-shadow, 不能引入 `bg-background`/`text-foreground` 等主题色
5. 鼠标轨迹是 **纯白色** (lighter 混合模式), 没有深浅色分支
6. `body` 底色 = 着色器 `colorBack`（`#0a0a0c`），兜住 iOS 工具栏收起时 fixed 背景露出的黑带

**样式常量** (定义在 `lib/ui-kit.ts`，注意: 这个目录必须进 `tailwind.config.ts` 的 content):
- `SECTION_BADGE = "bg-white/10 text-white border-white/25"`
- `TEXT_SHADOW = "[text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"`
- `GLASS_CARD = "border-white/15 bg-black/40 backdrop-blur-sm"`
- `GLASS_TAG = "bg-white/10 text-white/85 border-transparent"`
- `SECTION_SHELL = "min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16"`

### 3.3 自适应画质系统

`liquid-metal-background.tsx` 实现了三档画质控制:
- 起步: 2560×1440 (超采样抗锯齿)
- 降档: 1920×1080 → 1280×720
- 判据: rAF 采样 ~90 帧, p95 惩罚帧时间 > 17.5ms 才降档
- 通过 `paperShaderMount.setMaxPixelCount()` API 调节

### 3.4 国际化

`lib/i18n.ts` 导出 `translations` 字典, 类型 `Lang = "zh" | "en"`:
- 首帧固定英文（`useState<Lang>("en")`，与 `layout.tsx` 的 `<html lang="en">` 一致，否则注水失败）
- 挂载后 `useEffect` 只恢复 localStorage 里手动切过的选择，不再跟随浏览器语言
- 切换按钮在导航栏 (桌面端和移动端都有)，同时改 `document.documentElement.lang`
- 所有 UI 文案通过 `t.xxx` 引用, 新增文案需中英都补

### 3.5 图片与灯箱

- 封面: `<picture>` + AVIF/WebP srcset (`lib/image-variants.ts` 的 `IMAGE_SIZES`)，容器固定 16:9
- 灯箱: `dynamic()` 按需加载；`gallery` 区块进入视口时预载 chunk + 按 2.5s 间隔预热全部 2400px 无损原图（Save-Data 不预热）；桌面端悬停卡片立即预热该张
- 灯箱/轮播的滑动手势用 `setPointerCapture`，必须在 `onPointerDown` 里 `closest("a, button")` 放行，否则内部按钮点击被吞

## 4. 依赖清单

### 运行时依赖
| 包 | 版本 | 用途 |
|---|---|---|
| next | 14.2.35 | 框架 |
| react / react-dom | ^18.2.0 | UI 运行时 |
| @paper-design/shaders-react | ^0.0.81 | 液态金属 WebGL shader |
| lucide-react | ^0.400.0 | 图标 |
| clsx | ^2.1.1 | 类名合并 |
| tailwind-merge | ^2.4.0 | Tailwind 类名去重 |

已删除: `@radix-ui/react-slot`（asChild 无人用）、`tailwindcss-animate`（无 animate 类）、`class-variance-authority`（Button 只剩页脚图标一种用法、Badge 只剩胶囊外形，cva 变体系统整个拆掉了）、`framer-motion`（入场/填充/灯箱动画全部 CSS 化后无残留用途，First Load JS 146kB→120kB）。

### 开发依赖
| 包 | 版本 | 用途 |
|---|---|---|
| typescript | ^5.0.0 | 类型检查 |
| tailwindcss | ^3.4.0 | CSS 框架 |
| postcss + autoprefixer | ^8.4 / ^10.4 | CSS 处理 |
| eslint + eslint-config-next | ^8 / 14.2.35 | 代码检查 |

已删除: `gh-pages` 与 `package.json` 里的 `deploy` 脚本（部署走 Actions，脚本引的是已卸载的包）。本地按需 `npm i --no-save` 的: `sharp`（生成图片变体）、`playwright`（WebKit 帧率测量）。

## 5. Git 历史摘要 (最近 15 条)

```
3984a56 perf: 全站瘦身——HTML -33%、CSS -17%，净删 90 行冗余代码（本地 sha cc871e9）
28b7428 fix: 修卡片链接时灵时不灵——指针捕获三连坑（本地 sha 28b7428）
8868e56 docs: 更新 README 与 RELAY 至现状，修正过时注释
419ba3e chore: 死依赖与死脚本清理 + 修正过时注释
21eac44 perf: 清理死代码 + 封面 sizes 校准，包体与流量双减
a4c401e fix: 中文逐字之间的多余间距——reveal-gap 改为按源文本空格决定
98780c4 docs: README 与简介去除全部 Emoji，仅保留网页正文 Emoji
d27c340 fix: 修 iOS 底部露黑带——body 底色与 shader 的 colorBack 对齐
08b24a4 style: 缩小插画卡片文字部分
cfe296b fix: Tailwind content 补扫 lib/——恢复区块上下 96px 留白与暗色底色
54eb9ce style: 插画卡片缩小 + 封面图固定 16:9
c9a5e4a style: 全站统一文字行距——正文 1.625 / 标题 1.375，消除行间挤压
ac9dc96 style: 去掉技能/实战项目两屏底部多余的互跳按钮
55d49b0 style: 去掉插画卡片底部的标签行（AI Art / Illustration / ComfyUI）
93cd8d4 revert: 技能与实战项目合并回单页滚动，各占一屏
```

> 注意：本仓库 git push 直连经常超时，实际推送走 GitHub API（`/tmp/pushfull.cjs`，
> 带远端树与本地 HEAD~1 树一致性校验）。API 重建的提交 sha 与本地不同但树相同，
> 所以远端 sha 与本地对不上是正常现象，别据此判断分叉。

## 6. 当前完成度

| 功能模块 | 状态 | 文件 | 说明 |
|----------|------|------|------|
| 项目脚手架 | ✅ | 根目录配置文件 | Next.js + TS + Tailwind + shadcn |
| 导航栏 | ✅ | components/site-nav.tsx | 响应式, 中英切换, 平滑滚动锚点 |
| 液态金属背景 | ✅ | components/liquid-metal-background.tsx | 全站 fixed, 自适应画质 |
| 鼠标轨迹 | ✅ | components/mouse-trail.tsx | 纯白流光 + 水晶碎粒 |
| Hero 区 | ✅ | components/ui/liquid-metal-hero.tsx | 标题先出、徽章后出 |
| 关于我 | ✅ | app/page.tsx, lib/i18n.ts | 高中生身份, 玻璃面板 |
| 技能展示 | ✅ | app/page.tsx, lib/i18n.ts | 3 组卡片, 按真实项目技术栈 |
| 实战项目轮播 | ✅ | components/ui/project-carousel.tsx | 5 个项目, 无限轮播 |
| AI 插画 + 灯箱 | ✅ | app/page.tsx, components/lightbox.tsx | 4 张插画, 16:9 封面, 无损原图 |
| 视频板块 | ✅ | app/page.tsx, app/layout.tsx | B 站外链播放器, lazy + preconnect |
| 联系方式 | ✅ | app/page.tsx | 邮件/GitHub/Bilibili/Pixiv/X |
| 中英双语 | ✅ | components/language-context.tsx | 默认英文, localStorage 持久化 |
| GitHub Pages 部署 | ✅ | .github/workflows/deploy.yml | Actions 自动构建部署 |
| 逐字揭示动画 | ✅ | components/ui/reveal-text.tsx | 纯 CSS transition, 按源文本空格决定间距 |
| 深色主题 | ✅ (设计决策) | — | 单一深色主题, 切换已移除 |
| SEO/元数据 | ✅ | app/layout.tsx, public/og-image.jpg | title/description/favicon/theme-color + OpenGraph/Twitter Card（iMessage/X 链接预览卡，1200×630 大图） |
| 无障碍 | ⚠️ 基础 | — | 图片/图标有 aria-label 与键盘支持, 缺 skip-nav |
| 子页面/路由 | ❌ 不做 | — | 用户要求保持单页滚动, 不拆子路由 |
| npm audit | ⚠️ 5 项 (4 high + 1 critical) | Next 14.2.35 传递依赖 | 需破坏性升级 next 大版本才能修, 已知未处理 |

## 7. 关键约束 (红线)

1. **Node.js 环境** — 默认环境没有 node, 需下载便携 Node 到 /tmp（每次 bash 调用都要重新 export PATH；/tmp 会被清空）
2. **GitHub 推送** — github.com:443 偶尔连不上, 可用 GitHub API 分步推送（POST blob/tree/commit + PATCH ref，响应务必 `Buffer.concat` 再 `toString('utf8')`，否则多字节字符被 chunk 切断显示成乱码）
3. **shadcn 组件** — 不能用 `npx shadcn@latest add`, 需手动创建
4. **shader 包版本** — `@paper-design/shaders-react` 只到 0.0.81, ^1.0.0 不存在
5. **preset API** — `liquidMetalPresets` 条目是 `{ name, params }`, 要展开 `.params`
6. **全站深色不变量** — 不能引入不透明背景/主题色切换, 会遮住固定的液态金属背景
7. **鼠标轨迹纯白** — 不要重新引入颜色分支
8. **Tailwind content 必须含 `lib/`** — `lib/ui-kit.ts` 里的共享类名字符串不进 content 就静默丢失（曾丢 `py-24` / `bg-black/35`，区块挤成一团）；且 Tailwind 连注释里的类名也扫，删死代码时注释里别写完整类名
9. **行距收口在 globals.css 且必须 `!important`** — Tailwind 字号工具类自带 1.1 行高，元素选择器压不过；`p` 1.625 / `h1~h4` 1.375 是全站唯一出处
10. **注水一致性** — 首帧语言由 `layout.tsx` 的 `<html lang>` 与 `language-context.tsx` 的 `useState` 初值共同决定，两边必须同为 `en`；同理 reveal 动画参数全部经 CSS 变量在 render 时算好下发，不在客户端读 `window` 尺寸之类首帧才有的数据
11. **单页结构 / 无 basePath** — 部署在用户主站根路径，不要加 `basePath` 或 `trailingSlash`；不要重新拆 /skills、/projects 子路由
12. **用户对 Emoji 的偏好** — README 与简介（meta description + 仓库 description）零 Emoji；网页正文的技能分组徽章保留 🎨/🧠/🛠️，别改成别的
13. **别把动画库请回来** — 全站动画（逐字揭示、区块入场、按钮填充、灯箱进出）都是纯 CSS + 一个自写 IO 钩子；曾经用 framer-motion，2026-10 移除。新增动画先考虑一行 CSS；「重新引入 framer」会把 First Load JS 拖回 146kB
14. **自定义手势/拖拽组件前先看「指针捕获」三连坑**（2026-10-01 实测修过两次，详见 README 第 9、15 条）：① `setPointerCapture` 会把后续指针事件与最终 `click` 全部重定向到捕获元素 → 落在内部按钮上的点击必须 `closest("a, button")` 提前 return；② 「拖拽过就吞 click」的抑制标记，复位要写在该 return **之前**，否则一次甩动后所有内部链接永久失效；③ 手势面只能覆盖自己那块（轮播轨道、灯箱图片），别铺到「点这里要关」的遮罩上——那次 click 会被重定向进带 `stopPropagation` 的图片容器。改完用 Playwright WebKit + 移动视口实测（「先甩动再点链接」必测）

## 8. 建议的下一步工作

### P0 — 一致性修复
（本轮已全部完成：description 与高中生身份一致 / 技能栈按真实项目重写 / 旧 index.html 早已删除）

### P1 — 内容与元数据增强
1. 添加 `sitemap.xml` 与 robots
2. 无障碍补 skip-nav 跳主内容

### P2 — 功能扩展
4. 升级 next 大版本以消掉 npm audit 的 5 项告警（破坏性，需回归全站）
5. 更多插画作品页 / 项目详情（若用户不再坚持单页）
6. 视频板块增加多个视频切换（目前单个 B 站外链播放器）
