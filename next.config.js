/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages 静态导出（Next 14 只识别 .js 配置，不要再用 next.config.ts）
  output: "export",
  // 部署目标是 ForJiang.github.io（用户主站），站点挂在根路径，无需 basePath。
  // 如果以后改部署到 username.github.io/<仓库名> 项目站，再取消下一行注释并填仓库名。
  // basePath: "/personal-website",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
