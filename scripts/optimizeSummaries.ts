// scripts/optimizeSummaries.ts
//
// Rewrites markdown summaries into ONE consistent SEO structure:
// - H1: "<Title> Summary (Plot, Themes & Analysis)"
// - Intro paragraph (keyword-targeted)
// - Plot Summary (2 short paragraphs)
// - Key Themes (bullets)
// - Why It Still Matters (1 line)
// - FAQ (3 Q&As)
//
// IMPORTANT: This script cleans existing junk first:
// - removes any stray frontmatter blocks in the body (--- ... ---)
// - removes any existing leading H1(s) and duplicate summary headings
// - removes accidental headings inside extracted plot text
//
// Usage:
//   node --loader ts-node/esm scripts/optimizeSummaries.ts
//   node --loader ts-node/esm scripts/optimizeSummaries.ts --dry
//   node --loader ts-node/esm scripts/optimizeSummaries.ts --file content/summaries/alice-in-wonderland.md

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

function parseArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") args.set("dry", true);
    else if (a === "--dir") args.set("dir", argv[i + 1] || "");
    else if (a === "--file") args.set("file", argv[i + 1] || "");
    else if (a === "--verbose") args.set("verbose", true);
  }
  return {
    dry: Boolean(args.get("dry")),
    verbose: Boolean(args.get("verbose")),
    dir: (args.get("dir") as string) || "content/summaries",
    file: (args.get("file") as string) || ""
  };
}

function slugFromFile(filePath: string) {
  return path.basename(filePath).replace(/\.md$/i, "");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeWhitespace(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yamlEscapeString(s: string) {
  const out = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
  return `"${out}"`;
}

function buildFrontmatter(fm: FM) {
  const lines: string[] = [];
  if (fm.title) lines.push(`title: ${yamlEscapeString(fm.title)}`);
  if (fm.author) lines.push(`author: ${yamlEscapeString(fm.author)}`);
  if (fm.description) lines.push(`description: ${yamlEscapeString(fm.description)}`);
  if (fm.readingTime) lines.push(`readingTime: ${yamlEscapeString(String(fm.readingTime))}`);
  if (typeof fm.year === "number") lines.push(`year: ${fm.year}`);
  if (fm.funbookshelfUrl) lines.push(`funbookshelfUrl: ${yamlEscapeString(fm.funbookshelfUrl)}`);
  if (fm.coverImage) lines.push(`coverImage: ${yamlEscapeString(fm.coverImage)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

// Remove any accidental frontmatter blocks inside the body, not the real top one (gray-matter already handled top)
function stripBodyFrontmatterBlocks(md: string) {
  // remove blocks like:
  // ---
  // title: ...
  // ---
  // found anywhere in body
  return md.replace(/\n---\n[\s\S]*?\n---\n/g, "\n").trim();
}

// Remove any leading H1 and duplicate summary headings
function stripLeadingTitles(md: string, title: string) {
  let s = md.replace(/\r\n/g, "\n");

  // Remove leading H1 lines
  s = s.replace(/^#\s+.*\n+/g, "");

  // Remove repeated title summary headings anywhere near the top
  const t = escapeRegExp(title);
  s = s.replace(new RegExp(String.raw`^#\s+${t}\s+Summary\s*\(.*?\)\s*\n+`, "i"), "");
  s = s.replace(new RegExp(String.raw`^#\s+${t}\s*\n+`, "i"), "");

  // Remove duplicated "Summary (Plot, Themes & Analysis)" occurrences in first ~30 lines
  const lines = s.split("\n");
  const head = lines.slice(0, 30).join("\n");
  const tail = lines.slice(30).join("\n");
  const cleanedHead = head.replace(/#\s+.*Summary\s*\(Plot,\s*Themes\s*&\s*Analysis\)\s*/gi, "");
  s = (cleanedHead + "\n" + tail).trim();

  return s;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeHeadingLines(text: string) {
  // if extracted text contains accidental headings, drop them
  return normalizeWhitespace(
    text
      .split("\n")
      .filter((l) => !l.trim().match(/^#{1,6}\s+/))
      .join("\n")
  );
}

function extractSection(md: string, headings: string[]) {
  const norm = md.replace(/\r\n/g, "\n");
  for (const h of headings) {
    const re = new RegExp(String.raw`(^|\n)#{2,4}\s*${escapeRegExp(h)}\s*\n`, "i");
    const m = re.exec(norm);
    if (!m) continue;

    const start = m.index + m[0].length;
    const rest = norm.slice(start);
    const nextHeading = rest.search(/\n#{2,4}\s+/);
    const chunk = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
    return normalizeWhitespace(chunk);
  }
  return "";
}

function firstParagraph(md: string) {
  const n = normalizeWhitespace(md);
  return (n.split("\n\n")[0] || "").trim();
}

function secondParagraph(md: string) {
  const n = normalizeWhitespace(md);
  return (n.split("\n\n")[1] || "").trim();
}

function extractBullets(md: string) {
  const lines = md.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim());
  const bullets = lines.filter((l) => l.startsWith("- ") || l.startsWith("* "));
  return bullets;
}

function intro(title: string, author: string) {
  // keyword-focused like your example
  return `Looking for a clear, fast **${title}** summary? This guide breaks down the plot, main themes, and key ideas of ${author}'s classic in a spoiler-light, easy-to-read format.`;
}

function faq(title: string) {
  return [
    {
      q: `What is ${title} about?`,
      a: `${title} follows a central journey that tests the main character and reveals deeper ideas beneath the story—without needing a difficult, academic read.`
    },
    {
      q: `What are the main themes in ${title}?`,
      a: `The biggest themes usually include identity, power and rules, social pressure, and how choices shape outcomes—depending on how you interpret key scenes.`
    },
    {
      q: `Is ${title} a difficult read?`,
      a: `Not usually. The language can feel older, but the plot is easy to follow with a quick summary and a few notes on the themes.`
    }
  ];
}

function buildBody(params: {
  title: string;
  author: string;
  plot1: string;
  plot2: string;
  themes: string[];
  why: string;
  funUrl?: string;
}) {
  const { title, author, plot1, plot2, themes, why, funUrl } = params;
  const faqs = faq(title);

  const themeBullets =
    themes.length > 0
      ? themes
      : [
          "- Identity and self-discovery",
          "- Power, authority, and rules",
          "- Choice, consequence, and responsibility",
          "- The gap between appearance and reality"
        ];

  const funLink = funUrl ? `\n\n[Read the full text on FunBookShelf →](${funUrl})` : "";

  return normalizeWhitespace(`
# ${title} Summary (Plot, Themes & Analysis)

${intro(title, author)}

## ${title} Plot Summary
${plot1}

## ${title} Plot Summary
${plot2}

## Key Themes in ${title}
${themeBullets.join("\n")}

## Why ${title} Still Matters
${why}

## Frequently Asked Questions About ${title}

**${faqs[0].q}**  
${faqs[0].a}

**${faqs[1].q}**  
${faqs[1].a}

**${faqs[2].q}**  
${faqs[2].a}
${funLink}
`);
}

async function listMarkdownFiles(dir: string) {
  const abs = path.resolve(process.cwd(), dir);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
    .map((e) => path.join(abs, e.name));
}

async function processFile(filePath: string, dry: boolean, verbose: boolean) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const slug = slugFromFile(filePath);

  const fm = (parsed.data || {}) as FM;
  const title = (fm.title || titleFromSlug(slug)).trim();
  const author = (fm.author || "Unknown Author").trim();
  const description = (fm.description || "Summary coming soon.").trim();
  const funUrl = fm.funbookshelfUrl ? String(fm.funbookshelfUrl).trim() : "";

  // Clean body before any extraction
  let body = parsed.content || "";
  body = stripBodyFrontmatterBlocks(body);
  body = stripLeadingTitles(body, title);

  // Try to reuse content from old structure if present
  const overview = extractSection(body, ["Overview", "Summary", "Quick summary"]);
  const plot = extractSection(body, ["Plot", "Plot Summary", `${title} Plot Summary`, "What happens", "What happens (spoiler-light)"]);
  const themesSec = extractSection(body, ["Themes", "Key Themes", "Key themes"]);
  const who = extractSection(body, ["Why it still matters", "Why it matters", "Why this still matters", "Who should read it"]);

  let plot1 = removeHeadingLines(firstParagraph(plot) || firstParagraph(overview) || firstParagraph(body));
  let plot2 = removeHeadingLines(secondParagraph(plot) || secondParagraph(overview) || "");

  // Ensure we never output empty plot paragraphs
  if (!plot1) plot1 = `A spoiler-light overview of the setup, main characters, and the story’s central conflict.`;
  if (!plot2) plot2 = `A short summary of what unfolds—and what the story suggests about people, society, or human nature—without getting bogged down in details.`;

  let themes = extractBullets(themesSec);
  if (themes.length === 0 && themesSec) {
    const parts = themesSec
      .replace(/\n+/g, " ")
      .split(/[,;•]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    themes = parts.map((p) => `- ${p}`);
  }

  let whyLine = removeHeadingLines(firstParagraph(who));
  if (!whyLine) {
    whyLine = `Ideal if you want a fast, clear classic with a strong message and plenty to think about.`;
  }

  const newFrontmatter = buildFrontmatter({
    ...fm,
    title,
    author,
    description
  });

  const newBody = buildBody({
    title,
    author,
    plot1,
    plot2,
    themes,
    why: whyLine,
    funUrl: funUrl || undefined
  });

  const next = newFrontmatter + "\n" + newBody + "\n";

  if (!dry) await fs.writeFile(filePath, next, "utf8");
  if (verbose) console.log(`[OK] ${slug} (${dry ? "dry-run" : "written"})`);
}

async function main() {
  const { dry, dir, file, verbose } = parseArgs(process.argv.slice(2));

  const targets = file
    ? [path.resolve(process.cwd(), file)]
    : await listMarkdownFiles(dir);

  if (targets.length === 0) {
    console.log(`No .md files found in: ${dir}`);
    process.exit(0);
  }

  let n = 0;
  for (const fp of targets) {
    try {
      await processFile(fp, dry, verbose);
      n++;
    } catch (e: any) {
      console.error(`[ERR] ${fp}: ${e?.message ?? e}`);
    }
  }

  console.log(`Done. Processed ${n} file(s). ${dry ? "(dry-run)" : ""}`.trim());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});