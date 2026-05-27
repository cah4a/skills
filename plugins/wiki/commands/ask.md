---
description: "Search and query the project wiki — ask questions about past decisions, patterns, and architecture"
argument-hint: "<question about the project>"
---

You are running the /wiki:ask command. The user's question: $ARGUMENTS

## Gate: wiki must exist

If there is no `wiki/` directory in the project root, tell the user:
"No wiki found. Run `/wiki:init` to set one up first."
Then stop.

## Your task

Answer the user's question by searching the project wiki.

1. Use the `wiki_search` MCP tool to find relevant entries:
   ```
   wiki_search({ query: "<user's question>", top_k: 5 })
   ```

2. Read the matching entries. If the top results don't seem relevant (low scores), try rephrasing the query and searching again.

3. **Synthesize an answer.** Don't just dump raw entries — combine the relevant information into a clear, direct answer to the user's question. Reference which wiki entries the information came from.

4. If the wiki doesn't have enough information to answer the question, say so clearly. Suggest running `/wiki:cognite` to capture the missing context, or offer to look in the codebase directly.

## Examples

User: `/wiki:ask why did we choose postgres?`
→ Search for "database choice postgres", read matching entries, answer: "We chose Postgres over SQLite because we needed row-level locking for concurrent writers. See `decisions/database.md`."

User: `/wiki:ask how does auth work?`
→ Search for "authentication flow", synthesize from matching entries, cite sources.

User: `/wiki:ask what's our testing strategy?`
→ Search, find nothing relevant, respond: "The wiki doesn't have an entry about testing strategy. Want me to run `/wiki:cognite overall` to capture it from the codebase?"
