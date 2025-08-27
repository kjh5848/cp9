'use client'

import { useState } from 'react'
import { GlassCard } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface BlogTOCProps {
  items: TOCItem[]
  activeSection: string
  mobile?: boolean
}

export function BlogTOC({ items, activeSection, mobile = false }: BlogTOCProps) {
  const [isExpanded, setIsExpanded] = useState(!mobile)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // 헤더 높이 등을 고려한 오프셋
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const getLevelClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-base font-semibold'
      case 2:
        return 'text-sm font-medium pl-4'
      case 3:
        return 'text-sm font-normal pl-8'
      case 4:
        return 'text-xs font-normal pl-12'
      default:
        return 'text-sm font-normal pl-4'
    }
  }

  const getActiveClass = (id: string) => {
    return activeSection === id
      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500'
      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
  }

  if (mobile) {
    return (
      <GlassCard className="mb-6">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full justify-between mb-4"
        >
          <span className="flex items-center">
            📖 목차
          </span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </Button>

        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md transition-all duration-200
                    ${getLevelClass(item.level)}
                    ${getActiveClass(item.id)}
                  `}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        )}
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        📖 목차
      </h3>
      
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`
              w-full text-left px-3 py-2 rounded-md transition-all duration-200 block
              ${getLevelClass(item.level)}
              ${getActiveClass(item.id)}
            `}
            title={item.title}
          >
            <span className="block truncate">
              {item.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>읽기 진행률</span>
          <span>{Math.round((items.findIndex(item => item.id === activeSection) + 1) / items.length * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${(items.findIndex(item => item.id === activeSection) + 1) / items.length * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 space-y-2">
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          ↑ 맨 위로
        </Button>
        <Button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          ↓ 맨 아래로
        </Button>
      </div>

      {/* Reading Time Estimate */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">예상 읽기 시간</span>
          <div className="flex items-center space-x-1">
            <span className="text-blue-600 dark:text-blue-400 font-medium">⏱️ 8분</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}