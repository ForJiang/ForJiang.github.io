# ForJiang · 个人主页

基于 **Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui** 的个人主页。全站使用 [Paper Design 的 LiquidMetal 流体金属着色器](https://shaders.paper.design) 做固定背景，配合 Framer Motion 的逐字揭示与按钮填充动画。

线上地址：**https://forjiang.github.io**

## 功能

- 🌊 液态金属着色器全站固定背景（`@paper-design/shaders-react`），滚动全程可见、不随地址栏伸缩而变形位移
- 🖱️ 白色鼠标流光轨迹特效（遵循 `prefers-reduced-motion`）
- ✨ 全站文字逐字揭示：每个单元从「透明 + 下移 + 模糊」过渡到清晰位置，按 stagger 错峰，滚动进入视口时触发（`components/ui/reveal-text.tsx`）
- 🧭 四个内容版块各占满一页（`min-h-screen` + 垂直居中），滚动节奏一致
- 🌐 中文 / English 双语言切换（首次访问自动跟随浏览器语言，手动切换后记住选择）
- 🖼️ 插画封面使用 `<picture>` + `srcset` 响应式加载：AVIF → WebP → JPEG 逐级回退，三档宽度按视口与 DPR 选择，文件名带内容哈希
- 🔍 点击封面图打开全屏灯箱查看 2400×1352 **WebP 无损**原图（Esc / 点遮罩关闭，左右方向键切换，打开期间锁定背景滚动）
- 🔗 联系方式带 Bilibili / Pixiv / X 官方标志（simple-icons, CC0），入口为真实 `<a>`，可中键新标签打开
- 🪟 全站深色玻璃拟态面板，白色文字系统，任意液滴位置下保持可读
- ✒️ 按钮采用指针扩散填充动画：圆形背景从鼠标进入的位置展开铺满、文字反色（`components/ui/origin-button.tsx`）
- 📱 完整响应式布局；移动端针对 iOS Safari 的视口与工具栏做了专门处理
- 📄 页面板块：Hero / 关于我 / 技术能力（含实战项目）/ 插画作品 / 联系方式 / 页脚

导航与页脚是常驻框架，**不参与逐字动画**：它们反复出现在视口里，逐字错峰反而显碎，且直接可见。

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
│       ├── origin-button.tsx                   # 指针扩散填充按钮
│       └── reveal-text.tsx                     # 逐字模糊上浮揭示动画
├── lib/
│   ├── favicon-inline.ts         # 主图标的圆角 PNG 内联 data URI
│   ├── i18n.ts                   # 中英双语文案字典（含实战项目数据）
│   ├── image-variants.ts         # 由脚本生成的图片变体清单
│   └── utils.ts                  # cn() 工具函数
├── public/
│   ├── favicon.jpg               # apple-touch-icon 用（直角、整幅不透明，256×256）
│   ├── favicon-rounded.png       # 标签页图标（128×128 圆角，四角透明）
│   └── images/                   # 4 张插画的 2400px 无损原图 + AVIF/WebP 变体
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

> ⚠️ **Pages 的发布来源必须是「GitHub Actions」**（对应 API 的 `build_type: workflow`）。如果它被改成分支部署，GitHub Pages 会直接发布 `main` 根目录——线上会变成仓库里那个旧版 `index.html`，而不是这里构建的 Next.js 站点，Actions 的部署记录虽显示成功但不生效。若线上内容看起来不像本站（比如带 emoji favicon 的纯静态页），先去 **Settings → Pages** 确认来源。

## 插画图片工作流

封面图不手工维护多份尺寸，改用脚本生成：

```bash
# 一次性安装 sharp（仅本地需要，--no-save 保证不写进 package.json、
# 不参与 CI 安装）
npm i --no-save sharp

# 换图：把新原图命名成 public/images/<name>.png（<name> 取 NAMES 里的那个）
# 然后重跑脚本
node scripts/generate-images.mjs
```

脚本会做四件事：为每张母版生成一张 **2400px 宽的 WebP 无损原图**（`<name>-full-<hash8>.webp`）、再从它生成 480 / 800 / 1200 三档宽度的 AVIF 与 WebP 封面变体（文件名含 8 位内容哈希，内容变化即自动失效缓存）、`<img>` 回退用 480 宽那一档、写出 `lib/image-variants.ts` 供页面引用。

母版清单在 `scripts/generate-images.mjs` 顶部的 `NAMES` 数组里，新增图片要同步加进去。

**高清原图为什么不是 1:1 存原图**：ComfyUI 直出的图是 3864×2176 PNG，单张约 10MB，四张共 42MB；全尺寸转 WebP lossless 也要 27MB，入库存不起。缩到 2400px 宽后降到每张 2.7~3.2MB（四张共约 11.7MB），而 2400 宽已超过绝大多数显示场景（灯箱 `max-w-92vw`，4K 屏才刚好铺满），降采样看不出来。灯箱只在点击后才加载它，首屏不为它付流量。

封面变体从 2400 的母版而不是原 PNG 缩放，避免「有损之上再有损」。母版文件本身不单独保留，脚本重跑时直接用已生成的 `-full-*.webp` 当输入（所以重跑是幂等的）。

## 换站点图标

图标分三个文件，各有分工：

| 文件 | 用途 | 要求 |
| --- | --- | --- |
| `lib/favicon-inline.ts` | 标签页主图标 | 32×32 **圆角** PNG，内联成 data URI |
| `public/favicon-rounded.png` | 高分屏降级 | 128×128 圆角 PNG，四角透明 |
| `public/favicon.jpg` | `apple-touch-icon` | **直角 + 整幅不透明** |

两个要点：

- **主图标必须内联成 data URI。** 浏览器把 favicon 按「页面 URL」缓存在自己的图标数据库里，只把引用换成新文件路径往往不足以让已经打开着的标签页重取；内联后图标跟着 HTML 一起到达，没有可被缓存的单独请求。`app/layout.tsx` 里是用原生 `<link rel="icon">` 而不是 `metadata.icons`——后者会把 `url` 当路径 normalize，`data:image/png;base64,` 前缀会被剥掉。
- **`apple-touch-icon` 必须保持直角且整幅不透明。** iOS 会自己给主屏图标套圆角 mask，预先裁圆的源图会被二次裁切，透明角还会透出用户的桌面壁纸。

圆角图由 canvas 从 `favicon.jpg` 生成：读图 → 设 `globalCompositeOperation = 'destination-in'` → `roundRect(0, 0, size, size, size * 0.2)` 填充做遮罩 → `toDataURL('image/png')`。半径取边长的 20%（iOS squircle 的比例）。

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
| 网页标题 / 描述 / favicon | `app/layout.tsx` 的 `metadata`；换图标见上一节 |
| 文字动效的快慢与强度 | `RevealText` 的 `duration` / `stagger` / `blur` / `yOffset` props |
| 液态金属背景参数 | `components/liquid-metal-background.tsx` |
| 网站文案（中文 / English） | `lib/i18n.ts` 的 `translations`，两个语言都要补齐 |

## 实现上值得注意的几点

**液态金属背景**：`scale` 控制液滴相对视口的大小（0.5 时直径约为视口短边的 67%，漂移全程不触边）；`offsetX/offsetY` 为 0 时液滴群在视口正中央。容器高度用 `100lvh`（工具栏收起后的视口高，滚动全程恒定）而非 `100vh`/`100dvh`——后两者会让 canvas 在滚动中反复 resize，表现为背景滑动与卡顿。抗锯齿依赖渲染缓冲超采样，因此画质档位只影响边缘锐度、不产生锯齿。

**移动端**：底部工具栏是覆盖在视口上的不透明浮层，iOS Safari 在普通浏览下 `env(safe-area-inset-bottom)` 恒为 0，因此用固定值兜底（见 `globals.css` 中 `@media (hover: none) and (pointer: coarse)`）。站点为单一深色主题，不要重新引入 `bg-background` / 主题色切换，否则会遮住固定的液态金属背景。

**framer-motion 的一般纪律**：全站用 `LazyMotion` + `domAnimation` 按需加载 framer-motion，剔除了未使用的 drag / layout 代码。新增带动画的组件请用 `m.*` 而非 `motion.*`，否则会把完整版拖回包里。另注意 framer-motion 会接管元素的 `transform` 属性，不要同时用 Tailwind 的 `-translate-x-1/2` 之类的工具类做定位（`origin-button.tsx` 里踩过，改用 `x/y` 由它统一管理）。

**逐字揭示动画（`reveal-text.tsx`）**，五个坑都实测过，改这个文件前值得先看：

1. **拆字必须按码点**（`Array.from(input)`），不能用正则的 `[\s\S]`——后者按 UTF-16 码元匹配，会把 emoji 拆成孤立代理项，而孤立代理项在服务端序列化与客户端 hydrate 时结果不同，触发 React 注水失败，整棵服务端树被丢弃后 `useInView` 的观察器全部失效，表现为全站文字停在不可见状态。
2. **每个单元自己驱动动画**，不要依赖 framer 的父子 variant 传播——传播只在父级首次切换 variant 时发生，之后新挂载的子元素（切换语言时就会出现）接不上，会永远停在 hidden。
3. **`IntersectionObserver` 不要给 margin 设负值**。负的 top margin 会漏掉 fixed 导航，负的 bottom margin 会在「已滚到页面最底」时漏掉页脚版权文字——用户看得见它，IO 却判它不相交。
4. **`as="span"` 时不能加 `w-full`**：span 是 inline，`width:100%` 会让浏览器把容器算成只有一行宽，中文逐字必然竖排。
5. **`delay` 写在 variants 的 visible 分支里**，不要放 `transition` prop，否则它对 `hidden` 的初始应用同样生效。

切换语言会换掉整套单元，`key` 用索引而非文本，避免 ~790 个 span 全部卸载重挂载；已揭示过的组件用 ref 记住状态，让新挂载的单元直接以可见状态出现。
