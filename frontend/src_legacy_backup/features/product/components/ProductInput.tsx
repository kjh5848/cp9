'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductAPI } from '../hooks/useProductAPI'
import { useProductActions } from '../hooks/useProductActions'
import { useSearchHistory } from '@/features/search/hooks/useSearchHistory'
import { ProductItem, DeepLinkResponse } from '@/shared/types/api'
import { generateItemId } from '../utils/product-helpers'

type SearchMode = 'link' | 'keyword' | 'category'

export default function ProductInput() {
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword')
  const [keyword, setKeyword] = useState('')
  const [urls, setUrls] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageSize, setImageSize] = useState(200)
  const [bestLimit, setBestLimit] = useState(20)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none')

  const { 
    searchProducts, 
    searchByCategory, 
    convertToDeeplinks, 
    loading 
  } = useProductAPI()

  const { 
    handleCopyToClipboard, 
    handleCopySelectedLinks, 
    handleGenerateSeo,
    isActionModalOpen,
    setIsActionModalOpen,
    selected,
    setSelected
  } = useProductActions()

  const { addHistory, searchHistory } = useSearchHistory()

  const handleKeywordSearch = useCallback(async () => {
    if (!keyword.trim()) return

    try {
      const results = await searchProducts(keyword.trim())
      if (results.length > 0) {
        addHistory(keyword.trim(), results)
      }
    } catch (error) {
      console.error('키워드 검색 오류:', error)
    }
  }, [keyword, searchProducts, addHistory])

  const handleLinkSubmit = useCallback(async () => {
    if (!urls.trim()) return

    const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean)
    if (urlList.length === 0) return

    try {
      const results = await convertToDeeplinks(urlList)
      if (results.length > 0) {
        addHistory('딥링크 변환', results)
      }
    } catch (error) {
      console.error('딥링크 변환 오류:', error)
    }
  }, [urls, convertToDeeplinks, addHistory])

  const handleCategorySearch = useCallback(async (options: {
    categoryId: string;
    imageSize: number;
    bestLimit: number;
    priceRange: [number, number];
  }) => {
    try {
      const results = await searchByCategory(options)
      if (results.length > 0) {
        addHistory(`카테고리 ${options.categoryId}`, results)
      }
    } catch (error) {
      console.error('카테고리 검색 오류:', error)
    }
  }, [searchByCategory, addHistory])

  const handleEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  const safeAddHistory = (keyword: string, items: (ProductItem | DeepLinkResponse)[]) => {
    try {
      addHistory(keyword, items)
    } catch (error) {
      console.error('검색 이력 저장 오류:', error)
    }
  }

  const handleDeeplinkConvert = () => {
    if (!urls.trim()) {
      alert('URL을 입력해주세요')
      return
    }
    handleLinkSubmit()
  }

  const handleModeChange = (newMode: "link" | "keyword" | "category") => {
    setSearchMode(newMode)
    setKeyword('')
    setUrls('')
    setCategoryId('')
  }

  return (
    <div className="space-y-6">
      {/* 검색 모드 선택 */}
      <div className="flex space-x-2">
        <Button
          variant={searchMode === 'keyword' ? 'default' : 'outline'}
          onClick={() => handleModeChange('keyword')}
        >
          키워드 검색
        </Button>
        <Button
          variant={searchMode === 'link' ? 'default' : 'outline'}
          onClick={() => handleModeChange('link')}
        >
          URL 검색
        </Button>
        <Button
          variant={searchMode === 'category' ? 'default' : 'outline'}
          onClick={() => handleModeChange('category')}
        >
          카테고리 검색
        </Button>
      </div>

      {/* 키워드 검색 */}
      {searchMode === 'keyword' && (
        <Card>
          <CardHeader>
            <CardTitle>키워드로 상품 검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="검색할 키워드를 입력하세요 (예: 무선 이어폰)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => handleEnter(e, handleKeywordSearch)}
              />
            </div>
            <Button 
              onClick={handleKeywordSearch} 
              disabled={loading || !keyword.trim()}
              className="w-full"
            >
              {loading ? '검색 중...' : '검색'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* URL 검색 */}
      {searchMode === 'link' && (
        <Card>
          <CardHeader>
            <CardTitle>URL로 딥링크 변환</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                placeholder="쿠팡 상품 URL을 한 줄에 하나씩 입력하세요"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleDeeplinkConvert} 
              disabled={loading || !urls.trim()}
              className="w-full"
            >
              {loading ? '변환 중...' : '딥링크 변환'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 카테고리 검색 */}
      {searchMode === 'category' && (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 베스트 상품</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 ID</label>
                <Input
                  placeholder="카테고리 ID"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이미지 크기</label>
                <Input
                  type="number"
                  value={imageSize}
                  onChange={(e) => setImageSize(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">상품 개수</label>
                <Input
                  type="number"
                  value={bestLimit}
                  onChange={(e) => setBestLimit(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">가격 정렬</label>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as 'none' | 'asc' | 'desc')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="none">정렬 안함</option>
                  <option value="asc">낮은 가격순</option>
                  <option value="desc">높은 가격순</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={() => handleCategorySearch({
                categoryId,
                imageSize,
                bestLimit,
                priceRange
              })} 
              disabled={loading || !categoryId}
              className="w-full"
            >
              {loading ? '검색 중...' : '카테고리 검색'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 검색 이력 */}
      {searchHistory?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item.keyword}</span>
                  <span className="text-xs text-gray-500">{item.results?.length}개 결과</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 