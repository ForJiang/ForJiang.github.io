"use client";

import OriginButton from '@/components/ui/origin-button';
import RevealText from '@/components/ui/reveal-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LazyMotion, domAnimation, m } from 'framer-motion';

interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
}

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
}: LiquidMetalHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 液态金属背景已上移为全站固定层 components/liquid-metal-background.tsx */}
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="text-center space-y-8">
          {badge && (
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-black/40 px-5 py-2 text-white border-white/25 hover:bg-black/55 transition-colors duration-300 backdrop-blur-sm"
              >
                <RevealText as="span" stagger={0.03} duration={0.55} blur={8}>
                  {badge}
                </RevealText>
              </Badge>
            </div>
          )}

          <div className="space-y-6">
            {/* Hero 标题是一次性入场（非滚动触发），逐字揭示用 delay 排成
                徽章 → 标题 → 副标题 的顺序 */}
            <RevealText
              as="h1"
              delay={0.15}
              stagger={0.045}
              duration={0.75}
              blur={12}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]"
            >
              {title}
            </RevealText>

            {subtitle && (
              <RevealText
                as="p"
                delay={0.35}
                stagger={0.03}
                duration={0.65}
                blur={8}
                className="max-w-3xl mx-auto text-xl sm:text-2xl text-white/85 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]"
              >
                {subtitle}
              </RevealText>
            )}
          </div>
          
          <m.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
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
              <m.div>
                <OriginButton
                  tone="glass"
                  onClick={onSecondaryCtaClick}
                  className="backdrop-blur-md text-lg px-8 h-12 font-semibold"
                >
                  <RevealText as="span" stagger={0.03} duration={0.5} blur={6}>
                    {secondaryCtaLabel}
                  </RevealText>
                </OriginButton>
              </m.div>
            )}
          </m.div>
          
          {features.length > 0 && (
            <m.div
              className="pt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: [0.215, 0.61, 0.355, 1] }}
            >
              <m.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-black/40 border-white/15 backdrop-blur-md shadow-2xl">
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {features.map((feature, index) => (
                        <m.div
                          key={index}
                          className="flex items-center justify-center text-center"
                        >
                          <RevealText
                            as="p"
                            stagger={0.03}
                            duration={0.5}
                            blur={6}
                            className="text-white/90 font-medium text-lg"
                          >
                            {feature}
                          </RevealText>
                        </m.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </m.div>
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}
