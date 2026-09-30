"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RevealText from "@/components/ui/reveal-text";
import SiteShell from "@/components/site-shell";
import { LanguageProvider, useLanguage } from "@/components/language-context";
import { SECTION_BADGE, TEXT_SHADOW, BODY_SHADOW, GLASS_CARD, GLASS_TAG, SECTION_SHELL, trackSpotlight } from "@/lib/ui-kit";

/**
 * 技能页（独立页面）。原本技术和实战项目同在一个 #skills 区块里，用户要求
 * 两块各占一页：技术栈留在这里，实战项目轮播移到 /projects。
 */
function SkillsSection() {
  const { t } = useLanguage();

  return (
    <section id="skills" className={SECTION_SHELL}>
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

        {/* 实战项目已拆为独立页面：这里放一个入口，技能与项目互相引用 */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          >
            <RevealText as="span" stagger={0.02} duration={0.45} blur={5}>
              {t.skills.projects.projectsCta}
            </RevealText>
          </Link>
        </m.div>
      </div>
    </section>
  );
}

export default function SkillsPage() {
  return (
    <LanguageProvider>
      <SiteShell>
        <SkillsSection />
      </SiteShell>
    </LanguageProvider>
  );
}
