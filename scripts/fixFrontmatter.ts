// scripts/fixFrontmatter.ts
// Fixes malformed or missing YAML frontmatter in markdown files.
// Default target: content/summaries/*.md
//
// Usage:
//   npm run fix:frontmatter
//   node --loader ts-node/esm scripts/fixFrontmatter.ts --dry
//   node --loader ts-node/esm scripts/fixFrontmatter.ts --dir content/summaries
//
// What it fixes:
// 1) Files missing --- frontmatter delimiters but starting with key: value lines
// 2) Files where frontmatter appears as inline text (e.g. `title: "..." author: "..." ...`) near the top
// 3) Leaves already-correct files alone

import fs from "node:fs/promises";
import path from "node:path";

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

const KNOWN_KEYS = new Set([
  "title",
  "author",
  "description",
  "readingTime",
  "year",
  "funbookshelfUrl",
  "coverImage"
]);

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

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function yamlEscapeString(s: string) {
  // keep it simple + safe
  const out = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
  return `"${out}"`;
}

function normalizeFrontmatter(fm: FM, slug: string): FM {
  const out: FM = { ...fm };

  // Normalize common strings
  for (const k of ["title", "author", "description", "readingTime", "funbookshelfUrl", "coverImage"] as const) {
    if (typeof out[k] === "string") out[k] = out[k]!.trim();
  }

  // year to number if possible
  if (typeof out.year === "string") {
    const n = Number(out.year);
    if (!Number.isNaN(n)) out.year = n;
    else delete out.year;
  }

  // Required-ish fallbacks
  if (!out.title) out.title = toTitleCaseFromSlug(slug);
  if (!out.author) out.author = "Unknown author";
  if (!out.description) out.description = "Summary coming soon.";

  // Remove empty strings
  for (const k of Object.keys(out)) {
    if (typeof out[k] === "string" && out[k].trim() === "") delete out[k];
  }

  return out;
}

function buildYamlFrontmatter(fm: FM) {
  const orderedKeys: (keyof FM)[] = [
    "title",
    "author",
    "description",
    "readingTime",
    "year",
    "funbookshelfUrl",
    "coverImage"
  ];

  const lines: string[] = [];
  for (const key of orderedKeys) {
    const v = fm[key];
    if (v === undefined || v === null) continue;

    if (key === "year" && typeof v === "number") {
      lines.push(`${key}: ${v}`);
    } else if (typeof v === "string") {
      lines.push(`${key}: ${yamlEscapeString(v)}`);
    } else {
      // fallback stringify
      lines.push(`${key}: ${yamlEscapeString(String(v))}`);
    }
  }

  // If there are extra keys (not expected), include them at the end (stable)
  const extras = Object.keys(fm)
    .filter((k) => !orderedKeys.includes(k as any) && KNOWN_KEYS.has(k))
    .sort();

  for (const k of extras) {
    const v = fm[k];
    if (v === undefined || v === null) continue;
    if (typeof v === "number") lines.push(`${k}: ${v}`);
    else lines.push(`${k}: ${yamlEscapeString(String(v))}`);
  }

  return `---\n${lines.join("\n")}\n---\n`;
}

function hasValidYamlFrontmatter(text: string) {
  // Must start with --- and contain a closing --- on its own line soon after.
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return false;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return false;

  // closing delimiter should be on its own line
  const closingIndex = text.indexOf("\n---\n", 4);
  const closingIndexWin = text.indexOf("\r\n---\r\n", 4);
  return closingIndex !== -1 || closingIndexWin !== -1;
}

function extractFrontmatterFromTopKeyValueLines(text: string): { fm: FM; body: string } | null {
  // Reads consecutive key: value lines from start until first blank line.
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const fm: FM = {};
  let i = 0;
  let sawAny = false;

  while (i < lines.length) {
    const line = lines[i];

    // stop on blank line
    if (line.trim() === "") {
      i++;
      break;
    }

    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.+)\s*$/);
    if (!m) break;

    const key = m[1];
    if (!KNOWN_KEYS.has(key)) break;

    let raw = m[2].trim();
    sawAny = true;

    // strip quotes
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }

    if (key === "year") {
      const n = Number(raw);
      if (!Number.isNaN(n)) fm.year = n;
    } else {
      (fm as any)[key] = raw;
    }

    i++;
  }

  if (!sawAny) return null;

  const body = lines.slice(i).join("\n").replace(/^\n+/, "");
  return { fm, body };
}

function extractFrontmatterFromInlineBlock(text: string): { fm: FM; body: string } | null {
  // Looks for a chunk near the top that contains `title:` etc as inline tokens.
  const norm = text.replace(/\r\n/g, "\n");

  // only examine the top portion to avoid accidental matches later
  const head = norm.slice(0, 1500);

  if (!head.includes("title:") || !head.includes("author:")) return null;

  // find a "frontmatter-like" region: from first "title:" up to the next blank line
  const start = head.indexOf("title:");
  const afterStart = head.slice(start);

  const blankLine = afterStart.search(/\n\s*\n/);
  const region = blankLine === -1 ? afterStart : afterStart.slice(0, blankLine);

  // token regex: key: value (quoted or unquoted)
  const re = /([A-Za-z][A-Za-z0-9_]*)\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d{3,4}|https?:\/\/\S+|[^\s]+)\s*/g;

  const fm: FM = {};
  let match: RegExpExecArray | null;
  let found = 0;

  while ((match = re.exec(region))) {
    const key = match[1];
    if (!KNOWN_KEYS.has(key)) continue;

    let raw = match[2].trim();
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }

    if (key === "year") {
      const n = Number(raw);
      if (!Number.isNaN(n)) fm.year = n;
    } else {
      (fm as any)[key] = raw;
    }

    found++;
  }

  if (found === 0) return null;

  // remove that region from the full text (only the first occurrence)
  const fullStart = norm.indexOf(region);
  let body = norm;
  if (fullStart !== -1) {
    body = (norm.slice(0, fullStart) + norm.slice(fullStart + region.length)).replace(/^\n+/, "");
  }

  return { fm, body };
}

async function listMarkdownFiles(dir: string) {
  const abs = path.resolve(process.cwd(), dir);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
    .map((e) => path.join(abs, e.name));
}

function getSlugFromFile(filePath: string) {
  return path.basename(filePath).replace(/\.md$/i, "");
}

async function processFile(filePath: string, dry: boolean, verbose: boolean) {
  const original = await fs.readFile(filePath, "utf8");
  const slug = getSlugFromFile(filePath);

  if (hasValidYamlFrontmatter(original)) {
    if (verbose) console.log(`[OK] ${slug} (already has YAML frontmatter)`);
    return { filePath, slug, changed: false, reason: "already-ok" as const };
  }

  // Attempt extraction strategies
  const fromTop = extractFrontmatterFromTopKeyValueLines(original);
  const fromInline = !fromTop ? extractFrontmatterFromInlineBlock(original) : null;

  const extracted = fromTop ?? fromInline;
  if (!extracted) {
    // No extractable frontmatter — do nothing (safe)
    console.log(`[SKIP] ${slug} (no recognizable frontmatter to fix)`);
    return { filePath, slug, changed: false, reason: "no-frontmatter-found" as const };
  }

  const fm = normalizeFrontmatter(extracted.fm, slug);
  const yaml = buildYamlFrontmatter(fm);

  const next = `${yaml}\n${extracted.body.replace(/^\n+/, "")}`.replace(/\n{4,}/g, "\n\n\n");

  if (next === original) {
    if (verbose) console.log(`[OK] ${slug} (no changes needed after normalization)`);
    return { filePath, slug, changed: false, reason: "no-change" as const };
  }

  if (!dry) {
    await fs.writeFile(filePath, next, "utf8");
  }

  console.log(`[FIX] ${slug} (${dry ? "dry-run" : "written"})`);
  return { filePath, slug, changed: true, reason: "fixed" as const };
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

  let fixed = 0;
  let skipped = 0;

  for (const fp of targets) {
    try {
      const res = await processFile(fp, dry, verbose);
      if (res.changed) fixed++;
      else skipped++;
    } catch (e: any) {
      console.error(`[ERR] ${fp}: ${e?.message ?? e}`);
    }
  }

  console.log(
    `\nDone. ${fixed} fixed, ${skipped} unchanged/skipped. ${dry ? "(dry-run)" : ""}`.trim()
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});