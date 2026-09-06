---
name: coder
description: >-
  Code-writing expert. ALWAYS invoke this skill when writing or changing code — implementing a feature, fixing a bug, refactoring, or a swap that feels too trivial to need it. Do not Edit, Write, or heredoc into a source file directly — invoke this skill first. Also the brief another skill hands a coding subagent.
---

Make the chosen design easy for a maintainer to follow. Put related behavior together, make control and data flow
apparent, and use the codebase's established vocabulary. Write code as if it had always been there. Find and reuse
what the codebase already provides before adding an implementation. New code must earn its place by covering what
the existing code doesn't.

## Scout

Before writing, read the code around where your change will land: the sibling files, the module's conventions, the tests
beside it, and its callers. Understand who uses the changed code and which behavior they rely on. The neighbourhood is
the spec for *how* your code should look; the task only says *what* it should do. You're done scouting when you can name
the existing pattern your change will follow — or say, concretely, that there isn't one.

## The bar

Judge everything you write by simplicity — measured in the reader's head, not your line count: how little they must hold
in mind to follow this code and change it safely. Three corollaries, each cutting against instinct:

- **Boring beats clever.**
- **Local beats general.**
- **Obvious beats short.**

Then fit: prefer established patterns unless they violate explicit requirements or force unnecessary complexity; surface
that conflict. Then surgery: every changed line traces to the task; what the task didn't need, you didn't touch.

## Prove

Demonstrate the requested behavior and check what the change could break. Run repository-required checks; disclose
anything unverified. Command output is the evidence. A green run supports correctness; the bar above decides if the code
is *good*.

## Report

Report what changed, verification evidence, and decisions or limitations that affect review.
