import fs from "node:fs/promises";
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

export interface StoredIndex {
  entries: IndexedEntry[];
  files: Record<string, number>; // relativePath -> mtimeMs
}

const INDEX_FILENAME = ".index.json";

/**
 * Compute cosine similarity between two vectors.
 * Returns 0 if either vector has zero magnitude.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Search indexed entries by cosine similarity to a query embedding.
 * Returns the top-k results sorted by descending score.
 */
export function searchIndex(
  entries: IndexedEntry[],
  queryEmbedding: number[],
  topK: number,
): SearchResult[] {
  const scored = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    body: entry.body,
    score: cosineSimilarity(entry.embedding, queryEmbedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Find files that are new or have been modified since they were last indexed.
 * Files not present in the stored index (or if index is null) are stale.
 * Files with a higher mtime than what's stored are stale.
 */
export function findStaleFiles(
  scannedFiles: ScannedFile[],
  storedIndex: StoredIndex | null,
): ScannedFile[] {
  if (storedIndex === null) return [...scannedFiles];

  return scannedFiles.filter((file) => {
    const storedMtime = storedIndex.files[file.relativePath];
    // undefined means new file; mismatch means modified
    return storedMtime === undefined || storedMtime < file.mtimeMs;
  });
}

/**
 * Load the stored index from .index.json in the wiki directory.
 * Returns null if the file doesn't exist.
 */
export async function loadIndex(wikiDir: string): Promise<StoredIndex | null> {
  const indexPath = path.join(wikiDir, INDEX_FILENAME);
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    return JSON.parse(raw) as StoredIndex;
  } catch (err) {
    if (isNodeError(err) && err.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Persist the index to .index.json in the wiki directory.
 */
export async function saveIndex(
  wikiDir: string,
  index: StoredIndex,
): Promise<void> {
  const indexPath = path.join(wikiDir, INDEX_FILENAME);
  await fs.writeFile(indexPath, JSON.stringify(index), "utf-8");
}

/**
 * Build (or incrementally update) the search index.
 *
 * - Stale files (new or modified) get re-embedded.
 * - Non-stale entries from the existing index are preserved.
 * - Entries for files that no longer exist in scannedFiles are dropped.
 */
export async function buildIndex(
  wikiDir: string,
  scannedFiles: ScannedFile[],
  entries: WikiEntry[],
  embedder: Embedder,
  existingIndex: StoredIndex | null,
): Promise<StoredIndex> {
  const staleFiles = findStaleFiles(scannedFiles, existingIndex);
  const staleIds = new Set(staleFiles.map((f) => f.relativePath));
  const currentIds = new Set(scannedFiles.map((f) => f.relativePath));

  // Keep entries from the existing index that are not stale and still exist
  const keptEntries: IndexedEntry[] =
    existingIndex?.entries.filter(
      (e) => !staleIds.has(e.id) && currentIds.has(e.id),
    ) ?? [];

  // Find the WikiEntry objects for stale files
  const staleEntries = entries.filter((e) => staleIds.has(e.id));

  // Embed all stale entries in one batch
  let newIndexedEntries: IndexedEntry[] = [];
  if (staleEntries.length > 0) {
    const texts = staleEntries.map((e) => `${e.title}\n\n${e.body}`);
    const embeddings = await embedder.embedBatch(texts);
    newIndexedEntries = staleEntries.map((e, i) => ({
      id: e.id,
      title: e.title,
      body: e.body,
      embedding: embeddings[i] ?? [],
    }));
  }

  const allEntries = [...keptEntries, ...newIndexedEntries];

  // Build the files map from current scanned files
  const files: Record<string, number> = {};
  for (const file of scannedFiles) {
    files[file.relativePath] = file.mtimeMs;
  }

  const newIndex: StoredIndex = { entries: allEntries, files };
  await saveIndex(wikiDir, newIndex);
  return newIndex;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface NodeError extends Error {
  code: string;
}

function isNodeError(err: unknown): err is NodeError {
  return err instanceof Error && "code" in err;
}
