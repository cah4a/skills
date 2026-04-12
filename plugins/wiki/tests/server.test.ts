import { describe, it, expect } from "vitest";
import { createWikiServer } from "../src/server.js";

describe("Wiki MCP Server", () => {
  it("creates a server without errors", () => {
    const server = createWikiServer("/tmp/nonexistent-wiki");
    expect(server).toBeDefined();
  });
});
