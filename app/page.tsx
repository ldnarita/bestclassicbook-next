import Link from "next/link";
import { FULL_TEXT_BASE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="grid">
      <section className="col-12 card">
        <div className="badge">Classic literature, simplified.</div>

        <h1 className="h1">Classic Book Summaries & Ranked Reading Lists</h1>

        <p className="p">
          Discover clear, spoiler-light summaries of the world’s most important classic novels. Explore ranked reading
          lists, author guides, and curated recommendations to find your next great book.
        </p>

        <p className="p muted" style={{ marginTop: 8 }}>
          Read essential works across genres and eras — from <em>Pride and Prejudice</em> and <em>Frankenstein</em> to{" "}
          <em>Anna Karenina</em>, <em>The Count of Monte Cristo</em>, <em>Dracula</em>, and more.
        </p>

        <hr className="sep" />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="badge" href="/summaries">Browse All Summaries →</Link>
          <Link className="badge" href="/lists">Explore Top Classic Book Lists →</Link>
          <Link className="badge" href="/authors">Discover Authors →</Link>
          <Link className="badge" href="/blog">Read the Blog →</Link>
        </div>
      </section>

      <section className="col-6 card">
        <h2 className="h2">Why Use Our Classic Book Summaries?</h2>
        <ul className="p">
          <li>Fast, readable plot overviews (no academic jargon)</li>
          <li>Key themes, character insights, and deeper meaning explained</li>
          <li>Guidance on who should read each book</li>
          <li>Ideal for students, book clubs, and independent readers</li>
        </ul>
      </section>

      <section className="col-6 card">
        <h2 className="h2">Find the Best Classic Books for You</h2>
        <p className="p">
          Not sure where to start? Browse our ranked lists of the best classic books for beginners, love stories,
          adventure novels, dystopian fiction, and timeless literary masterpieces.
        </p>
        <div style={{ marginTop: 10 }}>
          <Link className="badge" href="/lists">Explore ranked lists →</Link>
        </div>
      </section>

      <section className="col-12 card">
        <h2 className="h2">Read the Complete Novel Online</h2>
        <p className="p">
          When you’re ready to read the full book, use a trusted edition of the{" "}
          <strong>full public domain text</strong>.
        </p>
        <div style={{ marginTop: 10 }}>
          <a className="badge" href={FULL_TEXT_BASE_URL} rel="noopener noreferrer">
            Full public domain text →
          </a>
        </div>
      </section>

      <section className="col-12 card">
        <h2 className="h2">Popular Classic Book Summaries</h2>
        <p className="p">Start with some of the most searched classic literature summaries:</p>

        <ul className="p" style={{ marginTop: 10 }}>
          <li><Link href="/summaries/pride-and-prejudice">Pride and Prejudice summary</Link></li>
          <li><Link href="/summaries/moby-dick">Moby-Dick summary</Link></li>
          <li><Link href="/summaries/the-great-gatsby">The Great Gatsby summary</Link></li>
          <li><Link href="/summaries/dracula">Dracula summary</Link></li>
          <li><Link href="/summaries/frankenstein">Frankenstein summary</Link></li>
        </ul>
      </section>
    </div>
  );
}
