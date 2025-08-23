'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * 탭 네비게이션 컴포넌트
 * 
 * @param tabs - 탭 목록
 * @param activeTab - 현재 활성 탭 ID
 * @param onTabChange - 탭 변경 시 콜백
 * @param className - 추가 CSS 클래스
 * @param size - 탭 크기
 * @param variant - 탭 스타일 변형
 */
export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  size = 'md',
  variant = 'default'
}: TabNavigationProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getTabClassName = (tab: Tab, isActive: boolean) => {
    const baseClasses = `
      inline-flex items-center gap-2 font-medium transition-all duration-200
      ${sizeClasses[size]}
      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses} rounded-lg
          ${isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }
          ${tab.disabled ? 'hover:bg-transparent hover:text-gray-400' : ''}
        `;
      
      case 'underline':
        return `
          ${baseClasses} border-b-2 rounded-none
          ${isActive 
            ? 'border-blue-400 text-blue-400' 
            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
          }
          ${tab.disabled ? 'hover:border-transparent hover:text-gray-400' : ''}
        `;
      
      default: // 'default'
        return `
          ${baseClasses} rounded-md
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
          }
          ${tab.disabled ? 'hover:bg-transparent hover:text-gray-400' : ''}
        `;
    }
  };

  const containerClassName = () => {
    switch (variant) {
      case 'pills':
        return 'flex gap-1 p-1 bg-gray-800/50 rounded-lg';
      case 'underline':
        return 'flex gap-6 border-b border-gray-700';
      default:
        return 'flex gap-1 p-1 bg-gray-800/50 rounded-lg';
    }
  };

  const handleTabClick = (tab: Tab) => {
    if (tab.disabled) return;
    onTabChange(tab.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: Tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tab);
    }
  };

  return (
    <div className={`${containerClassName()} ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            className={getTabClassName(tab, isActive)}
            onClick={() => handleTabClick(tab)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            disabled={tab.disabled}
            aria-selected={isActive}
            role="tab"
            tabIndex={tab.disabled ? -1 : 0}
          >
            {tab.icon && (
              <span className="flex-shrink-0">
                {tab.icon}
              </span>
            )}
            
            <span>{tab.label}</span>
            
            {tab.count !== undefined && (
              <span 
                className={`
                  px-1.5 py-0.5 text-xs rounded-full font-medium
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-600/50 text-gray-300'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}