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
  { label: "关于", en: "About", id: "about" },
  { label: "技能", en: "Skills", id: "skills" },
  { label: "项目", en: "Projects", id: "projects" },
  { label: "联系", en: "Contact", id: "contact" },
];

const SKILLS = [
  {
    title: "🧭 前端开发",
    titleEn: "Frontend Development",
    tags: ["HTML5 / CSS3", "JavaScript", "TypeScript", "Vue 3", "React", "小程序", "响应式设计"],
  },
  {
    title: "⚙️ 后端与数据",
    titleEn: "Backend & Data",
    tags: ["Node.js", "Python", "MySQL", "PostgreSQL", "Redis", "RESTful API", "GraphQL"],
  },
  {
    title: "🛠️ 工具与其他",
    titleEn: "Tools & More",
    tags: ["Git", "Docker", "Nginx", "Linux", "Figma", "性能优化", "单元测试"],
  },
];

const PROJECTS = [
  {
    title: "云途 · 旅行规划平台",
    titleEn: "YunTu · Travel Planning Platform",
    desc: "一站式旅行规划与同伴协作 SaaS。",
    descEn: "All-in-one trip planning & companion collaboration SaaS.",
    tags: ["Vue 3", "Node.js", "PostgreSQL"],
    cover: "/images/yuntu.jpg",
  },
  {
    title: "清单 Tick · 待办应用",
    titleEn: "Tick List · Todo App",
    desc: "本地优先的极简待办,离线可用。",
    descEn: "A local-first minimalist todo that works offline.",
    tags: ["React", "TypeScript", "IndexedDB"],
    cover: "/images/tick.jpg",
  },
  {
    title: "PixelBoard · 协作白板",
    titleEn: "PixelBoard · Collaborative Whiteboard",
    desc: "多人实时协作白板。",
    descEn: "A real-time collaborative whiteboard.",
    tags: ["Canvas", "WebSocket", "Redis"],
    cover: "/images/pixelboard.jpg",
  },
  {
    title: "节气志 · 传统文化站点",
    titleEn: "Solar Terms · Traditional Culture Site",
    desc: "二十四节气与传统文化小站。",
    descEn: "A little site for the 24 solar terms and traditional culture.",
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
// 中英双语的英文行样式：小一号、降低不透明度
const EN_HEADER = `text-base md:text-lg text-white/60 ${BODY_SHADOW}`;
const EN_BODY = `text-sm md:text-base text-white/55 leading-relaxed ${BODY_SHADOW}`;
const EN_SMALL = "text-[10px] md:text-[11px] font-normal tracking-wide text-white/55";

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
                  className="group flex flex-col items-center gap-0.5"
                >
                  <span className="text-sm font-medium text-white/75 transition-colors group-hover:text-white">
                    {item.label}
                  </span>
                  <span className="text-[10px] leading-none text-white/45 transition-colors group-hover:text-white/80">
                    {item.en}
                  </span>
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
                  className="flex items-baseline gap-2 py-2 text-left text-sm font-medium text-white/75 hover:text-white transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-normal text-white/45">{item.en}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <LiquidMetalHero
        badge="👋 你好,我是"
        badgeEn="Hello, I'm"
        title="ForJiang"
        subtitle="web coding..."
        primaryCtaLabel="查看我的项目 →"
        primaryCtaEn="View My Projects →"
        secondaryCtaLabel="联系我"
        secondaryCtaEn="Contact Me"
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
            <Badge variant="secondary" className={`inline-flex flex-col items-center gap-0.5 py-2 mb-4 ${SECTION_BADGE}`}>
              <span>关于我</span>
              <span className={EN_SMALL}>About Me</span>
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>
              一个喜欢把想法变成产品的开发者
            </h2>
            <p className={EN_HEADER}>A developer who loves turning ideas into products</p>
            <div className="space-y-2">
              <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
                你好！我是 <strong className="text-white">ForJiang</strong>，一名高中生，也是一个热爱编程的学习者。从第一次写下
                <strong className="text-white"> Hello, World</strong> 开始，我就迷上了用代码把想法变成现实的过程。
              </p>
              <p className={EN_BODY}>
                Hi! I&apos;m <strong className="text-white/85">ForJiang</strong> — a high school student and a passionate programming learner. Ever since writing my first <strong className="text-white/85">Hello, World</strong>, I&apos;ve been fascinated by turning ideas into reality with code.
              </p>
            </div>
            <div className="space-y-2">
              <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
                过去几年，我一直在学习编程，尝试过<strong className="text-white">前端、后端和一些小项目</strong>，也在不断摸索如何把课堂之外的想法做成真正能运行的东西。
                我尤其享受打磨交互细节、优化性能，以及把复杂问题拆解成简单方案时的成就感。虽然现在还在学习阶段，但我很期待未来能做出更多有意思的作品。
              </p>
              <p className={EN_BODY}>
                Over the past few years I&apos;ve been learning programming — trying out frontend, backend and some small projects, and exploring how to turn ideas beyond the classroom into things that actually run. I especially enjoy polishing interaction details, optimizing performance, and the satisfaction of breaking complex problems into simple ones. I&apos;m still learning, but I can&apos;t wait to build more interesting things.
              </p>
            </div>
            <div className="space-y-2">
              <p className={`text-lg text-white/80 leading-relaxed ${BODY_SHADOW}`}>
                不写代码的时候，我喜欢摄影、跑步，以及在技术社区分享自己的学习笔记。如果你有有趣的想法，或者愿意一起交流编程，欢迎随时找我聊聊！
              </p>
              <p className={EN_BODY}>
                When I&apos;m not coding, I enjoy photography, running, and sharing my study notes with the tech community. If you have an interesting idea — or just want to talk code — feel free to reach out!
              </p>
            </div>
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
            <Badge variant="secondary" className={`inline-flex flex-col items-center gap-0.5 py-2 mb-4 ${SECTION_BADGE}`}>
              <span>技术栈</span>
              <span className={EN_SMALL}>Tech Stack</span>
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>我的技术能力</h2>
            <p className={`mt-2 ${EN_HEADER}`}>My Skills</p>
            <p className={`mt-3 text-white/75 ${BODY_SHADOW}`}>常用的工具与技术,持续学习中</p>
            <p className={`mt-1 ${EN_BODY}`}>Tools and technologies I use, always learning</p>
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
                    <p className={`text-xs font-normal ${EN_SMALL}`}>{skill.titleEn}</p>
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
            <Badge variant="secondary" className={`inline-flex flex-col items-center gap-0.5 py-2 mb-4 ${SECTION_BADGE}`}>
              <span>精选项目</span>
              <span className={EN_SMALL}>Projects</span>
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>一些我做过并喜欢的作品</h2>
            <p className={`mt-2 ${EN_HEADER}`}>Works I&apos;ve made and loved</p>
            <p className={`mt-3 text-white/75 ${BODY_SHADOW}`}>一些作品与实验,持续更新中</p>
            <p className={`mt-1 ${EN_BODY}`}>Projects and experiments, more coming soon</p>
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
                    <p className={`text-xs font-normal ${EN_SMALL}`}>{project.titleEn}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 space-y-1">
                      <p className={`text-white/75 ${BODY_SHADOW}`}>{project.desc}</p>
                      <p className={`text-sm text-white/55 ${BODY_SHADOW}`}>{project.descEn}</p>
                    </div>
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
            <Badge variant="secondary" className={`inline-flex flex-col items-center gap-0.5 py-2 mb-4 ${SECTION_BADGE}`}>
              <span>联系我</span>
              <span className={EN_SMALL}>Contact Me</span>
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${TEXT_SHADOW}`}>
              无论是项目合作、技术交流,还是单纯打个招呼,都欢迎!
            </h2>
            <p className={EN_HEADER}>
              Project collaboration, tech chats, or just saying hi — everyone&apos;s welcome!
            </p>
            <p className={`text-lg text-white/80 ${BODY_SHADOW}`}>
              有想法?最快的方式是直接给我写邮件 🚀
            </p>
            <p className={EN_BODY}>
              Got an idea? The fastest way is to email me directly 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="flex flex-col items-center gap-0.5 bg-white text-zinc-950 hover:bg-white/90"
                onClick={() => window.location.href = `mailto:${CONTACTS.email}`}
              >
                <span>发送邮件</span>
                <span className="text-xs font-normal text-zinc-950/60">Email Me</span>
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
                className="flex flex-col items-center gap-0.5 border-white/40 bg-black/40 text-white hover:bg-black/60 hover:text-white hover:border-white/60"
                onClick={() => window.open(CONTACTS.bilibili, "_blank")}
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  哔哩哔哩
                </span>
                <span className="text-xs font-normal text-white/60">Bilibili</span>
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
