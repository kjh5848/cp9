import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * 테이블 컴포넌트의 props 타입
 */
interface TableProps {
  headers: TableHeader[];
  data: any[][];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onRowClick?: (rowIndex: number, rowData: any[]) => void;
  className?: string;
}

interface TableHeader {
  label: string;
  field?: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * 재사용 가능한 테이블 컴포넌트
 * 정렬 기능과 커스터마이징 가능한 헤더를 지원
 */
export function Table({ 
  headers, 
  data, 
  onSort, 
  sortField, 
  sortOrder,
  onRowClick,
  className = '' 
}: TableProps) {
  const handleSort = (field?: string) => {
    if (field && onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field?: string) => {
    if (!field || sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-400" />
      : <ChevronDown className="w-4 h-4 text-blue-400" />;
  };

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-700 ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-3 font-medium text-gray-300 ${getAlignment(header.align)} ${
                  header.width || ''
                } ${header.sortable ? 'cursor-pointer hover:bg-gray-700/50' : ''}`}
                onClick={() => header.sortable && handleSort(header.field)}
              >
                <div className={`flex items-center gap-2 ${
                  header.align === 'center' ? 'justify-center' : 
                  header.align === 'right' ? 'justify-end' : 
                  'justify-start'
                }`}>
                  <span>{header.label}</span>
                  {header.sortable && getSortIcon(header.field)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800/50">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick && onRowClick(rowIndex, row)}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-4 py-3 text-gray-300 ${getAlignment(headers[cellIndex]?.align)}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          데이터가 없습니다
        </div>
      )}
    </div>
  );
}

export type { TableProps, TableHeader };