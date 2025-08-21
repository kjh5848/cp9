'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ResearchItem } from '../../types';
import { ChevronDown, ChevronRight, Package, Star, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AnimatedButton } from '@/shared/components/advanced-ui';

interface TableViewProps {
  data: ResearchItem[];
  currentSessionId?: string;
}

/**
 * 테이블 뷰 컴포넌트
 * 세션별 리서치 데이터를 테이블 형태로 표시하는 뷰
 * 각 상품의 개별 데이터가 아닌 전체 리서치 세션 데이터를 비교 테이블로 제공
 */
export default function TableView({ data, currentSessionId = '1' }: TableViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // 전체 아이템 수
  const totalItems = data[0]?.metadata?.totalItems || data.length;

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    if (expandedItems.size === data.length) {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set(data.map(item => item.id)));
    }
  };

  // 삭제 - 테이블 데이터 변환 불필요

  return (
    <div>
      {/* 리서치 개요 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">리서치 개요</h3>
        </div>
        <p className="text-gray-300">
          총 <span className="text-green-400 font-bold">{totalItems}개</span>의 상품을 분석했습니다
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            {data.map((item, index) => (
              <span key={item.id} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                {index + 1}. {item.productName} - ₩{item.productPrice.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 세션 비교 테이블 */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">2024 가성비 노트북 TOP3 비교</h3>
          </div>
          <p className="text-gray-400 text-sm mt-1">총 {totalItems}개 제품의 상세 비교 분석 결과</p>
        </div>

        {/* 테이블 내용 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/30 text-left">
              <tr>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">순위</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">제품명</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">가격</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">평점</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">키워드</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">주요 장점</th>
                <th className="px-4 py-3 text-gray-300 font-medium text-sm">고려사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  {/* 순위 */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                    </div>
                  </td>

                  {/* 제품명 */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover rounded-lg"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm line-clamp-1">{item.productName}</h4>
                        <p className="text-gray-400 text-xs">{item.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* 가격 */}
                  <td className="px-4 py-4">
                    <div className="text-green-400 font-bold text-sm">
                      ₩{item.productPrice.toLocaleString()}
                    </div>
                  </td>

                  {/* 평점 */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-sm font-medium">{item.analysis.rating}</span>
                    </div>
                  </td>

                  {/* 키워드 */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {item.analysis.keywords.slice(0, 2).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 주요 장점 */}
                  <td className="px-4 py-4 max-w-48">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs line-clamp-2">{item.analysis.pros[0]}</p>
                    </div>
                  </td>

                  {/* 고려사항 */}
                  <td className="px-4 py-4 max-w-48">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs line-clamp-2">{item.analysis.cons[0]}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 테이블 하단 액션 영역 */}
        <div className="bg-gray-900/30 px-6 py-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-sm text-gray-400">
              클릭하여 전체 리서치 보고서와 상세 비교 분석을 확인하세요
            </div>
            <div className="flex gap-3">
              <Link href={`/research/${currentSessionId}`}>
                <AnimatedButton variant="gradient" size="sm">
                  📊 전체 리서치 보기
                </AnimatedButton>
              </Link>
              <Link href={`/research/${currentSessionId}#detailed-comparison`}>
                <AnimatedButton variant="outline" size="sm" className="border-green-500 text-green-400 hover:bg-green-500/10">
                  🔍 상세 비교 분석
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}