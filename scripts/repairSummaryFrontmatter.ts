import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "summaries");

function hasFencedFrontmatter(s: string) {
  return s.startsWith("---\n") && s.includes("\n---\n");
}

// If the file starts with `title: ...` etc, wrap the block into `--- ... ---`
function repairUnfencedFrontmatter(s: string) {
  // detect a frontmatter-like block at top: lines with `key: value`
  const lines = s.split("\n");

  // gather initial key:value lines until first blank line
  const fmLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") break;
    if (!/^[a-zA-Z0-9_]+:\s+/.test(line)) break;
    fmLines.push(line);
    i++;
  }

  // if we didn't capture enough, do nothing
  if (fmLines.length < 3) return s;

  const rest = lines.slice(i).join("\n").replace(/^\s+/, ""); // trim leading whitespace

  return `---\n${fmLines.join("\n")}\n---\n\n${rest}`;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

let changed = 0;

for (const file of files) {
  const full = path.join(dir, file);
  const raw = fs.readFileSync(full, "utf8");

  if (hasFencedFrontmatter(raw)) continue;

  const repaired = repairUnfencedFrontmatter(raw);

  if (repaired !== raw) {
    fs.writeFileSync(full, repaired, "utf8");
    changed++;
    console.log(`✅ Repaired: ${file}`);
  }
}

console.log(`\nDone. Repaired ${changed} files.`);