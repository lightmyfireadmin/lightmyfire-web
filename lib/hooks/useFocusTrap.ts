import { useEffect, useRef } from 'react';

/**
 * useFocusTrap Hook
 * Traps keyboard focus within a given element to ensure Tab navigation stays contained
 * Useful for modals, menus, and other modal-like components
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const initialActiveElement = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const focusableSelector = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => {
        return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        // Shift + Tab: move to previous element or wrap to last
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move to next element or wrap to first
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Try to focus the first interactive element when trap is activated
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the initial element when trap is deactivated
      if (initialActiveElement && initialActiveElement.focus) {
        initialActiveElement.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
