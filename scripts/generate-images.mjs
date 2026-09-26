/**
 * 生成移动端/桌面端响应式图片变体。
 *
 * 用法（需要 sharp）：
 *   npm i -D sharp && node scripts/generate-images.mjs
 *
 * 输入：一个母版文件，母版把无损原图缩到 FULL_W 宽存成 WebP lossless
 *       （`public/images/<name>.src`，脚本按 .png → .jpg 顺序探测）。
 * 输出：① `<name>-full-<hash8>.webp`  无损原图，灯箱查看高清图用
 *       ② `<name>-<480|800|1200>-<hash8>.<avif|webp>`  封面卡片 srcset
 *       ③ lib/image-variants.ts（页面引用的清单）
 *
 * 只做一次，不参与线上构建：CI 直接使用已生成的产物文件。
 *
 * 为什么母版要单独存一份：原图（ComfyUI 直出的 3864×2176 PNG）单张 10MB 左右，
 * 四张共 42MB，全尺寸 WebP lossless 也要 27MB——入库存不起。缩到 2400px 宽后
 * 降到每张 2.7~3.2MB（四张共约 11.7MB），而 2400 宽已经超过绝大多数显示场景
 * （灯箱 max-w-92vw，4K 屏才刚好铺满），缩采样看不出来。
 * 卡片变体从母版而不是原图缩放，避免「有损之上再有损」。
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/images");
const WIDTHS = [480, 800, 1200];
const AVIF_Q = 50;
const WEBP_Q = 78;
const FULL_W = 2400;
// 探测顺序：换了新母版就把对应扩展名放前面，或用原文件名改这里
const NAMES = ["yuntu", "tick", "pixelboard", "solar"];

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("缺少 sharp：请先执行 npm i -D sharp");
  process.exit(1);
}

async function findMaster(name) {
  // 优先用已生成的 full 无损图当母版：重跑脚本时不再需要保留原始 PNG
  for (const f of await readdir(SRC)) {
    if (f.startsWith(`${name}-full-`) && f.endsWith(".webp")) {
      const buf = await readFile(path.join(SRC, f));
      if (buf.length) return { path: path.join(SRC, f), buf };
    }
  }
  // 换了新原图时：把原图放进 public/images/ 就行
  for (const ext of [".png", ".webp", ".jpg"]) {
    try {
      const p = path.join(SRC, name + ext);
      const buf = await readFile(p);
      if (buf.length) return { path: p, buf };
    } catch {
      /* 不存在就试下一个扩展名 */
    }
  }
  throw new Error(`找不到 ${name} 的母版（试过 -full-*.webp、.png/.webp/.jpg）`);
}

const out = [];

for (const name of NAMES) {
  const master = await findMaster(name);

  // 母版：等比缩到 FULL_W，WebP lossless（灯箱原图，不做有损压缩）
  const full = await sharp(master.buf).resize({ width: FULL_W }).webp({ lossless: true }).toBuffer();
  const fullHash = createHash("sha256").update(full).digest("hex").slice(0, 8);
  const fullFile = `${name}-full-${fullHash}.webp`;
  await writeFile(path.join(SRC, fullFile), full);
  const fullMeta = await sharp(full).metadata();
  console.log(`${fullFile}  ${(full.length / 1024 / 1024).toFixed(2)}MB  (${fullMeta.width}x${fullMeta.height})`);

  const entry = { name, width: fullMeta.width, height: fullMeta.height, avif: [], webp: [], fullFile };

  // 封面变体从母版缩放，不在有损结果上二次压缩
  for (const w of WIDTHS) {
    for (const [fmt, q] of [["avif", AVIF_Q], ["webp", WEBP_Q]]) {
      const data = await sharp(full).resize({ width: w }).toFormat(fmt, { quality: q }).toBuffer();
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
lines.push("// 每项提供 AVIF / WebP 两组 srcset、一张小的 <img> 回退图，以及一张无损原图 full");
lines.push(`// （灯箱查看高清原图用，宽度 ${FULL_W}px，WebP lossless，不做有损压缩）。`);
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
  // <img> 回退只用 480 宽那一档：真退到这里的浏览器很少，没必要让它下 3MB 原图
  const fb = e.webp[0];
  lines.push(`    fallback: "${fb.path}",`);
  lines.push(`    full: "/images/${e.fullFile}",`);
  lines.push("  },");
}
lines.push("] as const;");
lines.push("");
lines.push("export const IMAGE_SIZES =");
lines.push('  "(max-width: 639px) calc(100vw - 3rem), calc((100vw - 4rem) / 2)";');

await writeFile(path.join(ROOT, "lib/image-variants.ts"), lines.join("\n"));
console.log("\n写出 lib/image-variants.ts");
