---
description: "Initialize a project wiki for capturing decisions, patterns, and insights"
---

You are running the /wiki:init command.

## Your task

Bootstrap a project wiki at `wiki/` in the project root.

## Check if wiki already exists

If `wiki/` already exists, tell the user: "Wiki already exists. Use `/wiki:cognite` to capture new insights or `/wiki:ask` to query it."

## Initialize

1. Create the `wiki/` directory — **no subfolders yet**. Folders will be created organically as entries are written, based on what makes sense for this project.

2. Write `wiki/README.md`:
   ```markdown
   # Project Wiki

   This directory contains project knowledge captured as markdown files —
   decisions, patterns, architectural insights, and other durable context.

   Organized into topical subfolders. Indexed for semantic search via the
   wiki MCP server.

   ## Usage

   - `/wiki:cognite` — capture knowledge from commits, code, or sessions
   - `/wiki:ask` — search and query the wiki
   - `wiki_search` MCP tool — semantic search (used by Claude automatically)
   ```

3. Create `wiki/GUIDE.md` — the wiki governance file. Interview the user briefly to fill it in:

   Ask: "What kind of knowledge matters most for this project? Any specific things you always want tracked (e.g., env variables, API contracts, architecture decisions)?"

   Based on their answers, write a `GUIDE.md` like:

   ```markdown
   # Wiki Guide

   ## Scope
   - [what this project's wiki should capture]

   ## Out of scope
   - [what doesn't belong]

   ## Folder conventions
   - [any project-specific folder rules, or "Folders are created as needed"]

   ## Style
   - Entries should be readable by a new team member in 60 seconds
   - Always include the trade-off, not just the decision
   ```

   Keep it short. The user can refine it later. If they say "just defaults" or want to skip, write a minimal version and move on.

4. Add `wiki/.index.json` to `.gitignore` (append to existing file, don't overwrite).

5. Ask the user how to populate the wiki:

   > Wiki initialized. How should I populate it?
   >
   > - **commits** — scan git history for decisions and patterns (I'll ask how far back)
   > - **overall** — scan the current codebase and docs to extract project state
   > - **skip** — leave empty, you'll capture knowledge as you work

6. Based on the user's choice:
   - **commits**: Ask how far back (or accept a range), then run the cognition workflow — read commits, extract insights, propose entries.
   - **overall**: Read key project files (README.md, CLAUDE.md, docs/, package manifests, directory structure, CI config). Extract tech stack, architecture patterns, key dependencies, conventions. Propose entries.
   - **skip**: Done. Tell the user they can run `/wiki:cognite` any time.

## Writing entries

When creating entries during init, follow the format in `references/entry-format.md`.

For folder names: choose a short, descriptive name based on the content. Don't use a fixed taxonomy — let the project's actual knowledge shape the structure. If two entries are about database decisions, put them in `database/` or `decisions/` — whatever reads naturally for this project.

Propose each entry to the user before writing. They confirm, edit, or skip.
