import { existsSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createEmbedder, type Embedder } from "./embeddings.js";
import { scanWikiFiles, loadEntry } from "./indexer.js";
import { loadIndex, buildIndex, searchIndex, type IndexedEntry } from "./search.js";

const CACHE_TTL_MS = 5_000;

export function createWikiServer(wikiPath: string): McpServer {
  const server = new McpServer({ name: "wiki", version: "0.1.0" });

  let cachedEntries: IndexedEntry[] = [];
  let lastIndexedAt = 0;
  let embedder: Embedder | null = null;

  async function ensureIndex(): Promise<IndexedEntry[]> {
    const now = Date.now();
    if (now - lastIndexedAt < CACHE_TTL_MS) {
      return cachedEntries;
    }

    if (!existsSync(wikiPath)) {
      return [];
    }

    if (embedder === null) {
      embedder = await createEmbedder();
    }

    const scannedFiles = await scanWikiFiles(wikiPath);
    const entries = await Promise.all(scannedFiles.map((f) => loadEntry(f)));
    const existingIndex = await loadIndex(wikiPath);
    const index = await buildIndex(wikiPath, scannedFiles, entries, embedder, existingIndex);

    cachedEntries = index.entries;
    lastIndexedAt = Date.now();
    return cachedEntries;
  }

  server.tool(
    "wiki_search",
    "Search the project wiki using natural language",
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
      if (!existsSync(wikiPath)) {
        return {
          content: [
            {
              type: "text",
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
              type: "text",
              text: "Wiki exists but has no entries yet. Run /wiki to populate it.",
            },
          ],
        };
      }

      const currentEmbedder = embedder ?? (embedder = await createEmbedder());
      const queryEmbedding = await currentEmbedder.embed(query);
      const results = searchIndex(entries, queryEmbedding, top_k);

      const text = results
        .map(
          ({ title, id, score, body }) =>
            `## ${title}\nFile: ${id} | Score: ${score.toFixed(3)}\n\n${body}`,
        )
        .join("\n\n---\n\n");

      return {
        content: [{ type: "text", text }],
      };
    },
  );

  return server;
}
