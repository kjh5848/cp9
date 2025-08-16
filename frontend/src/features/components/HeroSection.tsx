'use client'

import { AnimatedButton } from '@/shared/components/advanced-ui'
import { ArrowRight, Sparkles, Zap, Shield, Globe, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export interface HeroFeature {
  icon: LucideIcon
  text: string
  color: 'blue' | 'purple' | 'pink'
}

export interface HeroSectionProps {
  badge?: {
    icon?: LucideIcon
    text: string
  }
  title: {
    main: string
    highlight: string
  }
  description: string
  primaryAction: {
    text: string
    href: string
  }
  secondaryAction: {
    text: string
    href?: string
    onClick?: () => void
  }
  features?: HeroFeature[]
}

export function HeroSection({
  badge = { icon: Sparkles, text: 'AI-Powered Automation' },
  title,
  description,
  primaryAction,
  secondaryAction,
  features = [
    { icon: Zap, text: '실시간 AI 분석', color: 'blue' },
    { icon: Shield, text: '안전한 데이터 보호', color: 'purple' },
    { icon: Globe, text: 'SEO 최적화', color: 'pink' }
  ]
}: HeroSectionProps) {
  const getFeatureColor = (color: 'blue' | 'purple' | 'pink') => {
    switch (color) {
      case 'blue': return 'bg-blue-500/10 text-blue-400'
      case 'purple': return 'bg-purple-500/10 text-purple-400'
      case 'pink': return 'bg-pink-500/10 text-pink-400'
      default: return 'bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <section className="relative min-h-[600px] flex items-center justify-center py-20 px-4">
      {/* Animated 3D-like cube background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl transform rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 rounded-3xl transform -rotate-6 animate-pulse animation-delay-2000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-cyan-500/10 rounded-3xl transform rotate-12 animate-pulse animation-delay-4000" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Floating badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-700 rounded-full mb-8">
            {badge.icon && <badge.icon className="w-4 h-4 text-blue-400" />}
            <span className="text-sm text-gray-300">{badge.text}</span>
          </div>
        )}

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {title.main}
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title.highlight}
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href={primaryAction.href}>
            <AnimatedButton variant="gradient" size="lg" className="min-w-[200px]">
              <span className="flex items-center gap-2">
                {primaryAction.text} <ArrowRight className="w-5 h-5" />
              </span>
            </AnimatedButton>
          </Link>
          {secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <AnimatedButton variant="outline" size="lg" className="min-w-[200px]">
                {secondaryAction.text}
              </AnimatedButton>
            </Link>
          ) : (
            <AnimatedButton 
              variant="outline" 
              size="lg" 
              className="min-w-[200px]"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.text}
            </AnimatedButton>
          )}
        </div>

        {/* Feature highlights */}
        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              const colorClasses = getFeatureColor(feature.color)
              
              return (
                <div key={index} className="flex items-center gap-3 justify-center">
                  <div className={`p-2 rounded-lg ${colorClasses.split(' ')[0]}`}>
                    <IconComponent className={`w-5 h-5 ${colorClasses.split(' ')[1]}`} />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}