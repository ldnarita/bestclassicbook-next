import Link from "next/link";
import lists from "@/content/lists.json";
import { baseMetadata } from "@/lib/seo";

export const metadata = baseMetadata({
  title: "Classic Book Lists | Best Classic Book",
  description: "Browse ranked lists of classic books and curated reading guides."
});

export default function ListsIndexPage() {
  return (
    <div className="card">
      <h1>Lists</h1>
      <p className="muted">Curated classic book lists built for discovery.</p>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "18px 0" }} />

      <ul>
        {lists.map((l) => (
          <li key={l.slug} style={{ margin: "10px 0" }}>
            <Link href={`/lists/${l.slug}`}>{l.title}</Link>
            <div className="muted">{l.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}