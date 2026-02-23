import { baseMetadata } from "@/lib/seo";
import { listMarkdownDocs } from "@/lib/content";
import { SummaryCard } from "@/components/SummaryCard";

type SummaryFrontmatter = {
  title?: string;
  author?: string;
  description?: string;
  readingTime?: string;
  year?: number;
  funbookshelfUrl?: string;
};

export const metadata = baseMetadata({
  title: "Classic Book Summaries | Best Classic Book",
  description: "Browse fast, high-quality summaries of public domain classic books."
});

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default async function SummariesIndex() {
  const rawDocs = await listMarkdownDocs<SummaryFrontmatter>("content/summaries");

  const docs = rawDocs
    .map((d) => {
      const title = (d.frontmatter?.title ?? "").trim();
      const author = (d.frontmatter?.author ?? "").trim();
      const description = (d.frontmatter?.description ?? "").trim();

      // Fallbacks so cards never render empty
      const safeTitle = title || titleFromSlug(d.slug);
      const safeAuthor = author || "Unknown author";
      const safeDescription = description || "Summary coming soon.";

      return {
        ...d,
        frontmatter: {
          ...d.frontmatter,
          title: safeTitle,
          author: safeAuthor,
          description: safeDescription
        }
      };
    })
    // If a file is REALLY broken, you can hide it:
    .filter((d) => {
      const t = (d.frontmatter?.title ?? "").trim();
      const a = (d.frontmatter?.author ?? "").trim();
      const desc = (d.frontmatter?.description ?? "").trim();
      return Boolean(t || a || desc);
    })
    .sort((a, b) =>
      (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "")
    );

  return (
    <div>
      <h1 className="h1">Summaries</h1>
      <p className="p">
        Short, modern summaries with a clean path to the full public domain text when you’re ready to read.
      </p>

      <hr className="sep" />

      <div className="grid">
        {docs.map((d) => (
          <div className="col-6" key={d.slug}>
            <SummaryCard
              slug={d.slug}
              title={d.frontmatter.title!}
              author={d.frontmatter.author!}
              description={d.frontmatter.description!}
            />
          </div>
        ))}
      </div>
    </div>
  );
}