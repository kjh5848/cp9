import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  describe('Given the Home page', () => {
    it('When rendered, Then should display main title and description', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByText('쿠팡 파트너스 자동 블로그 SaaS')).toBeInTheDocument();
      expect(screen.getByText('키워드만 입력하면 쿠팡 상품 검색부터 워드프레스 초안까지 원-클릭으로 완성')).toBeInTheDocument();
      expect(screen.getByText('CP9')).toBeInTheDocument();
    });

    it('When rendered, Then should display keyword input form', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByLabelText('키워드')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('예: 무선 이어폰')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '자동 블로그 글 생성' })).toBeInTheDocument();
    });

    it('When rendered, Then should display feature cards', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByText('🔍 스마트 상품 검색')).toBeInTheDocument();
      expect(screen.getByText('🤖 AI 컨텐츠 생성')).toBeInTheDocument();
      expect(screen.getByText('📝 자동 발행')).toBeInTheDocument();
      
      // Check feature descriptions
      expect(screen.getByText('키워드 입력 시 쿠팡 상품을 자동으로 검색하고 최적화합니다.')).toBeInTheDocument();
      expect(screen.getByText('LLM을 활용한 고품질 블로그 컨텐츠 자동 생성 기능입니다.')).toBeInTheDocument();
      expect(screen.getByText('워드프레스 등 다양한 플랫폼에 자동으로 포스팅합니다.')).toBeInTheDocument();
    });

    it('When rendered, Then should use proper semantic HTML structure', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'CP9' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '쿠팡 파트너스 자동 블로그 SaaS' })).toBeInTheDocument();
    });

    it('When rendered, Then should display action buttons', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByRole('button', { name: '무료로 시작하기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '데모 보기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
    });

    it('When rendered, Then should have proper form structure', () => {
      // Given & When
      render(<Home />);

      // Then
      const keywordInput = screen.getByLabelText('키워드');
      const submitButton = screen.getByRole('button', { name: '자동 블로그 글 생성' });
      
      expect(keywordInput).toHaveAttribute('type', 'text');
      expect(keywordInput).toHaveAttribute('placeholder', '예: 무선 이어폰');
      expect(keywordInput).toHaveAttribute('id', 'keyword');
      expect(submitButton).toBeInTheDocument();
    });

    it('When rendered, Then should display navigation links', () => {
      // Given & When
      render(<Home />);

      // Then
      expect(screen.getByRole('link', { name: '문서' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });
  });
}); 