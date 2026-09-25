/** 标签页主图标：32×32 圆角 PNG，内联成 data URI。
 *
 *  浏览器把 favicon 按「页面 URL」缓存在自己的图标数据库里，只把引用换成新的
 *  文件路径往往不足以让已经打开着的标签页重取；内联之后图标跟着 HTML 一起到达，
 *  不存在可被缓存的单独请求。128×128 的文件版本仍保留在后面作高分屏降级。
 *
 *  apple-touch-icon 不走这里：iOS 会自己给图标套圆角 mask，预先裁圆的源图会被
 *  二次裁切，透明角还会透出桌面壁纸，所以它必须是直角且整幅不透明（见 favicon.jpg）。
 *
 *  重新生成：用 Chrome canvas 读 public/favicon.jpg，套 roundRect 的
 *  destination-in 圆角遮罩后 toDataURL('image/png')。
 */
export const INLINE_ICON_32 =
  "data:image/png;base64,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";
