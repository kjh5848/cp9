import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label Component', () => {
  describe('Given a Label component', () => {
    it('When rendered with default props, Then should display correctly', () => {
      // Given
      const labelText = 'Test Label';

      // When
      render(<Label data-testid="label">{labelText}</Label>);

      // Then
      const label = screen.getByTestId('label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveTextContent(labelText);
      expect(label).toHaveClass('text-sm', 'font-medium');
    });

    it('When htmlFor is provided, Then should set for attribute correctly', () => {
      // Given
      const labelText = 'Input Label';
      const inputId = 'test-input';

      // When
      render(<Label htmlFor={inputId} data-testid="label">{labelText}</Label>);

      // Then
      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('for', inputId);
    });

    it('When custom className is provided, Then should merge with default classes', () => {
      // Given
      const customClass = 'custom-label-class';
      const labelText = 'Custom Label';

      // When
      render(<Label className={customClass} data-testid="label">{labelText}</Label>);
      const label = screen.getByTestId('label');

      // Then
      expect(label).toHaveClass(customClass);
      expect(label).toHaveClass('text-sm'); // default class should still be present
    });

    it('When used with Input component, Then should provide proper association', () => {
      // Given
      const labelText = 'Email';
      const inputId = 'email-input';

      // When
      render(
        <div>
          <Label htmlFor={inputId} data-testid="label">{labelText}</Label>
          <input id={inputId} type="email" data-testid="input" />
        </div>
      );

      // Then
      const label = screen.getByTestId('label');
      const input = screen.getByTestId('input');
      expect(label).toHaveAttribute('for', inputId);
      expect(input).toHaveAttribute('id', inputId);
    });

    it('When peer disabled variant is used, Then should apply peer disabled styles', () => {
      // Given
      const labelText = 'Disabled Label';

      // When
      render(
        <div>
          <input disabled data-testid="disabled-input" />
          <Label data-testid="label" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {labelText}
          </Label>
        </div>
      );

      // Then
      const label = screen.getByTestId('label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });
  });
}); 