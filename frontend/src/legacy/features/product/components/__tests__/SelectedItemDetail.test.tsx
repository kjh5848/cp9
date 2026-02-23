import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SelectedItemDetail from '../SelectedItemDetail';
import { ProductItem, DeepLinkResponse } from '../../types';

// Mock data
const mockProductItem: ProductItem = {
  productName: 'Test Product',
  productPrice: 50000,
  productImage: 'https://example.com/image.jpg',
  productUrl: 'https://example.com/product',
  productId: 123,
  isRocket: true,
  isFreeShipping: true,
  categoryName: 'Electronics'
};

const mockDeepLinkItem: DeepLinkResponse = {
  originalUrl: 'https://example.com/original',
  shortenUrl: 'https://short.com/abc',
  landingUrl: 'https://landing.com/xyz'
};

describe('SelectedItemDetail', () => {
  const defaultProps = {
    item: null,
    onActionButtonClick: vi.fn(),
    selectedCount: 0,
    mode: 'product' as const
  };

  it('선택된 아이템이 없을 때 플레이스홀더를 표시한다', () => {
    render(<SelectedItemDetail {...defaultProps} />);
    
    expect(screen.getByText('아이템을 선택하세요')).toBeInTheDocument();
    expect(screen.getByText('선택한 아이템의 정보가 여기에 표시됩니다')).toBeInTheDocument();
  });

  it('상품 아이템을 표시한다', () => {
    render(
      <SelectedItemDetail 
        {...defaultProps} 
        item={mockProductItem}
        selectedCount={1}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('🚀 로켓배송')).toBeInTheDocument();
  });

  it('딥링크 아이템을 표시한다', () => {
    render(
      <SelectedItemDetail 
        {...defaultProps} 
        item={mockDeepLinkItem}
        selectedCount={1}
        mode="deeplink"
      />
    );
    
    expect(screen.getByText('딥링크 변환 결과')).toBeInTheDocument();
    expect(screen.getByText('원본 URL:')).toBeInTheDocument();
    expect(screen.getByText('단축 URL:')).toBeInTheDocument();
    expect(screen.getByText('랜딩 URL:')).toBeInTheDocument();
  });

  it('선택된 아이템이 있을 때 액션 버튼을 표시한다', () => {
    render(
      <SelectedItemDetail 
        {...defaultProps} 
        item={mockProductItem}
        selectedCount={2}
      />
    );
    
    expect(screen.getByText('선택된 상품 액션 (2개)')).toBeInTheDocument();
  });
});