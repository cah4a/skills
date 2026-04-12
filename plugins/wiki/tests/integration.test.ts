import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { createEmbedder } from "../src/embeddings.js";
import { scanWikiFiles, loadEntry } from "../src/indexer.js";
import { buildIndex, searchIndex, type IndexedEntry } from "../src/search.js";

const WIKI_DIR = path.resolve(import.meta.dirname, "fixtures/wiki");

describe("Integration: index and search", () => {
  let indexedEntries: IndexedEntry[];

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

    expect(results[0]?.id).toBe("architecture/database.md");
    expect(results[0]?.score).toBeGreaterThan(0.5);
  });

  it("finds auth entry when querying about authentication", async () => {
    const embedder = await createEmbedder();
    const queryEmbedding = await embedder.embed(
      "how does authentication work, tokens, sessions",
    );
    const results = searchIndex(indexedEntries, queryEmbedding, 3);

    expect(results[0]?.id).toBe("decisions/auth-flow.md");
  });
}, 120_000);
