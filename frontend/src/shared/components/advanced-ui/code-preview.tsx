'use client'

import React, { useState } from 'react'
import { Button, Card } from '@/shared/ui'
import { Copy, Code, Eye } from 'lucide-react'

interface CodePreviewProps {
  title: string
  description: string
  code: string
  preview: React.ReactNode
  category?: string
}

export function CodePreview({ title, description, code, preview, category }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gray-900/70 border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            {category && (
              <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                {category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              미리보기
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'code' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('code')}
              className="text-xs"
            >
              <Code className="w-3 h-3 mr-1" />
              코드
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === 'preview' ? (
          <div className="p-6 min-h-48 flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
            {preview}
          </div>
        ) : (
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
              {copied ? '복사됨!' : '복사'}
            </Button>
            <pre className="p-4 bg-gray-950 text-gray-300 text-sm overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </Card>
  )
}

interface ComponentSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

export function ComponentSection({ title, description, children }: ComponentSectionProps) {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">{description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    </section>
  )
}