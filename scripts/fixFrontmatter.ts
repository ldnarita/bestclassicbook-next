import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

type FM = {
  title?: string;
  author?: string;
  description?: string;
  readingTime?: string;
  year?: number;
  funbookshelfUrl?: string;
  coverImage?: string;
  [k: string]: any;
};

function slugFromFile(filePath: string) {
  return path.basename(filePath).replace(/\.md$/i, "");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalize(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function yamlEscapeString(s: string) {
  const out = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
  return `"${out}"`;
}

function buildFrontmatter(fm: FM) {
  const lines: string[] = [];
  lines.push(`title: ${yamlEscapeString(fm.title || "")}`);
  lines.push(`author: ${yamlEscapeString(fm.author || "")}`);
  lines.push(`description: ${yamlEscapeString(fm.description || "")}`);

  if (fm.readingTime) lines.push(`readingTime: ${yamlEscapeString(String(fm.readingTime))}`);
  if (typeof fm.year === "number") lines.push(`year: ${fm.year}`);
  if (fm.funbookshelfUrl) lines.push(`funbookshelfUrl: ${yamlEscapeString(String(fm.funbookshelfUrl))}`);
  if (fm.coverImage) lines.push(`coverImage: ${yamlEscapeString(String(fm.coverImage))}`);

  return `---\n${lines.join("\n")}\n---\n`;
}

function stripInternalFrontmatterBlocks(body: string) {
  // remove any extra blocks inside body:
  // \n---\n ... \n---\n
  return normalize(body.replace(/\n---\n[\s\S]*?\n---\n/g, "\n"));
}

async function listMarkdownFiles(dir: string) {
  const abs = path.resolve(process.cwd(), dir);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
    .map((e) => path.join(abs, e.name));
}

async function fixFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  const slug = slugFromFile(filePath);
  const fm = (parsed.data || {}) as FM;

  // Required fields with safe defaults
  const title = (fm.title || titleFromSlug(slug)).toString().trim();
  const author = (fm.author || "Unknown Author").toString().trim();
  const description = (fm.description || "Summary coming soon.").toString().trim();

  let body = parsed.content || "";
  body = stripInternalFrontmatterBlocks(body);

  const out = buildFrontmatter({ ...fm, title, author, description }) + "\n" + body + "\n";
  await fs.writeFile(filePath, out, "utf8");
}

async function main() {
  const dir = "content/summaries";
  const files = await listMarkdownFiles(dir);

  let n = 0;
  for (const f of files) {
    await fixFile(f);
    n++;
  }

  console.log(`fixFrontmatter: fixed ${n} file(s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});