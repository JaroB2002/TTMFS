export function CapsuleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <ellipse
        cx="60"
        cy="60"
        rx="38"
        ry="48"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M36 58c8-14 40-14 48 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="72" r="4" fill="currentColor" />
      <path
        d="M60 28v10M48 34l12 8 12-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
