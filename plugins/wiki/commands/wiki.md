---
description: "Capture project knowledge — decisions, patterns, insights — into the project wiki"
argument-hint: "[natural language: 'commits since friday', 'sessions', 'latest', or blank for current work]"
---

You are running the /wiki command. The user's arguments: $ARGUMENTS

## Your task

Capture decisions, patterns, and architectural insights into the project wiki at `wiki/`.

## First: check if wiki exists

If there is no `wiki/` directory in the project root, this is the first run:

1. Create the wiki structure:
   ```
   wiki/
   ├── README.md
   ├── architecture/
   ├── decisions/
   ├── features/
   ├── patterns/
   └── ideas/
   ```
2. Write `wiki/README.md` explaining what the wiki is (a short paragraph for human readers).
3. Add `wiki/.index.json` to `.gitignore` (append, don't overwrite).
4. Tell the user: "Wiki initialized. How should I populate it?"
   - **commits** — scan git history (ask how far back, or accept their specification)
   - **overall** — scan the current codebase and docs to extract project state
   - **skip** — leave empty, populate manually
5. Run the chosen mode.

If the wiki already exists, proceed based on the arguments.

## Interpreting arguments

The user gives natural language instructions. Figure out what they mean:

**No arguments (blank):**
- If on a feature branch: determine the merge-base with the default branch (`git merge-base HEAD main` or `master`). Read the commits and diffs since merge-base. Extract decisions and insights from those changes.
- If on the default branch (main/master): ask the user what they want to process. Suggest: "You're on main. What should I capture? (e.g., 'last 10 commits', 'overall scan', 'this session')"

**Commit-related** (e.g., "commits since friday", "last 10 commits", "everything"):
- Determine the commit range from the natural language description.
- Use `git log` with appropriate flags (--since, -n, revision range) to get the commits.
- For each commit: read the diff and commit message, extract durable insights.

**"latest":**
- Walk backward from HEAD one commit at a time.
- For each commit, check: does the wiki already cover the insights from this commit?
- Stop when you find a commit whose insights are already captured.
- Cognite all uncovered commits you found.
- Cap the walk at 100 commits — if you hit the cap, tell the user and suggest a specific range.

**"sessions" or session-related** (e.g., "sessions from this week"):
- Read previous Claude session transcripts from `~/.claude/projects/`.
- Extract decisions, insights, and patterns discussed.
- **Critical**: verify each extracted insight against the current codebase before writing. Sessions contain ideas that may not have been implemented, or were reverted. Only write entries for things that are actually reflected in the code.

**"overall" or broad scan:**
- Read key project files: README.md, CLAUDE.md, docs/, package.json/Cargo.toml/etc., directory structure, CI config.
- Extract: tech stack, architecture patterns, key dependencies, established conventions.
- This is the same as what init does for a fresh wiki — a snapshot of current state.

**Branch name or ref** (e.g., "main", "feature/auth"):
- Compute diff: `git diff <ref>...HEAD`
- Extract insights from the changes on the current branch relative to that ref.

## How to write entries

1. **Read existing entries first.** Before proposing anything new, scan the wiki to understand what's already captured. This prevents duplicates.

2. **Extract insights.** From the source material (commits, code, sessions), identify durable knowledge: decisions with rationale, architectural patterns, constraints discovered, trade-offs made.

3. **Propose entries to the user.** For each proposed entry, show a brief summary:
   ```
   Proposed: decisions/postgres-over-sqlite.md
   "We chose Postgres over SQLite for row-level locking support"
   ```
   Let the user confirm, edit, or skip each one.

4. **Write confirmed entries.** Use the format from `references/entry-format.md`. Place each file in the appropriate topical folder.

5. **After writing, confirm** what was added: list the new files with one-line summaries.

## Deduplication

Before writing any entry, check existing wiki content for overlap. If an existing entry covers the same topic, either:
- **Update** the existing entry with new information (if the new insight adds to it)
- **Skip** (if already fully covered)
- **Create a new entry** (if the angle is genuinely different)

Use your judgment — this is a content decision, not a string comparison.
