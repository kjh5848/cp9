import type { Metadata } from 'next'
import { GlassCard } from '@/shared/ui/GlassCard'
import { SearchBar } from '@/features/search-product/ui/SearchBar'
import { ProductCard } from '@/entities/product/ui/ProductCard'

export const metadata: Metadata = {
  title: 'CP9 - 쿠팡 파트너스 자동화 플랫폼',
  description: 'AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요',
}

// 렌더링 검증용 더미 데이터
const dummyProduct = {
  productId: 1,
  productName: '초고속 무선 충전기 15W 거치형 스탠드',
  productPrice: 24500,
  productImage: '', // 이미지가 비어있을 땐 fallback 텍스트 렌더링
  productUrl: '#',
  categoryName: '가전/디지털',
  isRocket: true,
  isFreeShipping: true,
  brandName: '슈피겐'
}

// FSD 컴포넌트 마이그레이션 렌더링 테스트 뷰
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 flex flex-col items-center justify-start pt-20">
      
      {/* 헤더 및 검색 바 위젯 (Features) */}
      <div className="w-full max-w-4xl flex flex-col items-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Deep Tech Dashboard</h1>
        <p className="text-slate-400 mb-8">
          FSD 기반 상품 검색 상태 관리(`useSearchStore`) 및 마이그레이션 검증 뷰입니다.
        </p>
        <SearchBar className="w-full shadow-blue-900/20 shadow-2xl" />
      </div>

      {/* 검색 결과 UI 피드 (Entities) */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard product={dummyProduct} />
        <ProductCard 
          product={{
            ...dummyProduct,
            productId: 2,
            productName: '노이즈 캔슬링 블루투스 헤드폰 ANC 5.3',
            productPrice: 154000,
            isRocket: false,
            brandName: '소니'
          }} 
        />
        <ProductCard 
          product={{
            ...dummyProduct,
            productId: 3,
            productName: '기계식 무접점 키보드 텐키리스 블루투스',
            productPrice: 89000,
            brandName: '한성컴퓨터'
          }} 
        />
      </div>

    </div>
  )
}
