import { PLATFORMS } from "./ShareBar";
import LavaBlobs from "./LavaBlobs";
import "./landing.css";

const STATS = [
  ["5", "platforms one tap away"],
  ["1", "board for every post"],
  ["AI", "captions in your tone"],
];

const BENEFITS = [
  {
    tint: "ember",
    title: "Plan once, show up everywhere",
    body: "Drop ideas on one board and move them from idea to scripted, filmed and posted. No more scattered notes and missed days.",
  },
  {
    tint: "indigo",
    title: "Captions in your brand's voice",
    body: "Pick a topic and a tone and the AI drafts the caption. Edit it, then send it straight to the platform.",
  },
  {
    tint: "mix",
    title: "Consistency beats luck",
    body: "The big platforms reward accounts that post regularly. A visible pipeline makes regular posting the easy path.",
  },
];

export default function Landing({ onStart }) {
  return (
    <main className="lp">
      <nav className="lp-nav">
        <span className="lp-logo">⚡ Content Planner</span>
        <button className="pill pill-light" onClick={onStart}>Get started</button>
      </nav>

      <section className="hero">
        <LavaBlobs />

        <h1 className="hero-title">
          <span className="t1">own</span>
          <span className="t2">your</span>
          <span className="t3">reach</span>
        </h1>

        <p className="hero-sub">
          A few platforms decide who gets seen. Plan, write and publish
          consistently so your business is always in the feed.
        </p>

        <div className="cta-bar">
          <span>Ready when you are</span>
          <button className="pill pill-warm" onClick={onStart}>Start planning</button>
        </div>

        <dl className="hero-stats">
          {STATS.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="platforms" aria-label="Supported platforms">
        <p className="section-lead">Publish where your customers already are.</p>
        <div className="plat-row">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="plat">{p.name}</div>
          ))}
        </div>
      </section>

      <section className="benefits">
        <h2>What you get</h2>
        <div className="b-grid">
          {BENEFITS.map((b) => (
            <article key={b.title} className="b-card">
              <div className={`orb orb-${b.tint}`} aria-hidden="true" />
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}