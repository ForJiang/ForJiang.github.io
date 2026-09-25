/**
 * 生成移动端/桌面端响应式图片变体。
 *
 * 用法（需要 sharp）：
 *   npm i -D sharp && node scripts/generate-images.mjs
 *
 * 输入：public/images/*.jpg（1600w 母版）
 * 输出：public/images/<name>-<width>-<hash8>.<avif|webp>.jpg 母版保留作 <img> 回退
 *       lib/image-variants.ts（页面引用的清单）
 *
 * 只做一次，不参与线上构建：CI 直接使用已生成的产物文件。
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/images");
const WIDTHS = [480, 800, 1200];
const AVIF_Q = 50;
const WEBP_Q = 78;
const NAMES = ["yuntu", "tick", "pixelboard", "solar"];

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("缺少 sharp：请先执行 npm i -D sharp");
  process.exit(1);
}

const out = [];

for (const name of NAMES) {
  const src = path.join(SRC, `${name}.jpg`);
  const buf = await readFile(src);
  const meta = await sharp(buf).metadata();
  // 母版纵横比，用于 <img width height>，避免布局抖动
  const height = meta.height; // 用母版真实尺寸声明，和 <img src> 指向的母版一致

  const entry = { name, width: meta.width, height, avif: [], webp: [] };

  for (const w of WIDTHS) {
    for (const [fmt, q] of [["avif", AVIF_Q], ["webp", WEBP_Q]]) {
      const data = await sharp(buf).resize({ width: w }).toFormat(fmt, { quality: q }).toBuffer();
      // 内容哈希：内容变了文件名才变，替换图片自动让 CDN / 浏览器缓存失效
      const hash = createHash("sha256").update(data).digest("hex").slice(0, 8);
      const file = `${name}-${w}-${hash}.${fmt}`;
      await writeFile(path.join(SRC, file), data);
      if (fmt === "avif") entry.avif.push({ w, path: `/images/${file}` });
      else entry.webp.push({ w, path: `/images/${file}` });
      console.log(`  ${file}  ${(data.length / 1024).toFixed(1)}KB`);
    }
  }
  out.push(entry);
}

const lines = [];
lines.push("// 由 scripts/generate-images.mjs 生成，请勿手改；新增图片后重跑该脚本。");
lines.push("// 每项提供 AVIF / WebP 两组 srcset 和一张 <img> 回退图。");
lines.push("export const PROJECT_IMAGES = [");
for (const e of out) {
  lines.push("  {");
  lines.push(`    name: "${e.name}",`);
  lines.push(`    width: ${e.width},`);
  lines.push(`    height: ${e.height},`);
  for (const fmt of ["avif", "webp"]) {
    const items = e[fmt].map((v) => `      { w: ${v.w}, path: "${v.path}" },`).join("\n");
    lines.push(`    ${fmt}: [\n${items}\n    ],`);
  }
  lines.push(`    fallback: "/images/${e.name}.jpg",`);
  lines.push("  },");
}
lines.push("] as const;");
lines.push("");
lines.push("export const IMAGE_SIZES =");
lines.push('  "(max-width: 639px) calc(100vw - 3rem), calc((100vw - 4rem) / 2)";');

await writeFile(path.join(ROOT, "lib/image-variants.ts"), lines.join("\n"));
console.log("\n写出 lib/image-variants.ts");
