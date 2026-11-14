"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { ScheduleMode, SchedulePreset } from "@/lib/schedule";

type Step = "message" | "when" | "seal" | "done";

type Result = {
  token: string;
  scheduleLabel: string;
  revealPath: string;
  deliverAt?: string;
};

const CHOSEN: { id: SchedulePreset; label: string; note: string }[] = [
  { id: "tomorrow", label: "Tomorrow", note: "Next day" },
  { id: "week", label: "One week", note: "In 7 days" },
  { id: "month", label: "One month", note: "~30 days" },
  { id: "year", label: "One year", note: "A full orbit" },
  { id: "five_years", label: "Five years", note: "Far ahead" },
  { id: "twenty_years", label: "Twenty years", note: "Almost a life" },
  { id: "custom", label: "Exact moment", note: "Date + time" },
  ...(process.env.NODE_ENV !== "production"
    ? [{ id: "instant" as const, label: "Now (local)", note: "Opens instantly" }]
    : []),
];

const RANDOM: { id: SchedulePreset; label: string; note: string }[] = [
  { id: "week", label: "Within a week", note: "Tomorrow → 7 days" },
  {
    id: "surprise_year",
    label: "Within a year",
    note: "Any moment in 12 months",
  },
  {
    id: "surprise_decade",
    label: "Within ten years",
    note: "A long surprise",
  },
  {
    id: "surprise_lifetime",
    label: "Within twenty years",
    note: "Tomorrow → 20 years",
  },
];

const panelMotion = {
  initial: { opacity: 0, y: 28, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(4px)" },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

export function ComposeFlow() {
  const [step, setStep] = useState<Step>("message");
  const [body, setBody] = useState("");
  const [audio, setAudio] = useState<{ mime: string; base64: string } | null>(
    null,
  );
  const [mode, setMode] = useState<ScheduleMode>("random");
  const [preset, setPreset] = useState<SchedulePreset>("surprise_year");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("09:00");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 20);
    return d.toISOString().slice(0, 10);
  }, []);

  const canContinueMessage = body.trim().length > 0 || !!audio;
  const showDate = mode === "chosen" && preset === "custom";
  const showTime = mode === "chosen" && preset !== "instant";

  async function seal(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          email: email.trim() || undefined,
          mode,
          preset,
          customDate: preset === "custom" ? customDate : undefined,
          customTime:
            mode === "chosen" && preset !== "instant" ? customTime : undefined,
          timezoneOffset: new Date().getTimezoneOffset(),
          audioMime: audio?.mime,
          audioBase64: audio?.base64,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not seal message.");
      }
      setResult(data);
      setStep("done");
      try {
        localStorage.setItem(
          "ttmfs:last",
          JSON.stringify({
            token: data.token,
            scheduleLabel: data.scheduleLabel,
            at: Date.now(),
          }),
        );
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    const url = `${window.location.origin}${result.revealPath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="compose">
      <ol className="steps" aria-label="Steps">
        {(
          [
            ["message", "Message"],
            ["when", "When"],
            ["seal", "Seal"],
            ["done", "Keep"],
          ] as const
        ).map(([id, label], index) => (
          <li
            key={id}
            className={
              step === id ? "active" : stepOrder(step) > index ? "done" : ""
            }
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {step === "message" && (
          <motion.section
            key="message"
            className="panel panel-frame"
            {...panelMotion}
          >
            <h2>What should future-you hear?</h2>
            <p className="lede">
              A line, a promise, a question. Type it, record it — or both.
            </p>
            <label className="field">
              <span>Text</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                maxLength={8000}
                placeholder="Hey future me…"
              />
            </label>
            <div className="field">
              <span>Or voice</span>
              <VoiceRecorder onChange={setAudio} />
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn primary"
                disabled={!canContinueMessage}
                onClick={() => setStep("when")}
              >
                Choose when
              </button>
            </div>
          </motion.section>
        )}

        {step === "when" && (
          <motion.section
            key="when"
            className="panel panel-frame"
            {...panelMotion}
          >
            <h2>When does it arrive?</h2>
            <p className="lede">
              Lock an exact date and time — or let chance pick a moment between
              tomorrow and twenty years from now.
            </p>

            <div className="mode-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "random"}
                className={mode === "random" ? "on" : ""}
                onClick={() => {
                  setMode("random");
                  setPreset("surprise_year");
                }}
              >
                Surprise
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "chosen"}
                className={mode === "chosen" ? "on" : ""}
                onClick={() => {
                  setMode("chosen");
                  setPreset("year");
                }}
              >
                Choose
              </button>
            </div>

            <div className="preset-grid">
              {(mode === "random" ? RANDOM : CHOSEN).map((option, i) => (
                <motion.button
                  key={option.id}
                  type="button"
                  className={`preset ${preset === option.id ? "selected" : ""}`}
                  onClick={() => setPreset(option.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <strong>{option.label}</strong>
                  <span>{option.note}</span>
                </motion.button>
              ))}
            </div>

            {showTime && (
              <div className="field-row">
                {showDate && (
                  <label className="field">
                    <span>Date</span>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  </label>
                )}
                <label className="field">
                  <span>Time of day</span>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="actions">
              <button
                type="button"
                className="btn text"
                onClick={() => setStep("message")}
              >
                Back
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={mode === "chosen" && preset === "custom" && !customDate}
                onClick={() => setStep("seal")}
              >
                Continue
              </button>
            </div>
          </motion.section>
        )}

        {step === "seal" && (
          <motion.section
            key="seal"
            className="panel panel-frame"
            {...panelMotion}
          >
            <h2>Seal the capsule</h2>
            <p className="lede">
              No account. You get a secret link — that&apos;s the only key.
              Email is optional.
            </p>
            <form onSubmit={seal}>
              <label className="field">
                <span>Email (optional)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <p className="hint">
                No newsletters. The link alone is enough to open your message
                when the time comes.
              </p>
              {error && <p className="error">{error}</p>}
              <div className="actions">
                <button
                  type="button"
                  className="btn text"
                  onClick={() => setStep("when")}
                >
                  Back
                </button>
                <button type="submit" className="btn primary" disabled={busy}>
                  {busy ? "Sealing…" : "Seal it"}
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {step === "done" && result && (
          <motion.section
            key="done"
            className="panel panel-frame"
            {...panelMotion}
          >
            <p className="eyebrow">Sealed</p>
            <h2>Save this link</h2>
            <p className="lede">
              {result.scheduleLabel}. Open the link later — until then it stays
              locked.
            </p>
            <div className="link-box">
              <code>{`${typeof window !== "undefined" ? window.location.origin : ""}${result.revealPath}`}</code>
            </div>
            <div className="actions">
              <button type="button" className="btn primary" onClick={copyLink}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="btn ghost" href={result.revealPath}>
                Open capsule
              </a>
            </div>
            <p className="hint">
              Bookmark it or drop it in your notes. Without login, this link is
              the key.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function stepOrder(step: Step): number {
  return { message: 0, when: 1, seal: 2, done: 3 }[step];
}
