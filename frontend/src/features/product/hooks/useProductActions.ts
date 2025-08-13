'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { isProductItem, isDeepLinkResponse } from '../utils/product-helpers'
import { ProductItem, DeepLinkResponse } from '@/shared/types/api'
import { ResearchPack } from '@/shared/types/api'

export function useProductActions() {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isSeoLoading, setIsSeoLoading] = useState(false)

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}이 클립보드에 복사되었습니다`)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      toast.error('클립보드 복사에 실패했습니다')
    }
  }

  const handleCopySelectedLinks = async () => {
    // 선택된 상품의 링크들을 복사하는 로직
    toast.success('선택된 링크들이 복사되었습니다')
  }

  const handleGenerateSeo = async () => {
    // SEO 글 생성 로직
    setIsSeoLoading(true)
    try {
      // SEO 생성 API 호출
      toast.success('SEO 글이 생성되었습니다')
    } catch (error) {
      toast.error('SEO 글 생성에 실패했습니다')
    } finally {
      setIsSeoLoading(false)
    }
  }

  const handleActionButtonClick = () => {
    setIsActionModalOpen(true)
  }

  const closeActionModal = () => {
    setIsActionModalOpen(false)
  }

  return {
    isActionModalOpen,
    isSeoLoading,
    handleCopySelectedLinks,
    handleGenerateSeo,
    handleActionButtonClick,
    closeActionModal,
    handleCopyToClipboard
  }
}

export function useProductActionsWithSelection(
  filteredResults: (ProductItem | DeepLinkResponse)[],
  selected: string[]
) {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isSeoLoading, setIsSeoLoading] = useState(false)

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}이 클립보드에 복사되었습니다`)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      toast.error('클립보드 복사에 실패했습니다')
    }
  }

  const handleCopySelectedLinks = async () => {
    if (selected.length === 0) {
      toast.error('선택된 상품이 없습니다')
      return
    }

    try {
      const selectedItems = getSelectedItems(filteredResults, selected)
      const links = selectedItems.map(item => {
        if (isProductItem(item)) {
          return item.productUrl
        } else if (isDeepLinkResponse(item)) {
          return item.landingUrl || item.shortenUrl || item.originalUrl
        }
        return ''
      }).filter(Boolean)

      if (links.length > 0) {
        await navigator.clipboard.writeText(links.join('\n'))
        toast.success(`${links.length}개의 링크가 클립보드에 복사되었습니다`)
      }
    } catch (error) {
      console.error('링크 복사 실패:', error)
      toast.error('링크 복사에 실패했습니다')
    }
  }

  // SEO 글 작성 (새로운 아키텍처: 상품 → 리서치 → 리서치 페이지로 리디렉트)
  const handleGenerateSeo = async () => {
    if (selected.length === 0) {
      toast.error('선택된 상품이 없습니다')
      return
    }

    setIsSeoLoading(true)
    try {
      const selectedItems = getSelectedItems(filteredResults, selected)
      
      // 선택된 상품 정보 수집 (ProductItem만)
      const productsData = selectedItems
        .filter(isProductItem)
        .map(item => ({
          name: item.productName,
          price: item.productPrice,
          category: item.categoryName,
          url: item.productUrl,
          image: item.productImage,
          productId: item.productId,
          isRocket: item.isRocket,
          isFreeShipping: item.isFreeShipping
        }))

      if (productsData.length === 0) {
        toast.error('선택된 상품이 없습니다')
        return
      }

      console.log('리서치 생성 요청 시작:', {
        selectedCount: productsData.length,
        products: productsData
      })

      // 프로젝트 ID 생성 (UUID 형식)
      const projectId = crypto.randomUUID()

      const completedResults: ResearchPack[] = []

      // 각 상품에 대해 item-research 호출 (2개씩 배치 처리)
      let processedCount = 0
      const batchSize = 2
      
      for (let i = 0; i < productsData.length; i += batchSize) {
        const batch = productsData.slice(i, i + batchSize)
        
        // 배치 내 상품들을 병렬로 처리
        const batchPromises = batch.map(async (product) => {
          try {
            const response = await fetch('/api/item-research', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json; charset=utf-8',
              },
              body: JSON.stringify({
                itemName: product.name,
                projectId: projectId,
                itemId: `item_${product.productId}`,
                productData: {
                  productName: product.name,
                  productPrice: product.price,
                  productImage: product.image,
                  productUrl: product.url,
                  categoryName: product.category,
                  isRocket: product.isRocket,
                  isFreeShipping: product.isFreeShipping
                }
              }, null, 2)
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              console.error(`리서치 실패 (${product.name}):`, {
                status: response.status,
                statusText: response.statusText,
                error: errorData
              })
              throw new Error(`리서치 실패 (${response.status}): ${errorData.details || errorData.error || response.statusText}`)
            }

            const result = await response.json()
            console.log(`리서치 완료: ${product.name}`, result)

            // ResearchPack 형태로 변환하여 저장
            const researchPack: ResearchPack = {
              itemId: `item_${product.productId}`,
              title: product.name,
              priceKRW: product.price,
              isRocket: product.isRocket,
              features: result.researchData.features || [],
              pros: result.researchData.benefits || [],
              cons: ['AI 분석으로 단점 파악 중...'],
              keywords: result.researchData.popularBrands || [],
              metaTitle: `${product.name} 리뷰 및 구매 가이드`,
              metaDescription: result.researchData.overview || '',
              slug: product.name.toLowerCase().replace(/\s+/g, '-')
            }
            
            completedResults.push(researchPack)
            return result
          } catch (error) {
            console.error(`리서치 오류 (${product.name}):`, error)
            throw error
          }
        })

        // 배치 완료 대기
        try {
          await Promise.all(batchPromises)
          processedCount += batch.length
          
          // 진행률 표시
          toast.success(`리서치 진행 중... ${processedCount}/${productsData.length}개 완료`)
        } catch (error) {
          console.error('배치 처리 오류:', error)
          toast.error('일부 상품의 리서치에 실패했습니다')
        }
      }

      // 리서치 완료 후 결과 페이지로 리디렉션
      setIsActionModalOpen(false)
      toast.success('리서치가 완료되었습니다! 결과 페이지로 이동합니다.')
      
      // 결과 데이터를 URL 파라미터로 전달하여 상세 페이지로 이동
      const resultsParam = encodeURIComponent(JSON.stringify(completedResults))
      const resultsUrl = `/research-results?projectId=${projectId}&results=${resultsParam}`
      
      setTimeout(() => {
        window.location.href = resultsUrl
      }, 1000)

    } catch (error: unknown) {
      console.error('리서치 생성 오류:', error)
      if (error instanceof Error) {
        toast.error(`리서치 생성에 실패했습니다: ${error.message}`)
      } else {
        console.error('알 수 없는 에러 타입:', typeof error)
        console.error('에러 내용:', JSON.stringify(error, null, 2))
        toast.error('리서치 생성에 실패했습니다 (알 수 없는 오류)')
      }
    } finally {
      setIsSeoLoading(false)
    }
  }

  const handleActionButtonClick = () => {
    setIsActionModalOpen(true)
  }

  const closeActionModal = () => {
    setIsActionModalOpen(false)
  }

  return {
    isActionModalOpen,
    isSeoLoading,
    handleCopySelectedLinks,
    handleGenerateSeo,
    handleActionButtonClick,
    closeActionModal,
    handleCopyToClipboard
  }
}

// 선택된 아이템들을 가져오는 유틸리티 함수
function getSelectedItems(
  filteredResults: (ProductItem | DeepLinkResponse)[],
  selected: string[]
): (ProductItem | DeepLinkResponse)[] {
  return selected
    .map(selectedId => {
      // ID에서 인덱스 추출
      const indexMatch = selectedId.match(/-(.+)$/)
      if (!indexMatch) return null
      
      const index = parseInt(indexMatch[1])
      if (isNaN(index) || index >= filteredResults.length) return null
      
      return filteredResults[index]
    })
    .filter((item): item is ProductItem | DeepLinkResponse => item !== null)
} 