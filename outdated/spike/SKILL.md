---
name: spike
description: >-
  Drive an uncertain coding task by exploring approaches on a live, backtrackable stack — checkpoint the code, send a subagent down one route, judge what comes back, then keep it, revise the approach and retry, or revert the code and back out. You never write code yourself; subagents implement each route and you judge at a senior-engineer bar. Trigger when the user says "spike", "spike this", "spike a couple approaches", "live stack", "backtrack", "try a route", "explore approaches and keep what works", "go down this path and back out if it's wrong", "checkpoint and try", or when a task has several plausible approaches where the right one only becomes clear by building it — and you want cheap, safe rollback of dead ends while keeping only the winning route.
---

Take a task whose *right* approach you can't see from the armchair — where the only way to know if A works is to build it — and explore it on a live stack you can roll back. Checkpoint the code, send a subagent down route A, judge what comes back. Keep it if it's good; if it's wrong, **revert the code** and try the revised approach. **You never write the implementation yourself** — every route is a subagent; you own the stack, the checkpoints, and the bar. This is lfg's discipline plus a rewind button.

The shape of a run:

```
THINK A → checkpoint → route A → understand → revise A→A1 → revert to checkpoint → route A1 → accept → THINK B …
```

Each frame is a hypothesis you can build, judge, revise, and — if it loses — erase without a trace.

## The hard rule

If you're about to call Edit or Write on a code file, stop. That's a *route*, not your hands. No exceptions for "small," "mechanical," or "I already see the answer" — those are exactly where the pull to just-do-it is strongest. Every line that ships goes through a subagent, and gets judged before it's accepted.

## The stack lives on disk

Keep the stack in `.scratch/<YYYYMMDD-HHMM>-<slug>.md`, not in your head — it must survive a compacted context and remember every dead end so you never re-walk one. Create it before the first frame:

```bash
mkdir -p .scratch && printf '*\n' > .scratch/.gitignore
```

The folder ignores itself, so the stack never reaches git and reverts never touch it. One file per task; the user deletes what they're done with. Lost the path? `ls -t .scratch/`. Each frame holds:

- **hypothesis** — the approach you're testing (the THINK)
- **checkpoint** — the snapshot id to revert to if this route loses, taken *before* the route runs (the frame's own label works)
- **status** — `thinking` · `routing` · `accepted` · `abandoned` · `revised→A1`
- **learnings** — what building it taught you (the UNDERSTAND notes)
- **verdict** — why you accepted or killed it

Revisions are new frames (A1) that inherit A's learnings and name A as parent. Abandoned frames stay in the file, struck through — they're your map of what doesn't work.

## The loop

One frame at a time, depth-first. Each turn, look at the top of the stack and make exactly one move:

1. **THINK** — write the frame's hypothesis. If forming it needs exploration, send a read-only *scout* subagent and record what it returns as a learning. The thinking itself is cheap; do it yourself.
2. **Checkpoint** — `bash scripts/spike.sh checkpoint <frame-id>` → snapshot the code before the route. Now this route is free to abandon.
3. **Route** — dispatch a subagent to implement the hypothesis. Brief it tight (goal, files, nothing speculative) and have it report back its diff *and* what it noticed: surprises, smells, choices it was forced to make.
4. **Judge** — read the diff like a senior engineer who'll maintain it, then run the build/tests to prove it *runs*. Tests prove it runs; **you** decide if it's *good*. Then one move:
   - **Accept (NICE!)** — good and runs → this becomes the new baseline. Mark the frame `accepted`; its result is the checkpoint for the next frame. Pop, and **THINK** the next sibling.
   - **Send back** — right approach, flawed execution → return it to a fresh subagent with specific notes. Same frame, same checkpoint.
   - **Revise + revert** — approach is wrong but you learned why → record the learning, open **A1** from A, run `bash scripts/spike.sh revert A` to restore the code to before A ran, then checkpoint and route A1 from clean ground.
   - **Abandon** — dead end → mark `abandoned`, revert to the *parent's* checkpoint, and backtrack: revise the parent instead.

Repeat until the stack is empty and the top-level goal is met.

## Revert is cheap — so explore boldly

Checkpoints are plain file snapshots under `.git/spike-snapshots/` — the spike **never commits, never stashes, never moves your HEAD or staging.** Committing the result is yours alone. Because every route is bracketed by a snapshot, a losing route costs nothing but the subagent that ran it. Don't agonize over whether A is perfect before trying it — build it, learn from it, keep it or erase it. The willingness to throw a route away is the whole point; a spike that never reverts is just lfg with extra ceremony.

One exception: **never silently discard *accepted* work.** Reverting a route you just built is free and expected. Reverting *past* a frame you already accepted — unwinding real, judged progress — is destructive: stop and confirm with the user first.

## You are the standard

Subagents will hand you code that compiles, passes the test they wrote, and quietly rots the codebase. Judge first for simplicity — measured in the reader's head, not your line count: **boring beats clever, local beats general, obvious beats short.** Does it fit the patterns already here? Could a newcomer follow it on first read? Is it surgical? A route that comes back below the bar gets sent back or revised — it does not get accepted because you're tired of the frame.

## Surface these — don't decide alone

Dispatch the obvious next move without asking. But stop and surface, with your recommendation, when:

- you're about to **revert accepted work** — destructive, always confirm;
- a frame has been **revised three or more times** without converging — the goal itself may be wrong;
- two routes both pass the bar with a **real design tradeoff** between them;
- a route reveals the **codebase isn't what the task assumed.**

These are forks only the user can own. Surfacing them is what keeps "explore boldly" from turning into "thrash forever."

---

Git mechanics, the stack file schema, subagent brief templates, and a full worked example: see [REFERENCE.md](REFERENCE.md).
