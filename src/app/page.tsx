import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          Talk to my <span>future self</span>
        </Link>
        <Link href="/compose" className="nav-link">
          Begin
        </Link>
      </header>

      <main className="hero">
        <div className="hero-visual" aria-hidden />
        <h1 className="hero-brand">
          Talk to my <em>future self</em>
        </h1>
        <p className="hero-copy">
          Spreek of schrijf iets in voor later. Het komt aan wanneer jij wilt —
          morgen, over twintig jaar, of op een random moment.
        </p>
        <div className="cta-row">
          <Link href="/compose" className="btn primary">
            Verstuur naar later
          </Link>
          <a href="#how" className="btn ghost">
            Hoe het werkt
          </a>
        </div>
      </main>

      <section id="how" className="section">
        <h2>Eén boodschap. Geen login.</h2>
        <p>
          Typ of neem een spraakbericht op. Kies een datum, of laat het lot het
          moment bepalen. Je krijgt een geheime link — bewaar die. Tot die tijd
          blijft alles dicht.
        </p>
        <p>
          Geïnspireerd door campagnes als{" "}
          <em>Talk to my younger self</em>, maar dan vooruit: een capsule voor
          wie je nog wordt.
        </p>
        <Link href="/compose" className="btn primary">
          Maak je capsule
        </Link>
      </section>

      <p className="footer-note">TTMFS · geen account, alleen een sleutel</p>
    </>
  );
}
