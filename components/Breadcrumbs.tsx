import Link from "next/link";

export function Breadcrumbs({
  items
}: {
  items: Array<{ name: string; href: string }>;
}) {
  return (
    <div className="badge" style={{ marginBottom: 12 }}>
      {items.map((it, idx) => (
        <span key={it.href}>
          {idx > 0 ? " / " : ""}
          <Link href={it.href}>{it.name}</Link>
        </span>
      ))}
    </div>
  );
}