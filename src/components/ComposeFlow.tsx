"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import { KineticTitle } from "@/components/KineticTitle";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { YearScrubber } from "@/components/YearScrubber";
import type { ScheduleMode } from "@/lib/schedule";

type Step = "message" | "when" | "seal" | "done";

type Result = {
  token: string;
  scheduleLabel: string;
  revealPath: string;
  deliverAt?: string;
};

const panelMotion = {
  initial: { opacity: 0, y: 36, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, filter: "blur(6px)" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function ComposeFlow() {
  const [step, setStep] = useState<Step>("message");
  const [body, setBody] = useState("");
  const [audio, setAudio] = useState<{ mime: string; base64: string } | null>(
    null,
  );
  const [mode, setMode] = useState<ScheduleMode>("random");
  const [years, setYears] = useState(1);
  const [useExact, setUseExact] = useState(false);
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
  const isLocal = process.env.NODE_ENV !== "production";

  async function seal(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const usingExact = mode === "chosen" && useExact;
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          email: email.trim() || undefined,
          mode,
          preset: usingExact ? "custom" : "horizon",
          customDate: usingExact ? customDate : undefined,
          customTime: mode === "chosen" ? customTime : undefined,
          horizonYears: usingExact ? undefined : years,
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

  async function sealInstant() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          mode: "chosen",
          preset: "instant",
          timezoneOffset: new Date().getTimezoneOffset(),
          audioMime: audio?.mime,
          audioBase64: audio?.base64,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed.");
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
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
          <motion.section key="message" className="panel" {...panelMotion}>
            <KineticTitle
              as="h2"
              className="sm"
              lines={["What should", "future-you hear?"]}
            />
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
              <span>Voice</span>
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
          <motion.section key="when" className="panel" {...panelMotion}>
            <KineticTitle
              as="h2"
              className="sm"
              lines={["How far into", "the future?"]}
            />
            <p className="lede">
              Drag the horizon — or lock an exact date and time of day.
            </p>

            <div className="mode-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "random"}
                className={mode === "random" ? "on" : ""}
                onClick={() => {
                  setMode("random");
                  setUseExact(false);
                }}
              >
                Surprise me
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "chosen"}
                className={mode === "chosen" ? "on" : ""}
                onClick={() => setMode("chosen")}
              >
                Exact arrival
              </button>
            </div>

            {!useExact && (
              <YearScrubber years={years} onChange={setYears} mode={mode} />
            )}

            {mode === "chosen" && (
              <>
                <label className="field">
                  <span>Time of day</span>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="btn text"
                  onClick={() => setUseExact((v) => !v)}
                >
                  {useExact ? "Use the scrubber instead" : "Or pick an exact date"}
                </button>

                {useExact && (
                  <div className="exact-block field-row">
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
                    <label className="field">
                      <span>Time</span>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </>
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
                disabled={useExact && !customDate}
                onClick={() => setStep("seal")}
              >
                Continue
              </button>
            </div>
          </motion.section>
        )}

        {step === "seal" && (
          <motion.section key="seal" className="panel" {...panelMotion}>
            <KineticTitle
              as="h2"
              className="sm"
              lines={["Seal the", "capsule"]}
            />
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
                No newsletters. The link alone opens your message when the time
                comes.
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
                <button type="submit" className="btn signal" disabled={busy}>
                  {busy ? "Sealing…" : "Seal it"}
                </button>
                {isLocal && (
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={busy}
                    onClick={sealInstant}
                  >
                    Instant (local)
                  </button>
                )}
              </div>
            </form>
          </motion.section>
        )}

        {step === "done" && result && (
          <motion.section key="done" className="panel" {...panelMotion}>
            <p className="eyebrow">Sealed</p>
            <KineticTitle
              as="h2"
              className="sm"
              lines={["Save this", "link"]}
            />
            <p className="lede">
              {result.scheduleLabel}. Open it later — until then it stays
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
              Bookmark it. Without login, this link is the key.
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
