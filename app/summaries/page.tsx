import { baseMetadata } from "@/lib/seo";
import { listMarkdownDocs } from "@/lib/content";
import { SummaryCard } from "@/components/SummaryCard";

type SummaryFrontmatter = {
  title: string;
  author: string;
  description: string;
  readingTime: string;
  year?: number;
  funbookshelfUrl: string;
};

export const metadata = baseMetadata({
  title: "Classic Book Summaries | Best Classic Book",
  description: "Browse fast, high-quality summaries of public domain classic books."
});

export default async function SummariesIndex() {
  const docs = await listMarkdownDocs<SummaryFrontmatter>("content/summaries");

  return (
    <div>
      <h1 className="h1">Summaries</h1>
      <p className="p">Short, modern summaries with a clean path to read the full text on FunBookShelf.</p>

      <hr className="sep" />

      <div className="grid">
        {docs.map((d) => (
          <div className="col-6" key={d.slug}>
            <SummaryCard
              slug={d.slug}
              title={d.frontmatter.title}
              author={d.frontmatter.author}
              description={d.frontmatter.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}