# 项目接力文档 — Personal Website

> 最后更新：2026-09-20 | 模式A 快速源码测绘
> Commit: `bdb12b1` (main)

---

## 1. 项目概览

| 属性 | 值 |
|------|----|
| 项目名 | personal-website |
| 仓库 | `ForJiang/ForJiang.github.io` |
| 线上地址 | https://forjiang.github.io |
| 框架 | Next.js 14.2.35 (App Router, 静态导出) |
| 语言 | TypeScript 5 |
| UI 库 | shadcn/ui (default style, slate color) + Tailwind CSS 3.4 |
| 视觉特效 | `@paper-design/shaders-react` 0.0.81 (LiquidMetal shader) + Canvas 鼠标轨迹 |
| 动画 | Framer Motion 11 |
| 国际化 | 客户端中英双语切换 (lib/i18n.ts) |
| 部署 | GitHub Actions → GitHub Pages (静态导出 `out/`) |
| 包管理 | npm (有 package-lock.json, node_modules 已安装) |
| Git 分支 | main, 工作区干净 |

## 2. 目录结构

```
personal-website/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── app/                           # Next.js App Router (无 src/ 前缀)
│   ├── layout.tsx                 # 根布局: Inter 字体, metadata, lang="zh-CN"
│   ├── page.tsx                   # 整站单页: Nav + Hero + About + Skills + Projects + Contact + Footer
│   └── globals.css                # Tailwind directives + shadcn CSS 变量主题
├── components/
│   ├── liquid-metal-background.tsx # 全站固定液态金属 WebGL 背景 (自适应画质)
│   ├── mouse-trail.tsx            # 白色流光鼠标轨迹 (Canvas, 叠加发光)
│   └── ui/
│       ├── badge.tsx              # shadcn Badge
│       ├── button.tsx             # shadcn Button
│       ├── card.tsx               # shadcn Card 系列
│       └── liquid-metal-hero.tsx  # Hero 区组件 (Framer Motion 入场动画)
├── lib/
│   ├── i18n.ts                    # 中英双语文案字典
│   └── utils.ts                   # cn() 工具函数 (clsx + tailwind-merge)
├── public/images/                 # 4 张 AI 插画封面 (yuntu/tick/pixelboard/solar.jpg)
├── out/                           # 静态构建产物 (被 .gitignore 但实际存在)
├── docs/deploy-workflow.yml       # 部署工作流模板副本
├── index.html                     # 旧版纯 HTML 页面 (已废弃, 可删)
├── components.json                # shadcn/ui 配置
├── next.config.js                 # output:"export", images.unoptimized
├── tailwind.config.ts             # darkMode:"class", shadcn HSL colors, animate 插件
├── postcss.config.js              # tailwindcss + autoprefixer
├── tsconfig.json                  # strict, @/* → ./*
└── package.json
```

## 3. 架构分析

### 3.1 单页应用架构

整站是一个客户端组件 (`app/page.tsx`, "use client", 363 行)，所有板块内联渲染：
- **导航栏**: 内联在 page.tsx (非独立组件), fixed 定位, 桌面端水平导航 + 移动端汉堡菜单
- **Hero**: `<LiquidMetalHero>` 组件, Framer Motion 逐项入场
- **关于我**: 玻璃拟态面板, 高中生/学习者身份
- **技能**: 3 列卡片 (前端/后端/工具), 每列含标签
- **项目**: 2×2 网格, AI 插画作品展示 (非代码项目)
- **联系**: 邮件/GitHub/Bilibili 三个按钮
- **页脚**: 版权 + 社交图标

板块间通过 `scrollIntoView({ behavior: "smooth" })` 平滑跳转。

### 3.2 视觉系统

**核心设计不变量** (来自 memory, 不可破坏):
1. 液态金属 shader 是全站 **fixed 固定背景** (`-z-10`), 不在 Hero 内部
2. 全站 **单一深色主题**, 暗色/亮色切换已移除
3. 所有内容区使用 **半透明深色玻璃面板** (`bg-black/35~40 + backdrop-blur`), 不能用不透明背景
4. 文字系统全部 **白色** + text-shadow, 不能引入 `bg-background`/`text-foreground` 等主题色
5. 鼠标轨迹是 **纯白色** (lighter 混合模式), 不要重新引入颜色分支

**样式常量** (定义在 page.tsx 顶部):
- `SECTION_BADGE = "bg-white/10 text-white border-white/25"`
- `TEXT_SHADOW = "[text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"`
- `GLASS_CARD = "border-white/15 bg-black/40 backdrop-blur-sm"`
- `GLASS_TAG = "bg-white/10 text-white/85 border-transparent"`

### 3.3 自适应画质系统

`liquid-metal-background.tsx` 实现了三档画质控制:
- 起步: 2560×1440 (超采样抗锯齿)
- 降档: 1920×1080 → 1280×720
- 判据: rAF 采样 ~90 帧, p95 惩罚帧时间 > 17.5ms 才降档
- 通过 `paperShaderMount.setMaxPixelCount()` API 调节

### 3.4 国际化

`lib/i18n.ts` 导出 `translations` 字典, 类型 `Lang = "zh" | "en"`:
- 检测顺序: localStorage → navigator.language → 默认 zh
- 切换按钮在导航栏 (桌面端和移动端都有)
- 所有 UI 文案通过 `t.xxx` 引用, 新增文案需中英都补

## 4. 依赖清单

### 运行时依赖
| 包 | 版本 | 用途 |
|---|---|---|
| next | 14.2.35 | 框架 |
| react / react-dom | ^18.2.0 | UI 运行时 |
| @paper-design/shaders-react | ^0.0.81 | 液态金属 WebGL shader |
| framer-motion | ^11.0.0 | 动画 |
| lucide-react | ^0.400.0 | 图标 |
| @radix-ui/react-slot | ^1.1.0 | shadcn Button 多态 |
| class-variance-authority | ^0.7.0 | shadcn 变体 |
| clsx | ^2.1.1 | 类名合并 |
| tailwind-merge | ^2.4.0 | Tailwind 类名去重 |
| tailwindcss-animate | ^1.0.7 | 动画工具类 |

### 开发依赖
| 包 | 版本 | 用途 |
|---|---|---|
| typescript | ^5.0.0 | 类型检查 |
| tailwindcss | ^3.4.0 | CSS 框架 |
| postcss + autoprefixer | ^8.4 / ^10.4 | CSS 处理 |
| eslint + eslint-config-next | ^8 / 14.2.35 | 代码检查 |
| gh-pages | ^6.1.0 | 备用手动部署 |

## 5. Git 历史摘要 (最近 20 条)

```
bdb12b1 鼠标轨迹改为白色流光（统一叠加发光混合，移除深浅色分支）
1359f00 重新触发 Pages 部署
def124a 新增中英双语模式
95e0330 插画卡片文字改为描述图片内容（中英双语）
a526186 全站中英双语
23737de 关于我改为高中生学习者身份；统一深色底
61a2f4c 项目封面替换为四张插画图
69f6a38 Hero 副标题改为 web coding...
73aa15e 移除 Hero 副标题文字
06728be 画质自适应：从 2.5K 最高档起步
dc7b528 流畅性优化：着色器缓冲压至 720p
3c1f768 液态金属扩展为全站固定背景
31f5979 页脚只保留版权信息
06c1306 移除 Hero 底部技能芯片卡片
cd2a23b Hero 可读性优化
78af1a4 Hero 对齐参考设计
db81bf6 修复 CI 构建
a1703d3 Add GitHub Actions workflow for deploying pages
20321d5 工作流模板加 configure-pages 自动启用
fb340af 升级为 Next.js 液态金属主站
```

## 6. 当前完成度

| 功能模块 | 状态 | 文件 | 说明 |
|----------|------|------|------|
| 项目脚手架 | ✅ | 根目录配置文件 | Next.js + TS + Tailwind + shadcn |
| 导航栏 | ✅ | app/page.tsx:97-152 | 响应式, 中英切换, 平滑滚动 |
| 液态金属背景 | ✅ | components/liquid-metal-background.tsx | 全站 fixed, 自适应画质 |
| 鼠标轨迹 | ✅ | components/mouse-trail.tsx | 白色流光 + 水晶碎粒 |
| Hero 区 | ✅ | components/ui/liquid-metal-hero.tsx | Framer Motion 入场动画 |
| 关于我 | ✅ | app/page.tsx:166-187, lib/i18n.ts | 高中生身份, 玻璃面板 |
| 技能展示 | ✅ | app/page.tsx:189-232, lib/i18n.ts | 3 列卡片, 标签 |
| 项目/插画 | ✅ | app/page.tsx:234-290, lib/i18n.ts | 4 张 AI 插画, 2×2 网格 |
| 联系方式 | ✅ | app/page.tsx:292-340 | 邮件/GitHub/Bilibili |
| 页脚 | ✅ | app/page.tsx:342-360 | 版权 + 社交图标 |
| 中英双语 | ✅ | lib/i18n.ts | localStorage 持久化 |
| GitHub Pages 部署 | ✅ | .github/workflows/deploy.yml | Actions 自动构建部署 |
| 暗色主题 | ✅ (设计决策) | — | 单一深色主题, 切换已移除 |
| SEO/元数据 | ⚠️ 基础 | app/layout.tsx:7-12 | 仅有 title + description, 缺 OG |
| 子页面/路由 | ❌ 缺失 | — | 仅单页, 无博客等子路由 |
| 无障碍 | ⚠️ 基础 | — | 有 aria-label, 缺 skip-nav 等 |

## 7. 关键约束 (红线)

1. **无 Node.js 环境** — 默认环境没有 node, 但可通过下载便携 Node 到 /tmp 解决 (见 memory: node-env-limitation)
2. **GitHub 推送** — github.com:443 偶尔连不上, 可用 GitHub API 分步推送 (见 memory: github-api-push-workaround)
3. **shadcn 组件** — 不能用 `npx shadcn@latest add`, 需手动创建
4. **shader 包版本** — `@paper-design/shaders-react` 只到 0.0.81, ^1.0.0 不存在
5. **preset API** — liquidMetalPresets 条目是 `{ name, params }`, 要展开 `.params` 而不是整个对象
6. **全站深色不变量** — 不能引入不透明背景/主题色切换, 会遮住固定的液态金属背景
7. **鼠标轨迹纯白** — 不要重新引入颜色分支, 全部 white + lighter 混合
8. **layout.tsx metadata description** — 当前仍写着"全栈开发工程师", 与实际身份(高中生)不一致

## 8. 建议的下一步工作

### P0 — 一致性修复
1. `app/layout.tsx:9` description 改为与"关于我"一致的高中生身份描述
2. 技能栈标签 (i18n.ts) 里 Docker/K8s/PostgreSQL 等偏专业的标签是否需要调整
3. 删除已废弃的 `index.html`

### P1 — 内容增强
4. 增加真实代码项目展示 (目前只有 AI 插画)
5. 添加 Open Graph / Twitter Card 元数据
6. 添加 favicon (当前是 SVG emoji)
7. 添加 sitemap.xml

### P2 — 功能扩展
8. 博客/文章子页面
9. 项目详情页
10. 更多 shadcn 组件 (如需表单: Input, Textarea)
11. 页面过渡动画优化
12. 性能优化 (图片 WebP/AVIF, 字体子集化)
