---
name: simplifier
description: Simplification moves to weigh before committing to a design. Load before planning, writing a spec, choosing an approach, or preparing what to do — read the list first, then plan.
---

# Simplifier

A smaller design exists. Before committing to a plan, walk every move below against it and name the moves that apply and
what each one deletes. The plan is done when a move has shrunk it, or every move is ruled out for a stated reason.

## Requirements

- **Delete it** — question the requirement itself; the cheapest code is none.
- **YAGNI** — cut flexibility, config, and abstraction that only one caller uses today.
- **Buy it** — the stdlib, platform, or a dependency already does this; the hand-rolled version dies.

## Representation

- **Invariant** — find what is always true; every check it makes dead dies.
- **Make illegal states unrepresentable** — encode the constraint in the type or schema so the invalid state cannot
  exist; its handling dies.
- **Parse, don't validate** — turn raw input into a proven type once at the boundary; downstream checks die.
- **Smart data** — change the data structure until the algorithm becomes obvious.
- **Derive, don't store** — one source of truth, everything else computed; the sync code between copies dies.

## State

- **Collapse states** — merge states the system treats identically; the state machine shrinks.
- **Immutable** — stop mutating; defensive copies, ordering rules, and races die.
- **Append-only** — add, never edit; update and conflict logic dies.
- **Idempotent** — same call twice, same result; retry bookkeeping and dedup die.
- **Single writer** — one owner mutates; locks and contention die.
- **Stateless** — push state to the client or the store; session machinery and failover handling die.

## Flow

- **Invert the dependency** — the arrow that hurts points the wrong way; flip who knows about whom.
- **Barricade** — do the messy thing once at the edge; the core assumes clean data.
- **Precompute** — move work to build or deploy time; runtime machinery dies.
- **Eager or lazy** — flip to whichever kills the cache and its invalidation.
- **Let it crash** — restart from a clean state; recovery paths die.
- **Brute force** — n is small and nothing is measured; the index, the cache, and the clever algorithm die.
- **Least power** — pick the weakest tool that does the job; the DSL, the plugin system, and the interpreter die.
- **Generalize** — find the rule where today's special cases fall out for free; take it only when it nets fewer lines.
- **Flatten** — inline the single-use wrapper, layer, or indirection.
