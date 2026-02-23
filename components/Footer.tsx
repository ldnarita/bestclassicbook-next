import Link from "next/link";
import { FULL_TEXT_BASE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span>© {new Date().getFullYear()} Best Classic Book</span>
          <span className="muted">•</span>
          <a className="muted" href={FULL_TEXT_BASE_URL} rel="noopener noreferrer">
            Read the complete novel online →
          </a>
        </div>
      </div>
    </footer>
  );
}
