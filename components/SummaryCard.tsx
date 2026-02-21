import Link from "next/link";

export function SummaryCard(props: {
  title: string;
  author: string;
  slug: string;
  description: string;
}) {
  return (
    <Link href={`/summaries/${props.slug}`} className="card" style={{ display: "block" }}>
      <div className="h2">{props.title}</div>
      <div className="badge">{props.author}</div>
      <p className="p" style={{ marginTop: 10 }}>{props.description}</p>
    </Link>
  );
}