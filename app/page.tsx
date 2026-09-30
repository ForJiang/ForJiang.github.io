"use client";

import { useRouter } from "next/navigation";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { m, AnimatePresence } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PROJECT_IMAGES, IMAGE_SIZES } from "@/lib/image-variants";
import { PixivIcon, XIcon, BilibiliIcon } from "@/components/brand-icons";
import type { LightboxItem } from "@/components/lightbox";
import OriginButton from "@/components/ui/origin-button";
import RevealText from "@/components/ui/reveal-text";
import SiteShell from "@/components/site-shell";
import { LanguageProvider, useLanguage } from "@/components/language-context";
import { SECTION_BADGE, TEXT_SHADOW, BODY_SHADOW, GLASS_CARD, GLASS_TAG, trackSpotlight } from "@/lib/ui-kit";
import dynamic from "next/dynamic";

/*
 * 灯箱只在点开图片时才出现，按需加载：其代码（双图淡入、滑动翻页、预载
 * 逻辑）不参与首屏。为避免点击后多等一个 chunk，画廊（#projects）进入
 * 视口时就顺手预载——那时用户还在看封面，点开时模块早已就绪。
 * 类型仍从原模块引入，仅运行期加载被延后。
 */
const Lightbox = dynamic(() => import("@/components/lightbox"));

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

/**
 * 首页：Hero / 关于我 / 插画作品 / 视频演示 / 联系方式 / 页脚。
 * 技术栈与实战项目已拆成独立页面（/skills、/projects，用户要求两块各占
 * 一页），导航见 components/site-nav.tsx。
 */
export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [viewing, setViewing] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
        // 灯箱代码按需加载（见顶部 dynamic 导入）：这里先把 chunk 拉下来，
        // 用户点开图片时不必再等一次网络往返。与动态 import 走同一模块图，
        // webpack 会复用已下载的实例，不会重复请求。
        void import("@/components/lightbox");
        PROJECT_IMAGES.forEach((_, i) => {
          window.setTimeout(() => prefetchFull(i), i * 2500);
        });
      },
      { threshold: 0.15 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [prefetchFull]);

  return (
    <SiteShell>
      {/* Hero Section */}
      <LiquidMetalHero
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        primaryCtaLabel={t.hero.primaryCta}
        secondaryCtaLabel={t.hero.secondaryCta}
        onPrimaryCtaClick={() => router.push("/projects")}
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
                    {/* 封面图：AVIF → WebP → JPEG 逐级回退，按视口宽度取合适档位。
                        flex-1 + min-h：图片吃掉卡片里文字之外的剩余高度（行内各卡
                        等高拉伸时同步放大），18rem 是下限——插画是宽幅的，容器越高
                        object-cover 裁掉的越少，预览越完整；原来固定 h-52 且文字区
                        也吃 flex-1，图片只占六成左右 */}
                    <div className="relative min-h-[18rem] flex-1 overflow-hidden shrink-0">
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
                    {/* 不带 flex-1：文字区按内容自然高度，剩余空间全给封面图 */}
                    <CardContent className="flex flex-col gap-4">
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

      {/* Videos Section */}
      <section id="videos" className="min-h-screen flex flex-col justify-center bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <Badge variant="secondary" className={`inline-flex py-2 mb-4 ${SECTION_BADGE}`}>
                <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                  {t.videos.badge}
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
              {t.videos.heading}
            </RevealText>
            <RevealText
              as="p"
              delay={0.4}
              stagger={0.01}
              duration={0.5}
              blur={6}
              className={`mt-3 text-white/75 ${BODY_SHADOW}`}
            >
              {t.videos.subtitle}
            </RevealText>
          </div>
        </div>

        {/* 播放器单独用更宽的容器：视频画面越大越好，而标题/副标题保持适宽
            才可读（长行文字拉太宽会难以阅读），两者分开约束。
            这里不用 container 类：它自带 xl 断点 1280px 的上限，会把播放器
            提前截小；改用 w-full + 内层 1440px 上限，宽屏上才是真的满幅。 */}
        <div className="mx-auto w-full px-6 lg:px-8">
          {/* B 站外链播放器：协议相对地址继承当前协议，http/https 站点都不触发
              混合内容拦截；loading="lazy" 让播放器滚入视野后才联网加载，
              不占用首屏带宽。外层 aspect-video 兜住 16:9 比例，内层绝对定位铺满。
              1440px 上限：常见 1440/1512 宽笔记本上接近满幅，同时 16:9 的
              高度（≈810px）不超出屏幕太多，翻开就能看。 */}
          <div className="relative mx-auto w-full max-w-[1440px] aspect-video rounded-lg overflow-hidden border border-white/15 shadow-2xl bg-black">
            <iframe
              src="//player.bilibili.com/player.html?isOutside=true&aid=117346962312416&bvid=BV1F9ai6REo8&cid=42340451929&p=1"
              scrolling="no"
              frameBorder={0}
              allowFullScreen
              loading="lazy"
              title={t.videos.heading}
              className="absolute inset-0 h-full w-full"
            />
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
    </SiteShell>
  );
}
