import { PLATFORMS } from "./ShareBar";
import "./landing.css";

const BENEFITS = [
  {
    title: "Plan once, show up everywhere",
    body: "Drop ideas on one board and move them from idea to scheduled to posted. No more scattered notes and missed days.",
  },
  {
    title: "Captions in your brand's voice",
    body: "Pick a topic and a tone and the AI drafts the caption. Edit it, then send it straight to the platform.",
    feature: true,
  },
  {
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
        <div className="blob blob-a" aria-hidden="true" />
        <div className="blob blob-b" aria-hidden="true" />

        <h1 className="hero-title">
          <span className="t1">own</span>
          <span className="t2">your</span>
          <span className="t3">reach</span>
        </h1>

        <p className="hero-sub">
          A few platforms decide who gets seen. Plan, write and publish
          consistently so your business is always in the feed.
        </p>

        <div className="stat s1"><b>5</b><span>platforms one tap away</span></div>
        <div className="stat s2"><b>1</b><span>board for every post</span></div>
        <div className="stat s3"><b>AI</b><span>captions in your tone</span></div>

        <div className="cta-bar">
          <span>ready when you are</span>
          <button className="pill pill-warm" onClick={onStart}>Start planning</button>
        </div>
      </section>

      <section className="platforms" aria-label="Supported platforms">
        {PLATFORMS.map((p) => (
          <div key={p.id} className="plat">{p.name}</div>
        ))}
      </section>

      <section className="benefits">
        <h2>What you get</h2>
        <div className="b-grid">
          {BENEFITS.map((b) => (
            <article key={b.title} className={`b-card ${b.feature ? "b-feature" : ""}`}>
              {b.feature && <div className="blob blob-mini" aria-hidden="true" />}
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}