// 由 scripts/generate-images.mjs 生成，请勿手改；新增图片后重跑该脚本。
// 每项提供 AVIF / WebP 两组 srcset、一张小的 <img> 回退图，以及一张无损原图 full
// （灯箱查看高清原图用，宽度 2400px，WebP lossless，不做有损压缩）。
export const PROJECT_IMAGES = [
  {
    name: "yuntu",
    width: 2400,
    height: 1352,
    avif: [
      { w: 480, path: "/images/yuntu-480-875fac84.avif" },
      { w: 800, path: "/images/yuntu-800-123c12e0.avif" },
      { w: 1200, path: "/images/yuntu-1200-54261c9e.avif" },
    ],
    webp: [
      { w: 480, path: "/images/yuntu-480-62bf9f86.webp" },
      { w: 800, path: "/images/yuntu-800-912590c0.webp" },
      { w: 1200, path: "/images/yuntu-1200-763a61ad.webp" },
    ],
    fallback: "/images/yuntu-480-62bf9f86.webp",
    full: "/images/yuntu-full-221ce7e3.webp",
  },
  {
    name: "tick",
    width: 2400,
    height: 1352,
    avif: [
      { w: 480, path: "/images/tick-480-15259c19.avif" },
      { w: 800, path: "/images/tick-800-4f0d66d4.avif" },
      { w: 1200, path: "/images/tick-1200-aac09490.avif" },
    ],
    webp: [
      { w: 480, path: "/images/tick-480-dd178877.webp" },
      { w: 800, path: "/images/tick-800-edebdc62.webp" },
      { w: 1200, path: "/images/tick-1200-10afae32.webp" },
    ],
    fallback: "/images/tick-480-dd178877.webp",
    full: "/images/tick-full-f4c1a30c.webp",
  },
  {
    name: "pixelboard",
    width: 2400,
    height: 1352,
    avif: [
      { w: 480, path: "/images/pixelboard-480-af10e253.avif" },
      { w: 800, path: "/images/pixelboard-800-0ef94ba8.avif" },
      { w: 1200, path: "/images/pixelboard-1200-2342ebb6.avif" },
    ],
    webp: [
      { w: 480, path: "/images/pixelboard-480-3ffcc225.webp" },
      { w: 800, path: "/images/pixelboard-800-2188228c.webp" },
      { w: 1200, path: "/images/pixelboard-1200-2b95697e.webp" },
    ],
    fallback: "/images/pixelboard-480-3ffcc225.webp",
    full: "/images/pixelboard-full-717e0769.webp",
  },
  {
    name: "solar",
    width: 2400,
    height: 1352,
    avif: [
      { w: 480, path: "/images/solar-480-3e1d22a9.avif" },
      { w: 800, path: "/images/solar-800-c2567d21.avif" },
      { w: 1200, path: "/images/solar-1200-becd84c4.avif" },
    ],
    webp: [
      { w: 480, path: "/images/solar-480-5ed09ba3.webp" },
      { w: 800, path: "/images/solar-800-96254dc5.webp" },
      { w: 1200, path: "/images/solar-1200-8a447993.webp" },
    ],
    fallback: "/images/solar-480-5ed09ba3.webp",
    full: "/images/solar-full-0c21afac.webp",
  },
] as const;

export const IMAGE_SIZES =
  "(max-width: 639px) calc(100vw - 3rem), calc((100vw - 4rem) / 2)";