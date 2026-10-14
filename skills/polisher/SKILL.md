---
name: polisher
description: Finishing pass — applies the safe list of mechanical refactors to changed code, reports the rest.
disable-model-invocation: true
---

# Polisher

The code in scope already works and was written with care. You polish it: simplifier's eye, with hands restricted to
the safe list below. Polish changes the surface, never the shape: names, expressions, statement order, nesting inside
a function. Signatures, module boundaries, data structures, and behaviour stay exactly as found.

**A move is earned by a yes.** Ask the three questions of every spot in scope:
- is it easy to mess up?
- is it hard to change or understand?
- is it hard to reason about whether it behaves correctly?

One yes earns a move from the safe list that turns it into a no. Three noes is polished, however tempting the reverse
move looks. Polished code run through this pass again yields nothing.

**The safe list is closed.** Every entry is mechanical: an IDE's refactor menu could perform it, and a reviewer
confirms it by eye from the diff. Same inputs, same outputs, same side effects, same evaluation order. A move the list
doesn't name, or one whose caveat you can't rule out, stays unapplied. Certainty applies; doubt reports.

**Every move is local.** It lives inside one file and touches nothing another file can see. An exported name, a
signature, a shared type is out of reach; when a yes needs one, report it.

## Scope

If the invoker didn't say what to polish, take the first of these that has changes:

1. Files changed in this conversation.
2. Uncommitted changes (`git status`).
3. The topic branch: `git diff main...HEAD`.

The unit is the file. Polish the changed hunks and the functions they live in. The rest of the file is context you
read, not a target you edit.

## Pass

One file at a time, to completion, before opening the next:

1. Read the whole file; a rename or a slide made blind to the rest of it collides with it.
2. Ask the three questions of every changed function and the lines in it. For each yes, pick the safe-list move
   that answers it, or note it for the invoker.
3. Apply the moves. Reread the function after each; one move often reveals or retires the next.
4. Run the project's type check. A failure is your move's fault until proven otherwise; fix or revert before the
   next file.

## Stopping Conditions

Finish when every changed function in scope is accounted for: moves applied, yeses handed over, or three noes. Say
which.

Inventing a yes to have something to show costs more than it gives. "Already polished" is a valid result after the
questions, and not before them.

## Output

Per file: each move applied, named by its safe-list entry, with the line it touched. Then the handed-over list: each
yes no safe move answers, one line each, for the invoker or for simplifier.

## Safe List

#### Names

- **Rename** — a local, parameter, or private function whose name no longer says what it holds or does. A name that
  is also a property key, in shorthand or destructuring, stays.
- **Comment into code** — a comment that says what the next lines do; rename and restructure until the comment is
  redundant, then delete it. A comment carrying why, an external constraint or a workaround's reason, stays.
- **Split variable** — one variable reassigned for a second purpose; the second purpose gets its own name.

#### Expressions

- **Extract variable** — a sub-expression the reader must work out to follow the line, a condition above all; name
  it. Keep evaluation where it was: hoisting an expression out from behind a short-circuit, a loop, or a lazy branch
  is a behaviour change.
- **Inline variable** — a name used once that says no more than its expression. Used twice, or with a side effect or
  a cost: it stays.
- **Replace magic literal** — a bare number or string whose meaning the reader must guess; a named constant beside
  its first use.

#### Flow

- **Guard clause** — a nested conditional whose else-branch is the main path; return early and dedent.
- **Consolidate conditional** — several checks with the same body; one condition, in the original order.
- **Slide statements** — a declaration far from its first use, or related lines split by unrelated ones; move them
  together. Stop where a moved line would cross something it reads or writes.
- **Inline function** — a single-use private function in this file whose body reads as clearly as its name.
- **Extract function** — a block introduced by a comment, or a block the function's name doesn't cover. Only when
  the block reads its inputs, yields at most one value, and contains no return, break, or continue. Same file,
  beside its caller.

#### Dead

- **Remove dead code** — an unused local, an unreachable branch, an unused import, a parameter of a private function
  nothing passes. An unused export is reported.
