import { notFound } from "next/navigation";
import Link from "next/link";
import lists from "@/content/lists.json";
import { baseMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/structuredData";
import { listMarkdownDocs } from "@/lib/content";
import { FULL_TEXT_BASE_URL } from "@/lib/site";

type ListDef = (typeof lists)[number];

type SummaryFrontmatter = {
  title: string;
  author: string;
  description: string;
  readingTime: string;
  year?: number;
  funbookshelfUrl?: string;
};

export async function generateStaticParams() {
  return (lists as ListDef[]).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = (lists as ListDef[]).find((l) => l.slug === slug);
  if (!list) return baseMetadata({ title: "Not found" });

  return baseMetadata({
    title: `${list.title} | Best Classic Book`,
    description: list.description,
    alternates: { canonical: `/lists/${slug}` }
  });
}

export default async function ListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = (lists as ListDef[]).find((l) => l.slug === slug);
  if (!list) return notFound();

  // Load summaries once and map by slug so we can show per-book "Full public domain text →"
  const summaries = await listMarkdownDocs<SummaryFrontmatter>("content/summaries");
  const bySlug = new Map(summaries.map((s) => [s.slug, s.frontmatter]));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Lists", path: "/lists" },
    { name: list.title, path: `/lists/${slug}` }
  ]);

  const itemList = itemListJsonLd({
    name: list.title,
    description: list.description,
    path: `/lists/${slug}`,
    items: list.items.map((it) => ({
      name: it.name,
      path: `/summaries/${it.slug}`
    }))
  });

  return (
    <article className="card">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Lists", href: "/lists" },
          { name: list.title, href: `/lists/${slug}` }
        ]}
      />

      <JsonLd data={[breadcrumb, itemList]} />

      <h1 className="h1">{list.title}</h1>
      <p className="p muted">{list.description}</p>

      <hr className="sep" />

      <ol className="p" style={{ margin: 0, paddingLeft: 18 }}>
        {list.items.map((it) => {
          const fm = bySlug.get(it.slug);
          const fullTextUrl = fm?.funbookshelfUrl?.trim();

          return (
            <li key={it.slug} style={{ margin: "14px 0" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                  <Link href={`/summaries/${it.slug}`} style={{ fontWeight: 700 }}>
                    {it.name}
                  </Link>

                  {fm?.author ? <span className="muted">— {fm.author}</span> : null}
                </div>

                {fm?.description ? <div className="muted">{fm.description}</div> : null}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="badge" href={`/summaries/${it.slug}`}>Read summary →</Link>

                  {fullTextUrl ? (
                    <a className="badge" href={fullTextUrl} rel="noopener noreferrer">
                      Full public domain text →
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <hr className="sep" />

      <section aria-label="Read the complete novel online">
        <h2 className="h2" style={{ marginBottom: 8 }}>Read the Complete Novel Online</h2>
        <p className="p muted" style={{ marginTop: 0 }}>
          When you’re ready to read, use a trusted edition of the <strong>full public domain text</strong>.
        </p>
        <a className="badge" href={FULL_TEXT_BASE_URL} rel="noopener noreferrer">
          Full public domain text →
        </a>
      </section>
    </article>
  );
}