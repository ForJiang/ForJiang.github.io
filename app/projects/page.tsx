"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OriginButton from "@/components/ui/origin-button";
import ProjectCarousel from "@/components/ui/project-carousel";
import RevealText from "@/components/ui/reveal-text";
import SiteShell from "@/components/site-shell";
import { LanguageProvider, useLanguage } from "@/components/language-context";
import { SECTION_BADGE, TEXT_SHADOW, BODY_SHADOW, GLASS_CARD, GLASS_TAG, SECTION_SHELL, trackSpotlight } from "@/lib/ui-kit";

/**
 * 实战项目页（独立页面）。原本是 #skills 区块下半部分，用户要求它与技术栈
 * 各占一页，整体迁到这里；无限轮播的实现见 project-carousel.tsx 顶部注释。
 */
function ProjectsSection() {
  const { t } = useLanguage();
  const projects = t.skills.projects;

  return (
    <section id="projects-page" className={SECTION_SHELL}>
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
                {projects.badge}
              </RevealText>
            </Badge>
          </m.div>
          <RevealText
            as="h2"
            delay={0.15}
            stagger={0.03}
            duration={0.65}
            className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}
          >
            {projects.heading}
          </RevealText>
          <RevealText
            as="p"
            delay={0.35}
            stagger={0.01}
            duration={0.5}
            blur={6}
            className={`mt-3 text-white/75 ${BODY_SHADOW}`}
          >
            {projects.subtitle}
          </RevealText>
        </div>

        {/* 真无限轮播：transform 驱动的轨道组件，触屏甩动没有物理边界
            （原理与交互模型见 components/ui/project-carousel.tsx 顶部
            注释）。卡片宽 min(30rem, 85vw) + shrink-0，居中吸附。 */}
        <ProjectCarousel
          count={projects.items.length}
          prevLabel={projects.prevProject}
          nextLabel={projects.nextProject}
        >
          {[0, 1, 2, 3, 4]
            .flatMap((copy) =>
              projects.items.map((proj, idx) => ({ copy, proj, idx }))
            )
            .map(({ copy, proj, idx }) => (
              <m.div
                // key 必须跨语言稳定：用项目名会让 React 在切换语言时把卡片
                // 连同里面的 RevealText 一起卸载重挂载，揭示动画重新从隐藏
                // 态播一遍。repo 地址两种语言一致且互不重复；copy 前缀区分
                // 五份克隆——同一张卡的五份各自持有独立的揭示状态
                key={`${copy}-${proj.repo}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="w-[min(30rem,85vw)] shrink-0"
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
                          {projects.demoCta}
                        </RevealText>
                      </OriginButton>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            ))}
        </ProjectCarousel>

        {/* 技术栈已拆为独立页面：这里放一个入口，项目与技能互相引用 */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          >
            <RevealText as="span" stagger={0.02} duration={0.45} blur={5}>
              {t.skills.projects.skillsCta}
            </RevealText>
          </Link>
        </m.div>
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <LanguageProvider>
      <SiteShell>
        <ProjectsSection />
      </SiteShell>
    </LanguageProvider>
  );
}
