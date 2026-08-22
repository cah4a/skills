---
name: self-grill
description: Grill a task's unknowns with one cold interrogator until nothing blocks building.
disable-model-invocation: true
---

You've been summoned to settle users requirements to the project.
User have intent that is considered as REQUIREMENTS.

Your job is to resolve REQUIREMENTS with the existing project/codebase and compose THE MINIMAL DESIGN DOCUMENT.

This document must be small, terse, concise, self-contained, and resolve COMPLEX PROBLEMS only.
It doesn't need to be a full implementation plan, states of work, or a full design doc with all details included.
It must be enough to unblock the following work, so the requirements could be break onto task and implemented without changing the design.
So we are not looking for PLAN, we are looking for a way moving forward.

## PHASE 0

Find all related files, functions, classes, and modules that are related to the task.
This is a research phase to understand the current state of the codebase and how it relates to the task at hand.
Save all the findings in a separate context map file, and make sure to include the path to each file, function, class, and module.
Important thing is to find all this by yourself so you could answer the questions without asking the user.

Then write a first draft of the design doc that is just enough to answer the questions below.
Just a bare minimum to illustrate "THE PROBLEM" and "THE SOLUTION" in a way that is understandable to a cold reviewer.

## PHASE 1

Run a cold interrogator with next question:

```
Design Doc: <design_doc_path>
Context Map: <context_map_path>

You are a cold reviewer. You have no history with this design and no stake in it.
Read the feature design doc and the context map above. The repo itself is fair
game — read any file you need. Do not modify anything.

Your job is to find the issues that make this design WRONG or UNBUILDABLE, not
to improve it.

An issue qualifies only if getting it wrong forces reworking the feature or a
big part of it. A detail the implementer can settle either way without breaking
the design is NOT an issue — do not report it. Style, naming, testing strategy,
and things listed as non-goals in the doc are not targets.

Hunt in this order:
1. Contradictions — the doc claims something about the codebase; the cited file
   or the map says otherwise. Verify every claim in the doc that cites a
   file:line by reading that file. Report mismatches.
2. Collisions — the design assumes something the existing code won't allow
   (data shape, lifecycle, ordering, concurrency, an existing consumer).
3. Holes — a load-bearing question the doc doesn't answer: a state that can
   occur but has no defined behavior, a migration path for existing data,
   a failure mode with no owner.
4. Contradictory or incomplete requirements — the doc's stated requirements
   cannot all hold at once, or a requirement is too vague to design against.

For each issue report:
- SEVERITY:
  - CRITICAL — requirements are contradictory or incomplete; only the user can
    resolve it.
  - MAJOR — wrong answer forces reworking the feature or a big part of it.
  - MINOR — real, but cheap to change later even if decided wrong now.
- The issue in one or two sentences.
- What breaks if it's decided wrong (concrete: which part of the design falls).
- Evidence: file:line if you read code, or "doc only" if not.

Report at most 10 issues, worst first. One structural details. 
Do not pad: if nothing meets the bar, return exactly "NO BLOCKING ISSUES" — that is a legitimate and useful result, not a failure.

Do not report/investigate anything that is already mentioned in the design doc as a non-goal or out of scope, or anything that is explicitly called out as a known limitation or trade-off. Those are not issues.
```

# PHASE 2

Interview user about CRITICAL findings to solve it with him using hard decision or pivot the design.

For MAJOR findings run a subagent to make a sound solution that simplifies the design, reduces complexity, yet covering
the requirements.

For every MINOR finding, make a note in the design doc and move on.

Don't rerun the loop, we are still investigating how this skill is working.
