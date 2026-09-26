# ForJiang · 个人主页

基于 **Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui** 的个人主页。全站使用 [Paper Design 的 LiquidMetal 流体金属着色器](https://shaders.paper.design) 做固定背景，配合纯 CSS transition 的逐字揭示动画与 Framer Motion 的按钮填充 / 入场动画（Framer 只负责按钮和卡片，逐字动画不用它——原因见「Safari 性能专项」）。

线上地址：**https://forjiang.github.io**

## 功能

- 🌊 液态金属着色器全站固定背景（`@paper-design/shaders-react`），滚动全程可见、不随地址栏伸缩而变形位移
- 🖱️ 白色鼠标流光轨迹特效（遵循 `prefers-reduced-motion`）
- ✨ 全站文字逐字揭示：每个单元从「透明 + 下移 +（短文本）模糊」过渡到清晰位置，按 stagger 错峰，滚动进入视口时触发。**纯 CSS transition 驱动**（合成器动画），framer 不参与逐帧（`components/ui/reveal-text.tsx`）
- 🧭 四个内容版块各占满一页（`min-h-screen` + 垂直居中），滚动节奏一致
- 🌐 中文 / English 双语言切换（**默认英文**，手动切换后记住选择，不再跟随浏览器语言）
- 🖼️ 插画封面使用 `<picture>` + `srcset` 响应式加载：AVIF → WebP → WebP（480 宽）逐级回退，三档宽度按视口与 DPR 选择，文件名带内容哈希
- 🔍 点击封面图打开全屏灯箱查看 2400×1352 **WebP 无损**原图（Esc / 点遮罩关闭，左右方向键切换，打开期间锁定背景滚动）
- 🔗 联系方式带 Bilibili / Pixiv / X 官方标志（simple-icons, CC0），入口为真实 `<a>`，可中键新标签打开
- 🪟 全站深色玻璃拟态面板，白色文字系统，任意液滴位置下保持可读（Safari 上大面积卡片自动降级为不透明深色底，见「Safari 性能专项」）
- 🚀 Safari / iOS 性能专项：逐字动画纯 CSS transition（合成器动画）、卡片对 WebKit 去大面积 backdrop 模糊、逐字 blur 超过 48 单元自动关闭，均经 Playwright WebKit 实测归因
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
│       └── reveal-text.tsx                     # 逐字模糊上浮揭示动画（纯 CSS transition）
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

母版清单在 `scripts/generate-images.mjs` 顶部的 `NAMES` 数组里，新增图片要同步加进去。脚本会用**已有的 `-full-*.webp` 当母版**，所以换图分两种情况：第一次放原图 `<name>.png` 进目录；只想调整变体质量就什么都不用放，直接重跑。

**高清原图为什么不是 1:1 存原图**：ComfyUI 直出的图是 3864×2176 PNG，单张约 10MB，四张共 42MB；全尺寸转 WebP lossless 也要 27MB，入库存不起。缩到 2400px 宽后降到每张 2.7~3.2MB（四张共约 11.7MB），而 2400 宽已超过绝大多数显示场景（灯箱 `max-w-92vw`，4K 屏才刚好铺满），降采样看不出来。灯箱只在点击后才加载它，首屏不为它付流量。

封面变体从 2400 的母版而不是原 PNG 缩放，避免「有损之上再有损」。因为母版就是 `-full-*.webp` 本身，重跑脚本只会生成同名文件（内容哈希不变），所以反复重跑是幂等的。

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
| 插画封面图 | 把新原图命名成 `public/images/<name>.png` 后重跑上面的脚本 |
| 联系方式（邮箱 / GitHub / 哔哩哔哩 / Pixiv / X） | `app/page.tsx` 顶部 `CONTACTS` |
| 网页标题 / 描述 / favicon | `app/layout.tsx` 的 `metadata`；换图标见上一节 |
| 文字动效的快慢与强度 | `RevealText` 的 `duration` / `stagger` / `blur` / `yOffset` props |
| 长文本弃用模糊的阈值 | `components/ui/reveal-text.tsx` 的 `BLUR_UNIT_CAP`（单元数超过它自动只保留淡入+上浮） |
| Safari 的卡片降级（去模糊） | `app/globals.css` 的 `html.webkit .glass-soft`，webkit 类由 `app/layout.tsx` 的内联脚本打上 |
| 着色器画质档位 | `components/liquid-metal-background.tsx` 的 `QUALITY_TIERS`（最高档为库默认的 ≈8.3MP，覆盖 1440p 级 Retina 原生精度） |
| 液态金属背景参数 | `components/liquid-metal-background.tsx` |
| 网站文案（中文 / English） | `lib/i18n.ts` 的 `translations`，两个语言都要补齐 |
| 默认语言 | `app/page.tsx` 的 `useState<Lang>` **和** `app/layout.tsx` 的 `<html lang>`，两处必须一起改（见下面第 6 条） |

## 实现上值得注意的几点

**液态金属背景**：`scale` 控制液滴相对视口的大小（0.5 时直径约为视口短边的 67%，漂移全程不触边）；`offsetX/offsetY` 为 0 时液滴群在视口正中央。容器高度用 `100lvh`（工具栏收起后的视口高，滚动全程恒定）而非 `100vh`/`100dvh`——后两者会让 canvas 在滚动中反复 resize，表现为背景滑动与卡顿。抗锯齿依赖渲染缓冲超采样，因此画质档位只影响边缘锐度、不产生锯齿。

**移动端**：底部工具栏是覆盖在视口上的不透明浮层，iOS Safari 在普通浏览下 `env(safe-area-inset-bottom)` 恒为 0，因此用固定值兜底（见 `globals.css` 中 `@media (hover: none) and (pointer: coarse)`）。站点为单一深色主题，不要重新引入 `bg-background` / 主题色切换，否则会遮住固定的液态金属背景。

**framer-motion 的一般纪律**：带动画的组件（按钮、卡片入场、灯箱）用 `LazyMotion` + `domAnimation` 按需加载 framer-motion，剔除了未使用的 drag / layout 代码。新增带动画的组件请用 `m.*` 而非 `motion.*`，否则会把完整版拖回包里。另注意 framer-motion 会接管元素的 `transform` 属性，不要同时用 Tailwind 的 `-translate-x-1/2` 之类的工具类做定位（`origin-button.tsx` 里踩过，改用 `x/y` 由它统一管理）。**但 framer 不适合驱动大量元素的逐帧动画**——它会为每个元素跑一个 JS rAF 循环逐帧写内联样式，逐字揭示因此改成了纯 CSS transition（见下面第 8 条与「Safari 性能专项」），`reveal-text.tsx` 里只保留了 `useInView` 这一个 hook。

**逐字揭示动画（`reveal-text.tsx`）**，八个坑都实测过，改这个文件前值得先看：

1. **拆字必须按码点**（`Array.from(input)`），不能用正则的 `[\s\S]`——后者按 UTF-16 码元匹配，会把 emoji 拆成孤立代理项，而孤立代理项在服务端序列化与客户端 hydrate 时结果不同，触发 React 注水失败，整棵服务端树被丢弃后 `useInView` 的观察器全部失效，表现为全站文字停在不可见状态。
2. **每个单元自己驱动动画**，不要依赖 framer 的父子 variant 传播——传播只在父级首次切换 variant 时发生，之后新挂载的子元素（切换语言时就会出现）接不上，会永远停在 hidden。
3. **`IntersectionObserver` 不要给 margin 设负值**。负的 top margin 会漏掉 fixed 导航，负的 bottom margin 会在「已滚到页面最底」时漏掉页脚版权文字——用户看得见它，IO 却判它不相交。
4. **`as="span"` 时不能加 `w-full`**：span 是 inline，`width:100%` 会让浏览器把容器算成只有一行宽，中文逐字必然竖排。
5. **`delay` 写在 variants 的 visible 分支里**，不要放 `transition` prop，否则它对 `hidden` 的初始应用同样生效。
6. **默认语言的服务端与客户端必须一致**。改 `useState<Lang>` 的同时必须改 `app/layout.tsx` 的 `<html lang>`：服务端按 layout 的 lang 渲染首帧，客户端按 `useState` 的初值 hydrate，两边不同就是一次 React 注水失败——整棵服务端树被丢弃，`useInView` 的观察器跟着失效，全站文字停在不可见状态。另外首帧语言不要由 `navigator.language` / `localStorage` 决定，那必然造成两边不一致。
7. **任何「静止状态」下的 filter 都会让 Safari 显出与文字等大的灰色方块**——不管是 framer 留下的内联 `blur(0px)`，还是隐藏态里带 blur 的 CSS。方块是 WebKit 为带 filter 的元素建的合成层的空层贴片，首屏加载等注水的那一两秒最明显。对策是让静止状态彻底不带 filter：隐藏态加 `visibility: hidden`（整个元素不画），blur=0 的文本不设 `--reveal-blur` 变量（CSS 落到 `filter: none`），播放态目标直接写 `filter: none`（规范规定 none 与 blur 列表插值时补恒等值，blur(10px)→none 观感等同 blur(10)→blur(0)）。**另一个坑：`var()` 是字面替换**，`--reveal-blur` 的值必须是完整的 `blur(8px)`——只写 `8px` 会把 `filter: var(--reveal-blur, none)` 替换成非法的 `filter: 8px`，静默回退成 `none`，模糊效果整个消失。
8. **不要用 framer 给上百个单元做逐帧动画**。framer 会为每个单元跑一个 JS rAF 循环、每帧写一次内联 style，长段落揭示时主线程每帧要做上百次样式写入 + 重算，WebKit 实测掉到 55fps 以下、最差帧 300ms（blur 本身反而不是主因——`filter: none` 掉帧依旧）。现在整段动画是**纯 CSS transition**：组件只在容器上切换一次 `reveal-play` class，`opacity/transform` 的逐帧工作交给合成器；错峰用 `transition-delay: calc(var(--reveal-delay) + var(--ri) * var(--reveal-stagger))`，动画参数全部经 CSS 变量下发（render 里算好，服务端客户端一致，不破坏注水）。代价是 reveal-text 不再依赖 framer，只保留 `useInView` 这一个 hook。

切换语言会换掉整套单元，单元 `key` 用索引而非文本，避免 ~790 个 span 全部卸载重挂载。但**列表的 `key` 同样必须跨语言稳定**：实战项目卡片原来写 `key={proj.name}`，中文名和英文名不同，切换语言时 React 会把三张卡片连同里面的 `RevealText` 组件一起卸载重挂载——组件自己记住「已揭示过」的 ref 也随之一块丢，文字重新从隐藏态播一遍，刚摘掉的 filter 也跟着回来。现在改用 `repo` 地址做 key。

## Safari 性能专项

用 Playwright 的 WebKit 内核（`npm i --no-save playwright && npx playwright install webkit`）做 Safari 的帧率测量，rAF 逐帧采样按 500ms 分桶。实测结论与对应优化：

| 开销来源 | 实测 | 优化 |
| --- | --- | --- |
| framer 逐帧写样式 | 滚动揭示 55fps、最差帧 300ms | 改纯 CSS transition（见上面第 8 条） |
| 图片解码（首次滚入视口） | 慢帧第二大头 | 已是 `loading=lazy` + `decoding=async`，无法再省，属一次性成本 |
| 卡片大面积 `backdrop-blur` | 滚动时每帧重滤背景 | `html.webkit .glass-soft` 关掉卡片模糊、底色加深补偿（layout.tsx 的内联脚本给 WebKit 打类） |
| 液态金属着色器 | 空闲时非瓶颈 | 最高档提到库默认 1920×1080×4（Retina 上不再被降采样拉虚）；自适应采样提速（0.5s 稳定 + 60 帧），弱 GPU 一秒出头就落到 hold 得住的档位 |
| 逐字 blur 过渡 | filter 过渡不能上合成器 | 长文本（>48 单元，`BLUR_UNIT_CAP`）自动不用 blur，只保留 opacity+位移 |

着色器与 backdrop-blur 在空闲时都不贵，**不要预先优化它们**——先测量再动手。长文本弃用 blur 后视觉差别很小（仍是淡入 + 上浮），短标题保留完整模糊效果。
