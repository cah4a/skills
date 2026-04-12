import { pipeline, type Tensor, type FeatureExtractionPipeline } from "@huggingface/transformers";

export interface Embedder {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

const MODEL = "Xenova/all-MiniLM-L6-v2";

export async function createEmbedder(): Promise<Embedder> {
  const extractor: FeatureExtractionPipeline = await pipeline(
    "feature-extraction",
    MODEL
  );

  function tensorToRow(tensor: Tensor, rowIndex: number): number[] {
    const dims = tensor.dims;
    // dims is [batchSize, hiddenSize] after mean pooling, or [hiddenSize] for single
    const hiddenSize = dims[1] ?? dims[0] ?? tensor.size;
    const data = tensor.data;
    const offset = rowIndex * hiddenSize;
    const result: number[] = [];
    for (let i = 0; i < hiddenSize; i++) {
      const val = data[offset + i];
      result.push(typeof val === "number" ? val : 0);
    }
    return result;
  }

  async function embed(text: string): Promise<number[]> {
    const output = await extractor._call(text, {
      pooling: "mean",
      normalize: true,
    });
    return tensorToRow(output, 0);
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const output = await extractor._call(texts, {
      pooling: "mean",
      normalize: true,
    });
    const batchSize = output.dims[0] ?? texts.length;
    const results: number[][] = [];
    for (let i = 0; i < batchSize; i++) {
      results.push(tensorToRow(output, i));
    }
    return results;
  }

  return { embed, embedBatch };
}
