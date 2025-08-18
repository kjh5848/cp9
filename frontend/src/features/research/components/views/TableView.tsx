'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Table, TableHeader } from '@/shared/ui/table';
import { AnimatedButton } from '@/shared/components/advanced-ui';
import { ResearchItem, SortOptions } from '../../types';
import { Download, Eye, FileText, Star } from 'lucide-react';

interface TableViewProps {
  data: ResearchItem[];
}

/**
 * 테이블 뷰 컴포넌트
 * 데이터 중심의 정렬 가능한 테이블 형태로 상품 정보를 표시
 */
export default function TableView({ data }: TableViewProps) {
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    order: 'asc'
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // 테이블 헤더 정의
  const headers: TableHeader[] = [
    { label: '', field: 'select', sortable: false, width: 'w-10' },
    { label: '이미지', field: 'image', sortable: false, width: 'w-20' },
    { label: '상품명', field: 'name', sortable: true },
    { label: '카테고리', field: 'category', sortable: true, width: 'w-32' },
    { label: '가격', field: 'price', sortable: true, width: 'w-28', align: 'right' },
    { label: '평점', field: 'rating', sortable: true, width: 'w-24', align: 'center' },
    { label: '키워드', field: 'keywords', sortable: false },
    { label: '액션', field: 'actions', sortable: false, width: 'w-32', align: 'center' }
  ];

  // 정렬 처리
  const handleSort = (field: string) => {
    setSortOptions(prev => ({
      field: field as SortOptions['field'],
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 데이터 정렬
  const sortedData = [...data].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortOptions.field) {
      case 'name':
        aValue = a.productName;
        bValue = b.productName;
        break;
      case 'price':
        aValue = a.productPrice;
        bValue = b.productPrice;
        break;
      case 'rating':
        aValue = a.analysis.rating;
        bValue = b.analysis.rating;
        break;
      default:
        return 0;
    }

    if (sortOptions.order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 행 선택 처리
  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  // CSV 내보내기
  const handleExportCSV = () => {
    const csvContent = [
      ['상품명', '카테고리', '가격', '평점', '키워드', 'URL'],
      ...sortedData.map(item => [
        item.productName,
        item.category,
        item.productPrice.toString(),
        item.analysis.rating.toString(),
        item.analysis.keywords.join(', '),
        item.productUrl
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `research_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 테이블 데이터 변환
  const tableData = sortedData.map(item => [
    // 체크박스
    <input
      type="checkbox"
      checked={selectedRows.has(item.id)}
      onChange={() => handleRowSelect(item.id)}
      className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
    />,
    // 이미지
    <div className="relative w-12 h-12">
      <Image
        src={item.productImage}
        alt={item.productName}
        fill
        className="object-cover rounded"
        sizes="48px"
      />
    </div>,
    // 상품명
    <div className="max-w-xs">
      <p className="text-white font-medium truncate">{item.productName}</p>
      <p className="text-xs text-gray-400 truncate">{item.analysis.summary}</p>
    </div>,
    // 카테고리
    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
      {item.category}
    </span>,
    // 가격
    <span className="text-blue-400 font-medium">
      ₩{item.productPrice.toLocaleString()}
    </span>,
    // 평점
    <div className="flex items-center justify-center gap-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="text-white">{item.analysis.rating}</span>
    </div>,
    // 키워드
    <div className="flex flex-wrap gap-1">
      {item.analysis.keywords.slice(0, 3).map((keyword, idx) => (
        <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
          #{keyword}
        </span>
      ))}
    </div>,
    // 액션 버튼
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => window.open(item.productUrl, '_blank')}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="상품 보기"
      >
        <Eye className="w-4 h-4" />
      </button>
      {item.seoContent && (
        <button
          onClick={() => console.log('View SEO:', item.id)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="SEO 글 보기"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
    </div>
  ]);

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={selectedRows.size === data.length && data.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">
              전체 선택 ({selectedRows.size}/{data.length})
            </span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV 내보내기
          </AnimatedButton>
        </div>
      </div>

      {/* 테이블 */}
      <Table
        headers={headers}
        data={tableData}
        onSort={handleSort}
        sortField={sortOptions.field}
        sortOrder={sortOptions.order}
        className="bg-gray-800/30"
      />
    </div>
  );
}