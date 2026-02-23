'use client'

import { useState, useCallback } from 'react'
import { useWorkflowOrchestrator } from './useWorkflowOrchestrator'
import { ProductItem } from '@/shared/types/api'

interface WorkflowConfig {
  enablePerplexity?: boolean
  enableWordPress?: boolean
  maxProducts?: number
}

interface WorkflowResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export function useWorkflow() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<WorkflowResult | null>(null)

  const executeWorkflow = useCallback(async (params: {
    urls?: string[]
    productIds?: string[]
    keyword?: string
    config?: WorkflowConfig
  }): Promise<WorkflowResult> => {
    setIsLoading(true)
    setResult(null)

    try {
      // 워크플로우 실행 로직
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`워크플로우 실행 실패: ${response.status}`)
      }

      const data = await response.json()
      const result: WorkflowResult = { success: true, message: '워크플로우가 성공적으로 실행되었습니다', data }
      
      setResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      const result: WorkflowResult = { success: false, message: '워크플로우 실행 실패', error: errorMessage }
      
      setResult(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSeoContent = useCallback(async (
    query: string, 
    products: ProductItem[], 
    seoType: 'product_review' | 'comparison' | 'guide' = 'product_review'
  ): Promise<WorkflowResult> => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/workflow/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, products, seoType })
      })

      if (!response.ok) {
        throw new Error(`SEO 콘텐츠 생성 실패: ${response.status}`)
      }

      const data = await response.json()
      const result: WorkflowResult = { success: true, message: 'SEO 콘텐츠가 생성되었습니다', data }
      
      setResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      const result: WorkflowResult = { success: false, message: 'SEO 콘텐츠 생성 실패', error: errorMessage }
      
      setResult(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetWorkflow = useCallback(() => {
    setResult(null)
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    result,
    executeWorkflow,
    generateSeoContent,
    resetWorkflow
  }
}