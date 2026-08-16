---
name: self-grill
description: Cold subagents grill an idea into a technical spec, unattended. Re-invoke with a hard decision to fold it in.
disable-model-invocation: true
---

This conversation has already sold you on the idea, so you never write the grill's questions and never answer them —
**cold** subagents do both. Cold means spawned fresh (never a fork) and shown nothing of the run but the spec; the repo
is fair game.

## Spec and scratch

Open both on round one. They are the run's state — each round starts from the files, not your memory.

**The spec** is the answer, and the only thing subagents see. Before the loop starts, write into it the idea, its
**stakes** — what this is, who uses it, what breaks if it's wrong — and its **non-goals** by name: a scope that lives
only in this conversation doesn't exist for the loop.

- **As-built**: present tense, the system as if it already exists. No tasks, phases, or build order — except the path
  to production (existing data, running consumers, what can't ship in one release), which is a permanent constraint,
  not schedule. Grill it hardest, at the stakes the thing has.
- **By system, never by round**: each answer dissolves into the section it bears on.
- **Revised in place**: git keeps the layers. A rejected alternative survives as one line — *rejected X, because Y*.
- Lives where the repo keeps design docs; `docs/` if it keeps none.

**The scratch** is yours alone: the idea as first stated, parked questions, **Yours to decide**. Never design — the
settled belongs in the spec.

```bash
mkdir -p .scratch && printf '*\n' > .scratch/.gitignore
```

`.scratch/<YYYYMMDD-HHMM>-<slug>.md`, one file per task. Lost the path? `ls -t .scratch/`.

## The loop

One round at a time.

1. **Grill** — one cold interrogator reads the spec and attacks inside its scope: the questions whose answers would
   *change the design*, ranked by how much, **five at most**. Non-goals are not targets. Copy parked questions into its
   brief. Brief it that coming back empty is a legitimate return — that's the exit signal.
2. **Answer** — one cold subagent per question, in parallel, each getting only the question and the spec. It reads the
   code and commits to a **verdict**: one recommendation, argued — a menu is a refusal. It answers; it doesn't build.
   With the verdict, an honest confidence and **the one check that would raise it a tier**:
   - **High** — verified: read the code, ran it, or a primary source. Cite which.
   - **Medium** — inferred from real evidence; this exact case unchecked.
   - **Low** — priors, no receipts.
3. **Fold** — you are the only writer. Rewrite spec and scratch before the next round; an answer left in your context
   is gone at compaction.
4. **Repeat** with a fresh interrogator.

**Dry** is the interrogator returning empty — its verdict, not yours: answer a round's questions or park them, never
dismiss them. Dry means ready to build, not nothing left to learn; rounds past dry pad the design, and a grill not dry
by **round six** has stopped converging — stop, hand what's still moving to **Yours to decide**.

## Where each answer goes

- **Past the stakes** → non-goals as a line, *not doing X, because Y*, plus **Yours to decide** — scope you set, the
  user ratifies.
- **High** → the spec, plain and unmarked.
- **Medium** → the spec, flagged, carrying its check. Flag the exceptions only — uniform confidence launders guesses.
- **Low** → parked; re-ask next round decomposed, or re-briefed to verify rather than think. Two rounds stuck → **Open
  questions** in the spec. So does anything building settles faster than asking — does the API feel right, does the
  perf hold; neither blocks dry.

## Yours to decide

Collect in the scratch, raise at dry — never one question at a time: preferences no code-reading settles, real
tradeoffs where both answers hold, questions three rounds haven't moved. One exception: an answer that contradicts the
premise stops the loop now.

## Hard decisions land on top

After dry the user reads the spec and may re-invoke with a decision — *we're on Postgres, not Dynamo.* It enters the
spec as a **given**: unbadged, ungrilled, outranking everything standing. Brief the next interrogator to leave it alone
and hunt only the **wreckage** — every part of the design that assumed otherwise — then run to dry as normal. A given
that breaks nothing is a real outcome: fold it, say the design held, stop.
