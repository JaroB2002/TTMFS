"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import { CapsuleMark } from "@/components/CapsuleMark";
import { PromptCycle } from "@/components/PromptCycle";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { YearScrubber } from "@/components/YearScrubber";
import type { ScheduleMode } from "@/lib/schedule";

type Result = {
  token: string;
  scheduleLabel: string;
  revealPath: string;
  deliverAt?: string;
};

export function CapsuleDesk() {
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [body, setBody] = useState("");
  const [audio, setAudio] = useState<{ mime: string; base64: string } | null>(
    null,
  );
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("random");
  const [years, setYears] = useState(0.2);
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

  const ready = Boolean(body.trim() || audio);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const usingExact = scheduleMode === "chosen" && useExact;
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          email: email.trim() || undefined,
          mode: scheduleMode,
          preset: usingExact ? "custom" : "horizon",
          customDate: usingExact ? customDate : undefined,
          customTime: scheduleMode === "chosen" ? customTime : undefined,
          horizonYears: usingExact ? undefined : years,
          timezoneOffset: new Date().getTimezoneOffset(),
          audioMime: audio?.mime,
          audioBase64: audio?.base64,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send.");
      setResult(data);
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
    await navigator.clipboard.writeText(
      `${window.location.origin}${result.revealPath}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <AnimatePresence mode="wait">
      {!result ? (
        <motion.form
          key="desk"
          className="desk"
          onSubmit={send}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="desk-left">
            <div className="desk-head">
              <CapsuleMark className="desk-mark" />
              <PromptCycle
                onPick={(prompt) => {
                  setMode("text");
                  setBody((prev) => (prev ? prev : prompt));
                }}
              />
            </div>

            <div className="mode-pills" role="tablist">
              <button
                type="button"
                role="tab"
                className={mode === "voice" ? "on" : ""}
                aria-selected={mode === "voice"}
                onClick={() => setMode("voice")}
              >
                Voice
              </button>
              <button
                type="button"
                role="tab"
                className={mode === "text" ? "on" : ""}
                aria-selected={mode === "text"}
                onClick={() => setMode("text")}
              >
                Text
              </button>
            </div>

            {mode === "voice" ? (
              <VoiceRecorder large onChange={setAudio} />
            ) : (
              <label className="field">
                <span>Your message</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  maxLength={8000}
                  placeholder="Hey future me…"
                />
              </label>
            )}

            {mode === "voice" && (
              <button
                type="button"
                className="btn text"
                onClick={() => setMode("text")}
              >
                Prefer to type instead?
              </button>
            )}
            {mode === "text" && (
              <div className="field" style={{ marginTop: "0.75rem" }}>
                <span>Optional voice</span>
                <VoiceRecorder onChange={setAudio} />
              </div>
            )}
          </div>

          <div className="desk-right">
            <div className="desk-block">
              <div className="desk-label-row">
                <span className="desk-label">Return date</span>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setScheduleMode((m) =>
                      m === "random" ? "chosen" : "random",
                    );
                    setUseExact(false);
                  }}
                >
                  {scheduleMode === "random" ? "or pick a moment" : "or surprise me"}
                </button>
              </div>

              {scheduleMode === "random" || !useExact ? (
                <YearScrubber
                  years={years}
                  onChange={setYears}
                  mode={scheduleMode}
                />
              ) : null}

              {scheduleMode === "chosen" && (
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
                    className="linkish"
                    onClick={() => setUseExact((v) => !v)}
                  >
                    {useExact ? "use the scrubber" : "pick an exact date"}
                  </button>
                  {useExact && (
                    <div className="field-row">
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
            </div>

            <div className="desk-block">
              <span className="desk-label">We’ll email you a link</span>
              <label className="field">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </label>
              <p className="fineprint">
                Optional. The secret link alone is enough — email just helps you
                find it later. No spam.
              </p>
            </div>

            {error && <p className="error">{error}</p>}

            <button
              type="submit"
              className="btn send"
              disabled={!ready || busy || (useExact && !customDate)}
            >
              {busy ? "Sending…" : "Send it"}
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.section
          key="done"
          className="desk desk-done"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="done-copy">
            <p className="eyebrow">Sealed</p>
            <h2>It’s on its way.</h2>
            <p className="lede">
              {result.scheduleLabel}. Save this private link — that’s your key.
            </p>
            <div className="link-box">
              <code>{`${typeof window !== "undefined" ? window.location.origin : ""}${result.revealPath}`}</code>
            </div>
            <div className="actions">
              <button type="button" className="btn send" onClick={copyLink}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="btn ghost" href={result.revealPath}>
                Open capsule
              </a>
              <button
                type="button"
                className="btn text"
                onClick={() => {
                  setResult(null);
                  setBody("");
                  setAudio(null);
                  setEmail("");
                }}
              >
                Send another
              </button>
            </div>
          </div>
          <CapsuleMark className="done-mark" />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
