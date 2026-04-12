# Wiki Plugin

A Claude Code plugin that maintains a project-scoped wiki of decisions, patterns,
and architectural insights.

## What it does

- **Captures** knowledge from code changes, conversations, and codebase scans
- **Stores** entries as committed markdown files organized by topic
- **Searches** semantically via an MCP server with local embeddings

## Components

| Component | What it does |
|---|---|
| `/wiki` command | Capture insights — natural language arguments for different sources |
| `wiki_search` MCP tool | Semantic search over wiki entries |
| SessionStart hook | Injects wiki awareness into every session |
| `wiki/` SKILL.md | Tells Claude when and how to use the wiki |

## Quick start

1. Install the plugin
2. Run `/wiki` in any project — it bootstraps the wiki on first run
3. The MCP server starts automatically and indexes your entries
4. Claude will search the wiki proactively when it has context

## Wiki structure (per project)

```
wiki/
├── architecture/    # System design, infrastructure choices
├── decisions/       # Specific choices with rationale
├── features/        # Feature descriptions and approach
├── patterns/        # Code patterns and conventions
├── ideas/           # Future work and proposals
└── .index.json      # Vector index cache (gitignored)
```

## /wiki usage

```
/wiki                          # On branch: capture changes since merge-base
                               # On main: asks what to process
                               # First run: bootstraps wiki

/wiki commits since friday     # Scan recent commits
/wiki last 10 commits          # Scan specific count
/wiki latest                   # Walk back until wiki is current
/wiki sessions from this week  # Mine past conversations (verified against code)
/wiki overall                  # Snapshot current project state
/wiki main                     # Diff current branch against main
```

## Development

```bash
cd plugins/wiki
npm install
npm test           # run tests
npm run dev        # start MCP server locally
```
