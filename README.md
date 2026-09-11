# 个人网页

一个零依赖的单文件个人主页:纯 HTML + CSS + 原生 JavaScript,无需安装任何东西,双击 `index.html` 即可在浏览器打开。

## 功能

- 🌗 深色 / 浅色模式切换(自动跟随系统,并记住选择)
- ⌨️ 首页打字机效果、滚动显现动画
- 📱 完整响应式:桌面端双栏,移动端汉堡菜单
- 🧭 滚动时导航自动高亮当前分区、回到顶部按钮
- 📦 无任何外部资源(图标为内联 SVG,头像为 CSS 绘制),离线可用

## 如何改成你自己的信息

所有内容都在 `index.html` 里,用编辑器搜索替换即可:

| 想改什么 | 搜索示例 |
| --- | --- |
| 名字 | `ForJiang` |
| 职位 / 打字机台词 | `roles = ['全栈开发工程师', ...]`(在底部 `<script>` 中) |
| 自我介绍 | `关于我` 区块的两段 `<p>` |
| 技能标签 | `技术栈` 区块的 `.tag` 项 |
| 项目卡片 | `精选项目` 区块的 `proj-card` |
| 经历时间线 | `我的经历` 区块的 `tl-item` |
| 邮箱 | `jianghaoda.1@outlook.com` |
| 哔哩哔哩 | `https://b23.tv/edD6tm9` |
| GitHub | `github.com/ForJiang` |
| 头像 | 找到 `.avatar` 里的 `FJ`,换成你的名字缩写;或改为 `<img>` |
| 网页标题 | `<title>ForJiang · 个人主页</title>` |

## 本地预览

```bash
cd personal-website
python3 -m http.server 8765
# 打开 http://localhost:8765
```

直接双击 `index.html` 也可以正常运行。

## 部署

把 `index.html` 上传到任意静态托管即可,例如 GitHub Pages、Vercel、Netlify 或 Cloudflare Pages,无需构建步骤。
