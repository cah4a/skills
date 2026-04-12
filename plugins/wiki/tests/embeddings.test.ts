import { describe, it, expect, beforeAll } from "vitest";
import { createEmbedder, type Embedder } from "../src/embeddings.js";

describe("Embeddings", () => {
  let embedder: Embedder;

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
    dot += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return dot; // vectors are already normalized
}
