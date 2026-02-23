import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Given a Card component', () => {
    it('When rendered with basic content, Then should display correctly', () => {
      // Given
      const cardContent = 'Card content';

      // When
      render(<Card data-testid="card">{cardContent}</Card>);

      // Then
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-white');
      expect(card).toHaveTextContent(cardContent);
    });

    it('When custom className is provided, Then should merge with default classes', () => {
      // Given
      const customClass = 'custom-card-class';
      const cardContent = 'Custom card';

      // When
      render(<Card className={customClass} data-testid="card">{cardContent}</Card>);
      const card = screen.getByTestId('card');

      // Then
      expect(card).toHaveClass(customClass);
      expect(card).toHaveClass('rounded-lg'); // default class should still be present
    });
  });

  describe('Given a CardHeader component', () => {
    it('When rendered, Then should display with correct styling', () => {
      // Given
      const headerContent = 'Card Header';

      // When
      render(<CardHeader data-testid="card-header">{headerContent}</CardHeader>);

      // Then
      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
      expect(header).toHaveTextContent(headerContent);
    });
  });

  describe('Given a CardTitle component', () => {
    it('When rendered, Then should display as h3 with correct styling', () => {
      // Given
      const titleText = 'Card Title';

      // When
      render(<CardTitle data-testid="card-title">{titleText}</CardTitle>);

      // Then
      const title = screen.getByTestId('card-title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-2xl', 'font-semibold');
      expect(title).toHaveTextContent(titleText);
    });
  });

  describe('Given a CardDescription component', () => {
    it('When rendered, Then should display as p with correct styling', () => {
      // Given
      const descriptionText = 'Card description text';

      // When
      render(<CardDescription data-testid="card-description">{descriptionText}</CardDescription>);

      // Then
      const description = screen.getByTestId('card-description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-gray-500');
      expect(description).toHaveTextContent(descriptionText);
    });
  });

  describe('Given a CardContent component', () => {
    it('When rendered, Then should display with correct styling', () => {
      // Given
      const contentText = 'Card content';

      // When
      render(<CardContent data-testid="card-content">{contentText}</CardContent>);

      // Then
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6', 'pt-0');
      expect(content).toHaveTextContent(contentText);
    });
  });

  describe('Given a CardFooter component', () => {
    it('When rendered, Then should display with correct styling', () => {
      // Given
      const footerContent = 'Card footer';

      // When
      render(<CardFooter data-testid="card-footer">{footerContent}</CardFooter>);

      // Then
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
      expect(footer).toHaveTextContent(footerContent);
    });
  });

  describe('Given a complete Card structure', () => {
    it('When rendered with all components, Then should display correctly', () => {
      // Given
      const title = 'Test Card';
      const description = 'This is a test card';
      const content = 'Card content here';
      const footer = 'Card footer';

      // When
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
          <CardFooter>{footer}</CardFooter>
        </Card>
      );

      // Then
      const card = screen.getByTestId('complete-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      expect(screen.getByText(content)).toBeInTheDocument();
      expect(screen.getByText(footer)).toBeInTheDocument();
    });
  });
}); 