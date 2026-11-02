// 由 scripts/generate-images.mjs 生成，请勿手改；新增图片后重跑该脚本。
// 每项提供 AVIF / WebP 两组 srcset、一张小的 <img> 回退图，以及一张无损原图 full
// （灯箱查看高清原图用，宽度上限 3864px、不足则保持原生宽，WebP q90 有损）。
export const PROJECT_IMAGES = [
  {
    name: "yuntu",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/yuntu-480-7f03c49a.avif" },
      { w: 800, path: "/images/yuntu-800-f418656c.avif" },
      { w: 1200, path: "/images/yuntu-1200-e683516d.avif" },
    ],
    webp: [
      { w: 480, path: "/images/yuntu-480-40cf6f09.webp" },
      { w: 800, path: "/images/yuntu-800-580aa196.webp" },
      { w: 1200, path: "/images/yuntu-1200-6e72cfde.webp" },
    ],
    fallback: "/images/yuntu-480-40cf6f09.webp",
    full: "/images/yuntu-full-0e000a81.webp",
  },
  {
    name: "tick",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/tick-480-4ec79f92.avif" },
      { w: 800, path: "/images/tick-800-9678ec84.avif" },
      { w: 1200, path: "/images/tick-1200-19adcadd.avif" },
    ],
    webp: [
      { w: 480, path: "/images/tick-480-84221e67.webp" },
      { w: 800, path: "/images/tick-800-687f5dec.webp" },
      { w: 1200, path: "/images/tick-1200-4b02c54b.webp" },
    ],
    fallback: "/images/tick-480-84221e67.webp",
    full: "/images/tick-full-7ea41e99.webp",
  },
  {
    name: "pixelboard",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/pixelboard-480-cb059924.avif" },
      { w: 800, path: "/images/pixelboard-800-4df0be8f.avif" },
      { w: 1200, path: "/images/pixelboard-1200-ad6c7dcf.avif" },
    ],
    webp: [
      { w: 480, path: "/images/pixelboard-480-03bde701.webp" },
      { w: 800, path: "/images/pixelboard-800-539a61e0.webp" },
      { w: 1200, path: "/images/pixelboard-1200-fa8fe765.webp" },
    ],
    fallback: "/images/pixelboard-480-03bde701.webp",
    full: "/images/pixelboard-full-0e3f5498.webp",
  },
  {
    name: "solar",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/solar-480-39bbcca2.avif" },
      { w: 800, path: "/images/solar-800-3b1f4a7b.avif" },
      { w: 1200, path: "/images/solar-1200-02c4ea3a.avif" },
    ],
    webp: [
      { w: 480, path: "/images/solar-480-b364d7b5.webp" },
      { w: 800, path: "/images/solar-800-242c212e.webp" },
      { w: 1200, path: "/images/solar-1200-e42e0d8a.webp" },
    ],
    fallback: "/images/solar-480-b364d7b5.webp",
    full: "/images/solar-full-8ed4e97d.webp",
  },
] as const;

export const IMAGE_SIZES =
  "(max-width: 639px) calc(100vw - 3rem), min(496px, calc((100vw - 4rem) / 2))";