

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


      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {

            onSwipeLeft?.(deltaX);
          } else {

            onSwipeRight?.(Math.abs(deltaX));
          }
        }
      }


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
