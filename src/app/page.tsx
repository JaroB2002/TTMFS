"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KineticTitle } from "@/components/KineticTitle";
import { PortalField } from "@/components/PortalField";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="mark" />
          Talk to my future self
        </Link>
        <Link href="/compose" className="nav-link">
          Begin
        </Link>
      </header>

      <main className="hero">
        <PortalField />
        <p className="hero-kicker">No login · secret link · up to 20 years</p>
        <KineticTitle lines={["Talk to my", "future self"]} />
        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Write it. Speak it. Seal it into a private capsule. It arrives
          tomorrow, in twenty years — or at a random moment in between.
        </motion.p>
        <div className="hero-rule" />
        <div className="cta-row">
          <Link href="/compose" className="btn primary">
            Send to later
          </Link>
          <a href="#how" className="btn ghost">
            How it works
          </a>
        </div>
      </main>

      <section id="how" className="section">
        <h2>One message. No account.</h2>
        <p>
          Type or record a voice note. Scrub how far into the future it should
          travel — or lock an exact date and time. You get a private link. Keep
          it. Until then, everything stays sealed.
        </p>
        <p>
          Inspired by campaigns like <em>Talk to my younger self</em>, and
          Awwwards pieces such as Almanac and My Better Normal — flipped
          forward, for whoever you become.
        </p>
        <Link href="/compose" className="btn signal">
          Build your capsule
        </Link>
      </section>

      <p className="footer-note">TTMFS · sealed until arrival</p>
    </>
  );
}
