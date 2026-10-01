/** 标签页主图标：32×32 圆角 PNG，内联成 data URI。
 *
 *  浏览器把 favicon 按「页面 URL」缓存在自己的图标数据库里，只把引用换成新的
 *  文件路径往往不足以让已经打开着的标签页重取；内联之后图标跟着 HTML 一起到达，
 *  不存在可被缓存的单独请求。128×128 的文件版本仍保留在后面作高分屏降级。
 *
 *  apple-touch-icon 不走这里：iOS 会自己给图标套圆角 mask，预先裁圆的源图会被
 *  二次裁切，透明角还会透出桌面壁纸，所以它必须是直角且整幅不透明（见
 *  favicon-<hash8>.jpg，文件名带内容哈希的原因见 app/layout.tsx 的注释）。
 *
 *  源图是 assets/favicon-master.png（832×832，不进 public/——运行时没人取它，只作生成源）。重新生成用 sharp 一次出
 *  三档：256 直角 JPEG（apple-touch）、128 圆角 PNG（高分屏降级）、32 圆角 PNG
 *  内联在下面。圆角遮罩是 SVG rect rx=边长 20%（iOS squircle 比例）经
 *  `composite: dest-in` 贴上去的；封面那种「重跑脚本幂等」的管线在
 *  scripts/generate-images.mjs，图标档位少、直接手跑三行 sharp 即可。
 */
export const INLINE_ICON_32 =
  "data:image/png;base64,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";
