import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Given an Input component', () => {
    it('When rendered with default props, Then should display correctly', () => {
      // Given
      const placeholder = 'Enter text';

      // When
      render(<Input placeholder={placeholder} data-testid="input" />);

      // Then
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', placeholder);
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
    });

    it('When value changes, Then should update correctly', () => {
      // Given
      const initialValue = 'initial';
      const newValue = 'new value';
      const handleChange = vi.fn();

      // When
      render(<Input value={initialValue} onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      // Then
      expect(input.value).toBe(initialValue);

      // When
      fireEvent.change(input, { target: { value: newValue } });

      // Then
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: newValue })
      }));
    });

    it('When different types are provided, Then should set type correctly', () => {
      // Given
      const types = ['text', 'password', 'email', 'number'] as const;

      types.forEach((type) => {
        // When
        render(<Input type={type} data-testid={`input-${type}`} />);

        // Then
        const input = screen.getByTestId(`input-${type}`);
        expect(input).toHaveAttribute('type', type);
      });
    });

    it('When disabled is true, Then should be disabled', () => {
      // Given
      const placeholder = 'Disabled input';

      // When
      render(<Input placeholder={placeholder} disabled data-testid="input" />);

      // Then
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('When focused, Then should have focus styles', () => {
      // Given
      const placeholder = 'Focus input';

      // When
      render(<Input placeholder={placeholder} data-testid="input" />);
      const input = screen.getByTestId('input');

      // Then
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('When custom className is provided, Then should merge with default classes', () => {
      // Given
      const customClass = 'custom-input-class';
      const placeholder = 'Custom input';

      // When
      render(<Input className={customClass} placeholder={placeholder} data-testid="input" />);
      const input = screen.getByTestId('input');

      // Then
      expect(input).toHaveClass(customClass);
      expect(input).toHaveClass('flex'); // default class should still be present
    });

    it('When ref is provided, Then should forward ref correctly', () => {
      // Given
      const inputRef = { current: null };

      // When
      render(<Input ref={inputRef} data-testid="input" />);
      const input = screen.getByTestId('input');

      // Then
      expect(inputRef.current).toBe(input);
    });
  });
}); 