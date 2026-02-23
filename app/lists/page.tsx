import Link from "next/link";
import lists from "@/content/lists.json";
import { baseMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/structuredData";

type ListDef = (typeof lists)[number];

export const metadata = baseMetadata({
  title: "Top Classic Book Lists | Best Classic Book",
  description: "Browse curated, ranked lists of classic books by genre and reader intent."
});

export default function ListsIndex() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Lists", path: "/lists" }
  ]);

  const itemList = itemListJsonLd({
    name: "Top Classic Book Lists",
    description: "Curated classic reading lists by genre and search intent.",
    path: "/lists",
    items: (lists as ListDef[]).map((l) => ({
      name: l.title,
      path: `/lists/${l.slug}`
    }))
  });

  return (
    <article className="card">
      <JsonLd data={[breadcrumb, itemList]} />

      <h1 className="h1">Top Classic Book Lists</h1>
      <p className="p">
        Explore classic book lists built around real search intent: romance, adventure, horror, mystery, science fiction, and more.
      </p>

      <hr className="sep" />

      <div className="grid">
        {(lists as ListDef[]).map((l) => (
          <div className="col-6" key={l.slug}>
            <div className="card">
              <h2 className="h2" style={{ marginTop: 0 }}>
                <Link href={`/lists/${l.slug}`}>{l.title}</Link>
              </h2>
              <p className="p muted" style={{ marginTop: 8 }}>{l.description}</p>
              <div style={{ marginTop: 12 }}>
                <Link className="badge" href={`/lists/${l.slug}`}>View list →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}