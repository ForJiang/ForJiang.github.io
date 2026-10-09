import type { MetadataRoute } from "next";

/**
 * 抓取规则：全站允许收录，指向 sitemap。
 * 静态导出（output: "export"）下 Next 会在构建时生成 out/robots.txt。
 * 站点是用户主站根路径，没有需要屏蔽的路径（构建产物由 Pages 托管，
 * 仓库里的 README 等文件不参与线上服务）。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://forjiang.github.io/sitemap.xml",
  };
}
