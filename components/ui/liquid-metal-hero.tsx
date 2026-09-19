"use client";

import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1
    }
  };

  return (
    <section className="relative isolate min-h-screen flex items-center justify-center overflow-hidden">
      {/* 着色器背景限定在 Hero 内：preset 参数需展开 .params（0.0.8x 版本的 preset 是 { name, params } 结构）。
          在 Backdrop 预设上覆盖参数：深色底 + 单个柔和银色液滴（metaballs），对齐设计参考图 */}
      <LiquidMetal
        {...liquidMetalPresets[2].params}
        colorBack="#0a0a0c"
        colorTint="#ced2da"
        shape="metaballs"
        repetition={1}
        scale={0.75}
        offsetY={0.18}
        softness={0.45}
        distortion={0.12}
        contour={0.35}
        shiftRed={0.15}
        shiftBlue={0.15}
        speed={0.7}
        style={{ position: "absolute", inset: 0, zIndex: -10 }}
      />
      
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <motion.div 
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {badge && (
            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <Badge 
                variant="secondary" 
                className="bg-black/40 text-white border-white/25 hover:bg-black/55 transition-colors duration-300 backdrop-blur-sm"
              >
                {badge}
              </Badge>
            </motion.div>
          )}
          
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <motion.h1 
              role="heading" 
              aria-level={1}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]"
              variants={itemVariants}
            >
              {title}
            </motion.h1>
            
            <motion.p 
              className="max-w-3xl mx-auto text-xl sm:text-2xl text-white/85 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={buttonVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={onPrimaryCtaClick}
                size="lg"
                className="bg-white text-zinc-950 hover:bg-white/90 transition-all duration-300 shadow-2xl text-lg px-8 py-6 font-semibold"
              >
                {primaryCtaLabel}
              </Button>
            </motion.div>
            
            {secondaryCtaLabel && onSecondaryCtaClick && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-black/40 text-white hover:bg-black/60 hover:text-white hover:border-white/60 transition-all duration-300 backdrop-blur-md text-lg px-8 py-6 font-semibold"
                >
                  {secondaryCtaLabel}
                </Button>
              </motion.div>
            )}
          </motion.div>
          
          {features.length > 0 && (
            <motion.div 
              className="pt-12"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-black/40 border-white/15 backdrop-blur-md shadow-2xl">
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center justify-center text-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: 0.8 + (index * 0.1)
                          }}
                        >
                          <p className="text-white/90 font-medium text-lg">
                            {feature}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
