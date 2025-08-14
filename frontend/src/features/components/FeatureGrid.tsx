'use client'

import { GlassCard } from '@/features/components/ui/glass-card'
import { AnimatedButton } from '@/features/components/ui/animated-button'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  href: string
  disabled?: boolean
}

export interface FeatureGridProps {
  features: Feature[]
  columns?: 2 | 3
  className?: string
}

export function FeatureGrid({ 
  features, 
  columns = 3,
  className = '' 
}: FeatureGridProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {features.map((feature, index) => {
        const IconComponent = feature.icon
        const isDisabled = feature.disabled || feature.href === '#'
        
        return (
          <GlassCard key={index} className="group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 mb-4">
                {feature.description}
              </p>
              
              {!isDisabled ? (
                <Link href={feature.href}>
                  <AnimatedButton variant="outline" size="sm" className="w-full">
                    자세히 보기
                  </AnimatedButton>
                </Link>
              ) : (
                <AnimatedButton variant="outline" size="sm" className="w-full" disabled>
                  곧 출시 예정
                </AnimatedButton>
              )}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

export interface Stat {
  icon: LucideIcon
  value: string
  label: string
  color: string
}

export interface FeatureStatsProps {
  stats: Stat[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FeatureStats({ 
  stats, 
  columns = 3,
  className = 'mt-12' 
}: FeatureStatsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns]

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        
        return (
          <div key={index} className="text-center">
            <IconComponent className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}