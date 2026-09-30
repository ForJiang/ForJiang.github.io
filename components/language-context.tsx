"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "@/lib/i18n";

interface LanguageValue {
  lang: Lang;
  // 两种语言的字典结构相同，取并集类型（typeof translations.zh 是字面量类型，
  // 装不下 en 的文案）
  t: (typeof translations)[Lang];
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

/**
 * 全站语言状态。技能与实战项目拆成独立页面后，导航与各页正文都需要同一份
 * 语言，所以提到 context；每个页面根部分别包一层 Provider（静态导出没有
 * 跨页面保持状态的客户端根布局，各自挂载即可，localStorage 保证选择不丢）。
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // 默认英文，且服务端也渲染英文（见 layout 的 <html lang="en">）。两边必须
  // 一致，否则首帧服务端中文、客户端英文会触发 React 注水失败——曾因此全站
  // 文字停在不可见状态。
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    // 只恢复用户手动切换过的选择，不再跟随浏览器语言
    const saved = localStorage.getItem("language");
    if (saved === "en" || saved === "zh") {
      setLang(saved);
      document.documentElement.lang = saved === "zh" ? "zh-CN" : "en";
    }
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "zh" ? "en" : "zh";
    setLang(next);
    localStorage.setItem("language", next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage 必须在 LanguageProvider 内使用");
  return ctx;
}
