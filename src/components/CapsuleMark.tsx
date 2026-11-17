export function CapsuleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden
    >
      <circle
        cx="80"
        cy="80"
        r="54"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="4 8"
        opacity="0.55"
      />
      <circle cx="80" cy="80" r="36" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M80 28 L104 80 L80 132 L56 80 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="rgba(139,233,255,0.08)"
      />
      <circle cx="80" cy="80" r="5" fill="#ff5a3c" />
      <path
        d="M18 92 L48 70"
        stroke="#8be9ff"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <path
        d="M112 52 L146 38"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
      />
    </svg>
  );
}
