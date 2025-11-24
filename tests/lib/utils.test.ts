
import { describe, it, expect } from 'vitest';
import { truncate } from '../../lib/utils';

describe('truncate', () => {
  it('should truncate text correctly when maxLength is smaller than suffix length', () => {
    const text = 'hello world';
    const maxLength = 2;
    const suffix = '...';

    // This is expected to be 'he' because '...' (length 3) cannot fit in 2 chars.
    // So we should fallback to just truncating the text.
    const result = truncate(text, maxLength, suffix);

    expect(result.length).toBeLessThanOrEqual(maxLength);
    expect(result).toBe('he');
  });

  it('should truncate text normally', () => {
    const text = 'hello world';
    const maxLength = 8;
    const suffix = '...';

    // 'hello...'.length is 8
    const result = truncate(text, maxLength, suffix);
    expect(result).toBe('hello...');
    expect(result.length).toBe(maxLength);
  });

  it('should not truncate if text is shorter than maxLength', () => {
    const text = 'hello';
    const maxLength = 10;

    const result = truncate(text, maxLength);
    expect(result).toBe('hello');
  });
});
