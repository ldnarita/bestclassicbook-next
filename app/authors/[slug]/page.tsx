import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import authors from "@/content/authors.json";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { baseMetadata } from "@/lib/seo";
import { listMarkdownDocs } from "@/lib/content";
import { breadcrumbJsonLd, articleJsonLd } from "@/lib/structuredData";

type SummaryFrontmatter = {
  title?: string;
  author?: string;
  description?: string;
  funbookshelfUrl?: string;
};

// Normalizes "Charlotte Brontë" vs "Charlotte Bronte", spacing, punctuation
function normName(x: string) {
  return (x ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) return baseMetadata({ title: "Not found" });

  return baseMetadata({
    title: `${author.name} | Best Classic Book`,
    description: author.bio,
    alternates: { canonical: `/authors/${slug}` }
  });
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) return notFound();

  const allSummaries = await listMarkdownDocs<SummaryFrontmatter>("content/summaries");

  const authorKey = normName(author.name);

  const authorSummaries = allSummaries.filter((s) => {
    const a = normName(s.frontmatter?.author ?? "");
    return a === authorKey;
  });

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Authors", path: "/authors" },
    { name: author.name, path: `/authors/${slug}` }
  ];

  return (
    <article className="card">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Authors", href: "/authors" },
          { name: author.name, href: `/authors/${slug}` }
        ]}
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            title: author.name,
            path: `/authors/${slug}`,
            description: author.bio
          })
        ]}
      />

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Image
          src={author.image}
          alt={author.name}
          width={100}
          height={100}
          style={{ borderRadius: 18, border: "1px solid var(--border)" }}
        />
        <div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            {author.name}
          </h1>
          <p className="p">{author.bio}</p>
        </div>
      </div>

      <hr className="sep" />

      <h2 className="h2">Summaries</h2>

      {authorSummaries.length === 0 ? (
        <p className="p">No summaries published yet for this author.</p>
      ) : (
        <ul className="p">
          {authorSummaries.map((s) => (
            <li key={s.slug}>
              <Link href={`/summaries/${s.slug}`}>{s.frontmatter?.title ?? s.slug}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}