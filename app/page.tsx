import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid">
      <section className="col-12 card">
        <div className="badge">SEO Satellite → Funnels to full texts</div>
        <h1 className="h1">Classic book summaries & ranked lists — fast, clean, and trustworthy.</h1>
        <p className="p">
          Discover public domain classics with modern summaries, reading order guides, and “best of” lists.
        </p>

        <hr className="sep" />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="badge" href="/summaries">Browse Summaries →</Link>
          <Link className="badge" href="/lists">Browse Top Lists →</Link>
          <Link className="badge" href="/authors">Explore Authors →</Link>
          <Link className="badge" href="/blog">Read Blog →</Link>
        </div>
      </section>

      <section className="col-6 card">
        <div className="h2">What you get here</div>
        <ul className="p">
          <li>Short, clear summaries</li>
          <li>Reading order + “who should read this” guidance</li>
          <li>SEO-friendly list pages that rank well</li>
        </ul>
      </section>

      <section className="col-6 card">
        <div className="h2">Where you read full texts</div>
        <p className="p">
          When you’re ready to read, we’ll send you to FunBookShelf for full public domain texts — not duplicated here.
        </p>
      </section>
    </div>
  );
}