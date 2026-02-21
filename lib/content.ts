import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const ROOT = process.cwd();

function safeReadDir(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

function safeReadFile(filePath: string) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

export type MarkdownDoc<TFrontmatter> = {
  slug: string;
  frontmatter: TFrontmatter;
  content: string;
  html: string;
};

export async function getMarkdownBySlug<TFrontmatter>(
  folderRelative: string,
  slug: string
): Promise<MarkdownDoc<TFrontmatter> | null> {
  const filePath = path.join(ROOT, folderRelative, `${slug}.md`);
  const raw = safeReadFile(filePath);
  if (!raw) return null;

  const parsed = matter(raw);
  const processed = await remark().use(html).process(parsed.content);

  return {
    slug,
    frontmatter: parsed.data as TFrontmatter,
    content: parsed.content,
    html: processed.toString()
  };
}

export async function listMarkdownSlugs(folderRelative: string) {
  const dirPath = path.join(ROOT, folderRelative);
  const files = safeReadDir(dirPath);
  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export async function listMarkdownDocs<TFrontmatter>(folderRelative: string) {
  const slugs = await listMarkdownSlugs(folderRelative);
  const docs = await Promise.all(slugs.map((s) => getMarkdownBySlug<TFrontmatter>(folderRelative, s)));
  return docs.filter(Boolean) as MarkdownDoc<TFrontmatter>[];
}