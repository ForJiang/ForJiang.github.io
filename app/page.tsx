"use client";

import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import MouseTrail from "@/components/mouse-trail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Github, Mail, ExternalLink, Menu, Languages } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { translations, type Lang } from "@/lib/i18n";
import { PROJECT_IMAGES, IMAGE_SIZES } from "@/lib/image-variants";
import { PixivIcon, XIcon, BilibiliIcon } from "@/components/brand-icons";
import Lightbox, { type LightboxItem } from "@/components/lightbox";
import OriginButton from "@/components/ui/origin-button";
import RevealText from "@/components/ui/reveal-text";

/*
 * 液态金属背景异步加载：@paper-design/shaders-react 体积大且纯装饰，
 * 拆出首屏关键路径后文字先出图，shader 随后补上（body 已是纯黑，无闪屏）。
 */
const LiquidMetalBackground = dynamic(
  () => import("@/components/liquid-metal-background")
);

const NAV_IDS = ["about", "skills", "projects", "contact"] as const;

const PROJECT_META = [
  {
    image: "yuntu",
    tags: ["AI Art", "Illustration", "ComfyUI"],
  },
  {
    image: "tick",
    tags: ["AI Art", "Illustration", "ComfyUI"],
  },
  {
    image: "pixelboard",
    tags: ["AI Art", "Illustration", "ComfyUI"],
  },
  {
    image: "solar",
    tags: ["AI Art", "Illustration", "ComfyUI"],
  },
];

const CONTACTS = {
  email: "jianghaoda.1@outlook.com",
  github: "https://github.com/ForJiang",
  bilibili: "https://b23.tv/edD6tm9",
  pixiv: "https://www.pixiv.net/users/101240081",
  // x.com/jianghaoda3?s=11 的 ?s=11 是分享链接参数，指向同一账号，这里用干净地址
  x: "https://x.com/jianghaoda3",
};

const SECTION_BADGE = "bg-white/10 text-white border-white/25";
const TEXT_SHADOW = "[text-shadow:0_2px_12px_rgba(0,0,0,0.5)]";
const BODY_SHADOW = "[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]";
const GLASS_CARD = "border-white/15 bg-black/40 backdrop-blur-sm";
const GLASS_TAG = "bg-white/10 text-white/85 border-transparent";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  // 默认英文，且服务端也渲染英文（见 layout 的 <html lang="en">）。两边必须
  // 一致，否则首帧服务端中文、客户端英文会触发 React 注水失败——曾因此全站
  // 文字停在不可见状态。
  const [lang, setLang] = useState<Lang>("en");
  const [viewing, setViewing] = useState<number | null>(null);
  const t = translations[lang];

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // 灯箱看高清原图：full 是全尺寸 WebP 无损图（不做有损压缩），
  // fallback 只是给不支持 AVIF/WebP 的浏览器兜底的小图，不能拿它当原图
  const lightboxItems: LightboxItem[] = t.projects.cards.map((card, idx) => ({
    src: PROJECT_IMAGES[idx]?.full ?? "",
    title: card.title,
    desc: card.desc,
  }));

  const langButton = (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
      aria-label="Switch language / 切换语言"
    >
      <Languages className="h-4 w-4" />
      {t.langToggle}
    </button>
  );

  return (
    /*
     * LazyMotion + domAnimation：只打包进 fade/scale/variant/whileInView/exit 等
     * 本站用到的动画特性，去掉 framer-motion 里没用到的 drag 与 layout 投影
     * （约 22KB，Lighthouse 记为未使用 JS）。
     */
    <LazyMotion features={domAnimation}>
    <main className="relative min-h-screen text-white">
      {/* 全站液态金属固定背景 */}
      <LiquidMetalBackground />

      {/* 蔚蓝档案风格的鼠标流光轨迹 */}
      <MouseTrail />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* 导航与页脚不做逐字入场：它们是常驻框架，每字错峰反而显得碎；
                且 RevealText 的 w-full 容器会把 button 的固有宽度算错，中文
                逐字后必然换行成竖排 */}
            <div className="text-xl font-bold tracking-tight">
              ForJiang<span className="text-white/60">.</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-white/75 hover:text-white transition-colors"
                >
                  {t.nav[id]}
                </button>
              ))}
              {langButton}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              {langButton}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                aria-label={t.nav.menu}
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur-md"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {NAV_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left text-sm font-medium text-white/75 hover:text-white transition-colors py-2"
                >
                  {t.nav[id]}
                </button>
              ))}
            </div>
          </m.div>
        )}
      </nav>

      {/* Hero Section */}
      <LiquidMetalHero
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        primaryCtaLabel={t.hero.primaryCta}
        secondaryCtaLabel={t.hero.secondaryCta}
        onPrimaryCtaClick={() => scrollTo("projects")}
        onSecondaryCtaClick={() => scrollTo("contact")}
      />

      {/* About Section */}
      <section id="about" className="min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`max-w-4xl mx-auto text-center space-y-6 rounded-3xl px-6 py-10 md:px-12 ${GLASS_CARD}`}
          >
            <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
              <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                {t.about.badge}
              </RevealText>
            </Badge>
            {/* 面板是整体淡入，逐字揭示排在其后，避免两层位移动画叠加 */}
            <RevealText
              as="h2"
              delay={0.45}
              stagger={0.03}
              duration={0.65}
              className={`mx-auto max-w-2xl text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}
            >
              {t.about.heading}
            </RevealText>
            {t.about.paragraphs.map((paragraph, idx) => (
              <RevealText
                key={idx}
                as="p"
                delay={0.7 + idx * 0.12}
                stagger={0.01}
                duration={0.5}
                blur={6}
                className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}
              >
                {paragraph}
              </RevealText>
            ))}
          </m.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
                <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                  {t.skills.badge}
                </RevealText>
              </Badge>
            </m.div>
            {/* 逐字揭示，与徽章/副标题串成出场顺序 */}
            <RevealText
              as="h2"
              delay={0.15}
              stagger={0.03}
              duration={0.65}
              className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}
            >
              {t.skills.heading}
            </RevealText>
            <RevealText
              as="p"
              delay={0.4}
              stagger={0.01}
              duration={0.5}
              blur={6}
              className={`mt-3 text-white/75 ${BODY_SHADOW}`}
            >
              {t.skills.subtitle}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.skills.groups.map((group, idx) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow ${GLASS_CARD}`}>
                  <CardHeader>
                    <CardTitle className="text-white">
                      <RevealText as="div" stagger={0.03} duration={0.5} blur={6}>
                        {group.title}
                      </RevealText>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* 标签是组件不是纯文本，用 items 模式逐个做揭示，胶囊外观不变 */}
                    <RevealText
                      as="div"
                      items={group.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className={GLASS_TAG}>{tag}</Badge>
                      ))}
                      className="flex flex-wrap gap-2"
                      stagger={0.04}
                      duration={0.45}
                      blur={6}
                    />
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>

          {/* 实战项目：技能区下方，展示技能落在真实项目里的成果 */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
                <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                  {t.skills.projects.badge}
                </RevealText>
              </Badge>
              <RevealText
                as="h3"
                delay={0.15}
                stagger={0.03}
                duration={0.65}
                blur={10}
                className={`text-2xl md:text-3xl font-bold tracking-tight ${TEXT_SHADOW}`}
              >
                {t.skills.projects.heading}
              </RevealText>
              <RevealText
                as="p"
                delay={0.35}
                stagger={0.01}
                duration={0.5}
                blur={6}
                className={`mt-3 text-white/75 ${BODY_SHADOW}`}
              >
                {t.skills.projects.subtitle}
              </RevealText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t.skills.projects.items.map((proj, idx) => (
                <m.div
                  key={proj.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`group h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all ${GLASS_CARD}`}>
                    <CardHeader>
                      <CardTitle className="text-white">
                        <RevealText as="div" stagger={0.03} duration={0.5} blur={6}>
                          {proj.name}
                        </RevealText>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <RevealText
                        as="p"
                        stagger={0.01}
                        duration={0.5}
                        blur={6}
                        className={`text-white/75 flex-1 ${BODY_SHADOW}`}
                      >
                        {proj.desc}
                      </RevealText>
                      <RevealText
                        as="div"
                        items={proj.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className={GLASS_TAG}>{tag}</Badge>
                        ))}
                        className="flex flex-wrap gap-2"
                        stagger={0.04}
                        duration={0.45}
                        blur={6}
                      />
                      <div className="flex flex-wrap gap-3 pt-1">
                        {/* 传 href 即渲染真实 <a>：可中键/右键新标签、可被爬取 */}
                        <OriginButton
                          tone="glass"
                          href={proj.repo}
                          className="h-9 px-3 text-xs"
                        >
                          <Github className="h-4 w-4" />
                          <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                            GitHub
                          </RevealText>
                        </OriginButton>
                        <OriginButton
                          tone="glass"
                          href={proj.demo}
                          className="h-9 px-3 text-xs"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                            {t.skills.projects.demoCta}
                          </RevealText>
                        </OriginButton>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
                <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                  {t.projects.badge}
                </RevealText>
              </Badge>
            </m.div>
            {/* 逐字揭示，与徽章/副标题串成出场顺序 */}
            <RevealText
              as="h2"
              delay={0.15}
              stagger={0.03}
              duration={0.65}
              className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}
            >
              {t.projects.heading}
            </RevealText>
            <RevealText
              as="p"
              delay={0.4}
              stagger={0.01}
              duration={0.5}
              blur={6}
              className={`mt-3 text-white/75 ${BODY_SHADOW}`}
            >
              {t.projects.subtitle}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {t.projects.cards.map((card, idx) => {
              const meta = PROJECT_META[idx];
              const img = PROJECT_IMAGES.find((i) => i.name === meta.image);
              return (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className={`group h-full flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all ${GLASS_CARD}`}>
                    {/* 封面图：AVIF → WebP → JPEG 逐级回退，按视口宽度取合适档位 */}
                    <div className="relative h-52 overflow-hidden shrink-0">
                      {img && (
                      <picture>
                        {img.avif && (
                          <source
                            type="image/avif"
                            srcSet={img.avif.map((v) => `${v.path} ${v.w}w`).join(", ")}
                            sizes={IMAGE_SIZES}
                          />
                        )}
                        {img.webp && (
                          <source
                            type="image/webp"
                            srcSet={img.webp.map((v) => `${v.path} ${v.w}w`).join(", ")}
                            sizes={IMAGE_SIZES}
                          />
                        )}
                        <img
                          src={img.fallback}
                          alt={card.title}
                          width={img.width}
                          height={img.height}
                          loading="lazy"
                          decoding="async"
                          onClick={() => setViewing(idx)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${card.title} — 查看高清原图`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setViewing(idx);
                            }
                          }}
                          className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </picture>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">
                        <RevealText as="div" stagger={0.03} duration={0.5} blur={6}>
                          {card.title}
                        </RevealText>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <RevealText
                        as="p"
                        stagger={0.01}
                        duration={0.5}
                        blur={6}
                        className={`text-white/75 flex-1 ${BODY_SHADOW}`}
                      >
                        {card.desc}
                      </RevealText>
                      <RevealText
                        as="div"
                        items={meta.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className={GLASS_TAG}>{tag}</Badge>
                        ))}
                        className="flex flex-wrap gap-2"
                        stagger={0.04}
                        duration={0.45}
                        blur={6}
                      />
                    </CardContent>
                  </Card>
                </m.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
              <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                {t.contact.badge}
              </RevealText>
            </Badge>
            <RevealText
              as="h2"
              delay={0.45}
              stagger={0.03}
              duration={0.65}
              className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}
            >
              {t.contact.heading}
            </RevealText>
            <RevealText
              as="p"
              delay={0.65}
              stagger={0.01}
              duration={0.5}
              blur={6}
              className={`text-lg text-white/80 ${BODY_SHADOW}`}
            >
              {t.contact.subtitle}
            </RevealText>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
              <OriginButton
                tone="solid"
                onClick={() => window.location.href = `mailto:${CONTACTS.email}`}
              >
                <Mail className="h-4 w-4" />
                <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                  {t.contact.emailCta}
                </RevealText>
              </OriginButton>
              <OriginButton
                tone="glass"
                onClick={() => window.open(CONTACTS.github, "_blank")}
              >
                <Github className="h-4 w-4" />
                <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                  GitHub
                </RevealText>
              </OriginButton>
              <OriginButton
                tone="glass"
                onClick={() => window.open(CONTACTS.bilibili, "_blank")}
              >
                <BilibiliIcon className="h-4 w-4" />
                <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                  {t.contact.bilibiliCta}
                </RevealText>
              </OriginButton>
              <OriginButton
                tone="glass"
                onClick={() => window.open(CONTACTS.pixiv, "_blank")}
              >
                <PixivIcon className="h-4 w-4" />
                <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                  Pixiv
                </RevealText>
              </OriginButton>
              <OriginButton
                tone="glass"
                onClick={() => window.open(CONTACTS.x, "_blank")}
              >
                <XIcon className="h-4 w-4" />
                <RevealText as="span" stagger={0.03} duration={0.45} blur={5}>
                  X
                </RevealText>
              </OriginButton>
            </div>
          </m.div>
        </div>
      </section>

      {/* 全屏原图查看器 */}
      <AnimatePresence>
        {viewing !== null && (
          <Lightbox
            items={lightboxItems}
            index={viewing}
            onClose={() => setViewing(null)}
            onNavigate={setViewing}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} ForJiang</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="GitHub" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.github, "_blank")}>
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="哔哩哔哩" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.bilibili, "_blank")}>
              <BilibiliIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Pixiv" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.pixiv, "_blank")}>
              <PixivIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="X" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.x, "_blank")}>
              <XIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Email" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.location.href = `mailto:${CONTACTS.email}`}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </main>
    </LazyMotion>
  );
}
