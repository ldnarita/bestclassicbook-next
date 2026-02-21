import Link from "next/link";

export function ListCard(props: {
  title: string;
  slug: string;
  description: string;
}) {
  return (
    <Link href={`/lists/${props.slug}`} className="card" style={{ display: "block" }}>
      <div className="h2">{props.title}</div>
      <p className="p" style={{ marginTop: 10 }}>{props.description}</p>
    </Link>
  );
}