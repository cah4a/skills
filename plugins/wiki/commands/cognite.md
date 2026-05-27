---
description: "Capture project knowledge — decisions, patterns, insights — into the project wiki"
argument-hint: "[natural language: 'commits since friday', 'sessions', 'latest', or blank for current work]"
---

You are running the /wiki:cognite command. The user's arguments: $ARGUMENTS

## Gate: wiki must exist

If there is no `wiki/` directory in the project root, tell the user:
"No wiki found. Run `/wiki:init` to set one up first."
Then stop.

## Your task

Extract decisions, patterns, and architectural insights and write them to the project wiki at `wiki/`.

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

**Branch name or ref** (e.g., "main", "feature/auth"):
- Compute diff: `git diff <ref>...HEAD`
- Extract insights from the changes on the current branch relative to that ref.

## How to write entries

1. **Read `wiki/GUIDE.md` first.** The guide defines what's in scope, folder conventions, and style rules for this project's wiki. All entries must align with it. If the guide doesn't exist, proceed with defaults.

2. **Read existing entries.** Scan the wiki to understand what's already captured. This prevents duplicates and helps you match the existing structure.

3. **Extract insights.** From the source material (commits, code, sessions), identify durable knowledge: decisions with rationale, architectural patterns, constraints discovered, trade-offs made.

4. **Choose the right folder.** Look at existing wiki folders to maintain consistency. If an existing folder fits, use it. If not, create a new one with a short, descriptive name. Don't force entries into ill-fitting folders — let the structure grow with the project.

5. **Propose entries to the user.** For each proposed entry, show:
   ```
   Proposed: <folder>/<filename>.md
   "<title>"
   ```
   Let the user confirm, edit, or skip each one.

6. **Write confirmed entries.** Use the format from `references/entry-format.md`.

7. **After writing, confirm** what was added: list the new files with one-line summaries.

## Deduplication

Before writing any entry, check existing wiki content for overlap. If an existing entry covers the same topic, either:
- **Update** the existing entry with new information (if the new insight adds to it)
- **Skip** (if already fully covered)
- **Create a new entry** (if the angle is genuinely different)

Use your judgment — this is a content decision, not a string comparison.

## Reorganizing

If while writing entries you notice the folder structure no longer makes sense (e.g., too many entries in one folder, overlapping categories, folders that could be merged), suggest a reorganization to the user. Move files only with their confirmation.
