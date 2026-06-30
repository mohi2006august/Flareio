import { useRef, useCallback } from 'react';

/**
 * Hook that adds a 3D perspective tilt effect to a card
 * based on mouse position relative to the card.
 */
export function use3DTilt(options = {}) {
  const {
    maxTilt = 12,
    perspective = 800,
    scale = 1.03,
    glareOpacity = 0.15,
    speed = 400,
  } = options;

  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const animRef = useRef(null);
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    const cx = currentTilt.current;
    const tx = targetTilt.current;
    cx.x += (tx.x - cx.x) * 0.12;
    cx.y += (tx.y - cx.y) * 0.12;

    if (cardRef.current) {
      cardRef.current.style.transform = `
        perspective(${perspective}px)
        rotateX(${cx.x}deg)
        rotateY(${cx.y}deg)
        scale3d(${scale}, ${scale}, ${scale})
        translateZ(10px)
      `;
    }
    if (glareRef.current) {
      const glareX = 50 + cx.y * 3;
      const glareY = 50 - cx.x * 3;
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [perspective, scale, glareOpacity]);

  const onMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const normX = dx / (rect.width / 2);
    const normY = dy / (rect.height / 2);
    targetTilt.current.x = -normY * maxTilt;
    targetTilt.current.y = normX * maxTilt;
    if (!animRef.current) {
      animRef.current = requestAnimationFrame(animate);
    }
  }, [maxTilt, animate]);

  const onMouseLeave = useCallback(() => {
    targetTilt.current = { x: 0, y: 0 };
    // Let animation smoothly return to 0, then stop
    const checkDone = () => {
      const cx = currentTilt.current;
      if (Math.abs(cx.x) < 0.05 && Math.abs(cx.y) < 0.05) {
        cx.x = 0; cx.y = 0;
        if (cardRef.current) {
          cardRef.current.style.transform = '';
        }
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      } else {
        animRef.current = requestAnimationFrame(checkDone);
      }
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(checkDone);
  }, []);

  return { cardRef, glareRef, onMouseMove, onMouseLeave };
}
