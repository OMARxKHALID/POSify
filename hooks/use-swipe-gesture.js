/**
 * Custom hook for detecting swipe gestures
 * Supports swipe left/right with configurable thresholds
 */

import { useRef, useCallback } from "react";

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeMove,
  threshold = 50,
  preventDefaultTouchmoveEvent = false,
}) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);
  const touchEndY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }

      if (touchStartX.current && touchStartY.current) {
        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        const deltaX = touchStartX.current - currentX;
        const deltaY = touchStartY.current - currentY;

        // Only call onSwipeMove for horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          onSwipeMove?.(deltaX);
        }
      }
    },
    [onSwipeMove, preventDefaultTouchmoveEvent]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartX.current || !touchStartY.current) return;

      touchEndX.current = e.changedTouches[0].clientX;
      touchEndY.current = e.changedTouches[0].clientY;

      const deltaX = touchStartX.current - touchEndX.current;
      const deltaY = touchStartY.current - touchEndY.current;

      // Check if it's a horizontal swipe (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            // Swipe left
            onSwipeLeft?.(deltaX);
          } else {
            // Swipe right
            onSwipeRight?.(Math.abs(deltaX));
          }
        }
      }

      // Reset values
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
