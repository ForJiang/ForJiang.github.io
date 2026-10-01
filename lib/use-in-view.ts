"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver 版「进入视口一次」钩子，替代 framer-motion 的 useInView
 * ——这是替换后全站最后一批 framer 用途之一，换掉它 framer-motion 依赖即可
 * 整个移除（首屏 JS 最大的可削减项，而全站需要的只是几个一次性淡入）。
 *
 * 语义与原调用一致：元素任何一部分进入视口即触发（threshold 0）、结果锁存
 * （滚出视口不回退，状态留在 true，后续重渲染也不再重复观察）。
 *
 * rootMargin 为什么保持 0（不缩不放）：缩进会把「已滚到页面最底」的贴底内容
 * （页脚版权文字）排除在外——用户明明看得见它，IO 却判它不相交，文字永远停在
 * 隐藏态；顶部同理，fixed 导航会被负的上边距漏掉。
 */
export function useInViewOnce<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    // 环境没有 IO（理论上只有远古浏览器）时直接显示，别让内容永远隐藏
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return { ref, inView };
}
