---
name: wiki
description: >
  Project knowledge base for decisions, patterns, and architectural insights.
  Use this skill whenever you need to check project context, understand past
  decisions, or record new insights. Trigger when: you're about to make an
  architectural decision and should check if there's prior art; the user asks
  "why did we...", "how does X work", "what's our approach to..."; you're
  writing an implementation plan (add a /wiki step at the end); the user
  mentions "wiki", "project knowledge", "capture this", "remember this
  decision". Also use the wiki_search MCP tool proactively when starting
  work in an unfamiliar area of the codebase.
---

# Project Wiki

A project-scoped knowledge base that captures decisions, patterns, and insights
as committed markdown files with semantic search via MCP.

## Gate: is the wiki initialized?

**If there is no `wiki/` directory in the current project root, STOP.**
This project has not opted into the wiki. Do not suggest wiki actions,
do not call `wiki_search`, do not add `/wiki` steps to plans. The only
thing you should do is respond to an explicit `/wiki` command invocation
(which handles initialization).

The wiki is opt-in per project. If it's not there, it doesn't exist.

---

*Everything below applies only when `wiki/` exists in the project.*

## Reading the wiki

Use the `wiki_search` MCP tool to find relevant entries:

```
wiki_search({ query: "database choice and rationale", top_k: 5 })
```

Do this proactively when:
- Starting work in an area you haven't touched before
- About to make a decision that might already have context
- The user asks about project history or rationale

Users can also run `/wiki:ask <question>` for an interactive answer.

## Writing to the wiki

Run `/wiki:cognite` to capture insights from the current work. The command
handles everything: creating entries, choosing the right folder, deduplicating
against existing content.

When you're writing an implementation plan, include as the final step:
> Run `/wiki:cognite` to capture decisions and patterns from this work into the project wiki.

This ensures every planned piece of work leaves a knowledge trail.

## Entry format

Read `references/entry-format.md` for the full template. Key points:
- One file per insight, in a topical subfolder — folders are created dynamically based on project needs
- YAML frontmatter with title, tags, date, source
- Body focuses on the **why**, not the **what**

## What belongs in the wiki

Good wiki entries capture knowledge that would otherwise be lost between
sessions: the reasoning behind decisions, trade-offs considered,
constraints discovered, patterns established. The code shows what was done;
the wiki explains why.

**Good entries:**
- "We chose Postgres over SQLite because we need row-level locking"
- "The auth flow uses short-lived JWTs because we need horizontal scaling"
- "Rate limiting is per-user, not per-IP, because we're behind a load balancer"

**Not wiki material:**
- Implementation details visible in the code
- Temporary debugging notes
- Task tracking (use tasks/issues for that)
