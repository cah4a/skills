# Wiki Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that maintains a project-scoped wiki of decisions, patterns, and insights, with semantic search via MCP.

**Architecture:** TypeScript MCP server using `@huggingface/transformers` for local embeddings and brute-force cosine similarity for search. A `/wiki` slash command handles all capture modes (init, commits, sessions, branch diffs) with natural language arguments. A SessionStart hook injects wiki awareness into every session.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk`, `@huggingface/transformers`, zod, vitest

---

## File Structure

```
plugins/wiki/
├── .claude-plugin/
│   └── plugin.json                # Plugin metadata
├── .mcp.json                      # MCP server registration
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                   # MCP server entry point
│   ├── server.ts                  # Server setup + tool registration
│   ├── embeddings.ts              # Local embedding generation
│   ├── indexer.ts                 # Wiki file scanning + index building
│   └── search.ts                 # Cosine similarity search
├── tests/
│   ├── fixtures/
│   │   └── wiki/                  # Sample wiki for tests
│   │       ├── architecture/
│   │       │   └── database.md
│   │       └── decisions/
│   │           └── auth-flow.md
│   ├── embeddings.test.ts
│   ├── indexer.test.ts
│   ├── search.test.ts
│   └── server.test.ts
├── skills/
│   └── wiki/
│       ├── SKILL.md               # Skill instructions for Claude
│       └── references/
│           └── entry-format.md    # ADR-lite entry template
├── commands/
│   └── wiki.md                    # /wiki slash command
└── hooks/
    └── session-start.sh           # Context injection hook
```

### Project wiki structure (created per-project by `/wiki` on first run)

```
wiki/
├── .index.json                    # Gitignored — vector index cache
├── README.md                      # Human explanation of the wiki
├── architecture/
├── decisions/
├── features/
├── patterns/
└── ideas/
```

---

## Task 1: Plugin Skeleton

**Files:**
- Create: `plugins/wiki/.claude-plugin/plugin.json`
- Create: `plugins/wiki/.mcp.json`
- Create: `plugins/wiki/package.json`
- Create: `plugins/wiki/tsconfig.json`
- Create: `plugins/wiki/vitest.config.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p plugins/wiki/{.claude-plugin,src,tests/fixtures,skills/wiki/references,commands,hooks}
```

- [ ] **Step 2: Write plugin manifest**

`plugins/wiki/.claude-plugin/plugin.json`:
```json
{
  "name": "wiki",
  "description": "Project-scoped wiki for decisions, patterns, and insights with semantic search",
  "author": {
    "name": "cah4a"
  }
}
```

- [ ] **Step 3: Write MCP server config**

`plugins/wiki/.mcp.json`:
```json
{
  "wiki": {
    "command": "npx",
    "args": ["tsx", "src/index.ts"],
    "cwd": ".",
    "env": {
      "WIKI_PATH": "${PROJECT_DIR}/wiki"
    }
  }
}
```

Note: `PROJECT_DIR` is resolved by Claude Code to the current project root. Verify this env var name during implementation — it may need to be set differently or the path may need to be relative.

- [ ] **Step 4: Write package.json**

`plugins/wiki/package.json`:
```json
{
  "name": "@cah4a/wiki-plugin",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@huggingface/transformers": "^3.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 5: Write tsconfig.json**

`plugins/wiki/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 6: Write vitest config**

`plugins/wiki/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000, // embedding model loading can be slow
  },
});
```

- [ ] **Step 7: Install dependencies**

```bash
cd plugins/wiki && npm install
```

- [ ] **Step 8: Commit**

```bash
git add plugins/wiki/{.claude-plugin,package.json,tsconfig.json,vitest.config.ts,.mcp.json}
git add plugins/wiki/package-lock.json
git commit -m "feat(wiki): scaffold plugin skeleton with MCP server config"
```

---

## Task 2: Test Fixtures

**Files:**
- Create: `plugins/wiki/tests/fixtures/wiki/architecture/database.md`
- Create: `plugins/wiki/tests/fixtures/wiki/decisions/auth-flow.md`
- Create: `plugins/wiki/tests/fixtures/wiki/features/search.md`

- [ ] **Step 1: Create fixture directories**

```bash
mkdir -p plugins/wiki/tests/fixtures/wiki/{architecture,decisions,features}
```

- [ ] **Step 2: Write fixture entries**

`plugins/wiki/tests/fixtures/wiki/architecture/database.md`:
```markdown
---
title: "Database: chose Postgres over SQLite"
tags: [database, architecture, infrastructure]
date: 2026-03-15
source: commit:abc1234
---

We needed row-level locking for concurrent writers, which SQLite
doesn't support well. Trade-off: deployment complexity for correctness.

PostgreSQL also gives us JSONB columns for flexible metadata storage
and a mature extension ecosystem (PostGIS, pg_trgm for full-text search).
```

`plugins/wiki/tests/fixtures/wiki/decisions/auth-flow.md`:
```markdown
---
title: "Auth: JWT with short-lived access tokens"
tags: [auth, security, decisions]
date: 2026-03-20
source: commit:def5678
---

Access tokens expire after 15 minutes. Refresh tokens are stored
server-side in the database (not in cookies) and rotate on each use.

We considered session-based auth but JWT lets us scale the API
horizontally without shared session storage.
```

`plugins/wiki/tests/fixtures/wiki/features/search.md`:
```markdown
---
title: "Full-text search via pg_trgm"
tags: [search, features, postgres]
date: 2026-04-01
source: snapshot:2026-04-01
---

Search uses PostgreSQL's pg_trgm extension for trigram-based
fuzzy matching. This avoids adding Elasticsearch as a dependency.

Indexed columns: title, description, tags. Search results are
ranked by similarity score with a 0.3 threshold.
```

- [ ] **Step 3: Commit**

```bash
git add plugins/wiki/tests/fixtures/
git commit -m "test(wiki): add sample wiki fixtures for testing"
```

---

## Task 3: Embeddings Module

**Files:**
- Test: `plugins/wiki/tests/embeddings.test.ts`
- Create: `plugins/wiki/src/embeddings.ts`

- [ ] **Step 1: Write the failing test**

`plugins/wiki/tests/embeddings.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createEmbedder, type Embedder } from "../src/embeddings.js";

describe("Embeddings", () => {
  let embedder: Embedder;

  // Model loading is slow — share across tests
  beforeAll(async () => {
    embedder = await createEmbedder();
  }, 60_000);

  it("generates a fixed-length vector from text", async () => {
    const vector = await embedder.embed("hello world");

    expect(Array.isArray(vector)).toBe(true);
    expect(vector.length).toBeGreaterThan(0);
    // MiniLM-L6-v2 produces 384-dimensional embeddings
    expect(vector.length).toBe(384);
    // Values should be normalized (unit vector)
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1.0, 1);
  });

  it("produces similar vectors for similar text", async () => {
    const v1 = await embedder.embed("PostgreSQL database configuration");
    const v2 = await embedder.embed("Postgres DB setup and config");
    const v3 = await embedder.embed("chocolate cake recipe ingredients");

    const similarScore = cosine(v1, v2);
    const differentScore = cosine(v1, v3);

    expect(similarScore).toBeGreaterThan(differentScore);
    expect(similarScore).toBeGreaterThan(0.7);
    expect(differentScore).toBeLessThan(0.5);
  });
});

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
  }
  return dot; // vectors are already normalized
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd plugins/wiki && npx vitest run tests/embeddings.test.ts
```

Expected: FAIL — `Cannot find module '../src/embeddings.js'`

- [ ] **Step 3: Implement embeddings module**

`plugins/wiki/src/embeddings.ts`:
```typescript
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

export interface Embedder {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export async function createEmbedder(): Promise<Embedder> {
  const extractor: FeatureExtractionPipeline = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { dtype: "fp32" },
  );

  async function embed(text: string): Promise<number[]> {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as Float32Array);
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await embed(text));
    }
    return results;
  }

  return { embed, embedBatch };
}
```

Note: The exact `@huggingface/transformers` API (v3) may differ from what's shown. The model name may be `Xenova/all-MiniLM-L6-v2` or `sentence-transformers/all-MiniLM-L6-v2` depending on the version. Check the current docs and adjust the model identifier and output extraction. The key contract is: `embed(text) => number[]` returning a normalized 384-dim vector.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd plugins/wiki && npx vitest run tests/embeddings.test.ts
```

Expected: PASS (first run will download the model ~80MB to `~/.cache/huggingface/`)

- [ ] **Step 5: Commit**

```bash
cd plugins/wiki && git add src/embeddings.ts tests/embeddings.test.ts
git commit -m "feat(wiki): add local embedding generation via HuggingFace transformers"
```

---

## Task 4: Indexer Module

**Files:**
- Test: `plugins/wiki/tests/indexer.test.ts`
- Create: `plugins/wiki/src/indexer.ts`

The indexer reads markdown files from the wiki directory, parses YAML frontmatter, and builds an in-memory index with embeddings. It caches the index to `.index.json` and rebuilds only when files have changed.

- [ ] **Step 1: Write the failing test**

`plugins/wiki/tests/indexer.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEntry, scanWikiFiles, type WikiEntry } from "../src/indexer.js";

const FIXTURES = path.resolve(import.meta.dirname, "fixtures/wiki");

describe("parseEntry", () => {
  it("parses frontmatter and body from a markdown file", () => {
    const content = readFileSync(
      path.join(FIXTURES, "architecture/database.md"),
      "utf-8",
    );
    const entry = parseEntry(content, "architecture/database.md");

    expect(entry.id).toBe("architecture/database.md");
    expect(entry.title).toBe("Database: chose Postgres over SQLite");
    expect(entry.tags).toEqual(["database", "architecture", "infrastructure"]);
    expect(entry.date).toBe("2026-03-15");
    expect(entry.source).toBe("commit:abc1234");
    expect(entry.body).toContain("row-level locking");
  });

  it("handles entries without optional frontmatter fields", () => {
    const content = "---\ntitle: Simple entry\n---\n\nJust a body.";
    const entry = parseEntry(content, "ideas/simple.md");

    expect(entry.title).toBe("Simple entry");
    expect(entry.tags).toEqual([]);
    expect(entry.date).toBe("");
    expect(entry.source).toBe("");
    expect(entry.body).toBe("Just a body.");
  });
});

describe("scanWikiFiles", () => {
  it("finds all markdown files recursively", async () => {
    const files = await scanWikiFiles(FIXTURES);

    expect(files.length).toBe(3);
    expect(files.map((f) => f.relativePath).sort()).toEqual([
      "architecture/database.md",
      "decisions/auth-flow.md",
      "features/search.md",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd plugins/wiki && npx vitest run tests/indexer.test.ts
```

Expected: FAIL — `Cannot find module '../src/indexer.js'`

- [ ] **Step 3: Implement indexer module**

`plugins/wiki/src/indexer.ts`:
```typescript
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export interface WikiEntry {
  id: string;          // relative path: "architecture/database.md"
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

export function parseEntry(content: string, relativePath: string): WikiEntry {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!frontmatterMatch) {
    return {
      id: relativePath,
      title: relativePath,
      tags: [],
      date: "",
      source: "",
      body: content.trim(),
    };
  }

  const [, rawFrontmatter, rawBody] = frontmatterMatch;
  const frontmatter = parseFrontmatter(rawFrontmatter ?? "");
  const body = (rawBody ?? "").trim();

  return {
    id: relativePath,
    title: typeof frontmatter.title === "string" ? frontmatter.title : relativePath,
    tags: Array.isArray(frontmatter.tags)
      ? frontmatter.tags.filter((t): t is string => typeof t === "string")
      : [],
    date: typeof frontmatter.date === "string" ? frontmatter.date : String(frontmatter.date ?? ""),
    source: typeof frontmatter.source === "string" ? frontmatter.source : "",
    body,
  };
}

/** Minimal YAML-ish frontmatter parser. Handles: scalars, arrays like [a, b, c]. */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!key || value === undefined) continue;

    const trimmed = value.trim();
    // Array: [a, b, c]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      result[key] = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else {
      // Scalar — strip quotes
      result[key] = trimmed.replace(/^["']|["']$/g, "");
    }
  }
  return result;
}

export async function scanWikiFiles(wikiDir: string): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];
  await walkDir(wikiDir, wikiDir, results);
  return results;
}

async function walkDir(
  baseDir: string,
  currentDir: string,
  results: ScannedFile[],
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories and the index file
      if (!entry.name.startsWith(".")) {
        await walkDir(baseDir, fullPath, results);
      }
    } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
      const stats = await stat(fullPath);
      results.push({
        relativePath: path.relative(baseDir, fullPath),
        absolutePath: fullPath,
        mtimeMs: stats.mtimeMs,
      });
    }
  }
}

export async function loadEntry(file: ScannedFile): Promise<WikiEntry> {
  const content = await readFile(file.absolutePath, "utf-8");
  return parseEntry(content, file.relativePath);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd plugins/wiki && npx vitest run tests/indexer.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd plugins/wiki && git add src/indexer.ts tests/indexer.test.ts
git commit -m "feat(wiki): add wiki file scanner and frontmatter parser"
```

---

## Task 5: Search Module

**Files:**
- Test: `plugins/wiki/tests/search.test.ts`
- Create: `plugins/wiki/src/search.ts`

The search module stores indexed entries (with embeddings) and performs cosine similarity search. It handles index caching via `.index.json`.

- [ ] **Step 1: Write the failing test**

`plugins/wiki/tests/search.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  searchIndex,
  type IndexedEntry,
} from "../src/search.js";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [0.5, 0.5, 0.5, 0.5];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 5);
  });
});

describe("searchIndex", () => {
  const entries: IndexedEntry[] = [
    {
      id: "architecture/database.md",
      title: "Database choice",
      body: "We chose Postgres",
      embedding: [1, 0, 0],
    },
    {
      id: "decisions/auth.md",
      title: "Auth flow",
      body: "JWT with short tokens",
      embedding: [0, 1, 0],
    },
    {
      id: "features/search.md",
      title: "Search feature",
      body: "Full-text search",
      embedding: [0.9, 0.1, 0],
    },
  ];

  it("returns entries ranked by similarity", () => {
    const queryEmbedding = [1, 0, 0]; // closest to database entry
    const results = searchIndex(entries, queryEmbedding, 3);

    expect(results[0]!.id).toBe("architecture/database.md");
    expect(results[1]!.id).toBe("features/search.md");
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it("respects top_k limit", () => {
    const results = searchIndex(entries, [1, 0, 0], 1);
    expect(results.length).toBe(1);
  });

  it("returns empty array for empty index", () => {
    const results = searchIndex([], [1, 0, 0], 5);
    expect(results).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd plugins/wiki && npx vitest run tests/search.test.ts
```

Expected: FAIL — `Cannot find module '../src/search.js'`

- [ ] **Step 3: Implement search module**

`plugins/wiki/src/search.ts`:
```typescript
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WikiEntry, ScannedFile } from "./indexer.js";
import type { Embedder } from "./embeddings.js";

export interface IndexedEntry {
  id: string;
  title: string;
  body: string;
  embedding: number[];
}

export interface SearchResult {
  id: string;
  title: string;
  body: string;
  score: number;
}

interface StoredIndex {
  entries: IndexedEntry[];
  files: Record<string, number>; // relativePath -> mtimeMs
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function searchIndex(
  entries: IndexedEntry[],
  queryEmbedding: number[],
  topK: number,
): SearchResult[] {
  return entries
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      score: cosineSimilarity(entry.embedding, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function loadIndex(wikiDir: string): Promise<StoredIndex | null> {
  const indexPath = path.join(wikiDir, ".index.json");
  try {
    const raw = await readFile(indexPath, "utf-8");
    return JSON.parse(raw) as StoredIndex;
  } catch {
    return null;
  }
}

export async function saveIndex(
  wikiDir: string,
  index: StoredIndex,
): Promise<void> {
  const indexPath = path.join(wikiDir, ".index.json");
  await writeFile(indexPath, JSON.stringify(index), "utf-8");
}

/** Determine which files need re-embedding based on mtime changes. */
export function findStaleFiles(
  scannedFiles: ScannedFile[],
  storedIndex: StoredIndex | null,
): ScannedFile[] {
  if (!storedIndex) return scannedFiles;

  return scannedFiles.filter((file) => {
    const storedMtime = storedIndex.files[file.relativePath];
    return storedMtime === undefined || storedMtime < file.mtimeMs;
  });
}

/** Build or incrementally update the index. */
export async function buildIndex(
  wikiDir: string,
  scannedFiles: ScannedFile[],
  entries: WikiEntry[],
  embedder: Embedder,
  existingIndex: StoredIndex | null,
): Promise<StoredIndex> {
  const staleFiles = findStaleFiles(scannedFiles, existingIndex);
  const staleIds = new Set(staleFiles.map((f) => f.relativePath));

  // Keep non-stale entries from existing index
  const kept = existingIndex
    ? existingIndex.entries.filter((e) => !staleIds.has(e.id))
    : [];

  // Remove entries for files that no longer exist
  const currentIds = new Set(scannedFiles.map((f) => f.relativePath));
  const surviving = kept.filter((e) => currentIds.has(e.id));

  // Embed new/changed entries
  const staleEntries = entries.filter((e) => staleIds.has(e.id));
  const textsToEmbed = staleEntries.map(
    (e) => `${e.title}\n\n${e.body}`,
  );
  const newEmbeddings = await embedder.embedBatch(textsToEmbed);

  const newIndexed: IndexedEntry[] = staleEntries.map((entry, i) => ({
    id: entry.id,
    title: entry.title,
    body: entry.body,
    embedding: newEmbeddings[i]!,
  }));

  const allEntries = [...surviving, ...newIndexed];
  const files: Record<string, number> = {};
  for (const f of scannedFiles) {
    files[f.relativePath] = f.mtimeMs;
  }

  const index: StoredIndex = { entries: allEntries, files };
  await saveIndex(wikiDir, index);
  return index;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd plugins/wiki && npx vitest run tests/search.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd plugins/wiki && git add src/search.ts tests/search.test.ts
git commit -m "feat(wiki): add cosine similarity search and index management"
```

---

## Task 6: MCP Server

**Files:**
- Test: `plugins/wiki/tests/server.test.ts`
- Create: `plugins/wiki/src/server.ts`
- Create: `plugins/wiki/src/index.ts`

- [ ] **Step 1: Write the failing test**

`plugins/wiki/tests/server.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createWikiServer } from "../src/server.js";

describe("Wiki MCP Server", () => {
  it("creates a server with wiki_search tool", () => {
    const server = createWikiServer("/tmp/fake-wiki");
    // The server should be instantiable without errors.
    // Full integration testing requires a running transport,
    // but we verify construction succeeds.
    expect(server).toBeDefined();
  });
});
```

Note: MCP servers are transport-dependent — full tool-invocation tests require stdio or in-memory transport. The integration test in Task 7 will cover end-to-end. This test verifies the server constructs without errors.

- [ ] **Step 2: Run test to verify it fails**

```bash
cd plugins/wiki && npx vitest run tests/server.test.ts
```

Expected: FAIL — `Cannot find module '../src/server.js'`

- [ ] **Step 3: Implement server module**

`plugins/wiki/src/server.ts`:
```typescript
import { existsSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createEmbedder, type Embedder } from "./embeddings.js";
import { scanWikiFiles, loadEntry } from "./indexer.js";
import {
  loadIndex,
  buildIndex,
  searchIndex,
  type IndexedEntry,
} from "./search.js";

export function createWikiServer(wikiPath: string): McpServer {
  const server = new McpServer({
    name: "wiki",
    version: "0.1.0",
  });

  // Lazy-initialized state
  let embedder: Embedder | null = null;
  let cachedEntries: IndexedEntry[] = [];
  let lastIndexTime = 0;

  async function ensureIndex(): Promise<IndexedEntry[]> {
    // If wiki directory doesn't exist, there's nothing to index
    if (!existsSync(wikiPath)) {
      return [];
    }

    const now = Date.now();
    // Re-check files at most every 5 seconds
    if (cachedEntries.length > 0 && now - lastIndexTime < 5000) {
      return cachedEntries;
    }

    if (!embedder) {
      embedder = await createEmbedder();
    }

    const scannedFiles = await scanWikiFiles(wikiPath);
    const wikiEntries = await Promise.all(scannedFiles.map(loadEntry));
    const existingIndex = await loadIndex(wikiPath);
    const index = await buildIndex(
      wikiPath,
      scannedFiles,
      wikiEntries,
      embedder,
      existingIndex,
    );

    cachedEntries = index.entries;
    lastIndexTime = now;
    return cachedEntries;
  }

  server.tool(
    "wiki_search",
    "Search the project wiki for decisions, patterns, and architectural insights. Returns the most semantically relevant entries.",
    {
      query: z.string().describe("Natural language search query"),
      top_k: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .default(5)
        .describe("Number of results to return"),
    },
    async ({ query, top_k }) => {
      // Wiki not initialized — stay quiet, don't prompt
      if (!existsSync(wikiPath)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No wiki directory found. This project has not initialized a wiki. Run /wiki to set one up.",
            },
          ],
        };
      }

      const entries = await ensureIndex();

      if (entries.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Wiki exists but has no entries yet. Run /wiki to populate it.",
            },
          ],
        };
      }

      if (!embedder) {
        embedder = await createEmbedder();
      }

      const queryEmbedding = await embedder.embed(query);
      const results = searchIndex(entries, queryEmbedding, top_k);

      const formatted = results.map((r) =>
        [
          `## ${r.title}`,
          `File: ${r.id} | Score: ${r.score.toFixed(3)}`,
          "",
          r.body,
        ].join("\n"),
      );

      return {
        content: [{ type: "text" as const, text: formatted.join("\n\n---\n\n") }],
      };
    },
  );

  return server;
}
```

- [ ] **Step 4: Implement entry point**

`plugins/wiki/src/index.ts`:
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWikiServer } from "./server.js";

const wikiPath = process.env["WIKI_PATH"];

if (!wikiPath) {
  console.error("WIKI_PATH environment variable is required");
  process.exit(1);
}

const server = createWikiServer(wikiPath);
const transport = new StdioServerTransport();
await server.connect(transport);
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd plugins/wiki && npx vitest run tests/server.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd plugins/wiki && git add src/server.ts src/index.ts tests/server.test.ts
git commit -m "feat(wiki): add MCP server with wiki_search tool"
```

---

## Task 7: Integration Test

**Files:**
- Create: `plugins/wiki/tests/integration.test.ts`

End-to-end test: index the test fixtures, search for something, verify relevant results come back.

- [ ] **Step 1: Write the integration test**

`plugins/wiki/tests/integration.test.ts`:
```typescript
import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { createEmbedder } from "../src/embeddings.js";
import { scanWikiFiles, loadEntry } from "../src/indexer.js";
import { buildIndex, searchIndex } from "../src/search.js";

const WIKI_DIR = path.resolve(import.meta.dirname, "fixtures/wiki");

describe("Integration: index and search", () => {
  let indexedEntries: { id: string; title: string; body: string; embedding: number[] }[];

  beforeAll(async () => {
    const embedder = await createEmbedder();
    const scannedFiles = await scanWikiFiles(WIKI_DIR);
    const entries = await Promise.all(scannedFiles.map(loadEntry));
    const index = await buildIndex(WIKI_DIR, scannedFiles, entries, embedder, null);
    indexedEntries = index.entries;
  }, 120_000);

  it("indexes all fixture entries", () => {
    expect(indexedEntries.length).toBe(3);
  });

  it("finds database entry when querying about databases", async () => {
    const embedder = await createEmbedder();
    const queryEmbedding = await embedder.embed(
      "which database did we choose and why",
    );
    const results = searchIndex(indexedEntries, queryEmbedding, 3);

    expect(results[0]!.id).toBe("architecture/database.md");
    expect(results[0]!.score).toBeGreaterThan(0.5);
  });

  it("finds auth entry when querying about authentication", async () => {
    const embedder = await createEmbedder();
    const queryEmbedding = await embedder.embed(
      "how does authentication work, tokens, sessions",
    );
    const results = searchIndex(indexedEntries, queryEmbedding, 3);

    expect(results[0]!.id).toBe("decisions/auth-flow.md");
  });
}, 120_000);
```

- [ ] **Step 2: Run integration test**

```bash
cd plugins/wiki && npx vitest run tests/integration.test.ts
```

Expected: PASS (may take 30-60s on first run due to model loading)

- [ ] **Step 3: Run all tests together**

```bash
cd plugins/wiki && npx vitest run
```

Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
cd plugins/wiki && git add tests/integration.test.ts
git commit -m "test(wiki): add end-to-end integration test for index and search"
```

---

## Task 8: Entry Format Reference

**Files:**
- Create: `plugins/wiki/skills/wiki/references/entry-format.md`

- [ ] **Step 1: Write the entry format reference**

`plugins/wiki/skills/wiki/references/entry-format.md`:
```markdown
# Wiki Entry Format

Each wiki entry is a markdown file in a topical subfolder under `wiki/`.

## Folder structure

Place entries in the folder that best matches their nature:

| Folder | What goes here |
|---|---|
| `architecture/` | System design, component relationships, infrastructure choices |
| `decisions/` | Specific choices with rationale — "we chose X because Y" |
| `features/` | Feature descriptions, requirements, implementation approach |
| `patterns/` | Code patterns, conventions, recurring approaches |
| `ideas/` | Future work, proposals not yet implemented, exploratory thoughts |

Create new folders if none of the above fit. The vector index searches all folders.

## File naming

Use lowercase kebab-case descriptive names: `database-choice.md`, `auth-flow.md`, `rate-limiting-pattern.md`.

## Entry template

---
title: "Short descriptive title"
tags: [tag1, tag2, tag3]
date: YYYY-MM-DD
source: commit:abc1234 | session | snapshot:YYYY-MM-DD
---

The body explains the insight, decision, or pattern in plain prose.

Focus on the **why** — the reasoning, trade-offs, and constraints that led
to this state. The **what** is visible in the code; the wiki captures what
isn't.

Include enough context that someone reading this months later, with no
memory of the conversation, understands the decision and its boundaries.

## Fields

- **title**: One line. Should make sense in a search result list.
- **tags**: Lowercase, for filtering. Use existing tags when possible.
- **date**: When the insight was captured (not when the code was written).
- **source**: Where this insight came from. Informational only — SHAs may become orphaned after squash merges and that's fine.
  - `commit:<sha>` — extracted from a specific commit
  - `session` — extracted from a Claude conversation
  - `snapshot:<date>` — extracted from a codebase scan
```

- [ ] **Step 2: Commit**

```bash
cd plugins/wiki && git add skills/wiki/references/entry-format.md
git commit -m "docs(wiki): add entry format reference"
```

---

## Task 9: SKILL.md

**Files:**
- Create: `plugins/wiki/skills/wiki/SKILL.md`

- [ ] **Step 1: Write the skill instructions**

`plugins/wiki/skills/wiki/SKILL.md`:
```markdown
---
name: wiki
description: >
  Project knowledge base for decisions, patterns, and architectural insights.
  Use this skill whenever you need to check project context, understand past
  decisions, or record new insights. Trigger when: you're about to make an
  architectural decision and should check if there's prior art; the user asks
  "why did we...", "how does X work", "what's our approach to..."; you're
  writing an implementation plan (add a /wiki step at the end); the user
  mentions "wiki", "project knowledge", "capture this", "remember this
  decision". Also use the wiki_search MCP tool proactively when starting
  work in an unfamiliar area of the codebase.
---

# Project Wiki

A project-scoped knowledge base that captures decisions, patterns, and insights
as committed markdown files with semantic search via MCP.

## Gate: is the wiki initialized?

**If there is no `wiki/` directory in the current project root, STOP.**
This project has not opted into the wiki. Do not suggest wiki actions,
do not call `wiki_search`, do not add `/wiki` steps to plans. The only
thing you should do is respond to an explicit `/wiki` command invocation
(which handles initialization).

The wiki is opt-in per project. If it's not there, it doesn't exist.

---

*Everything below applies only when `wiki/` exists in the project.*

## Reading the wiki

Use the `wiki_search` MCP tool to find relevant entries:

```
wiki_search({ query: "database choice and rationale", top_k: 5 })
```

Do this proactively when:
- Starting work in an area you haven't touched before
- About to make a decision that might already have context
- The user asks about project history or rationale

## Writing to the wiki

Run `/wiki` to capture insights from the current work. The command handles
everything: creating entries, choosing the right folder, deduplicating against
existing content.

When you're writing an implementation plan, include as the final step:
> Run `/wiki` to capture decisions and patterns from this work into the project wiki.

This ensures every planned piece of work leaves a knowledge trail.

## Entry format

Read `references/entry-format.md` for the full template. Key points:
- One file per insight, in a topical subfolder (`architecture/`, `decisions/`, etc.)
- YAML frontmatter with title, tags, date, source
- Body focuses on the **why**, not the **what**

## What belongs in the wiki

Good wiki entries capture knowledge that would otherwise be lost between
sessions: the reasoning behind decisions, trade-offs considered,
constraints discovered, patterns established. The code shows what was done;
the wiki explains why.

**Good entries:**
- "We chose Postgres over SQLite because we need row-level locking"
- "The auth flow uses short-lived JWTs because we need horizontal scaling"
- "Rate limiting is per-user, not per-IP, because we're behind a load balancer"

**Not wiki material:**
- Implementation details visible in the code
- Temporary debugging notes
- Task tracking (use tasks/issues for that)
```

- [ ] **Step 2: Commit**

```bash
cd plugins/wiki && git add skills/wiki/SKILL.md
git commit -m "feat(wiki): add SKILL.md with usage instructions"
```

---

## Task 10: /wiki Command

**Files:**
- Create: `plugins/wiki/commands/wiki.md`

The command uses natural language arguments. Claude interprets the intent and acts accordingly.

- [ ] **Step 1: Write the wiki command**

`plugins/wiki/commands/wiki.md`:
```markdown
---
description: "Capture project knowledge — decisions, patterns, insights — into the project wiki"
argument-hint: "[natural language: 'commits since friday', 'sessions', 'latest', or blank for current work]"
---

You are running the /wiki command. The user's arguments: $ARGUMENTS

## Your task

Capture decisions, patterns, and architectural insights into the project wiki at `wiki/`.

## First: check if wiki exists

If there is no `wiki/` directory in the project root, this is the first run:

1. Create the wiki structure:
   ```
   wiki/
   ├── README.md
   ├── architecture/
   ├── decisions/
   ├── features/
   ├── patterns/
   └── ideas/
   ```
2. Write `wiki/README.md` explaining what the wiki is (a short paragraph for human readers).
3. Add `wiki/.index.json` to `.gitignore` (append, don't overwrite).
4. Tell the user: "Wiki initialized. How should I populate it?"
   - **commits** — scan git history (ask how far back, or accept their specification)
   - **overall** — scan the current codebase and docs to extract project state
   - **skip** — leave empty, populate manually
5. Run the chosen mode.

If the wiki already exists, proceed based on the arguments.

## Interpreting arguments

The user gives natural language instructions. Figure out what they mean:

**No arguments (blank):**
- If on a feature branch: determine the merge-base with the default branch (`git merge-base HEAD main` or `master`). Read the commits and diffs since merge-base. Extract decisions and insights from those changes.
- If on the default branch (main/master): ask the user what they want to process. Suggest: "You're on main. What should I capture? (e.g., 'last 10 commits', 'overall scan', 'this session')"

**Commit-related** (e.g., "commits since friday", "last 10 commits", "everything"):
- Determine the commit range from the natural language description.
- Use `git log` with appropriate flags (--since, -n, revision range) to get the commits.
- For each commit: read the diff and commit message, extract durable insights.

**"latest":**
- Walk backward from HEAD one commit at a time.
- For each commit, check: does the wiki already cover the insights from this commit?
- Stop when you find a commit whose insights are already captured.
- Cognite all uncovered commits you found.
- Cap the walk at 100 commits — if you hit the cap, tell the user and suggest `/wiki all` or a specific range.

**"sessions" or session-related** (e.g., "sessions from this week"):
- Read previous Claude session transcripts from `~/.claude/projects/`.
- Extract decisions, insights, and patterns discussed.
- **Critical**: verify each extracted insight against the current codebase before writing. Sessions contain ideas that may not have been implemented, or were reverted. Only write entries for things that are actually reflected in the code.

**"overall" or broad scan:**
- Read key project files: README.md, CLAUDE.md, docs/, package.json/Cargo.toml/etc., directory structure, CI config.
- Extract: tech stack, architecture patterns, key dependencies, established conventions.
- This is the same as what init does for a fresh wiki — a snapshot of current state.

**Branch name or ref** (e.g., "main", "feature/auth"):
- Compute diff: `git diff <ref>...HEAD`
- Extract insights from the changes on the current branch relative to that ref.

## How to write entries

1. **Read existing entries first.** Before proposing anything new, scan the wiki to understand what's already captured. This prevents duplicates.

2. **Extract insights.** From the source material (commits, code, sessions), identify durable knowledge: decisions with rationale, architectural patterns, constraints discovered, trade-offs made.

3. **Propose entries to the user.** For each proposed entry, show a brief summary:
   ```
   Proposed: decisions/postgres-over-sqlite.md
   "We chose Postgres over SQLite for row-level locking support"
   ```
   Let the user confirm, edit, or skip each one.

4. **Write confirmed entries.** Use the format from `references/entry-format.md`. Place each file in the appropriate topical folder.

5. **After writing, confirm** what was added: list the new files with one-line summaries.

## Deduplication

Before writing any entry, check existing wiki content for overlap. If an existing entry covers the same topic, either:
- **Update** the existing entry with new information (if the new insight adds to it)
- **Skip** (if already fully covered)
- **Create a new entry** (if the angle is genuinely different)

Use your judgment — this is a content decision, not a string comparison.
```

- [ ] **Step 2: Commit**

```bash
cd plugins/wiki && git add commands/wiki.md
git commit -m "feat(wiki): add /wiki command with natural language argument handling"
```

---

## Task 11: SessionStart Hook

**Files:**
- Create: `plugins/wiki/hooks/session-start.sh`

The hook checks if a wiki exists in the current project and injects context about it.

- [ ] **Step 1: Write the hook script**

`plugins/wiki/hooks/session-start.sh`:
```bash
#!/bin/bash
# Wiki SessionStart hook — injects wiki awareness into every session.
# Outputs markdown that gets added to Claude's context.
# CRITICAL: outputs NOTHING if wiki/ doesn't exist. The plugin must be
# completely invisible in projects that haven't opted in.

WIKI_DIR="wiki"

# No wiki in this project — stay completely silent
if [ ! -d "$WIKI_DIR" ]; then
  exit 0
fi

echo "## Project Wiki"
echo ""
echo "This project has a knowledge base at \`wiki/\`. It contains decisions, patterns, and architectural insights captured from previous work."
echo ""

# List topics (folder names with entry counts)
echo "### Topics"
for dir in "$WIKI_DIR"/*/; do
  [ -d "$dir" ] || continue
  dirname=$(basename "$dir")
  # Skip hidden dirs
  [[ "$dirname" == .* ]] && continue
  count=$(find "$dir" -name "*.md" -not -name "README.md" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "- **$dirname/** ($count entries)"
  fi
done

echo ""
echo "### How to use"
echo "- **Search**: Use the \`wiki_search\` MCP tool to find relevant context before making decisions."
echo "- **Capture**: Run \`/wiki\` to save decisions and insights from the current work."
echo "- **Plans**: When writing implementation plans, include a final step: \`Run /wiki to capture decisions from this work.\`"
echo ""
echo "Search the wiki proactively when starting work in an unfamiliar area."
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x plugins/wiki/hooks/session-start.sh
```

- [ ] **Step 3: Verify the hook output with test fixtures**

```bash
cd plugins/wiki && WIKI_DIR=tests/fixtures/wiki bash hooks/session-start.sh
```

Expected: Outputs markdown with topic list showing architecture, decisions, features with counts.

Note: The hook as written uses a hardcoded `WIKI_DIR="wiki"` which looks for `wiki/` relative to the current working directory. This works when Claude Code runs the hook from the project root. The test above overrides the variable to verify output formatting.

- [ ] **Step 4: Commit**

```bash
cd plugins/wiki && git add hooks/session-start.sh
git commit -m "feat(wiki): add SessionStart hook for context injection"
```

---

## Task 12: README and Final Wiring

**Files:**
- Create: `plugins/wiki/README.md`

- [ ] **Step 1: Write plugin README**

`plugins/wiki/README.md`:
```markdown
# Wiki Plugin

A Claude Code plugin that maintains a project-scoped wiki of decisions, patterns,
and architectural insights.

## What it does

- **Captures** knowledge from code changes, conversations, and codebase scans
- **Stores** entries as committed markdown files organized by topic
- **Searches** semantically via an MCP server with local embeddings

## Components

| Component | What it does |
|---|---|
| `/wiki` command | Capture insights — natural language arguments for different sources |
| `wiki_search` MCP tool | Semantic search over wiki entries |
| SessionStart hook | Injects wiki awareness into every session |
| `wiki/` SKILL.md | Tells Claude when and how to use the wiki |

## Quick start

1. Install the plugin
2. Run `/wiki` in any project — it bootstraps the wiki on first run
3. The MCP server starts automatically and indexes your entries
4. Claude will search the wiki proactively when it has context

## Wiki structure (per project)

```
wiki/
├── architecture/    # System design, infrastructure choices
├── decisions/       # Specific choices with rationale
├── features/        # Feature descriptions and approach
├── patterns/        # Code patterns and conventions
├── ideas/           # Future work and proposals
└── .index.json      # Vector index cache (gitignored)
```

## /wiki usage

```
/wiki                          # On branch: capture changes since merge-base
                               # On main: asks what to process
                               # First run: bootstraps wiki

/wiki commits since friday     # Scan recent commits
/wiki last 10 commits          # Scan specific count
/wiki latest                   # Walk back until wiki is current
/wiki sessions from this week  # Mine past conversations (verified against code)
/wiki overall                  # Snapshot current project state
/wiki main                     # Diff current branch against main
```

## Development

```bash
cd plugins/wiki
npm install
npm test           # run tests
npm run dev        # start MCP server locally
```
```

- [ ] **Step 2: Run full test suite one final time**

```bash
cd plugins/wiki && npx vitest run
```

Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
cd plugins/wiki && git add README.md
git commit -m "docs(wiki): add plugin README"
```

---

## Post-Implementation Notes

### Hook registration

The SessionStart hook needs to be registered in the user's Claude Code settings. This can be done manually or as part of the plugin installation process. The hook config in `~/.claude/settings.json` would look like:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash <plugin-path>/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

The exact path depends on where the plugin gets installed. This registration should ideally happen automatically during plugin installation.

### MCP server registration

The `.mcp.json` in the plugin root handles MCP server registration. When the plugin is installed, Claude Code reads this file and starts the server. The `WIKI_PATH` environment variable needs to resolve to the project's `wiki/` directory.

### Things to verify during implementation

1. The exact `@huggingface/transformers` v3 API — model name, output format, pooling options. The plan uses `Xenova/all-MiniLM-L6-v2` but the canonical name may differ.
2. The `@modelcontextprotocol/sdk` tool registration API — the plan uses `server.tool()` with zod schema which matches recent SDK versions. Verify against installed version.
3. How `$ARGUMENTS` is passed to slash commands — verify the exact placeholder syntax.
4. Whether `.mcp.json` in a plugin supports `${PROJECT_DIR}` or equivalent env var substitution for the wiki path.
5. The location and format of Claude Code session transcripts for the `sessions` mode.
