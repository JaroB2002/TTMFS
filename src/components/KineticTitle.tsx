"use client";

import { motion } from "framer-motion";

type Props = {
  lines: string[];
  as?: "h1" | "h2";
  className?: string;
  delay?: number;
};

export function KineticTitle({
  lines,
  as = "h1",
  className = "",
  delay = 0,
}: Props) {
  const Tag = as;
  let charIndex = 0;

  return (
    <Tag className={`kinetic-title ${className}`}>
      {lines.map((line, lineIndex) => (
        <span className="kinetic-line" key={`${line}-${lineIndex}`}>
          {Array.from(line).map((char) => {
            const i = charIndex++;
            return (
              <motion.span
                key={`${lineIndex}-${i}`}
                className="kinetic-char"
                initial={{ y: "110%", opacity: 0, rotate: 4 }}
                animate={{ y: "0%", opacity: 1, rotate: 0 }}
                transition={{
                  duration: 0.85,
                  delay: delay + i * 0.028 + lineIndex * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
