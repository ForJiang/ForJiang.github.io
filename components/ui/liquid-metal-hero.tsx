"use client";

import type { CSSProperties } from "react";
import OriginButton from '@/components/ui/origin-button';
import RevealText from '@/components/ui/reveal-text';
import { Badge } from '@/components/ui/badge';

interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
}

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}: LiquidMetalHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 液态金属背景已上移为全站固定层 components/liquid-metal-background.tsx */}
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="text-center space-y-8">
          {badge && (
            <div className="flex justify-center">
              <Badge
                className="bg-black/40 px-5 py-2 text-white border-white/25 hover:bg-black/55 transition-colors duration-300 backdrop-blur-sm"
              >
                {/* 徽章排在标题之后出现（用户要求）：标题 0.05s 起、0.75s 的
                    逐字在 0.8s 收尾，徽章从 0.85s 接上。visibility:hidden 的
                    隐藏态不占布局变化，徽章晚出现不会让标题闪位 */}
                <RevealText as="span" delay={0.85} stagger={0.03} duration={0.55} blur={8}>
                  {badge}
                </RevealText>
              </Badge>
            </div>
          )}

          <div className="space-y-6">
            {/* Hero 标题是一次性入场（非滚动触发），逐字揭示用 delay 排成
                标题 → 徽章 → 副标题 → 按钮 的顺序 */}
            <RevealText
              as="h1"
              delay={0.05}
              stagger={0.045}
              duration={0.75}
              blur={12}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.7)]"
            >
              {title}
            </RevealText>

            {subtitle && (
              <RevealText
                as="p"
                delay={1.05}
                stagger={0.03}
                duration={0.65}
                blur={8}
                className="max-w-3xl mx-auto text-xl sm:text-2xl text-white/85 [text-shadow:0_2px_14px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.6)]"
              >
                {subtitle}
              </RevealText>
            )}
          </div>

          {/* 按钮组入场（标题 → 徽章 → 副标题 → 按钮 的最后一环）：纯 CSS
              animation + both 填充，样式表生效即开始排队，不等注水（globals.css
              的 .rise-in）。上浮淡入由这一层负责，缩放反馈交给按钮自身的
              :active，避免双重缩放 */}
          <div
            className="rise-in flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{ "--enter-delay": "1.25s", "--enter-dur": "0.6s" } as CSSProperties}
          >
            {/* 悬停时圆形填充从指针处扩散、文字反色；上浮淡入由这一层负责，
                缩放反馈交给按钮自身，避免双重缩放 */}
            <div>
              <OriginButton
                tone="solid"
                onClick={onPrimaryCtaClick}
                className="shadow-2xl text-lg px-8 h-12 font-semibold"
              >
                <RevealText as="span" stagger={0.03} duration={0.5} blur={6}>
                  {primaryCtaLabel}
                </RevealText>
              </OriginButton>
            </div>

            {secondaryCtaLabel && onSecondaryCtaClick && (
              <div>
                <OriginButton
                  tone="glass"
                  onClick={onSecondaryCtaClick}
                  className="backdrop-blur-md text-lg px-8 h-12 font-semibold"
                >
                  <RevealText as="span" stagger={0.03} duration={0.5} blur={6}>
                    {secondaryCtaLabel}
                  </RevealText>
                </OriginButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
