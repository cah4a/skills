# Spike — reference

Mechanics for the [SKILL.md](SKILL.md) loop: the snapshot helper, the stack file schema, subagent briefs, and a worked example.

## Snapshots (no commits)

The codebase is the mutable state you explore. `scripts/spike.sh` snapshots it so any route can be rolled back — **without ever committing.** Snapshots are plain copies of your tracked + untracked source files into `.git/spike-snapshots/<id>/`.

| Command | When | What it does |
|---|---|---|
| `bash scripts/spike.sh checkpoint base` | Once, at the start | Snapshots the current working tree (including your pre-existing WIP) under id `base`. Revert to `base` always returns to the pristine start. |
| `bash scripts/spike.sh checkpoint <frame-id>` | Before every route | Snapshots the tree under that id. Store the id in the frame — it's where `revert` brings you back to. |
| `bash scripts/spike.sh revert <id>` | When a route loses | Erases the current spike files and restores the snapshot exactly. Route-created files vanish; `.gitignore`d files (node_modules, build output) are left alone. |
| `bash scripts/spike.sh clean` | When the spike is done | Removes `.git/spike-snapshots/`. Your working tree is untouched. |

**What it never does:** commit, stash, move HEAD, or touch your staging index. Your git state is exactly as you left it; only working-tree *files* move. Committing the accepted result is yours alone.

The file set it owns is precisely `git ls-files --cached --others --exclude-standard` — tracked files plus untracked-but-not-ignored. That's why a revert can erase a route's new files yet never delete your `node_modules` or your unrelated ignored artifacts.

### Finishing a spike

When the stack is empty and the goal is met, the accepted work is **already in your working tree** as ordinary uncommitted changes. Review it and commit by hand, however you like. Then drop the snapshots:

```bash
bash scripts/spike.sh clean
```

## The stack file — `.scratch/<YYYYMMDD-HHMM>-<slug>.md`

`.scratch/` carries a `.gitignore` of `*`, which ignores the folder and itself: nothing reaches git, and reverts leave the stack alone. One file per task — if a compaction loses the path, `ls -t .scratch/` finds it. One section per frame; the **top of the stack is the deepest unfinished frame**.

```markdown
# spike: <one-line goal>

## A — use the existing EventBus to fan out notifications
parent: —
status: revised→A1
checkpoint: A          # snapshot taken before route A ran
learnings:
  - EventBus is synchronous; a slow handler would block the request path.
verdict: wrong shape — needs async. Revised to A1.

## A1 — push onto the existing job queue, handle out of band
parent: A
status: accepted
checkpoint: A1
learnings:
  - Queue already has a retry policy we get for free.
verdict: clean, fits the codebase, tests green. New baseline.

## B — <next goal, opened after A1 accepted>
parent: —
status: thinking
```

Keep abandoned/revised frames in the file — struck through or marked `abandoned` — so you never re-walk a dead end.

## Subagent briefs

**Scout** (read-only, optional) — to form or sharpen a hypothesis without spending your own context:

```
Explore <question> in this codebase. Do not change any files.
Report back, tersely: what exists already, the constraints that matter,
and the 1–2 approaches that fit best — with the catch for each.
```

**Router** — to implement one route. Brief it tight and set it up to be judged:

```
Implement: <the frame's hypothesis>.
Files in scope: <list>. Do nothing speculative or outside this.
Match the patterns already in these files.
Report back: your diff, plus anything you noticed — surprises, smells,
and any choice you were forced to make that I should know about.
```

You then read the diff at the senior-engineer bar and run the build/tests yourself. Tests prove it runs; you decide if it's good.

## Worked example

Goal: *send a notification when an order ships.* Two unknowns — how to fan out, and whether it can be async.

| Move | Stack / snapshot |
|---|---|
| `checkpoint base` | base snapshot = your current tree |
| **THINK A** — fan out via the synchronous `EventBus` | frame A, `status: thinking` |
| `checkpoint A` | snapshot before route A |
| **route A** — subagent wires EventBus | diff returned; build green |
| **judge + UNDERSTAND** — works, but EventBus is synchronous; a slow handler blocks the request | learning recorded on A |
| **REVISE A→A1** — push onto the existing job queue instead | A `status: revised→A1`; open A1 |
| `revert A` | working tree back to pre-A; EventBus wiring gone |
| `checkpoint A1` | snapshot before route A1 |
| **route A1** — subagent wires the queue | diff returned |
| **judge → NICE!** — clean, fits, tests green | A1 `accepted`; new baseline |
| **THINK B** — the notification template itself | frame B, off the A1 baseline |
| … goal met → `clean` | you commit the result by hand |

The EventBus attempt left no trace in the final working tree — only the queue-based route survived. That's the point: explore boldly, keep the winner, commit on your own terms.
