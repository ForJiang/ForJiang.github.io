export type Lang = "zh" | "en";

/**
 * 全站文案字典。中文为主语言；英文用于语言切换模式。
 * 新增文案时两个语言都要补齐。
 */
export const translations = {
  zh: {
    langToggle: "EN",
    nav: {
      about: "关于",
      skills: "技能",
      projects: "项目",
      contact: "联系",
      menu: "打开菜单",
    },
    hero: {
      badge: "👋 你好，我是",
      title: "ForJiang",
      subtitle: "web coding...",
      primaryCta: "查看我的项目 →",
      secondaryCta: "联系我",
    },
    about: {
      badge: "关于我",
      heading: "一个喜欢把想法变成产品的开发者",
      paragraphs: [
        "你好！我是 ForJiang，一名高中生，也是一个热爱编程的学习者。从第一次写下 Hello, World 开始，我就迷上了用代码把想法变成现实的过程。",
        "过去几年，我一直在学习编程，尝试过前端、后端和一些小项目，也在不断摸索如何把课堂之外的想法做成真正能运行的东西。我尤其享受打磨交互细节、优化性能，以及把复杂问题拆解成简单方案时的成就感。虽然现在还在学习阶段，但我很期待未来能做出更多有意思的作品。",
        "不写代码的时候，我喜欢摄影、跑步，以及在技术社区分享自己的学习笔记。如果你有有趣的想法，或者愿意一起交流编程，欢迎随时找我聊聊！",
      ],
    },
    skills: {
      badge: "技术栈",
      heading: "我的技术能力",
      subtitle: "常用的工具与技术，持续学习中",
      groups: [
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
      ],
      projects: {
        badge: "实战项目",
        heading: "把这些用在了这些项目里",
        subtitle: "两个纯静态、可离线使用的网页工具",
        demoCta: "在线试用",
        items: [
          {
            name: "RVC 声音克隆",
            desc: "浏览器端 RVC 声音克隆：录音、上传、推理、导出全在页内完成，音频不上传。双引擎设计——ONNX Runtime Web 页内推理，或连接本机 RVC 服务取 GPU 级音质；批量队列可打包 ZIP 一次下载。",
            tags: ["JavaScript", "ONNX Runtime", "Web Audio", "IndexedDB", "Python"],
            repo: "https://github.com/ForJiang/rvc-sound-clone",
            demo: "https://forjiang.github.io/rvc-sound-clone/",
          },
          {
            name: "图片元数据清除器",
            desc: "批量抹掉照片里的隐藏信息：EXIF 相机型号、拍摄时间、GPS 定位、内嵌缩略图与修图痕迹。先扫描后清除再自检，输出零元数据；Canvas 重编码加强制拆段双保险，断网可用，附 65 项单元测试。",
            tags: ["JavaScript", "Canvas", "EXIF / GPS / XMP", "ZIP"],
            repo: "https://github.com/ForJiang/image-metadata-cleaner",
            demo: "https://forjiang.github.io/image-metadata-cleaner/",
          },
        ],
      },
    },
    projects: {
      badge: "AI 绘画",
      heading: "一些插画作品",
      subtitle: "用 ComfyUI 生成的插画习作，持续更新中",
      cards: [
        {
          title: "晨光 · 慵懒的清晨",
          desc: "清晨的阳光洒进房间，初音未来坐在木地板上小憩，城市在天窗外苏醒。",
        },
        {
          title: "雨天 · 窗边书写",
          desc: "雨滴顺着玻璃滑落，窗外是川流不息的街道，她在书桌前安静地写着什么。",
        },
        {
          title: "深夜 · 枕边休息",
          desc: "深夜的房间里只亮着一盏小灯，她躺在被窝里卸下一天的疲惫。",
        },
        {
          title: "暮色 · 窗前远眺",
          desc: "暮色四合，城市的灯火渐次亮起，她站在落地窗前眺望夜色。",
        },
      ],
    },
    contact: {
      badge: "联系我",
      heading: "无论是项目合作、技术交流，还是单纯打个招呼，都欢迎！",
      subtitle: "有想法？最快的方式是直接给我写邮件 🚀",
      emailCta: "发送邮件",
      bilibiliCta: "哔哩哔哩",
    },
  },
  en: {
    langToggle: "中文",
    nav: {
      about: "About",
      skills: "Skills",
      projects: "Projects",
      contact: "Contact",
      menu: "Menu",
    },
    hero: {
      badge: "👋 Hi, I'm",
      title: "ForJiang",
      subtitle: "web coding...",
      primaryCta: "View My Projects →",
      secondaryCta: "Contact Me",
    },
    about: {
      badge: "About Me",
      heading: "A developer who loves turning ideas into products",
      paragraphs: [
        "Hi! I'm ForJiang — a high school student and a passionate programming learner. Ever since writing my first Hello, World, I've been fascinated by turning ideas into reality with code.",
        "Over the past few years I've been learning programming — trying out frontend, backend and some small projects, and exploring how to turn ideas beyond the classroom into things that actually run. I especially enjoy polishing interaction details, optimizing performance, and the satisfaction of breaking complex problems into simple ones. I'm still learning, but I can't wait to build more interesting things.",
        "When I'm not coding, I enjoy photography, running, and sharing my study notes with the tech community. If you have an interesting idea — or just want to talk code — feel free to reach out!",
      ],
    },
    skills: {
      badge: "Tech Stack",
      heading: "My Skills",
      subtitle: "Tools and technologies I use, always learning",
      groups: [
        {
          title: "🧭 Frontend Development",
          tags: ["HTML5 / CSS3", "JavaScript", "TypeScript", "Vue 3", "React", "Mini Programs", "Responsive Design"],
        },
        {
          title: "⚙️ Backend & Data",
          tags: ["Node.js", "Python", "MySQL", "PostgreSQL", "Redis", "RESTful API", "GraphQL"],
        },
        {
          title: "🛠️ Tools & More",
          tags: ["Git", "Docker", "Nginx", "Linux", "Figma", "Performance", "Unit Testing"],
        },
      ],
      projects: {
        badge: "Projects",
        heading: "Where I put these skills to work",
        subtitle: "Two fully static, offline-capable web tools",
        demoCta: "Live demo",
        items: [
          {
            name: "RVC Sound Clone",
            desc: "Browser-side RVC voice cloning: record, upload, infer and export entirely in-page — audio never leaves the device. Dual-engine: ONNX Runtime Web in the browser, or a local RVC service for GPU-grade quality. Batch queue exports as ZIP.",
            tags: ["JavaScript", "ONNX Runtime", "Web Audio", "IndexedDB", "Python"],
            repo: "https://github.com/ForJiang/rvc-sound-clone",
            demo: "https://forjiang.github.io/rvc-sound-clone/",
          },
          {
            name: "Image Metadata Cleaner",
            desc: "Batch-strips the hidden data in photos: camera model, timestamps, GPS coordinates, embedded thumbnails, editor traces. Scan first, then strip, then self-verify — zero metadata out. Works offline, 65 unit tests.",
            tags: ["JavaScript", "Canvas", "EXIF / GPS / XMP", "ZIP"],
            repo: "https://github.com/ForJiang/image-metadata-cleaner",
            demo: "https://forjiang.github.io/image-metadata-cleaner/",
          },
        ],
      },
    },
    projects: {
      badge: "AI Art",
      heading: "Some of my illustrations",
      subtitle: "Illustrations generated with ComfyUI, more coming soon",
      cards: [
        {
          title: "Morning Light · A Lazy Morning",
          desc: "Morning sunlight fills the room as Miku sits resting on the wooden floor, the city waking up outside.",
        },
        {
          title: "Rainy Day · Writing by the Window",
          desc: "Raindrops slide down the glass over a busy street while she quietly writes at her desk.",
        },
        {
          title: "Late Night · At Rest",
          desc: "A single lamp glows in the dark room as she lies back, letting the day go.",
        },
        {
          title: "Dusk · Gazing at the City",
          desc: "As dusk settles and city lights come on, she gazes out at the night from the floor-to-ceiling window.",
        },
      ],
    },
    contact: {
      badge: "Contact Me",
      heading: "Project collaboration, tech chats, or just saying hi — everyone's welcome!",
      subtitle: "Got an idea? The fastest way is to email me directly 🚀",
      emailCta: "Email Me",
      bilibiliCta: "Bilibili",
    },
  },
} as const;
