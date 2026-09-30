import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的技能 · ForJiang",
  description: "ForJiang 的技术栈：前端、后端与数据、工具链，以及常用框架与工程实践。",
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
