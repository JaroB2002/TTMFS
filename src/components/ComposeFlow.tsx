"use client";

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
  { id: "tomorrow", label: "Morgen", note: "Morgenmiddag" },
  { id: "week", label: "Een week", note: "Over 7 dagen" },
  { id: "month", label: "Een maand", note: "Over ~30 dagen" },
  { id: "year", label: "Een jaar", note: "Over een jaar" },
  { id: "five_years", label: "Vijf jaar", note: "Ver vooruit" },
  { id: "twenty_years", label: "Twintig jaar", note: "Bijna een leven" },
  { id: "custom", label: "Zelf kiezen", note: "Exacte datum" },
  ...(process.env.NODE_ENV !== "production"
    ? [{ id: "instant" as const, label: "Nu (lokaal)", note: "Meteen open" }]
    : []),
];

const RANDOM: { id: SchedulePreset; label: string; note: string }[] = [
  { id: "week", label: "Binnen een week", note: "Morgen tot 7 dagen" },
  {
    id: "surprise_year",
    label: "Binnen een jaar",
    note: "Elk moment tot 12 maanden",
  },
  {
    id: "surprise_decade",
    label: "Binnen tien jaar",
    note: "Een verrassing verderop",
  },
  {
    id: "surprise_lifetime",
    label: "Binnen twintig jaar",
    note: "Van morgen tot 2046",
  },
];

export function ComposeFlow() {
  const [step, setStep] = useState<Step>("message");
  const [body, setBody] = useState("");
  const [audio, setAudio] = useState<{ mime: string; base64: string } | null>(
    null,
  );
  const [mode, setMode] = useState<ScheduleMode>("random");
  const [preset, setPreset] = useState<SchedulePreset>("surprise_year");
  const [customDate, setCustomDate] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() + 20);
    return d.toISOString().slice(0, 10);
  }, []);

  const canContinueMessage = body.trim().length > 0 || !!audio;

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
          audioMime: audio?.mime,
          audioBase64: audio?.base64,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Opslaan mislukt.");
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
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
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
      <ol className="steps" aria-label="Stappen">
        {(
          [
            ["message", "Boodschap"],
            ["when", "Wanneer"],
            ["seal", "Verzegel"],
            ["done", "Bewaar"],
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

      {step === "message" && (
        <section className="panel reveal">
          <h2>Wat wil je later horen?</h2>
          <p className="lede">
            Een zin, een belofte, een vraag. Typ het, of spreek het in — of
            allebei.
          </p>
          <label className="field">
            <span>Tekst</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={8000}
              placeholder="Hé toekomstige ik…"
            />
          </label>
          <div className="field">
            <span>Of stem</span>
            <VoiceRecorder onChange={setAudio} />
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn primary"
              disabled={!canContinueMessage}
              onClick={() => setStep("when")}
            >
              Kies wanneer
            </button>
          </div>
        </section>
      )}

      {step === "when" && (
        <section className="panel reveal">
          <h2>Wanneer komt het aan?</h2>
          <p className="lede">
            Kies een moment, of laat het lot het tijdstip bepalen — ergens
            tussen morgen en twintig jaar.
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
              Verrassing
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
              Zelf kiezen
            </button>
          </div>

          <div className="preset-grid">
            {(mode === "random" ? RANDOM : CHOSEN).map((option) => (
              <button
                key={option.id}
                type="button"
                className={`preset ${preset === option.id ? "selected" : ""}`}
                onClick={() => setPreset(option.id)}
              >
                <strong>{option.label}</strong>
                <span>{option.note}</span>
              </button>
            ))}
          </div>

          {mode === "chosen" && preset === "custom" && (
            <label className="field">
              <span>Datum</span>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </label>
          )}

          <div className="actions">
            <button
              type="button"
              className="btn text"
              onClick={() => setStep("message")}
            >
              Terug
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={mode === "chosen" && preset === "custom" && !customDate}
              onClick={() => setStep("seal")}
            >
              Verder
            </button>
          </div>
        </section>
      )}

      {step === "seal" && (
        <section className="panel reveal">
          <h2>Verzegel je boodschap</h2>
          <p className="lede">
            Geen account. Je krijgt een geheime link. Bewaar die — daar komt je
            boodschap later aan. E-mail is optioneel.
          </p>
          <form onSubmit={seal}>
            <label className="field">
              <span>E-mail (optioneel)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@voorbeeld.nl"
                autoComplete="email"
              />
            </label>
            <p className="hint">
              We sturen geen nieuwsbrieven. Het adres is alleen om je later te
              kunnen wijzen op je sealed link — als e-mailverzending is
              ingesteld. De link zelf is altijd genoeg.
            </p>
            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button
                type="button"
                className="btn text"
                onClick={() => setStep("when")}
              >
                Terug
              </button>
              <button type="submit" className="btn primary" disabled={busy}>
                {busy ? "Verzegelen…" : "Verzegel"}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === "done" && result && (
        <section className="panel reveal sealed">
          <p className="eyebrow">Verzegeld</p>
          <h2>Bewaar deze link</h2>
          <p className="lede">
            {result.scheduleLabel}. Open de link later — tot die tijd blijft
            alles dicht.
          </p>
          <div className="link-box">
            <code>{`${typeof window !== "undefined" ? window.location.origin : ""}${result.revealPath}`}</code>
          </div>
          <div className="actions">
            <button type="button" className="btn primary" onClick={copyLink}>
              {copied ? "Gekopieerd" : "Kopieer link"}
            </button>
            <a className="btn ghost" href={result.revealPath}>
              Open capsule
            </a>
          </div>
          <p className="hint">
            Tip: bewaar de link in je notities of favorieten. Zonder login is
            dit de enige sleutel.
          </p>
        </section>
      )}
    </div>
  );
}

function stepOrder(step: Step): number {
  return { message: 0, when: 1, seal: 2, done: 3 }[step];
}
