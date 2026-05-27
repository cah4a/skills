import path from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWikiServer } from "./server.js";

const wikiPath = process.env["WIKI_PATH"] ?? path.join(process.cwd(), "wiki");

const server = createWikiServer(wikiPath);
const transport = new StdioServerTransport();

await server.connect(transport);
