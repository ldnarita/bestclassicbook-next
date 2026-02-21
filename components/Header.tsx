import Link from "next/link";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="container">
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 800, letterSpacing: -0.2 }}>
          {SITE.name}
        </Link>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/summaries">Summaries</Link>
          <Link href="/lists">Top Lists</Link>
          <Link href="/authors">Authors</Link>
          <Link href="/blog">Blog</Link>
        </nav>
      </div>
    </header>
  );
}