---
name: lfg
description: >-
  Drive a coding task to completion by unfolding it into a series of subagents — dispatch one subagent per step, hold a senior-engineer bar on what comes back, then decide the next step from there. Trigger whenever the user says "lfg" / "lfg this" / "let's go" / "let's fucking go", or wants an implementation task driven all the way to done via subagents: "implement X", "build this out end to end", "just get this done", "land this", "knock it out", "run with it", "take this and run", "go for it", "spawn agents to do this", "unfold this", "handle the rest". Prefer this over implementing inline when the task spans multiple steps and the user wants you to keep your own context clean and relentlessly land it at merge quality.
---

Take the task and unfold it into subagent-implemented work, driving relentlessly until it's done — and *good*. **You never write the implementation yourself.** Every step goes to a fresh subagent with a tight brief; you orchestrate and judge. Subagents are cheap and disposable — your context is the scarce resource, and it stays sharp only if it doesn't fill up with the details of every file they touched. That separation is the whole reason this works; collapse it and you're just a smart agent that ran out of room.

Go one step at a time and let each finished step reveal the next — don't plan the whole thing upfront, because you can't see the far folds until the near ones land.

## The map

Before the first dispatch, send one read-only scout (an Explore agent) to build the map: the files the task touches, the conventions in play, the commands that build and test. Record the revision you started from — the review diffs the whole run against it.

The map lives on disk, in `.scratch/<YYYYMMDD-HHMM>-<slug>.md`, because your context is the thing that fills up and a compaction takes anything held only there. Create it before the scout:

```bash
mkdir -p .scratch && printf '*\n' > .scratch/.gitignore
```

The folder ignores itself, so the map never reaches git. One file per task; the user deletes what they're done with. Lost the path? `ls -t .scratch/`.

Every brief carries its slice of the map — a subagent that has to rediscover the codebase was under-briefed, not diligent. When a step reports back, fold what it learned — new files, surprises, decisions made — into the file, plus a line naming the step you accepted, so each step starts where the last one ended instead of at the front door.

## The loop

One move at a time — after each, look at what came back and pick the next.

1. **Name the step** — the next one only, drawn from what the last step revealed.
2. **Dispatch** — brief a fresh subagent: the step's goal, its slice of the map, nothing speculative. Have it report back its diff *and* what it noticed — surprises, smells, choices it was forced to make. A subagent briefed this way is a subagent you can judge.
3. **Judge** — read the diff against the bar below, then run the build or tests to prove the change *runs*. That's all tests prove; *you* decide if it's *good*. Below the bar → back to a fresh subagent with specific notes, same step. Above it → fold what it learned into the map.
4. **Loop** — back to 1, until the feature works.
5. **Review** — dispatch the fit review below. Green → done. Findings → each is a step; back to 1.

Done is a green flag, not a working feature.

## The hard rule

If you're about to call Edit or Write on a code file, stop. That's a brief, not your hands. No exceptions for "small," "mechanical," "trivial," or "I already see the answer" — those are exactly the cases where the default to just-do-it pulls hardest, and where the rationalization to break the rule sounds most reasonable. Every line of code that ships goes through a subagent.

## You are the standard

This only works if *you* hold a real bar for what good code is. Subagents will hand you code that compiles, passes the test they wrote, and quietly rots the codebase. Your job is to not let that through.

Read every diff a subagent returns the way a careful senior engineer reads a PR they'll have to maintain. Judge it first for simplicity — but measure simplicity in the reader's head, not your line count: how little they must hold in mind to follow this and change it safely. Three corollaries, each cutting against an instinct of yours — **boring beats clever, local beats general, obvious beats short.** Then the rest: does it fit the patterns already here, or invent a parallel way of doing things? Could a newcomer follow it on first read? Is it surgical, or did it touch what the step didn't need?

## The review

Every step was judged alone and passed alone — and a run of individually-fine steps still lands two money formatters and a parameter every call site passes the same value to. Whether the accumulated whole *belongs here* is a question you can't answer: you know the task too well. It needs a reader who knows the project and not the task.

Dispatch a fresh subagent — never one that ran a step — and give it exactly three things:

- **the cumulative diff of the run** (`git diff` against where you started) — its scope;
- **the project** — its reference: where the diff landed, the conventions around it, and whatever the repo records about itself (`CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, a wiki);
- **the absolute path to [REVIEW.md](REVIEW.md) in this skill's directory** — its brief. Pass the path along; that file is the reviewer's context, not yours.

**Withhold the task rationale** — not why the feature exists, not what you decided along the way. Knowing the reason makes a bad fit look justified, and you want the maintainer who arrives cold.

It returns a green flag, or steps that each cite a path in existing code. Turn each into a step and run the loop again. Its notes — twins not worth collapsing yet — go to the user with the rest of what you surface. Two rounds is the budget: if a third still comes back with cited findings, the goal itself is suspect, so surface that instead of grinding.

## The escape hatch

Dispatch the obvious next step without asking — mechanical work doesn't need permission. But the moment you hit a real decision, stop and surface it with your recommendation before continuing:

- A chance to simplify — code the task could make leaner, or an abstraction worth collapsing.
- Two viable designs with a real tradeoff.
- Something that would change existing behavior or touch code outside the task.
- Unexpected state — the codebase isn't what the task assumed.

These are forks only the user can own. Surfacing them is what keeps "relentless" from turning into "reckless."
