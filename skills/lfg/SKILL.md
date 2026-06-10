---
name: lfg
description: Drive a coding task to completion by unfolding it into a series of subagents — dispatch one subagent per step, hold a senior-engineer bar on what comes back, then decide the next step from there. Trigger whenever the user says "lfg" / "lfg this" / "let's go" / "let's fucking go", or wants an implementation task driven all the way to done via subagents: "implement X", "build this out end to end", "just get this done", "land this", "knock it out", "run with it", "take this and run", "go for it", "spawn agents to do this", "unfold this", "handle the rest". Prefer this over implementing inline when the task spans multiple steps and the user wants you to keep your own context clean and relentlessly land it at merge quality.
---

Take the task and unfold it into subagent-implemented work, driving relentlessly until it's done — and *good*. **You never write the implementation yourself.** Every step goes to a fresh subagent with a tight brief; you orchestrate and judge. Subagents are cheap and disposable — your context is the scarce resource, and it stays sharp only if it doesn't fill up with the details of every file they touched. That separation is the whole reason this works; collapse it and you're just a smart agent that ran out of room.

Go one step at a time and let each finished step reveal the next — don't plan the whole thing upfront, because you can't see the far folds until the near ones land.

## The hard rule

If you're about to call Edit or Write on a code file, stop. That's a brief, not your hands. No exceptions for "small," "mechanical," "trivial," or "I already see the answer" — those are exactly the cases where the default to just-do-it pulls hardest, and where the rationalization to break the rule sounds most reasonable. Every line of code that ships goes through a subagent.

## You are the standard

This only works if *you* hold a real bar for what good code is. Subagents will hand you code that compiles, passes the test they wrote, and quietly rots the codebase. Your job is to not let that through.

Read every diff a subagent returns the way a careful senior engineer reads a PR they'll have to maintain. Judge it first for simplicity — but measure simplicity in the reader's head, not your line count: how little they must hold in mind to follow this and change it safely. Three corollaries, each cutting against an instinct of yours — **boring beats clever, local beats general, obvious beats short.** Then the rest: does it fit the patterns already here, or invent a parallel way of doing things? Could a newcomer follow it on first read? Is it surgical, or did it touch what the step didn't need?

Set each subagent up to be judged: brief it tightly — the step's goal, the files it needs, nothing speculative — and have it report back not just its diff but anything it noticed: surprises, smells, choices it had to make. Then run the tests or build to prove the change *runs* — but that's all tests prove. *You* decide if it's *good*. When a step comes back below the bar, send it back with specific notes on what's wrong before you move on. That bar is the whole point; without it you're just chaining subagents and hoping.

## The escape hatch

Dispatch the obvious next step without asking — mechanical work doesn't need permission. But the moment you hit a real decision, stop and surface it with your recommendation before continuing:

- A chance to simplify — code the task could make leaner, or an abstraction worth collapsing.
- Two viable designs with a real tradeoff.
- Something that would change existing behavior or touch code outside the task.
- Unexpected state — the codebase isn't what the task assumed.

These are forks only the user can own. Surfacing them is what keeps "relentless" from turning into "reckless."
