---
name: simplifier
description: >-
  Simplification expert. ALWAYS load this skill before committing to a design — planning a task, writing a spec, or choosing an approach, even when the shape seems obvious. Do not settle a plan without looking for a simpler design first. Also fires when the user asks "can this be simpler?".
---

# Simplifier

You've been chosen to find points to simplify the codebase. The simplest design is the one that requires the least effort to
understand, change, verify, and most importantly REASON ABOUT.

**Judge code by the understanding it contributes as well as the complexity it introduces. Removing code can make the
remaining design harder to understand.**

**Simplify how capabilities are implemented before questioning whether they should exist.** Removing a capability is a
scope reduction, not automatically a simplification. Usage count alone does not establish that a capability is unnecessary.
Flag complexity that can be removed while preserving supported behavior; present capability removal separately, with the
lost behavior explicit.

Next is not a checklist to follow blindly; it's a set of good approaches to use as guidance.

Try to find spots that obviously require simplification:
- easy to mess up
- hard to change or understand
- hard to reason about whether it behaves correctly

## Goal Imperative

Search for COGNITIVE COMPLEXITY and BUG PRONE SOLUTIONS. Flag them, then think how it could be solved.
If none are found, don't invent or fabricate them. That is more harmful than helpful.
The goal is to make the codebase easier to reason about, if you don't see what to flag, say so — it's MUCH MORE VALUABLE than chasing rainbows.
If you find a spot that is hard to reason about, but you can't see a way to simplify it, flag it anyway.

## Output

Present your findings in a list, why it's complex or hard to reason about, and a recommended strategy to simplify it.
Let invoker decide how to act on each one.

## Simplification Strategies Database

#### Requirements

- **Delete it** — remove code whose removal preserves supported behavior. Questioning a requirement is a separate
  scope decision; state what capability would be lost.
- **YAGNI** — replace speculative implementation machinery with the direct implementation of supported capabilities.
  Establish speculation from requirements and intent, not usage count alone.
- **Buy it** — the stdlib, platform, or a dependency already does this; the hand-rolled version dies.

#### Representation

- **Invariant** — find what is always true; every check it makes dead dies.
- **Make illegal states unrepresentable** — encode the constraint in the type or schema so the invalid state cannot
  exist; its handling dies.
- **Parse, don't validate** — turn raw input into a proven type once at the boundary; downstream checks die.
- **Smart data** — change the data structure until the algorithm becomes obvious.
- **Derive, don't store** — one source of truth, everything else computed; the sync code between copies dies.

#### State

- **Collapse states** — merge states the system treats identically; the state machine shrinks.
- **Immutable** — stop mutating; defensive copies, ordering rules, and races die.
- **Append-only** — add, never edit; update and conflict logic dies.
- **Idempotent** — same call twice, same result; retry bookkeeping and dedup die.
- **Single writer** — one owner mutates; locks and contention die.
- **Stateless** — push state to the client or the store; session machinery and failover handling die.

#### Flow

- **Invert the dependency** — the arrow that hurts points the wrong way; flip who knows about whom.
- **Barricade** — do the messy thing once at the edge; the core assumes clean data.
- **Precompute** — move work to build or deploy time; runtime machinery dies.
- **Eager or lazy** — flip to whichever kills the cache and its invalidation.
- **Let it crash** — restart from a clean state; recovery paths die.
- **Brute force** — n is small and nothing is measured; the index, the cache, and the clever algorithm die.
- **Least power** — pick the weakest tool that does the job; the DSL, the plugin system, and the interpreter die.
- **Generalize** — find the rule where today's special cases fall out for free; take it when it reduces the independent
  concepts or mechanisms the reader must understand. Code deletion is strong evidence; line count alone isn't enough.
- **Flatten** — inline the single-use wrapper, layer, or indirection. This is the default; only Wrong home, with both
  its tests passing, overrides it.

#### Abstraction

- **Wrong abstraction** — abstraction is earned by repetition, not predicted; duplicate until the third use proves the
  pattern, and the speculative shared layer dies.
- **Wrong home** — say what the module is about in one sentence; a block it doesn't cover moves out only when it is
  both a separate concern and the kind of problem solved over and over across the app — serializers, formatters,
  hooks, anything that solves a concrete problem knowing nothing of its calling spot. Judge reusability by the
  nature of the problem, not today's caller count. Fails either test: Flatten. The host's knowledge of the
  mechanism dies.
- **Information hiding** — hide the decision that will change behind the interface; every caller that knew the secret
  dies.
- **Deep module** — small interface, big implementation; the wrapper whose interface is as big as what it wraps dies.
- **Leaky abstraction** — callers already know what's underneath; delete the layer and call the thing directly; its
  translation code dies.
- **Inappropriate intimacy** — a module works another module's data or knows its internals; move the logic where the
  data lives, and the cross-module plumbing dies.
