"use client";

import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import MouseTrail from "@/components/mouse-trail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Github, Mail, ExternalLink, Menu, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

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
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    emoji: "🗺️",
  },
  {
    title: "清单 Tick · 待办应用",
    desc: "本地优先的极简待办,离线可用。",
    tags: ["React", "TypeScript", "IndexedDB"],
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    emoji: "✅",
  },
  {
    title: "PixelBoard · 协作白板",
    desc: "多人实时协作白板。",
    tags: ["Canvas", "WebSocket", "Redis"],
    gradient: "linear-gradient(135deg, #f43f5e, #fb923c)",
    emoji: "🎨",
  },
  {
    title: "节气志 · 传统文化站点",
    desc: "二十四节气与传统文化小站。",
    tags: ["Astro", "Markdown", "SSG"],
    gradient: "linear-gradient(135deg, #10b981, #84cc16)",
    emoji: "🌿",
  },
];

const CONTACTS = {
  email: "jianghaoda.1@outlook.com",
  github: "https://github.com/ForJiang",
  bilibili: "https://b23.tv/edD6tm9",
};

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* 蔚蓝档案风格的鼠标流光轨迹 */}
      <MouseTrail />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold tracking-tight">
              ForJiang<span className="text-primary">.</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
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
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
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
        subtitle="热爱构建优雅、高性能的 Web 应用,专注于前端工程化与用户体验,偶尔写写后端和设计。目前坐标上海,正在寻找有趣的合作机会。"
        primaryCtaLabel="查看我的项目 →"
        secondaryCtaLabel="联系我"
        onPrimaryCtaClick={() => scrollTo("projects")}
        onSecondaryCtaClick={() => scrollTo("contact")}
        features={["⚛️ React", "💚 Vue", "📘 TypeScript", "🚀 Node.js"]}
      />

      {/* About Section */}
      <section id="about" className="py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className="mb-4">关于我</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              一个喜欢把想法变成产品的开发者
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              你好!我是 <strong className="text-foreground">ForJiang</strong>,一名住在上海的全栈开发工程师。从大学第一次写下
              <strong className="text-foreground"> Hello, World</strong> 开始,我就迷上了用代码把想法变成现实的过程。
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              过去五年,我参与过<strong className="text-foreground">从 0 到 1 的创业项目</strong>,也支撑过<strong className="text-foreground">千万级用户的成熟产品</strong>。
              我尤其享受打磨交互细节、优化性能,以及把复杂问题拆解成简单方案时的成就感。
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              不写代码的时候,我喜欢摄影、跑步,以及在技术社区分享所学。如果你有有趣的想法,欢迎随时找我聊聊!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">技术栈</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">我的技术能力</h2>
            <p className="mt-3 text-muted-foreground">常用的工具与技术,持续学习中</p>
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
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
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
      <section id="projects" className="py-24 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">精选项目</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">一些我做过并喜欢的作品</h2>
            <p className="mt-3 text-muted-foreground">封面图可在 PROJECTS 数组中换成自己的截图</p>
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
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                  {/* 封面:把 div 换成 <img src="..."> 即可使用真实截图 */}
                  <div
                    className="relative h-52 flex items-center justify-center shrink-0"
                    style={{ background: project.gradient }}
                  >
                    <span className="text-6xl drop-shadow-lg" aria-hidden="true">{project.emoji}</span>
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <p className="text-muted-foreground flex-1">{project.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
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
      <section id="contact" className="py-24 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className="mb-4">联系我</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              无论是项目合作、技术交流,还是单纯打个招呼,都欢迎!
            </h2>
            <p className="text-lg text-muted-foreground">
              有想法?最快的方式是直接给我写邮件 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2" onClick={() => window.location.href = `mailto:${CONTACTS.email}`}>
                <Mail className="h-4 w-4" />
                发送邮件
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => window.open(CONTACTS.github, "_blank")}>
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => window.open(CONTACTS.bilibili, "_blank")}>
                <ExternalLink className="h-4 w-4" />
                哔哩哔哩
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ForJiang · 用 ❤️ 与代码制作
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.open(CONTACTS.github, "_blank")}>
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => window.open(CONTACTS.bilibili, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => window.location.href = `mailto:${CONTACTS.email}`}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}
