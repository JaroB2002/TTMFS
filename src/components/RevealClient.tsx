"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type View = {
  unlocked: boolean;
  scheduleLabel: string;
  scheduleMode: string;
  createdAt: string;
  deliverAt?: string;
  body?: string;
  hasAudio?: boolean;
  openedAt?: string | null;
};

export function RevealClient({ token }: { token: string }) {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/messages/${token}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Niet gevonden.");
        }
        if (!cancelled) setView(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Fout");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <section className="panel reveal">
        <p className="lede">Capsule openen…</p>
      </section>
    );
  }

  if (error || !view) {
    return (
      <section className="panel reveal">
        <h1>Niet gevonden</h1>
        <p className="lede">
          {error || "Deze capsule bestaat niet (meer)."}
        </p>
        <Link className="btn primary" href="/">
          Terug naar home
        </Link>
      </section>
    );
  }

  if (!view.unlocked) {
    return (
      <section className="panel reveal sealed-view">
        <p className="eyebrow">Nog verzegeld</p>
        <h1>Nog niet nu.</h1>
        <p className="lede">
          Je toekomstige ik moet nog even wachten. Planning:{" "}
          <em>{view.scheduleLabel.toLowerCase()}</em>.
        </p>
        {view.deliverAt && view.scheduleMode === "chosen" ? (
          <p className="meta">
            Opent op{" "}
            {new Intl.DateTimeFormat("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(view.deliverAt))}
          </p>
        ) : (
          <p className="meta">
            Het exacte moment blijft geheim tot de capsule vanzelf opengaat.
          </p>
        )}
        <div className="seal-orb" aria-hidden />
      </section>
    );
  }

  return (
    <section className="panel reveal open-view">
      <p className="eyebrow">Voor jou, van toen</p>
      <h1>Je boodschap is gearriveerd.</h1>
      <p className="meta">
        Verzegeld{" "}
        {new Intl.DateTimeFormat("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(view.createdAt))}
        {view.deliverAt
          ? ` · gearriveerd ${new Intl.DateTimeFormat("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(view.deliverAt))}`
          : ""}
      </p>
      {view.body ? <blockquote className="letter">{view.body}</blockquote> : null}
      {view.hasAudio ? (
        <div className="field">
          <span>Stem</span>
          <audio className="audio-preview" controls src={`/api/messages/${token}/audio`} />
        </div>
      ) : null}
      <Link className="btn ghost" href="/compose">
        Stuur er nog een
      </Link>
    </section>
  );
}
