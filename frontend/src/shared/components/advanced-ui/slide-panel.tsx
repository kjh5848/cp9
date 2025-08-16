'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'

interface SlidePanelProps {
  children: React.ReactNode
  title?: string
  trigger: React.ReactNode
  position?: 'left' | 'right'
  width?: string
}

export function SlidePanel({ 
  children, 
  title, 
  trigger, 
  position = 'right',
  width = 'w-80'
}: SlidePanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    left: {
      panel: 'left-0',
      translate: isOpen ? 'translate-x-0' : '-translate-x-full'
    },
    right: {
      panel: 'right-0',
      translate: isOpen ? 'translate-x-0' : 'translate-x-full'
    }
  }

  // ESC 키로 패널 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide Panel */}
      {isOpen && (
        <div
          className={`fixed top-0 ${positionClasses[position].panel} h-full ${width} bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${positionClasses[position].translate}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "slide-panel-title" : undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {title && (
              <h3 id="slide-panel-title" className="text-lg font-semibold text-white">{title}</h3>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="패널 닫기"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

interface AccordionItem {
  title: string
  content: React.ReactNode
}

interface AnimatedAccordionProps {
  items: AccordionItem[]
  className?: string
}

export function AnimatedAccordion({ items, className = '' }: AnimatedAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900/70 transition-colors flex items-center justify-between text-left"
          >
            <span className="text-white font-medium">{item.title}</span>
            <ChevronRight 
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                openIndex === index ? 'rotate-90' : ''
              }`}
            />
          </button>
          <div
            className={`transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="p-4 bg-gray-950/50 text-gray-300">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}