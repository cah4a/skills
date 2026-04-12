# Wiki Entry Format

Each wiki entry is a markdown file in a topical subfolder under `wiki/`.

## Folder structure

Place entries in the folder that best matches their nature:

| Folder | What goes here |
|---|---|
| `architecture/` | System design, component relationships, infrastructure choices |
| `decisions/` | Specific choices with rationale — "we chose X because Y" |
| `features/` | Feature descriptions, requirements, implementation approach |
| `patterns/` | Code patterns, conventions, recurring approaches |
| `ideas/` | Future work, proposals not yet implemented, exploratory thoughts |

Create new folders if none of the above fit. The vector index searches all folders.

## File naming

Use lowercase kebab-case descriptive names: `database-choice.md`, `auth-flow.md`, `rate-limiting-pattern.md`.

## Entry template

```
---
title: "Short descriptive title"
tags: [tag1, tag2, tag3]
date: YYYY-MM-DD
source: commit:abc1234 | session | snapshot:YYYY-MM-DD
---

The body explains the insight, decision, or pattern in plain prose.

Focus on the **why** — the reasoning, trade-offs, and constraints that led
to this state. The **what** is visible in the code; the wiki captures what
isn't.

Include enough context that someone reading this months later, with no
memory of the conversation, understands the decision and its boundaries.
```

## Fields

- **title**: One line. Should make sense in a search result list.
- **tags**: Lowercase, for filtering. Use existing tags when possible.
- **date**: When the insight was captured (not when the code was written).
- **source**: Where this insight came from. Informational only — SHAs may become orphaned after squash merges and that's fine.
  - `commit:<sha>` — extracted from a specific commit
  - `session` — extracted from a Claude conversation
  - `snapshot:<date>` — extracted from a codebase scan
