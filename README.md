# ForJiang · 个人主页

基于 **Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui** 的个人主页。全站使用 [Paper Design 的 LiquidMetal 流体金属着色器](https://shaders.paper.design) 做固定背景，配合 Framer Motion 逐项入场动画。

线上地址：**https://forjiang.github.io**

## 功能

- 🌊 液态金属着色器全站固定背景（`@paper-design/shaders-react`），滚动全程可见、不随地址栏伸缩而变形位移
- 🖱️ 白色鼠标流光轨迹特效（遵循 `prefers-reduced-motion`）
- 🧭 四个内容版块各占满一页（`min-h-screen` + 垂直居中），滚动节奏一致
- 🌐 中文 / English 双语言切换（首次访问自动跟随浏览器语言，手动切换后记住选择）
- 🖼️ 插画封面使用 `<picture>` + `srcset` 响应式加载：AVIF → WebP → JPEG 逐级回退，三档宽度按视口与 DPR 选择，文件名带内容哈希
- 🔍 点击封面图打开全屏灯箱查看 1600×901 高清原图（Esc / 点遮罩关闭，左右方向键切换，打开期间锁定背景滚动）
- 🪟 全站深色玻璃拟态面板，白色文字系统，任意液滴位置下保持可读
- ✨ 按钮采用指针扩散填充动画：圆形背景从鼠标进入的位置展开铺满、文字反色（`components/ui/origin-button.tsx`）
- 📱 完整响应式布局；移动端针对 iOS Safari 的视口与工具栏做了专门处理
- 📄 页面板块：Hero / 关于我 / 技术能力（含实战项目）/ 插画作品 / 联系方式 / 页脚

## 目录结构

```
personal-website/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署（已启用）
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 + 元信息 + favicon + theme-color
│   ├── page.tsx                  # 主页（导航、四个版块、页脚、灯箱都在这里）
│   └── globals.css               # shadcn 主题 CSS 变量 + .shader-bg 固定背景规则
├── components/
│   ├── brand-icons.tsx           # Bilibili / Pixiv / X 官方标志（simple-icons, CC0）
│   ├── lightbox.tsx              # 全屏原图查看器
│   ├── liquid-metal-background.tsx # 全站固定液态金属背景 + 画质自适应
│   ├── mouse-trail.tsx           # 鼠标流光轨迹
│   └── ui/
│       ├── badge.tsx / button.tsx / card.tsx   # shadcn/ui 组件
│       ├── liquid-metal-hero.tsx               # Hero 区
│       └── origin-button.tsx                   # 指针扩散填充按钮
├── lib/
│   ├── i18n.ts                   # 中英双语文案字典（含实战项目数据）
│   ├── image-variants.ts         # 由脚本生成的图片变体清单
│   └── utils.ts                  # cn() 工具函数
├── public/
│   ├── favicon.jpg               # 站点图标（256×256，13.6KB）
│   └── images/                   # 4 张插画母版 + 生成的 AVIF/WebP 变体
├── scripts/
│   └── generate-images.mjs       # 母版 → 响应式变体生成脚本
├── docs/deploy-workflow.yml     # 部署工作流模板副本
└── index.html                    # 旧版纯 HTML 页面，仅作参考，可删除
```

## 本地运行

需要 Node.js 18.17+：

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

## 部署

仓库已包含 `.github/workflows/deploy.yml`：每次 push 到 `main`，GitHub 云端自动执行 `npm install && npm run build`（静态导出到 `out/`）并发布到 Pages。**本地不需要 Node.js 也能部署。**

进度见仓库 **Actions** 标签页。

## 插画图片工作流

封面图不手工维护多份尺寸，改用脚本生成：

```bash
# 一次性安装 sharp（仅本地需要，不写入 package.json，不参与线上构建）
npm i -D sharp

# 把新母版（建议 1600×901 或更大）命名替换 public/images/ 下的同名 .jpg
# 然后重新生成 AVIF/WebP 三档变体与清单
node scripts/generate-images.mjs
```

脚本会做三件事：为每张母版生成 480 / 800 / 1200 三档宽度的 AVIF 与 WebP（文件名含 8 位内容哈希，内容变化即自动失效缓存）、母版保留作 `<img>` 回退、写出 `lib/image-variants.ts` 供页面引用。

母版清单在 `scripts/generate-images.mjs` 顶部的 `NAMES` 数组里，新增图片要同步加进去。

## 如何改成你自己的信息

| 想改什么 | 位置 |
| --- | --- |
| Hero 标语 / 按钮文字 | `app/page.tsx` 中 `<LiquidMetalHero>` 的 props |
| 自我介绍 | `lib/i18n.ts` 的 `about` |
| 技能标签 | `lib/i18n.ts` 的 `skills.groups` |
| 实战项目（名称、描述、标签、仓库与演示链接） | `lib/i18n.ts` 的 `skills.projects.items` |
| 插画卡片文案 | `lib/i18n.ts` 的 `projects.cards` |
| 插画封面图 | 替换 `public/images/` 母版后重跑上面的脚本 |
| 联系方式（邮箱 / GitHub / 哔哩哔哩 / Pixiv / X） | `app/page.tsx` 顶部 `CONTACTS` |
| 网页标题 / 描述 / favicon | `app/layout.tsx` 的 `metadata`；换图标替换 `public/favicon.jpg` |
| 液态金属背景参数 | `components/liquid-metal-background.tsx` |
| 网站文案（中文 / English） | `lib/i18n.ts` 的 `translations`，两个语言都要补齐 |

## 实现上值得注意的几点

**液态金属背景**：`scale` 控制液滴相对视口的大小（0.5 时直径约为视口短边的 67%，漂移全程不触边）；`offsetX/offsetY` 为 0 时液滴群在视口正中央。容器高度用 `100lvh`（工具栏收起后的视口高，滚动全程恒定）而非 `100vh`/`100dvh`——后两者会让 canvas 在滚动中反复 resize，表现为背景滑动与卡顿。抗锯齿依赖渲染缓冲超采样，因此画质档位只影响边缘锐度、不产生锯齿。

**移动端**：底部工具栏是覆盖在视口上的不透明浮层，iOS Safari 在普通浏览下 `env(safe-area-inset-bottom)` 恒为 0，因此用固定值兜底（见 `globals.css` 中 `@media (hover: none) and (pointer: coarse)`）。站点为单一深色主题，不要重新引入 `bg-background` / 主题色切换，否则会遮住固定的液态金属背景。

**动画**：全站用 `LazyMotion` + `domAnimation` 按需加载 framer-motion，剔除了未使用的 drag / layout 代码。新增带动画的组件请用 `m.*` 而非 `motion.*`，否则会把完整版拖回包里。另注意 framer-motion 会接管元素的 `transform` 属性，不要同时用 Tailwind 的 `-translate-x-1/2` 之类的工具类做定位（`origin-button.tsx` 里踩过，改用 `x/y` 由它统一管理）。
