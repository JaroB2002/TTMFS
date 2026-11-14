"use client";

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden>
      <div className="atm-noise" />
      <div className="atm-scan" />
      <svg className="atm-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#c8ff3d" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c8ff3d" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g className="atm-orbit">
          <ellipse
            cx="860"
            cy="220"
            rx="260"
            ry="120"
            fill="none"
            stroke="url(#ring)"
            strokeWidth="1"
          />
          <ellipse
            cx="860"
            cy="220"
            rx="180"
            ry="80"
            fill="none"
            stroke="rgba(200,255,61,0.18)"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
          <circle cx="860" cy="220" r="6" fill="#c8ff3d" className="atm-pulse" />
        </g>

        <g className="atm-shard">
          <path
            d="M70 510 L210 430 L250 610 Z"
            fill="rgba(200,255,61,0.05)"
            stroke="url(#edge)"
            strokeWidth="1.2"
          />
          <path
            d="M160 640 L320 560 L290 720 Z"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
        </g>

        <g className="atm-constellation">
          <path
            d="M180 120 L320 90 L410 170 L300 220 Z"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <circle cx="180" cy="120" r="3" fill="#fff" />
          <circle cx="320" cy="90" r="2.5" fill="#c8ff3d" />
          <circle cx="410" cy="170" r="3" fill="#fff" />
          <circle cx="300" cy="220" r="2" fill="#fff" />
        </g>

        <g className="atm-slash">
          <path
            d="M980 620 L1180 480"
            stroke="rgba(200,255,61,0.35)"
            strokeWidth="2"
          />
          <path
            d="M1000 680 L1160 560"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        </g>
      </svg>
      <div className="atm-flare" />
      <div className="atm-cut" />
    </div>
  );
}
