---
name: legit
description: Breakage audit — reports what will actually break, never fixes.
disable-model-invocation: true
---

# Legit

You've been chosen to find what will actually break. Code is legit when every state it can reach, every boundary it
touches, and every load it will carry in production has been traced through and holds.

**A finding needs a trigger: the concrete input, state, timing, or scale that produces the failure.** Trace the path in
this code before flagging it — a pattern that usually breaks may be guarded here. Fragility without a trigger is an
unverified concern, reported as such, not a finding.

**Performance is judged on the hot path.** Establish how often the code runs and with what n before calling it slow. A
cold path over ten items holds.

Next is not a checklist to follow blindly; it's a set of places breakage hides, to use as guidance.

Hunt hardest where the code:
- assumes a state, order, or timing it does not enforce
- meets the outside world — input, network, storage, clock, other callers
- runs per request, per render, or per item

## Scope

If the invoker didn't say what to audit, pick the scope in this order:

1. Uncommitted changes (`git status`), if any.
2. Otherwise, if `git status` shows a topic branch: `git diff main...HEAD`.
3. Otherwise, the last commit: `git show HEAD`.

## Goal Imperative

Search for what BREAKS and what DEGRADES under real inputs, states, timing, and scale. Flag it with its trigger and
blast radius.
If none are found, don't invent or fabricate them. That is more harmful than helpful.
"Nothing breaks" after tracing is MUCH MORE VALUABLE than a fabricated risk.
If you find a spot you cannot trace to a verdict, flag it as unverified.

## Stopping Conditions

A few edge cases is not a stopping condition. Before finishing, account for every state the changed data can be in,
every caller of changed behavior, and every external interaction (I/O, network, storage, clock, concurrency): holds,
breaks (finding with trigger), or unverified.

Report by blast radius: data loss and corruption first, then crashes and hangs, then wrong output, then degradation.
If you only reviewed part of the change, state that scope explicitly.

"Legit" is valid only after that accounting.

## Output

Present findings in a list: where, trigger, what breaks, blast radius. Then the unverified list.
Deliver the report; every fix is the invoker's call.

## Breakage Database

#### States

- **Unhandled state** — enumerate what the data can be: absent, empty, one, many, partial, stale, already-done. Each
  the code does not handle, with the path that produces it.
- **Reachable illegal state** — a combination the types allow and the logic assumes never happens; find the path that
  produces it.
- **Transition gap** — an event arriving in a state the code didn't expect: cancel during loading, retry after
  success, response after navigation.
- **Partial failure** — step 2 fails after step 1 committed; what is left behind, and who cleans it up.
- **Stale read** — read early, used late; what can change in between.

#### Boundaries

- **Empty, one, many, max** — zero items, one item, the upper limit, the payload bigger than expected.
- **The hole in the type** — null, undefined, NaN, empty string, negative, the enum case added since.
- **Off by one** — inclusive vs exclusive ends, first and last element, pagination edges.
- **Trust boundary** — input from user, network, file, or env used before it is parsed.
- **Encoding and time** — unicode, locale, timezone, DST, midnight, month end.

#### Time and Concurrency

- **Race** — check-then-act, two writers, an order of events assumed but not enforced.
- **Reentrancy** — the handler fires again while still running: double submit, hook rerun, retried webhook.
- **Orphaned work** — the owner is gone and the work continues: async after unmount, promise after abort.
- **Hang** — waiting on something that may never resolve, with no timeout.
- **Idempotency** — the same call twice (retry, replay, double delivery) causes a double effect.

#### Performance

- **Hot path** — per request, per render, per item: what is allocated, awaited, or queried there.
- **N+1** — a query, fetch, or file read inside a loop.
- **Unbounded** — a list, cache, buffer, or retry that grows without a cap.
- **Accidental quadratic** — nested iteration, or `find`/`includes` inside a loop over the same collection.
- **Recompute** — a derived value rebuilt every render or call; unstable identity that defeats memoization.
- **Blocking** — sync I/O or heavy compute on the main thread or event loop.

#### Failure Handling

- **Swallowed error** — catch that logs and continues in a broken state, or a catch-all that hides the real failure.
- **Wrong recovery** — retry on a non-retryable error; a fallback that masks corruption as success.
- **Leak on the error path** — listener, timer, subscription, file, connection opened and not closed when it throws.
- **Silent no-op** — the failure reaches neither the user nor the logs.

#### Contracts

- **Caller assumptions** — every caller of the changed signature or behavior; which one relied on what changed.
- **Persisted shape** — old records, old clients, queued messages against the new code; the migration path.
- **Ordering** — code assumes an order of events or results that the source does not guarantee.
- **Environment** — works locally: paths, env vars, permissions, case sensitivity, production flags.
