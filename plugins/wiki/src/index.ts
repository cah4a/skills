import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWikiServer } from "./server.js";

const wikiPath = process.env["WIKI_PATH"];

if (!wikiPath) {
  console.error("Error: WIKI_PATH environment variable is not set.");
  process.exit(1);
}

const server = createWikiServer(wikiPath);
const transport = new StdioServerTransport();

await server.connect(transport);
