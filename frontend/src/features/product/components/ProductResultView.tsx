'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isProductItem, isDeepLinkResponse, generateItemId } from '../utils/product-helpers'
import { ProductItem, DeepLinkResponse } from '@/shared/types/api'
import SelectedItemDetail from './SelectedItemDetail'

type ViewType = 'grid' | 'list'

interface ProductResultViewProps {
  loading: boolean
  viewType: ViewType
  setViewType: (value: ViewType) => void
  filteredResults: (ProductItem | DeepLinkResponse)[]
  mode?: 'product' | 'deeplink'
}

export default function ProductResultView({
  loading,
  viewType,
  setViewType,
  filteredResults,
  mode = 'product'
}: ProductResultViewProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selected.length === filteredResults.length) {
      setSelected([])
    } else {
      const allIds = filteredResults.map((_, index) => generateItemId(_, index))
      setSelected(allIds)
    }
  }

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${label}이 클립보드에 복사되었습니다:`, text)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
    }
  }

  // 선택된 첫 번째 아이템 찾기
  const getSelectedItem = () => {
    if (selected.length === 0) {
      console.log('🔍 getSelectedItem: 선택된 아이템 없음')
      return null
    }
    const selectedId = selected[0]
    console.log('🔍 getSelectedItem: 선택된 ID:', selectedId)
    console.log('🔍 getSelectedItem: 전체 선택 목록:', selected)
    
    // ID에서 인덱스 추출 (itemId 형식: "product-{index}" 또는 "deeplink-{index}")
    const indexMatch = selectedId.match(/-(.+)$/)
    if (!indexMatch) {
      console.log('🔍 getSelectedItem: ID 패턴 매치 실패')
      return null
    }
    
    const index = parseInt(indexMatch[1])
    console.log('🔍 getSelectedItem: 추출된 인덱스:', index)
    console.log('🔍 getSelectedItem: 결과 배열 길이:', filteredResults.length)
    
    if (isNaN(index) || index >= filteredResults.length) {
      console.log('🔍 getSelectedItem: 인덱스 범위 초과')
      return null
    }
    
    const foundItem = filteredResults[index] || null
    console.log('🔍 getSelectedItem: 찾은 아이템:', foundItem)
    return foundItem
  }

  const cardClass = "relative cursor-pointer border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
  const cardSelected = "ring-2 ring-blue-500 bg-blue-50"

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          로딩 중...
        </div>
      </div>
    )
  }

  if (!Array.isArray(filteredResults) || filteredResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 뷰 타입 선택 및 전체 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('grid')}
          >
            그리드
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('list')}
          >
            리스트
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selected.length === filteredResults.length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span>전체 선택</span>
          </label>
          
          {selected.length > 0 && (
            <span className="text-sm text-gray-600">
              {selected.length}개 선택됨
            </span>
          )}
        </div>
      </div>

      {/* 선택된 아이템 상세 정보 */}
      {selected.length === 1 && (
        <SelectedItemDetail 
          item={getSelectedItem()}
          onClose={() => setSelected([])}
        />
      )}

      {/* 상품 목록 */}
      <div className={viewType === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        : "space-y-2"
      }>
        {filteredResults.map((item, i) => {
          const itemId = generateItemId(item, i)

          return (
            <Card
              key={i}
              className={`${cardClass} ${
                selected.includes(itemId) ? cardSelected : ""
              }`}
              onClick={() => handleSelect(itemId)}
            >
              <CardContent className="p-4">
                {/* 상품 이미지 */}
                {mode !== 'deeplink' && isProductItem(item) && item.productImage && (
                  <div className="relative mb-3">
                    <Image
                      src={item.productImage}
                      alt={item.productName || '상품 이미지'}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover rounded"
                    />
                    {item.isRocket && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        로켓
                      </span>
                    )}
                  </div>
                )}

                {/* 상품 정보 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {isProductItem(item) 
                      ? item.productName 
                      : isDeepLinkResponse(item)
                      ? '딥링크 변환 결과'
                      : '알 수 없는 아이템'
                    }
                  </h3>

                  {/* 가격 정보 */}
                  {mode !== 'deeplink' && isProductItem(item) && (
                    <p className="text-lg font-bold text-blue-600">
                      {item.productPrice?.toLocaleString()}원
                    </p>
                  )}

                  {/* 카테고리 정보 */}
                  {mode !== 'deeplink' && isProductItem(item) && (
                    <p className="text-xs text-gray-500">
                      {item.categoryName}
                    </p>
                  )}

                  {/* 딥링크 정보 */}
                  {mode === 'deeplink' && isDeepLinkResponse(item) && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-blue-600">원본:</span>
                        <a 
                          href={item.originalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.originalUrl}
                        </a>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">단축:</span>
                        <a 
                          href={item.shortenUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-green-600 hover:underline truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.shortenUrl}
                        </a>
                      </div>
                      <div>
                        <span className="font-medium text-purple-600">랜딩:</span>
                        <a 
                          href={item.landingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-purple-600 hover:underline truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.landingUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 일반 링크 */}
                  {mode !== 'deeplink' && (
                    <div className="text-xs">
                      <a 
                        href={isProductItem(item) ? item.productUrl : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isProductItem(item) ? item.productUrl : '#'}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 모바일에서만 표시되는 액션 버튼 */}
      {Array.isArray(filteredResults) && filteredResults.length > 0 && (
        <div className="mt-4 flex justify-center lg:hidden">
          <Button 
            onClick={() => {/* 액션 모달 열기 */}}
            className="w-full max-w-xs"
          >
            선택된 상품 작업하기
          </Button>
        </div>
      )}
    </div>
  )
}