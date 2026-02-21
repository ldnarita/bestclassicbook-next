import { notFound } from "next/navigation";
import { baseMetadata } from "@/lib/seo";
import { getMarkdownBySlug, listMarkdownSlugs } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, articleJsonLd } from "@/lib/structuredData";

type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
};

export async function generateStaticParams() {
  const slugs = await listMarkdownSlugs("content/blog");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getMarkdownBySlug<BlogFrontmatter>("content/blog", slug);
  if (!doc) return baseMetadata({ title: "Not found" });

  return baseMetadata({
    title: `${doc.frontmatter.title} | Best Classic Book`,
    description: doc.frontmatter.description,
    alternates: { canonical: `/blog/${slug}` }
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getMarkdownBySlug<BlogFrontmatter>("content/blog", slug);
  if (!doc) return notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: doc.frontmatter.title, path: `/blog/${slug}` }
  ];

  return (
    <article className="card">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: doc.frontmatter.title, href: `/blog/${slug}` }
        ]}
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            title: doc.frontmatter.title,
            path: `/blog/${slug}`,
            description: doc.frontmatter.description,
            datePublished: doc.frontmatter.date,
            dateModified: doc.frontmatter.updated ?? doc.frontmatter.date
          })
        ]}
      />

      <h1 className="h1">{doc.frontmatter.title}</h1>
      <div className="badge">{doc.frontmatter.date}</div>

      <hr className="sep" />

      <div className="prose"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </article>
  );
}
