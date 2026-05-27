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
| `/wiki:init` | Bootstrap a project wiki |
| `/wiki:cognite` | Capture insights — natural language arguments for different sources |
| `/wiki:ask` | Query the wiki — ask questions, get synthesized answers |
| `wiki_search` MCP tool | Semantic search over wiki entries |
| SessionStart hook | Injects wiki awareness into every session |

## Quick start

1. Install the plugin
2. Run `/wiki:init` in any project to bootstrap the wiki
3. The MCP server starts automatically and indexes your entries
4. Claude will search the wiki proactively when it has context

## Wiki structure (per project)

```
wiki/
├── <folders>/       # Created dynamically based on project needs
│   └── *.md         # One file per insight, decision, or pattern
├── README.md        # Human-facing explanation
└── .index.json      # Vector index cache (gitignored)
```

Folders are not fixed — they're created organically as entries are written. The structure adapts to each project.

## Commands

```
/wiki:init                             # Bootstrap wiki in current project

/wiki:cognite                          # On branch: capture changes since merge-base
                                       # On main: asks what to process

/wiki:cognite commits since friday     # Scan recent commits
/wiki:cognite last 10 commits          # Scan specific count
/wiki:cognite latest                   # Walk back until wiki is current
/wiki:cognite sessions from this week  # Mine past conversations (verified against code)
/wiki:cognite overall                  # Snapshot current project state
/wiki:cognite main                     # Diff current branch against main

/wiki:ask why did we choose postgres?  # Search wiki and synthesize an answer
/wiki:ask how does auth work?          # Interactive Q&A over wiki entries
```

## Development

```bash
cd plugins/wiki
npm install
npm test           # run tests
npm run dev        # start MCP server locally
```
