'use client'

import { useState } from 'react'

interface ItemResearchResponse {
  itemName: string
  researchData: {
    overview: string
    features: string[]
    benefits: string[]
    targetAudience: string
    marketAnalysis: string
    recommendations: string[]
    priceRange: string
    popularBrands: string[]
  }
  success: boolean
}

export default function TestItemResearch() {
  const [itemName, setItemName] = useState('무선 블루투스 이어폰')
  const [result, setResult] = useState<ItemResearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/item-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ItemResearchResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">아이템 리서치 테스트</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="itemName" className="block text-sm font-medium mb-2">
            아이템 이름
          </label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 무선 블루투스 이어폰"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '조사 중...' : '아이템 조사하기'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">오류 발생:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            조사 결과: {result.itemName}
          </h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-2">개요</h3>
              <p className="text-gray-700">{result.researchData.overview}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">주요 기능</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.researchData.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">장점</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.researchData.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-700">{benefit}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">타겟 고객층</h3>
              <p className="text-gray-700">{result.researchData.targetAudience}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">시장 분석</h3>
              <p className="text-gray-700">{result.researchData.marketAnalysis}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">구매 추천 이유</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.researchData.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">가격대</h3>
              <p className="text-gray-700">{result.researchData.priceRange}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">인기 브랜드</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.researchData.popularBrands.map((brand, index) => (
                  <li key={index} className="text-gray-700">{brand}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}