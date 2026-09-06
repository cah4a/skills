---
name: simplifier
description: >-
  Simplification expert. ALWAYS load this skill before committing to a design — planning a task, writing a spec, or choosing an approach, even when the shape seems obvious. Do not settle a plan without looking for a simpler design first. Also fires when the user asks "can this be simpler?".
---

# Simplifier

Find a formulation of the problem with less to understand. Look for requirements that disappear, cases that share one
rule, behavior a library already provides, and representations that make the logic obvious. Introduce a function,
abstraction, or state machine when it replaces several mechanisms with one coherent concept. Push for the code that
this understanding makes unnecessary.

Understand what the module is responsible for before proposing simplifications. Judge its capabilities against that
responsibility, not just its current callers. An unused capability is not a simplification opportunity unless there is
evidence it no longer belongs.

Look for a simpler design that satisfies the same requirements. Use the moves below to explore alternatives, and weigh
each against keeping the code as it is.

Recommend changes that leave less for a maintainer to understand. Explain what complexity disappears and what replaces
it. When the existing design is the clearest, say so.

Whoever briefed you picks — the user, or the agent that dispatched you. Put the list in your report. Take findings
inside your brief and say which; apply none beyond it without a pick.

## Requirements

- **Delete it** — question the requirement itself; the cheapest code is none.
- **YAGNI** — find abstractions, functions, methods, variables, constants, options, and extension points introduced for
  use cases nobody asked for. Replace them with the direct implementation of the required behavior.
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
- **Generalize** — find the rule where today's special cases fall out for free; take it when it reduces the independent
  concepts or mechanisms the reader must understand. Code deletion is strong evidence; line count alone isn't enough.
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
