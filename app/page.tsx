"use client";

import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import LiquidMetalBackground from "@/components/liquid-metal-background";
import MouseTrail from "@/components/mouse-trail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Github, Mail, ExternalLink, Menu } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "关于", id: "about" },
  { label: "技能", id: "skills" },
  { label: "项目", id: "projects" },
  { label: "联系", id: "contact" },
];

const SKILLS = [
  {
    title: "🧭 前端开发",
    tags: ["HTML5 / CSS3", "JavaScript", "TypeScript", "Vue 3", "React", "小程序", "响应式设计"],
  },
  {
    title: "⚙️ 后端与数据",
    tags: ["Node.js", "Python", "MySQL", "PostgreSQL", "Redis", "RESTful API", "GraphQL"],
  },
  {
    title: "🛠️ 工具与其他",
    tags: ["Git", "Docker", "Nginx", "Linux", "Figma", "性能优化", "单元测试"],
  },
];

const PROJECTS = [
  {
    title: "云途 · 旅行规划平台",
    desc: "一站式旅行规划与同伴协作 SaaS。",
    tags: ["Vue 3", "Node.js", "PostgreSQL"],
    cover: "/images/yuntu.jpg",
  },
  {
    title: "清单 Tick · 待办应用",
    desc: "本地优先的极简待办,离线可用。",
    tags: ["React", "TypeScript", "IndexedDB"],
    cover: "/images/tick.jpg",
  },
  {
    title: "PixelBoard · 协作白板",
    desc: "多人实时协作白板。",
    tags: ["Canvas", "WebSocket", "Redis"],
    cover: "/images/pixelboard.jpg",
  },
  {
    title: "节气志 · 传统文化站点",
    desc: "二十四节气与传统文化小站。",
    tags: ["Astro", "Markdown", "SSG"],
    cover: "/images/solar.jpg",
  },
];

const CONTACTS = {
  email: "jianghaoda.1@outlook.com",
  github: "https://github.com/ForJiang",
  bilibili: "https://b23.tv/edD6tm9",
};

const SECTION_BADGE = "bg-white/10 text-white border-white/25";
const TEXT_SHADOW = "[text-shadow:0_2px_12px_rgba(0,0,0,0.5)]";
const BODY_SHADOW = "[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]";
const GLASS_CARD = "border-white/15 bg-black/40 backdrop-blur-sm";
const GLASS_TAG = "bg-white/10 text-white/85 border-transparent";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="relative min-h-screen text-white">
      {/* 全站液态金属固定背景 */}
      <LiquidMetalBackground />

      {/* 蔚蓝档案风格的鼠标流光轨迹 */}
      <MouseTrail />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold tracking-tight">
              ForJiang<span className="text-white/60">.</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-sm font-medium text-white/75 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur-md"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-sm font-medium text-white/75 hover:text-white transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <LiquidMetalHero
        badge="👋 你好,我是"
        title="ForJiang"
        subtitle="web coding..."
        primaryCtaLabel="查看我的项目 →"
        secondaryCtaLabel="联系我"
        onPrimaryCtaClick={() => scrollTo("projects")}
        onSecondaryCtaClick={() => scrollTo("contact")}
      />

      {/* About Section */}
      <section id="about" className="bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`max-w-3xl mx-auto text-center space-y-6 rounded-3xl px-6 py-10 md:px-12 ${GLASS_CARD}`}
          >
            <Badge variant="secondary" className={`mb-4 ${SECTION_BADGE}`}>关于我</Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>
              一个喜欢把想法变成产品的开发者
            </h2>
            <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
              你好！我是 <strong className="text-white">ForJiang</strong>，一名高中生，也是一个热爱编程的学习者。从第一次写下
              <strong className="text-white"> Hello, World</strong> 开始，我就迷上了用代码把想法变成现实的过程。
            </p>
            <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
              过去几年，我一直在学习编程，尝试过<strong className="text-white">前端、后端和一些小项目</strong>，也在不断摸索如何把课堂之外的想法做成真正能运行的东西。
              我尤其享受打磨交互细节、优化性能，以及把复杂问题拆解成简单方案时的成就感。虽然现在还在学习阶段，但我很期待未来能做出更多有意思的作品。
            </p>
            <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
              不写代码的时候，我喜欢摄影、跑步，以及在技术社区分享自己的学习笔记。如果你有有趣的想法，或者愿意一起交流编程，欢迎随时找我聊聊！
            </p>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className={`mb-4 ${SECTION_BADGE}`}>技术栈</Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>我的技术能力</h2>
            <p className={`mt-3 text-white/75 ${BODY_SHADOW}`}>常用的工具与技术,持续学习中</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKILLS.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow ${GLASS_CARD}`}>
                  <CardHeader>
                    <CardTitle className="text-white">{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className={GLASS_TAG}>{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className={`mb-4 ${SECTION_BADGE}`}>精选项目</Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>一些我做过并喜欢的作品</h2>
            <p className={`mt-3 text-white/75 ${BODY_SHADOW}`}>一些作品与实验,持续更新中</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className={`group h-full flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all ${GLASS_CARD}`}>
                  {/* 封面图放在 public/images/ 下，替换同名文件即可 */}
                  <div className="relative h-52 overflow-hidden shrink-0">
                    <img
                      src={project.cover}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <p className={`text-white/75 flex-1 ${BODY_SHADOW}`}>{project.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className={GLASS_TAG}>{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-black/35 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className={`mb-4 ${SECTION_BADGE}`}>联系我</Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>
              无论是项目合作、技术交流,还是单纯打个招呼,都欢迎!
            </h2>
            <p className={`text-lg text-white/80 ${BODY_SHADOW}`}>
              有想法?最快的方式是直接给我写邮件 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="gap-2 bg-white text-zinc-950 hover:bg-white/90"
                onClick={() => window.location.href = `mailto:${CONTACTS.email}`}
              >
                <Mail className="h-4 w-4" />
                发送邮件
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-white/40 bg-black/40 text-white hover:bg-black/60 hover:text-white hover:border-white/60"
                onClick={() => window.open(CONTACTS.github, "_blank")}
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-white/40 bg-black/40 text-white hover:bg-black/60 hover:text-white hover:border-white/60"
                onClick={() => window.open(CONTACTS.bilibili, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                哔哩哔哩
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} ForJiang
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.github, "_blank")}>
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(CONTACTS.bilibili, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.location.href = `mailto:${CONTACTS.email}`}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}
