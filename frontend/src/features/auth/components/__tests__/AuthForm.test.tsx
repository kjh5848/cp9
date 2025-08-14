import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '../AuthForm';
import { supabase } from '@/lib/supabase';

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('AuthForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Given an AuthForm component', () => {
    it('When rendered, Then should display login form by default', () => {
      // Given & When
      render(<AuthForm />);

      // Then
      expect(screen.getByText('로그인')).toBeInTheDocument();
      expect(screen.getByText('이메일과 비밀번호로 로그인하세요.')).toBeInTheDocument();
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('When clicking signup toggle, Then should switch to signup form', () => {
      // Given
      render(<AuthForm />);

      // When
      fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

      // Then
      expect(screen.getByText('회원가입')).toBeInTheDocument();
      expect(screen.getByText('새 계정을 만들어 CP9를 시작하세요.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    });

    it('When entering email and password, Then should update input values', () => {
      // Given
      render(<AuthForm />);
      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

      // When
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Then
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('When form is submitted with valid data, Then should call appropriate auth method', async () => {
      // Given
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

      render(<AuthForm />);
      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const submitButton = screen.getByRole('button', { name: '로그인' });

      // When
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Then
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('When Google sign in is clicked, Then should call OAuth method', async () => {
      // Given
      const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(mockSignInWithOAuth);

      render(<AuthForm />);
      const googleButton = screen.getByRole('button', { name: '구글로 로그인' });

      // When
      fireEvent.click(googleButton);

      // Then
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      });
    });

    it('When switching between login and signup, Then should clear messages', () => {
      // Given
      render(<AuthForm />);
      const toggleButton = screen.getByRole('button', { name: '회원가입' });

      // When
      fireEvent.click(toggleButton);

      // Then
      expect(screen.queryByText(/오류가 발생했습니다/)).not.toBeInTheDocument();
    });

    it('When form validation fails, Then should show required field errors', () => {
      // Given
      render(<AuthForm />);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      // When
      fireEvent.click(submitButton);

      // Then
      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
}); 