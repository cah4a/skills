# Wiki Entry Format

Each wiki entry is a markdown file in a topical subfolder under `wiki/`.

## Folder structure

Organize entries into topical folders that make sense for your project. Create folders as needed — there's no fixed taxonomy. The vector index searches all folders regardless of structure.

Common patterns:
- Group by domain area (`database/`, `auth/`, `billing/`)
- Group by type (`decisions/`, `patterns/`, `ideas/`)
- Group by feature (`search/`, `notifications/`, `onboarding/`)

Look at existing folders before creating new ones. Use the simplest structure that keeps things findable. If a folder grows unwieldy, split it. If two folders overlap, merge them.

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
