# ForJiang · 个人主页

基于 **Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui** 的个人主页，Hero 区使用 [Paper Design 的 LiquidMetal 流体金属着色器](https://shaders.paper.design) 做全屏动态背景，配合 Framer Motion 逐项入场动画。

线上地址：**https://forjiang.github.io**

## 功能

- 🌊 液态金属着色器背景（`@paper-design/shaders-react`）
- 🖱️ 蔚蓝档案风格鼠标流光轨迹特效（深浅色主题自适应，遵循 `prefers-reduced-motion`）
- 🌗 深色 / 浅色模式切换，自动跟随系统并记住选择
- 🧭 固定导航栏 + 移动端汉堡菜单，平滑滚动定位
- ✨ Framer Motion 入场 / 滚动显现动画
- 🖼️ 项目卡片带渐变封面图（可替换为真实截图）
- 📱 完整响应式布局
- 📄 页面板块：Hero / 关于我 / 技术栈 / 精选项目 / 联系方式

## 目录结构

```
personal-website/
├── docs/deploy-workflow.yml      # GitHub Pages 部署工作流模板（首次启用时复制到 .github/workflows/deploy.yml）
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 + 元信息 + favicon
│   ├── page.tsx                  # 主页（各板块内容都在这里）
│   └── globals.css               # shadcn 主题 CSS 变量
├── components/
│   ├── mouse-trail.tsx           # 鼠标流光轨迹特效
│   └── ui/                       # shadcn/ui 组件 + liquid-metal-hero
├── lib/utils.ts                  # cn() 工具函数
└── index.html                    # 旧版纯 HTML 页面，仅作参考，可删除
```

## 本地运行

需要 Node.js 18.17+：

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

## 部署（GitHub Actions 自动部署，推荐）

工作流模板已放在 `docs/deploy-workflow.yml`：每次 push 到 `main`，GitHub 云端自动执行 `npm install && npm run build`（静态导出到 `out/`），并发布到 Pages —— **本地不需要安装 Node.js**。

首次启用共两步（都在 GitHub 网页上完成）：

1. **创建工作流文件**：仓库页面 **Add file → Create new file**，文件名填 `.github/workflows/deploy.yml`，把 `docs/deploy-workflow.yml` 的内容原样粘贴进去，提交到 `main`。（`.github/workflows/` 下的文件需要带 `workflow` 权限的凭证才能通过 git 推送，所以用网页创建最省事）
2. **切换 Pages 来源**：**Settings → Pages → Build and deployment → Source**，从 `Deploy from a branch` 改为 **`GitHub Actions`**

之后每次 `git push` 自动部署，构建进度见仓库 **Actions** 标签页。

> 说明：目标仓库是 `ForJiang.github.io`（用户主站），站点挂在根路径，`next.config.js` 无需配置 `basePath`。切换到 Actions 部署后，仓库根目录的旧版 `index.html` 不再被使用，可以删除。

## 如何改成你自己的信息

| 想改什么 | 位置 |
| --- | --- |
| Hero 标语 / 按钮文字 / 技能芯片 | `app/page.tsx` 中 `<LiquidMetalHero>` 的 props |
| 自我介绍 | `app/page.tsx` 「关于我」区块 |
| 技能标签 | `app/page.tsx` 顶部 `SKILLS` 数组 |
| 项目卡片 / 封面图 | `app/page.tsx` 顶部 `PROJECTS` 数组（`gradient` 换成 `<img>` 即可用真实截图） |
| 鼠标轨迹开关 / 配色 | `components/mouse-trail.tsx` |
| 邮箱 / GitHub / 哔哩哔哩 | `app/page.tsx` 顶部 `CONTACTS` |
| 网页标题 / 描述 / favicon | `app/layout.tsx` 的 `metadata` |
| 主题配色 | `app/globals.css` 的 CSS 变量 |
