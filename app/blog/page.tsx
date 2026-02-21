import Link from "next/link";
import { baseMetadata } from "@/lib/seo";
import { listMarkdownDocs } from "@/lib/content";

type BlogFrontmatter = {
  title: string;
  description: string;
  date: string; // ISO
};

export const metadata = baseMetadata({
  title: "Blog | Best Classic Book",
  description: "Classic literature guides, reading order advice, and beginner-friendly recommendations."
});

export default async function BlogIndex() {
  const posts = await listMarkdownDocs<BlogFrontmatter>("content/blog");
  const sorted = posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));

  return (
    <div>
      <h1 className="h1">Blog</h1>
      <p className="p">Guides that support your list + summary funnel.</p>

      <hr className="sep" />

      <div className="grid">
        {sorted.map((p) => (
          <Link className="col-6 card" href={`/blog/${p.slug}`} key={p.slug}>
            <div className="h2">{p.frontmatter.title}</div>
            <div className="badge">{p.frontmatter.date}</div>
            <p className="p" style={{ marginTop: 10 }}>{p.frontmatter.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}