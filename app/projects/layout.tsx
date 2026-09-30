import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "实战项目 · ForJiang",
  description: "五个纯静态、可离线使用的网页小工具：RVC 声音克隆、图片元数据清除器、hello 手写动画、图生 3D 高斯泼溅、函数图像生成器。",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
