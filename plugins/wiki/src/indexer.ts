import fs from "node:fs/promises";
import path from "node:path";

export interface WikiEntry {
  id: string;
  title: string;
  tags: string[];
  date: string;
  source: string;
  body: string;
}

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  mtimeMs: number;
}

/**
 * Parse a YAML-ish scalar value: strips surrounding quotes.
 */
function parseScalar(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Parse a YAML-ish inline array like `[a, b, c]`.
 * Returns an empty array if the value doesn't look like an array.
 */
function parseArray(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }
  const inner = trimmed.slice(1, -1);
  if (inner.trim() === "") return [];
  return inner.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
}

/**
 * Parse YAML frontmatter and markdown body.
 * Frontmatter is between the first pair of `---` delimiters.
 */
export function parseEntry(content: string, relativePath: string): WikiEntry {
  let title = "";
  let tags: string[] = [];
  let date = "";
  let source = "";
  let body = content;

  // Check for frontmatter: must start with ---
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);

  if (fmMatch) {
    const frontmatter = fmMatch[1] ?? "";
    body = fmMatch[2] ?? "";

    for (const line of frontmatter.split("\n")) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();

      if (key === "title") {
        title = parseScalar(value);
      } else if (key === "tags") {
        tags = parseArray(value);
      } else if (key === "date") {
        date = parseScalar(value);
      } else if (key === "source") {
        // value already contains everything after the first colon, including commit:abc123
        source = parseScalar(value);
      }
    }
  }

  return {
    id: relativePath,
    title,
    tags,
    date,
    source,
    body,
  };
}

/**
 * Recursively scan a directory for .md files.
 * Skips README.md and hidden directories (starting with `.`).
 */
export async function scanWikiFiles(wikiDir: string): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];

  async function walk(dir: string, relativeBase: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const name = entry.name;

      if (entry.isDirectory()) {
        // Skip hidden directories
        if (name.startsWith(".")) continue;
        const subRelative = relativeBase ? `${relativeBase}/${name}` : name;
        await walk(path.join(dir, name), subRelative);
      } else if (entry.isFile() && name.endsWith(".md") && name !== "README.md" && name !== "GUIDE.md") {
        const absolutePath = path.join(dir, name);
        const relativePath = relativeBase ? `${relativeBase}/${name}` : name;
        const stat = await fs.stat(absolutePath);
        results.push({
          relativePath,
          absolutePath,
          mtimeMs: stat.mtimeMs,
        });
      }
    }
  }

  await walk(wikiDir, "");
  return results;
}

/**
 * Read a ScannedFile from disk and parse it into a WikiEntry.
 */
export async function loadEntry(file: ScannedFile): Promise<WikiEntry> {
  const content = await fs.readFile(file.absolutePath, "utf-8");
  return parseEntry(content, file.relativePath);
}
