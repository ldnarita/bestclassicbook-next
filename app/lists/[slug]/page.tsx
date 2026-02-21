import { notFound } from "next/navigation";
import Link from "next/link";
import lists from "@/content/lists.json";
import { baseMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/structuredData";

type ListDef = (typeof lists)[number];

export async function generateStaticParams() {
  return lists.map((l) => ({ slug: l.slug }));
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

export default async function ListSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = (lists as ListDef[]).find((l) => l.slug === slug);
  if (!list) return notFound();

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
      <JsonLd data={[breadcrumb, itemList]} />

      <h1>{list.title}</h1>
      <p className="muted">{list.description}</p>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "18px 0" }} />

      <ol>
        {list.items.map((it) => (
          <li key={it.slug} style={{ margin: "10px 0" }}>
            <Link href={`/summaries/${it.slug}`}>{it.name}</Link>
          </li>
        ))}
      </ol>
    </article>
  );
}