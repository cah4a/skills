---
name: self-grill
description: Cold subagents grill an idea into a technical spec, unattended. Re-invoke with a hard decision to fold it in.
disable-model-invocation: true
---

Interrogate an idea into a design without spending the user's attention. The questions come from a subagent that has never been in this conversation; each answer comes from another one. **You never answer your own questions** — including, especially, the ones you're certain you already know, because that certainty is your prior talking and your prior is what the grill exists to test. An answer generated in the context that generated the question is the same belief in more words. A **cold** subagent — never persuaded of anything, no idea which answer you're hoping for — is the one thing you cannot produce yourself.

## Spec and scratch

Two files, and you own both: the **spec** is the answer, the **scratch** is the working out. Open both on round one, not at the end. They are the state of the run, and neither lives in your context — the run survives a compaction, and each round starts from the files instead of your memory.

### The spec

The design, in **final form** every round: it reads as though the design were finished and someone had just written it up, never as work in progress. This is what the repo keeps and what everyone maintains. Put it where the repo already keeps design docs — match where they live, not how they're shaped, and `docs/` if it keeps none.

**Write it as-built.** Present tense, describing the system as though it already exists — *the indexer reads the queue and writes embeddings* — not the work that produces it. No tasks, no phases, no milestones, no order to build things in: `lfg` and `spike` own the building, and a design that has turned into a task list has stopped saying how anything works.

The one part of getting there that *is* design: **how it reaches production.** What happens to data that already exists, what breaks for anything already running against it, which changes can't ship in the same release. That isn't schedule — it's a permanent constraint on the design, and it's where the hard questions usually are. Grill it hardest.

**Organized by system, never by round.** The grill is process; only the design is content. An answer doesn't become an entry — it dissolves into the section it bears on, as a statement about how the thing works. A heading per question is a transcript of the grilling, and nobody can read a transcript.

**It converges — revise in place, don't append.** Git keeps the layers; the loop never wants them, because a settled question is blocked by the decision standing there, not by a log of having asked it. Rewriting drops one thing worth keeping: an alternative you **considered and rejected** stays as a line in the section it belongs to — *rejected X, because Y* — or the loop proposes it again next round.

It's also the shared brief, and **subagents see nothing else** — not this conversation, not the scratch. Anything not in the spec is invisible to the loop, starting with the idea itself. Write that down first.

### The scratch

Yours alone, and nobody's final form: the idea as the user first stated it, the path to the spec, the questions parked for a later round, and what you owe the user. Never design — the moment something is settled it belongs in the spec.

```bash
mkdir -p .scratch && printf '*\n' > .scratch/.gitignore
```

The folder ignores itself, so the working out never reaches git. `.scratch/<YYYYMMDD-HHMM>-<slug>.md`, one file per task; the user deletes what they're done with. Lost the path? `ls -t .scratch/`.

## The loop

One round at a time.

1. **Grill** — one interrogator subagent, briefed to read the spec and attack it: the questions whose answers would *change the design*, ordered by how much they'd change it. Not a checklist, not coverage. Hand it whatever the scratch has parked. You don't write these yourself for the same reason you don't answer them — this conversation has already sold you on the idea, so your own questions go soft exactly where the design is weakest.

2. **Answer** — one subagent per question, dispatched in parallel, each standalone: it gets the question and the spec, and nothing about who's asking or what the others are finding. It reads the code, digs until it has something to stand on, and commits. It answers; it doesn't build.

3. **Fold** — you are the only writer. Rewrite the spec to absorb what came back and update the scratch, before the next round begins; an answer left in your context is gone at the next compaction and invisible to the next interrogator.

4. **Repeat** — a fresh interrogator reads the updated spec.

The grill runs **dry** when a round returns no question that would change the design. Stop there. Rounds past dry don't sharpen a design, they pad it.

## Confidence needs receipts

Two rules that pull against each other, both load-bearing.

**The answer is a verdict.** One recommendation, chosen and argued. "It depends" and "you could do either" hand the decision back — a menu is a refusal.

**The confidence is honest**, and it absorbs all the hedging the verdict isn't allowed. Confidence is not a feeling; it's what the answer stands on:

- **High** — verified: read the code, ran it, or found it in a primary source. Cite which.
- **Medium** — inferred from real evidence, but this exact case was never checked.
- **Low** — reasoning from priors. No receipts.

Every answer also names **the one check that would raise it a tier**. That's what turns a shrug into the next round's question.

## Where each answer goes

- **High** → into the spec, stated plainly and unmarked. Silence is the confidence.
- **Medium** → into the spec, flagged, carrying the check that would settle it.
- **Low** → not into the spec. Park it in the scratch and re-ask next round, decomposed or re-briefed to go verify rather than think. If two rounds don't move it, it lands in the spec under **Open questions**, named as one.

Flag the exceptions, not everything: a badge on every line is noise nobody can sort, where a badge on the two shaky ones is the most useful thing in the document. The uncertainty still has to survive into the spec — a design that reads uniformly confident has laundered its guesses into prose, and someone will build on them. It's the certainty that goes quiet.

## Surface these — don't decide alone

The point of self-grill is that the user doesn't sit through the interview, so don't hand it back one question at a time. Collect these in the scratch under **Yours to decide** and raise them when the grill runs dry:

- a **preference, not a fact** — no amount of code-reading settles it;
- two answers that both hold up, with a **real tradeoff** between them;
- a question three rounds have failed to move — some things don't yield to grinding.

One exception to waiting: an answer that **contradicts the premise** the whole idea rests on stops the loop now. Every round after a dead premise is wasted.

## Hard decisions land on top

The run ends dry and you read the spec. Then you hand down a decision — *we're on Postgres, not Dynamo.* It's neither a question nor an answer, so nothing grills it and nothing grades it: it goes into the spec as a **given**, unbadged, outranking every decision already standing there. No markers, no protocol — the decision arrives as plain instruction and you do the rest.

What gets grilled is the **wreckage**. Brief the interrogator to leave the given alone and hunt only what it just invalidated: every part of the design that assumed otherwise, including what went quiet three rounds ago. Those are the round's questions, and the loop runs from there as normal until it's dry again.

A given that breaks nothing is a real outcome — fold it in, say the design already held, and stop. Manufacturing a round to look busy is the same padding as running past dry.
