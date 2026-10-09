import type { MetadataRoute } from "next";

/**
 * 站点地图：单页站点只有一个 URL，列出来供搜索引擎确认规范地址。
 * 静态导出（output: "export"）下 Next 会在构建时生成 out/sitemap.xml。
 * url 必须写绝对地址——sitemap 规范不接受相对路径（实测传 "/" 产物里
 * 就是 `<loc>/</loc>`，metadataBase 不会替它补全）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://forjiang.github.io/",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
