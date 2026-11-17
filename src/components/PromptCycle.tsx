"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const PROMPTS = [
  "Make a bold prediction.",
  "What does an ordinary Tuesday feel like right now?",
  "What are you quietly proud of today?",
  "Ask future-you one honest question.",
  "What should you remember about being this age?",
  "Say the thing you’re afraid to write down.",
  "Describe one smell, one sound, one hope.",
  "What do you hope hasn’t changed?",
];

export function PromptCycle({
  onPick,
}: {
  onPick?: (prompt: string) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PROMPTS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const prompt = PROMPTS[index]!;

  return (
    <div className="prompt-cycle">
      <AnimatePresence mode="wait">
        <motion.p
          key={prompt}
          className="prompt-text"
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {prompt}
        </motion.p>
      </AnimatePresence>
      {onPick && (
        <button
          type="button"
          className="prompt-use"
          onClick={() => onPick(prompt)}
        >
          use this prompt
        </button>
      )}
    </div>
  );
}
