import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid">
      <section className="col-12 card">
        <h1 className="h1">Classic Book Summaries & Ranked Reading Lists</h1>

        <p className="p">
          Discover clear, spoiler-light summaries of the world’s most important classic novels. Explore ranked
          reading lists, author guides, and curated recommendations to find your next great book.
        </p>

        <hr className="sep" />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="badge" href="/summaries">
            Browse All Summaries →
          </Link>
          <Link className="badge" href="/lists">
            Explore Top Classic Book Lists →
          </Link>
          <Link className="badge" href="/authors">
            Discover Authors →
          </Link>
          <Link className="badge" href="/blog">
            Read the Blog →
          </Link>
        </div>
      </section>

      <section className="col-6 card">
        <h2 className="h2">Why Use Our Classic Book Summaries?</h2>
        <ul className="p">
          <li>Fast, readable plot overviews (no academic jargon)</li>
          <li>Key themes, character insights, and deeper meaning explained</li>
          <li>Guidance on who should read each book</li>
          <li>Perfect for students, book clubs, or curious readers</li>
        </ul>
      </section>

      <section className="col-6 card">
        <h2 className="h2">Find the Best Classic Books for You</h2>
        <p className="p">
          Not sure where to start? Browse our ranked lists of the best classic books for beginners, romance,
          adventure, horror, science fiction, and psychological fiction.
        </p>
      </section>

      <section className="col-12 card">
        <h2 className="h2">Read the Complete Novel Online</h2>
        <p className="p">When you’re ready, access a trusted edition of the full public domain text.</p>
        <a className="badge" href="https://funbookshelf.com" rel="noopener noreferrer">
          Full public domain text →
        </a>
      </section>
    </div>
  );
}