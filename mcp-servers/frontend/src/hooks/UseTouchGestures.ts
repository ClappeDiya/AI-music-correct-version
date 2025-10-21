import { useEffect, useRef } from "react";

interface TouchGestureOptions {
  onPinchZoom?: (scale: number, centerX: number, centerY: number) => void;
  onPanMove?: (deltaX: number, deltaY: number) => void;
  onRotate?: (angle: number) => void;
}

export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: TouchGestureOptions,
) {
  const gestureRef = useRef({
    startDistance: 0,
    startAngle: 0,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getDistance = (touches: TouchList) => {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (touches: TouchList) => {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.atan2(dy, dx);
    };

    const getCenter = (touches: TouchList) => {
      const x = (touches[0].clientX + touches[1].clientX) / 2;
      const y = (touches[0].clientY + touches[1].clientY) / 2;
      return { x, y };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        gestureRef.current.startDistance = getDistance(e.touches);
        gestureRef.current.startAngle = getAngle(e.touches);
      } else if (e.touches.length === 1) {
        gestureRef.current.lastX = e.touches[0].clientX;
        gestureRef.current.lastY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / gestureRef.current.startDistance;
        const center = getCenter(e.touches);

        if (options.onPinchZoom) {
          options.onPinchZoom(scale, center.x, center.y);
        }

        if (options.onRotate) {
          const currentAngle = getAngle(e.touches);
          const rotation = currentAngle - gestureRef.current.startAngle;
          options.onRotate(rotation);
        }
      } else if (e.touches.length === 1 && options.onPanMove) {
        const deltaX = e.touches[0].clientX - gestureRef.current.lastX;
        const deltaY = e.touches[0].clientY - gestureRef.current.lastY;
        options.onPanMove(deltaX, deltaY);

        gestureRef.current.lastX = e.touches[0].clientX;
        gestureRef.current.lastY = e.touches[0].clientY;
      }
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [elementRef, options]);
}
