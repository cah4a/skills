import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  searchIndex,
  findStaleFiles,
} from "../src/search.js";
import type { IndexedEntry, StoredIndex } from "../src/search.js";
import type { ScannedFile } from "../src/indexer.js";

// ---------------------------------------------------------------------------
// cosineSimilarity
// ---------------------------------------------------------------------------

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it("returns 1 for identical non-unit vectors", () => {
    expect(cosineSimilarity([3, 4], [3, 4])).toBeCloseTo(1);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns 0 for a zero vector", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("returns 0 for both zero vectors", () => {
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  it("handles arbitrary vectors correctly", () => {
    // [1,1] vs [1,0]: cosine = 1/sqrt(2)
    expect(cosineSimilarity([1, 1], [1, 0])).toBeCloseTo(1 / Math.sqrt(2));
  });
});

// ---------------------------------------------------------------------------
// searchIndex
// ---------------------------------------------------------------------------

function makeEntry(id: string, embedding: number[]): IndexedEntry {
  return { id, title: `Title ${id}`, body: `Body ${id}`, embedding };
}

describe("searchIndex", () => {
  it("returns an empty array for an empty index", () => {
    const results = searchIndex([], [1, 0], 5);
    expect(results).toEqual([]);
  });

  it("returns results ranked by descending similarity", () => {
    const entries = [
      makeEntry("a", [1, 0]),   // similarity to [1,0] = 1
      makeEntry("b", [0, 1]),   // similarity to [1,0] = 0
      makeEntry("c", [-1, 0]),  // similarity to [1,0] = -1
    ];

    const results = searchIndex(entries, [1, 0], 3);

    expect(results).toHaveLength(3);
    expect(results[0]?.id).toBe("a");
    expect(results[1]?.id).toBe("b");
    expect(results[2]?.id).toBe("c");
  });

  it("attaches correct scores to results", () => {
    const entries = [makeEntry("a", [1, 0])];
    const results = searchIndex(entries, [1, 0], 1);

    expect(results[0]?.score).toBeCloseTo(1);
  });

  it("respects topK — returns at most topK results", () => {
    const entries = [
      makeEntry("a", [1, 0]),
      makeEntry("b", [0, 1]),
      makeEntry("c", [-1, 0]),
    ];

    const results = searchIndex(entries, [1, 0], 2);

    expect(results).toHaveLength(2);
    expect(results[0]?.id).toBe("a");
    expect(results[1]?.id).toBe("b");
  });

  it("returns all entries when topK exceeds index size", () => {
    const entries = [makeEntry("a", [1, 0]), makeEntry("b", [0, 1])];
    const results = searchIndex(entries, [1, 0], 100);

    expect(results).toHaveLength(2);
  });

  it("result objects have id, title, body, score fields", () => {
    const entry = makeEntry("x", [1, 0]);
    const [result] = searchIndex([entry], [1, 0], 1);

    expect(result).toBeDefined();
    if (!result) return;

    expect(result.id).toBe("x");
    expect(result.title).toBe("Title x");
    expect(result.body).toBe("Body x");
    expect(typeof result.score).toBe("number");
  });
});

// ---------------------------------------------------------------------------
// findStaleFiles
// ---------------------------------------------------------------------------

function makeScannedFile(relativePath: string, mtimeMs: number): ScannedFile {
  return { relativePath, absolutePath: `/wiki/${relativePath}`, mtimeMs };
}

function makeStoredIndex(files: Record<string, number>): StoredIndex {
  return { entries: [], files };
}

describe("findStaleFiles", () => {
  it("returns all files when stored index is null", () => {
    const scanned = [
      makeScannedFile("a.md", 1000),
      makeScannedFile("b.md", 2000),
    ];
    const stale = findStaleFiles(scanned, null);

    expect(stale).toHaveLength(2);
  });

  it("returns no files when all are up-to-date", () => {
    const scanned = [
      makeScannedFile("a.md", 1000),
      makeScannedFile("b.md", 2000),
    ];
    const stored = makeStoredIndex({ "a.md": 1000, "b.md": 2000 });

    const stale = findStaleFiles(scanned, stored);

    expect(stale).toHaveLength(0);
  });

  it("detects new files not in the stored index", () => {
    const scanned = [
      makeScannedFile("a.md", 1000),
      makeScannedFile("new.md", 3000),
    ];
    const stored = makeStoredIndex({ "a.md": 1000 });

    const stale = findStaleFiles(scanned, stored);

    expect(stale).toHaveLength(1);
    expect(stale[0]?.relativePath).toBe("new.md");
  });

  it("detects files with a newer mtime", () => {
    const scanned = [
      makeScannedFile("a.md", 9999), // was 1000 in index
    ];
    const stored = makeStoredIndex({ "a.md": 1000 });

    const stale = findStaleFiles(scanned, stored);

    expect(stale).toHaveLength(1);
    expect(stale[0]?.relativePath).toBe("a.md");
  });

  it("does not flag files whose mtime matches exactly", () => {
    const scanned = [makeScannedFile("a.md", 5000)];
    const stored = makeStoredIndex({ "a.md": 5000 });

    const stale = findStaleFiles(scanned, stored);

    expect(stale).toHaveLength(0);
  });

  it("handles an empty scanned list", () => {
    const stored = makeStoredIndex({ "a.md": 1000 });
    const stale = findStaleFiles([], stored);

    expect(stale).toHaveLength(0);
  });
});
