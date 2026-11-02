/**
 * ForJiang · https://forjiang.github.io
 * © 2026 ForJiang. 个人主页项目源码。
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
