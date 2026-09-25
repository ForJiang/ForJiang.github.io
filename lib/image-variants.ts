// 由 scripts/generate-images.mjs 生成，请勿手改；新增图片后重跑该脚本。
// 每项提供 AVIF / WebP 两组 srcset 和一张 <img> 回退图。
export const PROJECT_IMAGES = [
  {
    name: "yuntu",
    width: 1200,
    height: 676,
    avif: [
      { w: 480, path: "/images/yuntu-480-9f84e0e1.avif" },
      { w: 800, path: "/images/yuntu-800-bc330d30.avif" },
      { w: 1200, path: "/images/yuntu-1200-59dca776.avif" },
    ],
    webp: [
      { w: 480, path: "/images/yuntu-480-ff63a9a4.webp" },
      { w: 800, path: "/images/yuntu-800-e08dd634.webp" },
      { w: 1200, path: "/images/yuntu-1200-2ce96f0f.webp" },
    ],
    fallback: "/images/yuntu.jpg",
  },
  {
    name: "tick",
    width: 1200,
    height: 676,
    avif: [
      { w: 480, path: "/images/tick-480-bc8cb073.avif" },
      { w: 800, path: "/images/tick-800-d3738787.avif" },
      { w: 1200, path: "/images/tick-1200-ff3703d0.avif" },
    ],
    webp: [
      { w: 480, path: "/images/tick-480-0be6ff19.webp" },
      { w: 800, path: "/images/tick-800-34fec461.webp" },
      { w: 1200, path: "/images/tick-1200-a3526139.webp" },
    ],
    fallback: "/images/tick.jpg",
  },
  {
    name: "pixelboard",
    width: 1200,
    height: 676,
    avif: [
      { w: 480, path: "/images/pixelboard-480-ace85743.avif" },
      { w: 800, path: "/images/pixelboard-800-dfac803e.avif" },
      { w: 1200, path: "/images/pixelboard-1200-e5ecea22.avif" },
    ],
    webp: [
      { w: 480, path: "/images/pixelboard-480-20b92598.webp" },
      { w: 800, path: "/images/pixelboard-800-4acd6b1d.webp" },
      { w: 1200, path: "/images/pixelboard-1200-8c27f2b0.webp" },
    ],
    fallback: "/images/pixelboard.jpg",
  },
  {
    name: "solar",
    width: 1200,
    height: 676,
    avif: [
      { w: 480, path: "/images/solar-480-db402b34.avif" },
      { w: 800, path: "/images/solar-800-b0671e24.avif" },
      { w: 1200, path: "/images/solar-1200-de438287.avif" },
    ],
    webp: [
      { w: 480, path: "/images/solar-480-64182838.webp" },
      { w: 800, path: "/images/solar-800-12aa50ae.webp" },
      { w: 1200, path: "/images/solar-1200-05feab53.webp" },
    ],
    fallback: "/images/solar.jpg",
  },
] as const;

export const IMAGE_SIZES =
  "(max-width: 639px) calc(100vw - 3rem), calc((100vw - 4rem) / 2)";