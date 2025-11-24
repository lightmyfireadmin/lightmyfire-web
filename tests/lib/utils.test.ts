import { describe, it, expect } from 'vitest';
import { truncate } from '../../lib/utils';

describe('truncate', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncate('hello world', 5)).toBe('he...');
  });

  it('should not truncate text shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should not truncate text equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should use custom suffix', () => {
    expect(truncate('hello world', 5, '..')).toBe('hel..');
  });

  it('should handle maxLength smaller than suffix length', () => {
    expect(truncate('hello world', 2, '...')).toBe('he');
    expect(truncate('hello world', 2, '...').length).toBe(2);
  });
});
