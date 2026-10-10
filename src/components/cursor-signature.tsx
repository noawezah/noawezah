'use client';
import { useEffect, useRef } from 'react';

export function CursorSignature({ disabled }: { disabled: boolean }) {
  const stamp = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = stamp.current;
    if (!node || disabled) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let x = 0, y = 0;
    const hide = () => { delete node.dataset.visible; };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== 'mouse') { hide(); return; }
      if (!(event.target as Element)?.closest('.work-chapter') || (event.target as Element)?.closest('input,textarea,iframe')) { hide(); return; }
      x = Math.min(event.clientX + 20, window.innerWidth - 42);
      y = Math.min(event.clientY + 20, window.innerHeight - 42);
      node.dataset.visible = 'true';
      if (!frame) frame = requestAnimationFrame(() => {
        node.style.transform = `translate3d(${x}px,${y}px,0)`;
        frame = 0;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', hide);
    window.addEventListener('keydown', hide);
    window.addEventListener('scroll', hide, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    fine.addEventListener('change', hide);
    return () => {
      cancelAnimationFrame(frame);
      hide();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', hide);
      window.removeEventListener('keydown', hide);
      window.removeEventListener('scroll', hide);
      document.documentElement.removeEventListener('pointerleave', hide);
      fine.removeEventListener('change', hide);
    };
  }, [disabled]);
  return <span ref={stamp} className="cursor-signature" aria-hidden="true"><span>n.</span></span>;
}
