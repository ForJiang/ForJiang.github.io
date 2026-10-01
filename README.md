# ForJiang · 个人主页

基于 **Next.js 14 + TypeScript + Tailwind CSS** 的个人主页：技能与插画之外，收录五个纯静态、可离线使用的网页工具——RVC 声音克隆、图片元数据清除器、图生 3D 高斯泼溅、函数图像生成器、hello 手写动画演示。全站使用 [Paper Design 的 LiquidMetal 流体金属着色器](https://shaders.paper.design) 做固定背景；**全站没有任何动画库**——逐字揭示、区块入场、按钮填充、灯箱进出全部是纯 CSS transition/animation，进入视口的触发由一个 20 行的自写 IntersectionObserver 钩子完成（`lib/use-in-view.ts`），动画库清退的原因与过程见「Safari 性能专项」和坑 8。

线上地址：**https://forjiang.github.io**

## 收录的项目

主站之外，这些工具都在 GitHub Pages 上独立部署，全部纯静态、断网可用：

| 项目 | 一句话 | 在线 |
| --- | --- | --- |
| [RVC 声音克隆](https://github.com/ForJiang/rvc-sound-clone) | 浏览器内录音变声：ONNX Runtime Web 页内推理 + 本机 GPU 引擎双动力，完整参数一键预设，批量导出 ZIP | [试用](https://forjiang.github.io/rvc-sound-clone/) |
| [图片元数据清除器](https://github.com/ForJiang/image-metadata-cleaner) | 批量抹除 EXIF / GPS / 缩略图 / 尾部隐藏数据，先扫描后清除再自检，69 项单元测试 | [试用](https://forjiang.github.io/image-metadata-cleaner/) |
| [图生 3D 高斯泼溅](https://github.com/ForJiang/image-to-splat) | 图片 / 视频 → 本地深度估计 → 可交互高斯点云，导出 .ply / .splat 给 Blender | [试用](https://forjiang.github.io/image-to-splat/) |
| [函数图像生成器](https://github.com/ForJiang/function-grapher) | 多曲线同图 + 零依赖符号求导（1–8 阶带步骤）与切线方程，260 项单元测试 | [试用](https://forjiang.github.io/function-grapher/) |
| [hello 手写动画](https://github.com/ForJiang/forjiang-hello) | 零依赖复刻 Apple Hello：体素地形上逐笔手写，字标是实时光源 | [观看](https://forjiang.github.io/forjiang-hello/) |

## 功能

- 液态金属着色器全站固定背景（`@paper-design/shaders-react`），滚动全程可见、不随地址栏伸缩而变形位移
- 白色鼠标流光轨迹特效（遵循 `prefers-reduced-motion`）
- 全站文字逐字揭示：每个单元从「透明 + 下移 +（短文本）模糊」过渡到清晰位置，按 stagger 错峰，滚动进入视口时触发。**纯 CSS transition 驱动**（合成器动画），触发用自写 IO 钩子（`components/ui/reveal-text.tsx` + `lib/use-in-view.ts`）。间距只在源文本真有空白的位置出现——汉字之间不加、英文词间与中英文交界保留（见下面第 13 条）
- 区块级入场（卡片 / 面板 / 徽章的淡入上浮）同样是纯 CSS：`components/enter-block.tsx` 包装进入视口播一次，时长与错峰经 CSS 变量下发；Hero 按钮组用 `animation + both` 填充，样式表生效即排队、不等注水（globals.css 的 `.rise-in`）
- 中文 / English 双语言切换（**默认英文**，手动切换后记住选择，不再跟随浏览器语言）
- 全站行距统一收口在 `globals.css`：正文 `p` 1.625、标题 `h1~h4` 1.375——用 `!important` 压过 Tailwind 字号工具类自带的 1.1 行高（两行中文原本挤成一团），全站一个出处
- 插画封面使用 `<picture>` + `srcset` 响应式加载：AVIF → WebP → WebP（480 宽）逐级回退。封面容器固定 16:9（与插画母版同比例，`object-cover` 几乎不裁切），卡片收进 `max-w-5xl` 容器、文字缩到标题 18px / 简介 14px，图占卡片约 68%
- 点击封面图打开全屏灯箱：**立即显示已缓存的封面变体（轻模糊过渡）**，2400×1352 **WebP 无损**原图在后台下载、就绪后淡入盖住它。图片**左右滑动切换**（也可以用键盘方向键），底部是「上一张 / 页码 / 下一张」合成的一行居中控件，**不自动播放**——切换只由用户操作触发；**点遮罩暗处 / Esc / 右上角 X 都能关**。原图还有两级预热：画廊进入视口后按顺序预载全部原图，桌面端悬停卡片立即预载该张，翻页时相邻原图也已预载——省流量模式（Save-Data）不预热。灯箱代码本身按需加载（`dynamic`），画廊进入视口时顺手把 chunk 拉下来，点开时无需再等网络
- 联系方式带 Bilibili / Pixiv / X 官方标志（simple-icons, CC0），入口为真实 `<a>`，可中键新标签打开；页脚另有一组同款图标按钮
- 视频板块内嵌 B 站外链播放器：协议相对地址（http/https 都不触发混合内容拦截）、`loading="lazy"` 滚入视野才加载、域名 `preconnect` 提前建连，播放器容器 1440px 上限，宽屏接近满幅
- 实战项目横向无限轮播：卡片渲染三份（中间份常驻 + 两侧各一份缓冲，甩动投影限幅 ±2 张，一份缓冲足够覆盖越界——份数直接决定 SSR 出多少张卡的 DOM，曾占整页 HTML 的 76%）+ 滚出中间份立即按整份宽度无声归位，触屏惯性甩动也撞不到实体边界，滑到最后一张自动接上第一张，两个方向都滑不到头
- 全站深色玻璃拟态面板，白色文字系统，任意液滴位置下保持可读（Safari 上大面积卡片自动降级为不透明深色底，见「Safari 性能专项」）
- Safari / iOS 性能专项：逐字动画纯 CSS transition（合成器动画）、卡片对 WebKit 去大面积 backdrop 模糊、逐字 blur 超过 48 单元自动关闭，均经 Playwright WebKit 实测归因
- 按钮采用指针扩散填充动画：圆形背景从鼠标进入的位置展开铺满、文字反色（`components/ui/origin-button.tsx`）；Hero 按用户要求的顺序出场——标题先出、徽章后出
- 完整响应式布局；移动端针对 iOS Safari 的视口与工具栏做了专门处理（页脚预留 100px 避开底部工具栏；固定背景层踩过 `lvh` 在工具栏收起时少算一截露出黑带的怪癖，用「body 底色 = shader 的 colorBack」接缝，见 `globals.css` 与下面第 14 条）
- 单页滚动结构：Hero / 关于我 / 技术能力 / 实战项目 / 插画作品 / 视频演示 / 联系方式 / 页脚，每个板块各占一屏（`min-h-screen` + 垂直居中，相邻区块内容净间距 192px），导航平滑滚动到对应锚点

导航是常驻框架，**不参与逐字动画**：它反复出现在视口里，逐字错峰反而显碎，且直接可见。

## 目录结构

```
personal-website/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署（已启用）
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 + 元信息 + favicon + theme-color + 播放器域名 preconnect
│   ├── page.tsx                  # 单页站点：八个区块（Hero/关于/技能/实战项目/插画/视频/联系/页脚）+ 灯箱
│   └── globals.css               # 主题变量（只留在用的）+ 全站行距收口 + 逐字揭示动画 + Safari/移动端兜底
├── components/
│   ├── brand-icons.tsx           # Bilibili / Pixiv / X 官方标志（simple-icons, CC0）
│   ├── enter-block.tsx           # 区块级入场包装（IO 触发一次 + CSS 过渡）
│   ├── language-context.tsx      # 全站语言状态（Provider + useLanguage）
│   ├── lightbox.tsx              # 全屏原图查看器
│   ├── liquid-metal-background.tsx # 全站固定液态金属背景 + 画质自适应
│   ├── mouse-trail.tsx           # 鼠标流光轨迹
│   ├── site-nav.tsx              # 全站导航（首页锚点 + 平滑滚动）
│   ├── site-shell.tsx            # 页面外框（背景 + 轨迹 + 导航）
│   └── ui/
│       ├── badge.tsx / button.tsx / card.tsx   # shadcn/ui 组件（按站点实际用法裁剪，无变体系统）
│       ├── liquid-metal-hero.tsx               # Hero 区
│       ├── origin-button.tsx                   # 指针扩散填充按钮
│       ├── project-carousel.tsx                # transform 驱动的无限轮播轨道
│       └── reveal-text.tsx                     # 逐字模糊上浮揭示动画（纯 CSS transition）
├── lib/
│   ├── favicon-inline.ts         # 主图标的圆角 PNG 内联 data URI
│   ├── i18n.ts                   # 中英双语文案字典（含实战项目数据）
│   ├── image-variants.ts         # 由脚本生成的图片变体清单
│   ├── ui-kit.ts                 # 全站共用样式常量 + 卡片 spotlight 指针追踪
│   ├── use-in-view.ts            # 自写 IntersectionObserver「进入视口一次」钩子
│   └── utils.ts                  # cn() 工具函数
├── public/
│   ├── favicon.jpg               # apple-touch-icon 用（直角、整幅不透明，256×256）
│   ├── favicon-rounded.png       # 标签页图标（128×128 圆角，四角透明）
│   └── images/                   # 4 张插画的 2400px 无损原图 + AVIF/WebP 变体 + favicon-master.png（站点图标源图）
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

> **Pages 的发布来源必须是「GitHub Actions」**（对应 API 的 `build_type: workflow`）。如果它被改成分支部署，GitHub Pages 会直接发布 `main` 根目录——线上会变成仓库里那个旧版 `index.html`，而不是这里构建的 Next.js 站点，Actions 的部署记录虽显示成功但不生效。若线上内容看起来不像本站（比如带 emoji favicon 的纯静态页），先去 **Settings → Pages** 确认来源。

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

三个文件都从 `public/images/favicon-master.png`（832×832 源图）生成，本地用 sharp 一次性出档：

```bash
npm i --no-save sharp
node -e '
const sharp = require("sharp");
const mask = (s) => Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${s * 0.2}"/></svg>`);
const M = "public/images/favicon-master.png";
sharp(M).resize(256, 256, { fit: "cover" }).jpeg({ quality: 90 }).toFile("public/favicon.jpg");
sharp(M).resize(128, 128, { fit: "cover" }).composite([{ input: mask(128), blend: "dest-in" }]).png().toFile("public/favicon-rounded.png");
sharp(M).resize(32, 32, { fit: "cover" }).composite([{ input: mask(32), blend: "dest-in" }]).png().toBuffer()
  .then((b) => console.log("data:image/png;base64," + b.toString("base64")));
'
```

输出的 base64 整段替换 `lib/favicon-inline.ts` 里的 `INLINE_ICON_32`。半径取边长的 20%（iOS squircle 的比例）；圆角遮罩是 SVG `<rect rx>` 经 `composite: dest-in` 贴上去的（等价于 canvas 的 `destination-in` + `roundRect`）。换图只换 `favicon-master.png` 再重跑。

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
| 文字动效的快慢与强度 | `RevealText` 的 `duration` / `stagger` / `blur` props（上浮位移由 CSS 的 `--reveal-y` 默认值控制） |
| 区块入场动画（卡片/面板淡入上浮） | `components/enter-block.tsx` 的 `delay` / `duration`，过渡本体在 `app/globals.css` 的 `.enter-block` |
| 长文本弃用模糊的阈值 | `components/ui/reveal-text.tsx` 的 `BLUR_UNIT_CAP`（单元数超过它自动只保留淡入+上浮） |
| Safari 的卡片降级（去模糊） | `app/globals.css` 的 `html.webkit .glass-soft`，webkit 类由 `app/layout.tsx` 的内联脚本打上 |
| 着色器画质档位 | `components/liquid-metal-background.tsx` 的 `QUALITY_TIERS`（最高档为库默认的 ≈8.3MP，覆盖 1440p 级 Retina 原生精度） |
| 液态金属背景参数 | `components/liquid-metal-background.tsx` |
| 网站文案（中文 / English） | `lib/i18n.ts` 的 `translations`，两个语言都要补齐 |
| 默认语言 | `components/language-context.tsx` 的 `useState<Lang>` **和** `app/layout.tsx` 的 `<html lang>`，两处必须一起改（见下面第 6 条） |

## 实现上值得注意的几点

**液态金属背景**：`scale` 控制液滴相对视口的大小（0.5 时直径约为视口短边的 67%，漂移全程不触边）；`offsetX/offsetY` 为 0 时液滴群在视口正中央。容器高度用 `100lvh`（工具栏收起后的视口高，滚动全程恒定）而非 `100vh`/`100dvh`——后两者会让 canvas 在滚动中反复 resize，表现为背景滑动与卡顿。抗锯齿依赖渲染缓冲超采样，因此画质档位只影响边缘锐度、不产生锯齿。

**移动端**：底部工具栏是覆盖在视口上的不透明浮层，iOS Safari 在普通浏览下 `env(safe-area-inset-bottom)` 恒为 0，因此用固定值兜底（见 `globals.css` 中 `@media (hover: none) and (pointer: coarse)`）。站点为单一深色主题，不要重新引入 `bg-background` / 主题色切换，否则会遮住固定的液态金属背景。

**动画零依赖**：站点曾用 framer-motion 驱动按钮填充、卡片入场与灯箱，后来发现它不适合大量元素的逐帧动画（见下面第 8 条与「Safari 性能专项」），先把逐字揭示改成了纯 CSS；再盘点剩余用途——区块入场是「透明 + 下移 → 原位」的一次性淡入、按钮填充是 transform 过渡、按下反馈是 :active、灯箱是遮罩淡入淡出——全都是 CSS 原生表达，为一个按钮动画背整座库不值，于是 framer-motion 整个移除（First Load JS 146kB → 120kB，页面代码块 58.6kB → 32.4kB）。现在的分工：进入视口的触发用自写 IO 钩子 `lib/use-in-view.ts`，区块入场包装在 `components/enter-block.tsx`，过渡本体全在 `globals.css`。**新增动画先问一句能不能一行 CSS 写出来**；确实需要 JS 驱动的，也别为此重新引入动画库。注意 CSS 动画不要用 Tailwind 的 `-translate-x-1/2` 之类工具类与内联 transform 混写同一属性（`origin-button.tsx` 的填充圆是「平移居中 + 缩放」写进同一个 transform 的例子）。

**逐字揭示动画（`reveal-text.tsx`）**，十五个坑都实测过，改这个文件前值得先看：

1. **拆字必须按码点**（`Array.from(input)`），不能用正则的 `[\s\S]`——后者按 UTF-16 码元匹配，会把 emoji 拆成孤立代理项，而孤立代理项在服务端序列化与客户端 hydrate 时结果不同，触发 React 注水失败，整棵服务端树被丢弃后 `useInView` 的观察器全部失效，表现为全站文字停在不可见状态。
2. **每个单元自己驱动动画**，不要依赖 framer 的父子 variant 传播——传播只在父级首次切换 variant 时发生，之后新挂载的子元素（切换语言时就会出现）接不上，会永远停在 hidden。
3. **`IntersectionObserver` 不要给 margin 设负值**。负的 top margin 会漏掉 fixed 导航，负的 bottom margin 会在「已滚到页面最底」时漏掉页脚版权文字——用户看得见它，IO 却判它不相交。
4. **`as="span"` 时不能加 `w-full`**：span 是 inline，`width:100%` 会让浏览器把容器算成只有一行宽，中文逐字必然竖排。
5. **`delay` 写在 variants 的 visible 分支里**，不要放 `transition` prop，否则它对 `hidden` 的初始应用同样生效。
6. **默认语言的服务端与客户端必须一致**。改 `components/language-context.tsx` 里 `useState<Lang>` 的初值的同时必须改 `app/layout.tsx` 的 `<html lang>`：服务端按 layout 的 lang 渲染首帧，客户端按 `useState` 的初值 hydrate，两边不同就是一次 React 注水失败——整棵服务端树被丢弃，`useInView` 的观察器跟着失效，全站文字停在不可见状态。另外首帧语言不要由 `navigator.language` / `localStorage` 决定，那必然造成两边不一致；用户的选择只在挂载后的 `useEffect` 里恢复。
7. **任何「静止状态」下的 filter 都会让 Safari 显出与文字等大的灰色方块**——不管是 framer 留下的内联 `blur(0px)`，还是隐藏态里带 blur 的 CSS。方块是 WebKit 为带 filter 的元素建的合成层的空层贴片，首屏加载等注水的那一两秒最明显。对策是让静止状态彻底不带 filter：隐藏态加 `visibility: hidden`（整个元素不画），blur=0 的文本不设 `--reveal-blur` 变量（CSS 落到 `filter: none`），播放态目标直接写 `filter: none`（规范规定 none 与 blur 列表插值时补恒等值，blur(10px)→none 观感等同 blur(10)→blur(0)）。**另一个坑：`var()` 是字面替换**，`--reveal-blur` 的值必须是完整的 `blur(8px)`——只写 `8px` 会把 `filter: var(--reveal-blur, none)` 替换成非法的 `filter: 8px`，静默回退成 `none`，模糊效果整个消失。
8. **不要用 framer 给上百个单元做逐帧动画**。framer 会为每个单元跑一个 JS rAF 循环、每帧写一次内联 style，长段落揭示时主线程每帧要做上百次样式写入 + 重算，WebKit 实测掉到 55fps 以下、最差帧 300ms（blur 本身反而不是主因——`filter: none` 掉帧依旧）。现在整段动画是**纯 CSS transition**：组件只在容器上切换一次 `reveal-play` class，`opacity/transform` 的逐帧工作交给合成器；错峰用 `transition-delay: calc(var(--reveal-delay) + var(--ri) * var(--reveal-stagger))`，动画参数全部经 CSS 变量下发（render 里算好，服务端客户端一致，不破坏注水）。这一步是清退 framer-motion 的起点——先摘掉了它最不适合的那块；后来其余用途（入场/填充/灯箱）也全部 CSS 化，依赖整个移除（见上面「动画零依赖」），触发用的 `useInView` 换成了自写的 `lib/use-in-view.ts`。
9. **拖拽容器里 `setPointerCapture` 会吞掉内部按钮的 click**。全屏滑动手势面（灯箱遮罩、轮播轨道）为了顺畅拖拽会调用 `setPointerCapture`，而规范规定捕获期间后续的指针事件、兼容鼠标事件与最终 `click` 全部重定向到捕获元素——于是按在卡片「GitHub」链接上的点击，`click` 落到了轨道容器上，链接永远点不开；灯箱底部的「下一张」同理。现象是按钮看得见、点得住、就是没反应，且不报任何错。对策：`onPointerDown` 里先判断 `e.target.closest("a, button")`，落在交互元素上直接 return，不进入拖拽分支（`lightbox.tsx`、`project-carousel.tsx`）。
10. **Tailwind 的 `content` 必须覆盖放共享类名的目录**。共用样式抽成常量（`lib/ui-kit.ts` 的 `SECTION_SHELL` 等）后，如果 `tailwind.config.ts` 的 content 只扫了 `app/` 和 `components/`，常量字符串里的类根本不会进产物——不报错、不警告，页面只是静默丢样式。实测 `py-24`、`bg-black/35` 因此消失，所有区块的上下 96px 留白和暗色底色一起没了，几大部分挤在一起（用户反馈「靠得太近」）。排查方法是直接在 `out/_next/static/css/*.css` 里 grep 类名，而不是看页面猜。`lib/` 已加进 content。
11. **Tailwind 连注释里的类名也会扫**。删除死代码时留下的说明文字（「CardDescription 用的 `text-muted-foreground`」）会让这个被删掉用途的工具类重新出现在产物 CSS 里—— Tailwind 的候选提取器不区分代码与注释。写这类注释时避开完整的类名写法（如写成「muted 系文字色」），否则删了也白删。
12. **删 shadcn 组件的未用变体时，连带删主题变量**。`button.tsx` / `badge.tsx` 里 cva 变体字符串是 Tailwind 的扫描源：destructive / outline 等从未使用的变体会各自生成一整套工具类（`bg-destructive`、`border-input`、`underline-offset-4`……）白占 CSS；对应的 `--destructive` / `--popover` / `--muted` / `--input` 变量也一起失效。后来干脆把 cva 整个拆了：Button 全站只有「页脚图标按钮」一种用法、Badge 只剩胶囊外形（颜色全部由调用方的白色系类提供），固定成一组类后 `class-variance-authority` 依赖随之移除，`--primary` / `--secondary` / `--card` / `--accent` 等主题变量也没有存在理由了。同理 `asChild` 没人用就别引 `@radix-ui/react-slot`——它是纯为 asChild 存在的依赖。变量删完记得 grep 一遍 `out/_next/static/css/*.css` 确认没漏。
13. **中文之间不能加间距 margin，英文词间必须有**。「逐字」把 `日本を旅する` 拆成单字后，若统一给每个单元加 `margin-left`，中文会被插进本不存在的空隙（用户反馈「文字与文字的间隔过大」）；而纯英文 `Hello World` 拆成单词后没有间距又会全部糊在一起。对策是拆字时按**源文本是否有空白**给单元打 `gap` 标记：只有源文本里跟着空白的单元才加 `.reveal-gap` margin——汉字之间不加、英文词间与中英文交界都保留（`reveal-text.tsx` 的 `splitRevealUnits`）。判据必须是源文本，不能按「字符是否 CJK」猜：中英混排时一个汉字后面跟英文单词，交界处的空白同样要留。
14. **固定背景用 `lvh` 也会在 iOS 上露出黑带，最终靠 body 底色接缝**。`100lvh` 取的是工具栏收起后的视口高，滚动全程恒定不抖，但工具栏处于收起状态时 fixed 元素仍可能按未收起的高度少算一截，页面底部露出一条背景画布盖不到的黑带（用户 iOS 截图反馈「背景没有铺满屏幕」）。根元素与 body 的底色是唯一保证铺满画布的层，把 `body` 的 `background-color` 设成着色器本身的 `colorBack`（`#0a0a0c`），黑带与画布边缘同色即看不出接缝——比继续跟视口单位较劲可靠（`app/globals.css`）。
15. **「拖拽过就不响应点击」的抑制标记，复位必须早于所有提前 return**。轮播为免甩动后误触内部链接，用「本次是否拖过」的标记在 capture 阶段吞 click；而复位原先写在指针按下的链接守卫**之后**——守卫对落在链接上的按下直接 return，于是甩过一次轮播后标记永远是 `true`，之后每一下点卡片里的 GitHub / 在线试用都被当成误触吞掉，而点链接自己走的也是同一条 return，永远清不掉它，只有某次按下落在卡片空白处才恢复（用户反馈「这几个卡片的链接按钮有时候点了没反应」，现象是滑过一次之后必坏、过一会又莫名其妙好了）。同类坑还有两个变体：**手势面不要铺到「点这里要关」的区域上**——灯箱原先把滑动手势绑在整个遮罩上，点暗处也会 `setPointerCapture`，随后浏览器把这次 click 重定向到图片容器，而图片容器上恰好有 `stopPropagation`（点图片本身不关灯箱），关闭逻辑永远收不到，实测只能按 Esc 或点右上角 X，把手势面收缩到图片本身即可；**吞 click 的标记要带时限**——布尔标记若那一次 click 因指针取消、手指滑出屏幕而没来，就会把用户接下来点「下一张」的那一下也吞掉，改成时间窗（`e.timeStamp + 700`）才没这个隐患。顺带一个测试经验：验证「点击是否被吞」必须在 **document 的冒泡阶段**记录（`addEventListener('click', …)`，第三个参数不要传 `true`）——在 capture 阶段记录会漏报，事件其实已经派发到目标，只是随后被 `stopPropagation` 掐断。

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
