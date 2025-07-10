import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js Image component
import { vi } from 'vitest';

interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: MockImageProps) =>
    React.createElement('img', { src, alt, width, height, ...props }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
})); 