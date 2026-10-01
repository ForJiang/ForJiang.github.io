// 由 scripts/generate-images.mjs 生成，请勿手改；新增图片后重跑该脚本。
// 每项提供 AVIF / WebP 两组 srcset、一张小的 <img> 回退图，以及一张无损原图 full
// （灯箱查看高清原图用，宽度上限 3864px、不足则保持原生宽，WebP lossless）。
export const PROJECT_IMAGES = [
  {
    name: "yuntu",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/yuntu-480-971961f9.avif" },
      { w: 800, path: "/images/yuntu-800-563c1b58.avif" },
      { w: 1200, path: "/images/yuntu-1200-d72c8040.avif" },
    ],
    webp: [
      { w: 480, path: "/images/yuntu-480-0417e860.webp" },
      { w: 800, path: "/images/yuntu-800-f4888f31.webp" },
      { w: 1200, path: "/images/yuntu-1200-e2892ebe.webp" },
    ],
    fallback: "/images/yuntu-480-0417e860.webp",
    full: "/images/yuntu-full-033f4fff.webp",
  },
  {
    name: "tick",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/tick-480-891319cc.avif" },
      { w: 800, path: "/images/tick-800-7505403a.avif" },
      { w: 1200, path: "/images/tick-1200-c8533f4c.avif" },
    ],
    webp: [
      { w: 480, path: "/images/tick-480-9387c672.webp" },
      { w: 800, path: "/images/tick-800-ffd4d363.webp" },
      { w: 1200, path: "/images/tick-1200-6d168a6f.webp" },
    ],
    fallback: "/images/tick-480-9387c672.webp",
    full: "/images/tick-full-f024470f.webp",
  },
  {
    name: "pixelboard",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/pixelboard-480-324d0ff8.avif" },
      { w: 800, path: "/images/pixelboard-800-7afb74b0.avif" },
      { w: 1200, path: "/images/pixelboard-1200-2cd1e7c2.avif" },
    ],
    webp: [
      { w: 480, path: "/images/pixelboard-480-a5508b04.webp" },
      { w: 800, path: "/images/pixelboard-800-30bac289.webp" },
      { w: 1200, path: "/images/pixelboard-1200-749bda99.webp" },
    ],
    fallback: "/images/pixelboard-480-a5508b04.webp",
    full: "/images/pixelboard-full-badbae8a.webp",
  },
  {
    name: "solar",
    width: 3864,
    height: 2176,
    avif: [
      { w: 480, path: "/images/solar-480-86bc85b3.avif" },
      { w: 800, path: "/images/solar-800-fd8f0428.avif" },
      { w: 1200, path: "/images/solar-1200-bcb498dd.avif" },
    ],
    webp: [
      { w: 480, path: "/images/solar-480-2e44c5b2.webp" },
      { w: 800, path: "/images/solar-800-fcb4622a.webp" },
      { w: 1200, path: "/images/solar-1200-36b0169d.webp" },
    ],
    fallback: "/images/solar-480-2e44c5b2.webp",
    full: "/images/solar-full-1670f66f.webp",
  },
] as const;

export const IMAGE_SIZES =
  "(max-width: 639px) calc(100vw - 3rem), min(496px, calc((100vw - 4rem) / 2))";