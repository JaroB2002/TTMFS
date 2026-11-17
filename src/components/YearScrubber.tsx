"use client";

import { useMemo } from "react";

type Props = {
  years: number;
  onChange: (years: number) => void;
  mode: "random" | "chosen";
};

export function YearScrubber({ years, onChange, mode }: Props) {
  const label = useMemo(() => {
    if (years < 0.03) return mode === "random" ? "Within days" : "Tomorrow";
    if (years < 0.1) return mode === "random" ? "Within weeks" : "In a week";
    if (years < 0.3) return mode === "random" ? "Within months" : "In a month";
    if (years < 1.2) {
      return mode === "random" ? "Within a year" : "In one year";
    }
    const rounded = Math.round(years);
    return mode === "random"
      ? `Within ${rounded} years`
      : `In ${rounded} years`;
  }, [years, mode]);

  const yearMark = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + Math.max(0, Math.round(years)));
    return d.getFullYear();
  }, [years]);

  return (
    <div className="scrubber">
      <div className="scrubber-readout">
        <span className="scrubber-label">{label}</span>
        <span className="scrubber-year">{yearMark}</span>
      </div>
      <input
        className="scrubber-range"
        type="range"
        min={0}
        max={20}
        step={0.05}
        value={years}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="How far into the future"
      />
      <div className="scrubber-ticks" aria-hidden>
        <span>now</span>
        <span>5y</span>
        <span>10y</span>
        <span>20y</span>
      </div>
    </div>
  );
}
