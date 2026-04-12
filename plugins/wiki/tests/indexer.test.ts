import { describe, it, expect } from "vitest";
import path from "node:path";
import { parseEntry, scanWikiFiles, loadEntry } from "../src/indexer.js";

const FIXTURES_DIR = path.resolve(
  import.meta.dirname,
  "fixtures/wiki"
);

describe("parseEntry", () => {
  it("parses full frontmatter correctly", () => {
    const content = `---
title: "Database: chose Postgres over SQLite"
tags: [database, architecture, infrastructure]
date: 2026-03-15
source: commit:abc1234
---

We needed row-level locking for concurrent writers, which SQLite
doesn't support well.
`;
    const entry = parseEntry(content, "architecture/database.md");

    expect(entry.id).toBe("architecture/database.md");
    expect(entry.title).toBe("Database: chose Postgres over SQLite");
    expect(entry.tags).toEqual(["database", "architecture", "infrastructure"]);
    expect(entry.date).toBe("2026-03-15");
    expect(entry.source).toBe("commit:abc1234");
    expect(entry.body.trim()).toContain("row-level locking");
  });

  it("parses minimal frontmatter (title only)", () => {
    const content = `---
title: Minimal Entry
---

Just a body.
`;
    const entry = parseEntry(content, "misc/minimal.md");

    expect(entry.id).toBe("misc/minimal.md");
    expect(entry.title).toBe("Minimal Entry");
    expect(entry.tags).toEqual([]);
    expect(entry.date).toBe("");
    expect(entry.source).toBe("");
    expect(entry.body.trim()).toBe("Just a body.");
  });

  it("parses content with no frontmatter at all", () => {
    const content = `This is just plain body text.

No frontmatter here.
`;
    const entry = parseEntry(content, "misc/no-frontmatter.md");

    expect(entry.id).toBe("misc/no-frontmatter.md");
    expect(entry.title).toBe("");
    expect(entry.tags).toEqual([]);
    expect(entry.date).toBe("");
    expect(entry.source).toBe("");
    expect(entry.body).toContain("plain body text");
  });
});

describe("scanWikiFiles", () => {
  it("finds all 3 fixture markdown files", async () => {
    const files = await scanWikiFiles(FIXTURES_DIR);

    expect(files).toHaveLength(3);
  });

  it("returns correct relative paths for all fixtures", async () => {
    const files = await scanWikiFiles(FIXTURES_DIR);
    const relativePaths = files.map((f) => f.relativePath).sort();

    expect(relativePaths).toEqual([
      "architecture/database.md",
      "decisions/auth-flow.md",
      "features/search.md",
    ]);
  });

  it("returns absolute paths that exist on disk", async () => {
    const files = await scanWikiFiles(FIXTURES_DIR);

    for (const file of files) {
      expect(file.absolutePath).toBe(
        path.join(FIXTURES_DIR, file.relativePath)
      );
      expect(path.isAbsolute(file.absolutePath)).toBe(true);
    }
  });

  it("returns mtime as a positive number", async () => {
    const files = await scanWikiFiles(FIXTURES_DIR);

    for (const file of files) {
      expect(typeof file.mtimeMs).toBe("number");
      expect(file.mtimeMs).toBeGreaterThan(0);
    }
  });
});

describe("loadEntry", () => {
  it("loads and parses the database fixture", async () => {
    const files = await scanWikiFiles(FIXTURES_DIR);
    const dbFile = files.find(
      (f) => f.relativePath === "architecture/database.md"
    );

    expect(dbFile).toBeDefined();
    if (!dbFile) return;

    const entry = await loadEntry(dbFile);

    expect(entry.id).toBe("architecture/database.md");
    expect(entry.title).toBe("Database: chose Postgres over SQLite");
    expect(entry.tags).toEqual(["database", "architecture", "infrastructure"]);
    expect(entry.date).toBe("2026-03-15");
    expect(entry.source).toBe("commit:abc1234");
    expect(entry.body).toContain("row-level locking");
  });
});
