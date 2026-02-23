import Image from "next/image";
import { notFound } from "next/navigation";
import { baseMetadata } from "@/lib/seo";
import { getMarkdownBySlug, listMarkdownSlugs } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, bookSummaryJsonLd } from "@/lib/structuredData";

type SummaryFrontmatter = {
  title: string;
  author: string;
  description: string;
  readingTime: string;
  year?: number;
  coverImage?: string; // "/books/xxx.jpg"
  funbookshelfUrl?: string;
};

export async function generateStaticParams() {
  const slugs = await listMarkdownSlugs("content/summaries");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getMarkdownBySlug<SummaryFrontmatter>("content/summaries", slug);
  if (!doc) return baseMetadata({ title: "Not found" });

  return baseMetadata({
    title: `${doc.frontmatter.title} Summary | Best Classic Book`,
    description: doc.frontmatter.description,
    alternates: { canonical: `/summaries/${slug}` }
  });
}

export default async function SummaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getMarkdownBySlug<SummaryFrontmatter>("content/summaries", slug);
  if (!doc) return notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Summaries", path: "/summaries" },
    { name: doc.frontmatter.title, path: `/summaries/${slug}` }
  ];

  const breadcrumbLd = breadcrumbJsonLd(crumbs);
  const bookLd = bookSummaryJsonLd({
    title: doc.frontmatter.title,
    authorName: doc.frontmatter.author,
    description: doc.frontmatter.description,
    path: `/summaries/${slug}`,
    imagePath: doc.frontmatter.coverImage
  });

  const fullTextUrl = doc.frontmatter.funbookshelfUrl?.trim();

  return (
    <article className="card">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Summaries", href: "/summaries" },
          { name: doc.frontmatter.title, href: `/summaries/${slug}` }
        ]}
      />

      <JsonLd data={[breadcrumbLd, bookLd]} />

      <h1 className="h1">{doc.frontmatter.title}</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="badge">{doc.frontmatter.author}</span>
        <span className="badge">{doc.frontmatter.readingTime}</span>
        {doc.frontmatter.year ? <span className="badge">{doc.frontmatter.year}</span> : null}
      </div>

      {doc.frontmatter.coverImage ? (
        <div style={{ marginTop: 16 }}>
          <Image
            src={doc.frontmatter.coverImage}
            alt={`${doc.frontmatter.title} cover`}
            width={900}
            height={500}
            style={{ width: "100%", height: "auto", borderRadius: 16, border: "1px solid var(--border)" }}
            priority={false}
          />
        </div>
      ) : null}

      <hr className="sep" />

      <p className="p" style={{ fontSize: 16 }}>
        {doc.frontmatter.description}
      </p>

      <div
        className="prose"
        style={{ marginTop: 14 }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />

      {/* UPDATED CTA */}
      <hr className="sep" />

      <section aria-label="Read the complete novel online">
        <h2 className="h2" style={{ marginBottom: 8 }}>
          Read the Complete Novel Online
        </h2>

        <p className="p muted" style={{ marginTop: 0 }}>
          Access a trusted edition of the <strong>full public domain text</strong>.
        </p>

        {fullTextUrl ? (
          <a className="badge" href={fullTextUrl} rel="noopener noreferrer">
            Full public domain text →
          </a>
        ) : (
          <p className="p muted">
            Full text link coming soon.
          </p>
        )}
      </section>
    </article>
  );
}