import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  describe('Given a Button component', () => {
    it('When rendered with default props, Then should display correctly', () => {
      // Given
      const buttonText = 'Click me';

      // When
      render(<Button>{buttonText}</Button>);

      // Then
      const button = screen.getByRole('button', { name: buttonText });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('When rendered with different variants, Then should apply correct styles', () => {
      // Given
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      variants.forEach((variant) => {
        // When
        render(<Button variant={variant} data-testid={`button-${variant}`}>Test</Button>);

        // Then
        const button = screen.getByTestId(`button-${variant}`);
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('inline-flex');
      });
    });

    it('When rendered with different sizes, Then should apply correct dimensions', () => {
      // Given
      const sizes = ['default', 'sm', 'lg', 'icon'] as const;

      sizes.forEach((size) => {
        // When
        render(<Button size={size} data-testid={`button-${size}`}>Test</Button>);

        // Then
        const button = screen.getByTestId(`button-${size}`);
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('inline-flex');
      });
    });

    it('When clicked, Then should trigger onClick handler', () => {
      // Given
      const handleClick = vi.fn();
      const buttonText = 'Click me';

      // When
      render(<Button onClick={handleClick}>{buttonText}</Button>);
      const button = screen.getByRole('button', { name: buttonText });
      fireEvent.click(button);

      // Then
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('When disabled, Then should not trigger onClick handler', () => {
      // Given
      const handleClick = vi.fn();
      const buttonText = 'Disabled button';

      // When
      render(<Button onClick={handleClick} disabled>{buttonText}</Button>);
      const button = screen.getByRole('button', { name: buttonText });
      fireEvent.click(button);

      // Then
      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it('When custom className is provided, Then should merge with default classes', () => {
      // Given
      const customClass = 'custom-test-class';
      const buttonText = 'Custom button';

      // When
      render(<Button className={customClass}>{buttonText}</Button>);
      const button = screen.getByRole('button', { name: buttonText });

      // Then
      expect(button).toHaveClass(customClass);
      expect(button).toHaveClass('inline-flex'); // default class should still be present
    });

    it('When asChild is true, Then should render as span', () => {
      // Given
      const buttonText = 'Span button';

      // When
      render(<Button asChild>{buttonText}</Button>);

      // Then
      const element = screen.getByText(buttonText);
      expect(element.tagName).toBe('SPAN');
    });
  });
}); 