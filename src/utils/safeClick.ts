import React, { useRef } from 'react';

// Map of active single-click timers per DOM element to support debouncing
// against multi-clicks (double-click word selection)
const clickTimerMap = new WeakMap<Element, any>();

/**
 * Records the initial mouse coordinates when the user presses down on an element.
 * This lets us accurately measure if the user was dragging the mouse (e.g., to highlight text).
 */
export function handleSafeMouseDown(e: React.MouseEvent) {
  const currentTarget = e.currentTarget as HTMLElement;
  if (!currentTarget) return;
  currentTarget.dataset.safeClickStartX = String(e.clientX);
  currentTarget.dataset.safeClickStartY = String(e.clientY);
}

/**
 * Executes `action` ONLY if the user performed an intentional single click.
 * Completely suppresses execution if:
 * 1. The user was dragging the mouse to highlight/select text (distance > 4px).
 * 2. The user double-clicked or triple-clicked to select words/sentences (e.detail > 1).
 * 3. Text is currently highlighted/selected on the page.
 * 4. The click originated from an interactive element (button, link, input, select, textarea, etc.).
 * 
 * Uses a 200ms debounce to give the browser time to register a double-click or text selection.
 * If the user double-clicks (e.detail > 1), the timer is immediately cancelled.
 */
export function handleSafeClick(
  e: React.MouseEvent,
  action: () => void,
  delay = 200
) {
  const currentTarget = e.currentTarget as HTMLElement;
  const target = e.target as HTMLElement;

  // 1. If click originated on an interactive child or designated non-triggering element, ignore
  if (target && target.closest('button, a, input, select, textarea, [data-no-row-click]')) {
    return;
  }

  // 2. Multi-click check: e.detail > 1 means double-click or triple-click
  // (user is double-clicking to select/highlight a word or sentence)
  if (e.detail > 1) {
    if (currentTarget && clickTimerMap.has(currentTarget)) {
      clearTimeout(clickTimerMap.get(currentTarget));
      clickTimerMap.delete(currentTarget);
    }
    return;
  }

  // 3. Mouse drag check: user dragged the mouse across text to highlight it
  if (currentTarget && currentTarget.dataset.safeClickStartX !== undefined) {
    const startX = parseFloat(currentTarget.dataset.safeClickStartX);
    const startY = parseFloat(currentTarget.dataset.safeClickStartY || '0');
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist > 4) {
      if (clickTimerMap.has(currentTarget)) {
        clearTimeout(clickTimerMap.get(currentTarget));
        clickTimerMap.delete(currentTarget);
      }
      return;
    }
  }

  // 4. Text is already highlighted/selected on the screen
  if (typeof window !== 'undefined') {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      if (currentTarget && clickTimerMap.has(currentTarget)) {
        clearTimeout(clickTimerMap.get(currentTarget));
        clickTimerMap.delete(currentTarget);
      }
      return;
    }
  }

  // 5. Debounce single click:
  // If the user is about to perform a double-click, click 2 will arrive within ~200ms.
  // Click 2 will hit rule #2 above (e.detail > 1) and abort this timer completely.
  if (currentTarget && clickTimerMap.has(currentTarget)) {
    clearTimeout(clickTimerMap.get(currentTarget));
    clickTimerMap.delete(currentTarget);
  }

  if (currentTarget) {
    const timer = setTimeout(() => {
      clickTimerMap.delete(currentTarget);
      // Double check active selection right before triggering
      if (typeof window !== 'undefined') {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          return;
        }
      }
      action();
    }, delay);

    clickTimerMap.set(currentTarget, timer);
  } else {
    action();
  }
}

/**
 * Helper to spread on any element (tr, div, card, row) to make its click safe from text highlighting.
 * Works inside loops (.map()) and everywhere without violating React Hook rules.
 */
export function getSafeClickProps(action: () => void, delay = 200) {
  return {
    onMouseDown: handleSafeMouseDown,
    onClick: (e: React.MouseEvent) => handleSafeClick(e, action, delay),
  };
}

/**
 * Hook version for standalone components (outside loops).
 */
export function useSafeClick(action: () => void, delay = 200) {
  const mouseStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timerRef = useRef<any>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onClick = (e: React.MouseEvent) => {
    // 1. Interactive element
    const target = e.target as HTMLElement;
    if (target && target.closest('button, a, input, select, textarea, [data-no-row-click]')) {
      return;
    }

    // 2. Multi-click (e.g. double click to highlight a word)
    if (e.detail > 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 3. Mouse drag occurred (user dragged across text to highlight/select)
    const dist = Math.hypot(
      e.clientX - mouseStartRef.current.x,
      e.clientY - mouseStartRef.current.y
    );
    if (dist > 4) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 4. Text is actively highlighted / selected
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
    }

    // 5. Short debounce window
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const activeSel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (activeSel && activeSel.toString().trim().length > 0) {
        return;
      }
      action();
    }, delay);
  };

  return { onMouseDown, onClick };
}

/**
 * Direct synchronous check whether the user is selecting text or multi-clicking.
 */
export function isUserSelectingText(e?: React.MouseEvent): boolean {
  if (typeof window === 'undefined') return false;
  if (e && e.detail > 1) return true;
  const sel = window.getSelection();
  return Boolean(sel && sel.toString().trim().length > 0);
}
