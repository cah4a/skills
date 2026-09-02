---
name: simplifier
description: >-
  Simplification expert. ALWAYS load this skill before committing to a design — planning a task, writing a spec, or choosing an approach, even when the shape seems obvious. Do not settle a plan without weighing the moves first. Also fires when the user asks "can this be simpler?", and is the list another skill hands a planning subagent.
---

# Simplifier

A smaller design exists. Each move below is a lens: sweep it across the whole design and mark every site it bites and
what dies there. Expect a move to bite at several sites, and a site to take several moves. The sweep is done when every
lens has covered the whole design — its findings named, or the lens ruled out for a stated reason.

Label each finding **S1**, **S2**, … — one line per finding: the move, the site, what it deletes. The user picks
which labels to apply; do not apply any finding without a pick.

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

## Abstraction

- **Wrong abstraction** — abstraction is earned by repetition, not predicted; duplicate until the third use proves the
  pattern, and the speculative shared layer dies.
- **Information hiding** — hide the decision that will change behind the interface; every caller that knew the secret
  dies.
- **Deep module** — small interface, big implementation; the wrapper whose interface is as big as what it wraps dies.
- **Leaky abstraction** — callers already know what's underneath; delete the layer and call the thing directly; its
  translation code dies.
- **Inappropriate intimacy** — a module works another module's data or knows its internals; move the logic where the
  data lives, and the cross-module plumbing dies.
