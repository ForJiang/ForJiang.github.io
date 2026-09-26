"use client";

import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import MouseTrail from "@/components/mouse-trail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Github, Mail, ExternalLink, Menu, Languages, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
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
const TEXT_SHADOW = "[text-shadow:0_2px_18px_rgba(0,0,0,0.78),0_0_8px_rgba(0,0,0,0.55)]";
const BODY_SHADOW = "[text-shadow:0_1px_12px_rgba(0,0,0,0.72),0_0_6px_rgba(0,0,0,0.45)]";
// glass-soft：globals.css 里 WebKit 的降级钩子（Safari 去掉 backdrop-filter）
const GLASS_CARD = "glass-soft border-white/15 bg-black/40 backdrop-blur-sm";
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

  // 项目卡片横向滚动：一按走一张卡（卡宽 + gap），用 scrollBy 让浏览器自己
  // 处理平滑与边界，比手算 scrollLeft 稳
  // 卡片 hover 光晕跟随指针：只写 CSS 变量，不 setState——每次 pointermove
  // 触发一次重渲染会让卡片里的逐字 span 全部重新 diff，代价不值。
  const trackSpotlight = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // 无限轮播的归位：卡片渲染三份，加载后把 scrollLeft 定位到中间那份；滚动
  // 完全停下后若滑出了中间份，就按一整份的宽度无声平移回去——三份内容完全
  // 相同，肉眼不可见，于是「最后一张之后」接着的就是第一张，两个方向都滑
  // 不到头。平移必须等滚动停稳：iOS Safari 在惯性滚动途中改 scrollLeft 会直接
  // 掐断惯性，所以用 120ms 防抖等手势/惯性结束。跳变距离恒为 setWidth 的整数
  // 倍，落在 snap 吸附点上，不会引起吸附跳动。
  const projectCount = t.skills.projects.items.length;
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const nextSet = el.children[projectCount] as HTMLElement | undefined;
    if (!first || !nextSet) return;
    const setWidth = nextSet.offsetLeft - first.offsetLeft;
    if (!setWidth) return;
    el.scrollLeft = setWidth;
    let timer = 0;
    const normalize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (el.scrollLeft >= setWidth * 2) el.scrollLeft -= setWidth;
        else if (el.scrollLeft < setWidth) el.scrollLeft += setWidth;
      }, 120);
    };
    el.addEventListener("scroll", normalize, { passive: true });
    return () => {
      el.removeEventListener("scroll", normalize);
      window.clearTimeout(timer);
    };
  }, [projectCount]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // 灯箱看高清原图：full 是全尺寸 WebP 无损图（不做有损压缩），
  // fallback 只是给不支持 AVIF/WebP 的浏览器兜底的小图，不能拿它当原图。
  // thumb 用最大一档封面变体（1200w）：与卡片封面同源，打开灯箱时已在
  // 浏览器缓存里，立即上屏，原图下载完毕后在其上淡入
  const lightboxItems: LightboxItem[] = t.projects.cards.map((card, idx) => {
    const img = PROJECT_IMAGES[idx];
    return {
      src: img?.full ?? "",
      thumb: (img && img.webp[img.webp.length - 1]?.path) || img?.fallback || "",
      title: card.title,
      desc: card.desc,
    };
  });

  // 无损原图每张 ~3MB，点开才开始下载要白等数秒。两个预热入口：
  // ① 画廊（#projects）进入视口后按顺序预热全部原图——用户浏览插画的
  //    那几秒里下载大多已完成，点开即是秒开；② 桌面端鼠标悬停某张卡时
  //    立即预热那一张。省流量模式（Save-Data）不预热。
  const prefetchDoneRef = useRef<Set<string>>(new Set());
  const prefetchFull = useCallback((idx: number) => {
    const img = PROJECT_IMAGES[idx];
    if (!img || prefetchDoneRef.current.has(img.full)) return;
    prefetchDoneRef.current.add(img.full);
    const im = new Image();
    im.src = img.full;
  }, []);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (conn?.saveData) return;
    const section = document.getElementById("projects");
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        PROJECT_IMAGES.forEach((_, i) => {
          window.setTimeout(() => prefetchFull(i), i * 2500);
        });
      },
      { threshold: 0.15 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [prefetchFull]);

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
                <Card
                  className={`group relative h-full overflow-hidden transition-shadow hover:border-white/30 hover:shadow-lg ${GLASS_CARD}`}
                  onPointerMove={trackSpotlight}
                >
                  <span
                    aria-hidden="true"
                    className="spotlight pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-white">
                      <RevealText as="div" stagger={0.03} duration={0.5} blur={6}>
                        {group.title}
                      </RevealText>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
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
            className="mt-16"
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

            {/*
              项目卡片做成横向滑动的无限轮播：容器 overflow-x-auto + snap-mandatory，
              内容渲染三份（见下面 useEffect 的归位逻辑），中间份是常驻视区，
              左右两份是回路缓冲——滑到最后一张之后接着的还是第一张，两个方向
              都滑不到头。卡片宽 min(30rem, 85vw) + shrink-0，末尾一张露出的一角
              与左右箭头按钮共同承担可滑的提示。py-4 不能省：overflow-x:auto 会把
              overflow-y 隐式提成 auto，而卡片 hover 要上浮 4px，没有纵向内边距时
              那 4px 会溢出 padding box 被裁掉——表现为卡片上边缘少一截。
            */}
            <div
              ref={scrollerRef}
              tabIndex={0}
              className="-mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {[0, 1, 2]
                .flatMap((copy) =>
                  t.skills.projects.items.map((proj, idx) => ({ copy, proj, idx }))
                )
                .map(({ copy, proj, idx }) => (
                  <m.div
                    // key 必须跨语言稳定：用项目名会让 React 在切换语言时把卡片
                    // 连同里面的 RevealText 一起卸载重挂载，揭示动画重新从隐藏
                    // 态播一遍。repo 地址两种语言一致且互不重复；copy 前缀区分
                    // 三份克隆——同一张卡的三份各自持有独立的揭示状态
                    key={`${copy}-${proj.repo}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-[min(30rem,85vw)] shrink-0 snap-start"
                  >
                  <Card
                    className={`group relative h-full flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${GLASS_CARD}`}
                    onPointerMove={trackSpotlight}
                  >
                    <span
                      aria-hidden="true"
                      className="spotlight pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-white">
                        <RevealText as="div" stagger={0.03} duration={0.5} blur={6}>
                          {proj.name}
                        </RevealText>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-1 flex flex-col gap-4">
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

            {/* 桌面没有触摸屏，露角不足以提示可滑，把切换按钮放在卡片下方 */}
            <div className="mt-6 flex justify-center gap-3">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => scrollByCard(dir)}
                  aria-label={dir === -1 ? t.skills.projects.prevProject : t.skills.projects.nextProject}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className={dir === -1 ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
                </button>
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
                  onMouseEnter={() => prefetchFull(idx)}
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
      {/* 页脚是唯一没有 bg-black 蒙层的区块，液态金属的镜面高光扫过时
          版权文字（text-white/75）会被完全淹没——实测背景峰值 193 高于文字
          本身亮度。加一层暗底 + 轻模糊把它压住。 */}
      <footer className="bg-black/45 py-8 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">© {new Date().getFullYear()} ForJiang</p>
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
