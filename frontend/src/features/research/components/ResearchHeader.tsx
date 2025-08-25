'use client';

import { GradientBackground } from '@/shared/components/advanced-ui';
import { Search, Package, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResearchHeaderProps {
  title: string;
  itemCount: number;
  subtitle?: string;
}

/**
 * 리서치 헤더 컴포넌트
 * 페이지 상단의 타이틀과 정보를 표시
 */
export default function ResearchHeader({ title, itemCount, subtitle }: ResearchHeaderProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0">
        <GradientBackground />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Glass morphism container */}
      <div className="relative z-10 backdrop-blur-xl bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
          {/* Animated Icon with glow effect */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500/50 rounded-full blur-2xl animate-pulse" />
              
              {/* Icon container with glass morphism */}
              <div className="relative p-4 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-110">
                <Search className="w-10 h-10 text-white" />
                
                {/* Sparkle decorations */}
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>

          {/* Fluid Typography Title with gradient */}
          <h1 
            className={`font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-4 transition-all duration-1000 transform ${
              isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: '1.2',
              textShadow: '0 0 40px rgba(59, 130, 246, 0.5)'
            }}
          >
            {title}
          </h1>

          {/* Animated Subtitle */}
          {subtitle && (
            <p 
              className={`text-gray-300 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-200 transform ${
                isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)'
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Glass Morphism Statistics Cards */}
          <div className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-300 transform ${
            isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {/* Product Count Card */}
            <div className="group relative overflow-hidden">
              <div className="relative px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-3xl text-white">{itemCount}</span>
                      <span className="text-sm text-gray-400">개</span>
                    </div>
                    <div className="text-xs text-gray-500">분석 상품</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Analysis Status Card */}
            <div className="group relative overflow-hidden">
              <div className="relative px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">AI 분석</div>
                    <div className="text-xs text-green-400">완료</div>
                  </div>
                </div>
                
                {/* Animated completion indicator */}
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Research Quality Card */}
            <div className="group relative overflow-hidden">
              <div className="relative px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">품질 점수</div>
                    <div className="text-xs text-purple-400">98%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}