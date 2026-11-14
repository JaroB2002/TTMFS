"use client";

import { useEffect, useRef } from "react";

type Props = {
  intensity?: number;
  className?: string;
};

export function PortalField({ intensity = 1, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    function onMove(e: PointerEvent) {
      const rect = root!.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 28 * intensity;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 18 * intensity;
    }

    function tick() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      root!.style.setProperty("--px", `${cx.toFixed(2)}px`);
      root!.style.setProperty("--py", `${cy.toFixed(2)}px`);
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [intensity]);

  return (
    <div ref={rootRef} className={`portal-field ${className}`} aria-hidden>
      <div className="portal-haze" />
      <div className="portal-ring portal-ring-a" />
      <div className="portal-ring portal-ring-b" />
      <div className="portal-core" />
      <div className="portal-grain" />
      <svg className="portal-arc" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="portalStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0ebe3" stopOpacity="0" />
            <stop offset="45%" stopColor="#f0ebe3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e8372f" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle
          cx="300"
          cy="300"
          r="210"
          fill="none"
          stroke="url(#portalStroke)"
          strokeWidth="1.2"
          strokeDasharray="6 14"
          className="portal-dash"
        />
        <path
          d="M90 320 C160 120, 440 120, 510 320"
          fill="none"
          stroke="rgba(240,235,227,0.22)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
