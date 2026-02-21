import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="container" style={{ paddingBottom: 40 }}>
      <div className="card">
        <div className="badge">© {new Date().getFullYear()} {SITE.name}</div>
        <p className="p" style={{ marginTop: 10 }}>
          Looking for full public domain texts? Read on{" "}
          <a href={SITE.funnelTarget.url} rel="noopener noreferrer">
            {SITE.funnelTarget.name}
          </a>.
        </p>
      </div>
    </footer>
  );
}
