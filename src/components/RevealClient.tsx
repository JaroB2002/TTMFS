"use client";

import { motion } from "framer-motion";
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
          throw new Error(data.error || "Not found.");
        }
        if (!cancelled) setView(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
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
      <section className="panel panel-frame">
        <p className="lede">Opening capsule…</p>
      </section>
    );
  }

  if (error || !view) {
    return (
      <section className="panel panel-frame">
        <h1>Not found</h1>
        <p className="lede">{error || "This capsule does not exist."}</p>
        <Link className="btn primary" href="/">
          Back home
        </Link>
      </section>
    );
  }

  if (!view.unlocked) {
    return (
      <motion.section
        className="panel panel-frame sealed-view"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow">Still sealed</p>
        <h1>Not yet.</h1>
        <p className="lede">
          Future-you has to wait a little longer. Schedule:{" "}
          <em>{view.scheduleLabel.toLowerCase()}</em>.
        </p>
        {view.deliverAt && view.scheduleMode === "chosen" ? (
          <p className="meta">
            Opens{" "}
            {new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(view.deliverAt))}
          </p>
        ) : (
          <p className="meta">
            The exact moment stays hidden until the capsule unlocks on its own.
          </p>
        )}
        <div className="seal-orb" aria-hidden>
          <div className="halo" />
          <div className="halo" />
          <div className="core" />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="panel panel-frame open-view"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="eyebrow">From then · for now</p>
      <h1>Your message has arrived.</h1>
      <p className="meta">
        Sealed{" "}
        {new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(view.createdAt))}
        {view.deliverAt
          ? ` · arrived ${new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(view.deliverAt))}`
          : ""}
      </p>
      {view.body ? (
        <motion.blockquote
          className="letter"
          initial={{ opacity: 0, scale: 0.96, rotate: -0.6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {view.body}
        </motion.blockquote>
      ) : null}
      {view.hasAudio ? (
        <div className="field">
          <span>Voice</span>
          <audio
            className="audio-preview"
            controls
            src={`/api/messages/${token}/audio`}
          />
        </div>
      ) : null}
      <Link className="btn ghost" href="/compose">
        Send another
      </Link>
    </motion.section>
  );
}
