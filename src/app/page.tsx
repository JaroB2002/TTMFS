"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CapsuleDesk } from "@/components/CapsuleDesk";
import { CapsuleMark } from "@/components/CapsuleMark";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="mark" />
          Talk to my future self
        </Link>
        <a href="#how" className="nav-link">
          How it works
        </a>
      </header>

      <main>
        <section className="hero-home">
          <div className="hero-copy-wrap">
            <motion.p
              className="hero-kicker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              No login · voice or text · up to 20 years
            </motion.p>
            <motion.h1
              className="hero-brand"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              Talk to my <em>future self</em>
            </motion.h1>
            <motion.p
              className="hero-copy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.65 }}
            >
              Seal a voice note or a letter into a private capsule. It returns
              tomorrow, in twenty years — or at a random moment in between.
            </motion.p>
          </div>
          <div className="hero-stage" aria-hidden>
            <div className="hero-slash" />
            <CapsuleMark className="hero-orbit" />
          </div>
        </section>

        <CapsuleDesk />

        <section id="how" className="section">
          <h2>One message. No account.</h2>
          <p>
            Speak or type. Drag how far into the future it should travel — or
            lock an exact date and time. You get a secret link. Keep it. When
            the day comes, open it.
          </p>
        </section>

        <div className="faq">
          <details>
            <summary>Will other people hear my message?</summary>
            <p>
              No. Only someone with your secret link can open it. Don’t share
              the link unless you mean to.
            </p>
          </details>
          <details>
            <summary>Do I need an account?</summary>
            <p>
              No. Save the private link after you seal your capsule. Email is
              optional — only to help you find that link later.
            </p>
          </details>
          <details>
            <summary>Can I surprise myself?</summary>
            <p>
              Yes. Leave surprise mode on and drag the horizon. We pick a random
              moment inside that window — and keep the exact date hidden until
              it unlocks.
            </p>
          </details>
        </div>

        <p className="footer-note">TTMFS · sealed until arrival</p>
      </main>
    </>
  );
}
