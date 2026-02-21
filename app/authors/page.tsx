import Image from "next/image";
import Link from "next/link";
import { baseMetadata } from "@/lib/seo";
import authors from "@/content/authors.json";

export const metadata = baseMetadata({
  title: "Classic Authors | Best Classic Book",
  description: "Explore classic authors and jump to summaries of their most important works."
});

export default function AuthorsIndex() {
  return (
    <div>
      <h1 className="h1">Authors</h1>
      <p className="p">Public domain writers with lasting cultural impact.</p>

      <hr className="sep" />

      <div className="grid">
        {authors.map((a) => (
          <Link className="col-6 card" href={`/authors/${a.slug}`} key={a.slug}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Image
                src={a.image}
                alt={a.name}
                width={76}
                height={76}
                style={{ borderRadius: 16, border: "1px solid var(--border)" }}
              />
              <div>
                <div className="h2">{a.name}</div>
                <p className="p">{a.bio}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}