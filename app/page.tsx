import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid">
      {/* HERO */}
      <section className="col-12 card">
        <div className="badge">Classic literature, simplified.</div>

        <h1 className="h1">
          Classic Book Summaries & Ranked Reading Lists
        </h1>

        <p className="p">
          Discover clear, spoiler-light summaries of the world’s most important
          classic novels. Explore ranked reading lists, author guides, and
          curated recommendations to find your next great book. 
          Read essential classic books spanning different eras and genres
          include Harper Lee's To Kill a Mockingbird and F. Scott Fitzgerald's
          The Great Gatsby for American literature, George Orwell's 1984 for dystopian fiction, 
          and Jane Austen's Pride and Prejudice for romance. Other foundational, 
          must-read classics include Frankenstein, Anna Karenina, and The Count of Monte Cristo.
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

      {/* VALUE SECTION */}
      <section className="col-6 card">
        <div className="h2">Why Use Our Classic Book Summaries?</div>
        <ul className="p">
          <li>Fast, readable plot overviews (no academic jargon)</li>
          <li>Key themes, character insights, and deeper meaning explained</li>
          <li>Guidance on who should read each book</li>
          <li>Perfect for students, book clubs, or curious readers</li>
        </ul>
      </section>

      {/* DISCOVERY SECTION */}
      <section className="col-6 card">
        <div className="h2">Find the Best Classic Books for You</div>
        <p className="p">
          Not sure where to start? Browse our ranked lists of the best
          classic books for beginners, love stories, adventures, and
          timeless masterpieces.
        </p>
        <p className="p">
          When you’re ready to read the full public-domain text, we’ll
          direct you to trusted editions on FunBookShelf.
        </p>
      </section>

      {/* SEO HUB SECTION */}
      <section className="col-12 card">
        <div className="h2">Popular Classic Book Summaries</div>
        <p className="p">
          Start with some of the most searched classic literature summaries:
        </p>

        <ul className="p">
          <li>
            <Link href="/summaries/pride-and-prejudice">
              Pride and Prejudice summary
            </Link>
          </li>
          <li>
            <Link href="/summaries/moby-dick">
              Moby-Dick summary
            </Link>
          </li>
          <li>
            <Link href="/summaries/the-great-gatsby">
              The Great Gatsby summary
            </Link>
          </li>
          <li>
            <Link href="/summaries/dracula">
              Dracula summary
            </Link>
          </li>
          <li>
            <Link href="/summaries/frankenstein">
              Frankenstein summary
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}