import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  describe('Given multiple class names', () => {
    it('When passed string classes, Then should merge them correctly', () => {
      // Given
      const class1 = 'text-blue-500';
      const class2 = 'bg-white';
      const class3 = 'p-4';

      // When
      const result = cn(class1, class2, class3);

      // Then
      expect(result).toBe('text-blue-500 bg-white p-4');
    });

    it('When passed conflicting Tailwind classes, Then should resolve conflicts', () => {
      // Given
      const conflictingClasses = 'p-2 p-4'; // p-4 should override p-2

      // When
      const result = cn(conflictingClasses);

      // Then
      expect(result).toBe('p-4');
    });

    it('When passed conditional classes, Then should handle truthy/falsy values', () => {
      // Given
      const baseClass = 'base-class';
      const conditionalClass = true && 'conditional-class';
      const falsyClass = false && 'falsy-class';

      // When
      const result = cn(baseClass, conditionalClass, falsyClass);

      // Then
      expect(result).toBe('base-class conditional-class');
    });

    it('When passed array of classes, Then should handle arrays correctly', () => {
      // Given
      const classArray = ['class1', 'class2'];
      const singleClass = 'class3';

      // When
      const result = cn(classArray, singleClass);

      // Then
      expect(result).toBe('class1 class2 class3');
    });

    it('When passed undefined or null, Then should ignore them', () => {
      // Given
      const validClass = 'valid-class';
      const undefinedClass = undefined;
      const nullClass = null;

      // When
      const result = cn(validClass, undefinedClass, nullClass);

      // Then
      expect(result).toBe('valid-class');
    });
  });
}); 