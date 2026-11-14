"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setOn(true);

    function move(e: PointerEvent) {
      setPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  if (!on) return null;

  return (
    <div
      className="cursor-glow"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      aria-hidden
    />
  );
}
