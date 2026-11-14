import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="mark">TTMFS</span>
          Talk to my future self
        </Link>
        <Link href="/compose" className="nav-link">
          Begin
        </Link>
      </header>

      <main className="hero">
        <div className="hero-frame" aria-hidden>
          <div className="tick" />
          <div className="ring" />
          <div className="ring" />
          <div className="core" />
        </div>
        <p className="hero-kicker">No login · secret link · up to 20 years</p>
        <h1 className="hero-brand">
          Talk to my <em>future self</em>
        </h1>
        <p className="hero-copy">
          Write it. Speak it. Seal it. It arrives tomorrow, in twenty years, or
          at a random moment in between.
        </p>
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
        <div className="section-rule" />
        <h2>One message. No account.</h2>
        <p>
          Type or record a voice note. Pick an exact date and time, or let
          chance choose somewhere between tomorrow and twenty years out. You
          get a private link — keep it. Until then, everything stays sealed.
        </p>
        <p>
          Inspired by campaigns like <em>Talk to my younger self</em> — flipped
          forward, for whoever you become.
        </p>
        <Link href="/compose" className="btn primary">
          Build your capsule
        </Link>
      </section>

      <p className="footer-note">TTMFS · sealed until arrival</p>
    </>
  );
}
