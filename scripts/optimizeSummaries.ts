import fs from "node:fs";
import path from "node:path";

const SUM_DIR = path.join(process.cwd(), "content", "summaries");

function seoIntro(title: string) {
  return `Looking for a clear and spoiler-light ${title} summary? This guide covers the plot, main characters, key themes, and the deeper meaning of this classic, so you can understand the story fast.`;
}

function ensureH1(md: string, title: string) {
  const target = `# ${title} Summary (Plot, Themes & Analysis)`;
  if (md.match(/^#\s+/m)) return md.replace(/^#\s+.*$/m, target);
  return `${target}\n\n${md}`;
}

function hasSeoIntro(md: string) {
  const m = md.match(/^# .+\n\n(.+)\n/);
  return Boolean(m && m[1] && !m[1].startsWith("**") && !m[1].startsWith("---"));
}

function insertSeoIntro(md: string, intro: string) {
  return md.replace(/^(# .+\n)/, `$1\n${intro}\n`);
}

function ensureFaq(md: string, title: string) {
  if (md.includes("## Frequently Asked Questions")) return md;

  const faq = `\n\n---\n\n## Frequently Asked Questions About ${title}\n\n### What is ${title} about?\n${title} is a classic story that follows the main characters through a central conflict that reveals bigger ideas about society, human nature, or morality.\n\n### What are the main themes in ${title}?\nCommon themes include identity, power, love, ambition, responsibility, and the consequences of choices—depending on the lens you read it through.\n\n### Is ${title} hard to read?\nMost readers find it manageable with a good summary and context. If the language feels old-fashioned, try reading in short sections and focusing on the big plot moves and themes.\n`;

  return md.trimEnd() + faq + "\n";
}

function ensureSectionHeadings(md: string, title: string) {
  const replacements: Array<[RegExp, string]> = [
    [/^##\s+Overview\s*$/gim, `## ${title} Plot Summary`],
    [/^##\s+What happens.*$/gim, `## ${title} Plot Summary`],
    [/^##\s+Key themes\s*$/gim, `## Key Themes in ${title}`],
    [/^##\s+Who should read it\s*$/gim, `## Why ${title} Still Matters`]
  ];
  let out = md;
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  return out;
}

function getTitleFromMd(md: string, filename: string) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  if (m) return m[1].replace(/\s+Summary.*$/i, "").trim();

  const slug = filename.replace(/\.md$/, "");
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function main() {
  if (!fs.existsSync(SUM_DIR)) {
    console.error(`Missing folder: ${SUM_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SUM_DIR).filter((f) => f.endsWith(".md"));
  let changed = 0;

  for (const f of files) {
    const fp = path.join(SUM_DIR, f);
    const md = fs.readFileSync(fp, "utf8");
    const title = getTitleFromMd(md, f);

    let out = md;
    out = ensureH1(out, title);
    if (!hasSeoIntro(out)) out = insertSeoIntro(out, seoIntro(title));
    out = ensureSectionHeadings(out, title);
    out = ensureFaq(out, title);

    if (out !== md) {
      fs.writeFileSync(fp, out, "utf8");
      changed++;
    }
  }

  console.log(`✅ Optimized ${changed} summary files`);
}

main();