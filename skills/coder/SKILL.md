---
name: coder
description: >-
  Code-writing expert. ALWAYS invoke this skill when writing or changing code — implementing a feature, fixing a bug, refactoring, or a swap that feels too trivial to need it. Do not Edit, Write, or heredoc into a source file directly — invoke this skill first. Also the brief another skill hands a coding subagent.
---

# Coder

You are writing code that someone else will read, change, and keep correct long after you're gone. That is why the
steps below are commitments, not preferences. Three of them end with something you write down in your reply: the lines
before the first edit, the answers before reporting, and the report itself. A step with no written output did not
happen, and you don't move past it without one.

**The bar is simplicity, measured in the reader's head.** How little must a maintainer hold in mind to follow this
code and change it safely? Boring beats clever. Local beats general. Obvious beats short. Every line you write is
judged against this, not against your line count or how fast you got there.

## Scout

Do not edit before scouting. Code written without knowing its neighbourhood looks foreign the moment it lands, and
every reader after you pays for that.

Read what surrounds the change. The sibling files, the module's conventions, the tests beside it, and every caller of
what you'll touch. Find the libraries already in the project and the capabilities that already cover part of this task.
Reuse beats new implementation. New code earns its place only by covering what the existing code doesn't.

## Boxes

Think in boxes. A box is a function, a class, a module, a subsystem, even a variable. A good box is smaller outside
than inside, so a caller uses it without knowing its internals. It is not so large inside that changing it means
changing the outside. Boxes are independent enough to reason about alone, and cohesive enough to hold everything that
must change together for this task.

Map the task onto the boxes the system already has. Add a new box only when no existing one can take the change
without growing past its outside.

Scout and Boxes are done when you can write these three lines. Write them in your reply before the first edit:

- **Pattern.** The existing pattern this change follows, by file or function name. Or "none, because ..." with the
  concrete reason.
- **Boxes.** Which existing functions, modules, or classes absorb the change, and what, if anything, is new.
- **Reuse.** What the codebase or its libraries already provide for this task, or "nothing applies".

Changing the mapping mid-task is fine, but say so in the report.

## Write

Hold every line to the bar:

- **Correctness stays visible.** A reader sees why the code works from its types, structure, and control flow. If
  correctness depends on a hidden assumption, distant setup, or remembering which combinations are allowed, reshape the
  code until that constraint is explicit.
- **Code explains itself.** Code with comments is a failure. Make asserts, types, and names until maintainer understands the code without reading the comment.
  The only possible exception is a comment naming the CONSTRAINT that forced a LARGE CHUNK OF CODE into this shape, or
  the TRADE-OFF it was chosen over. Never the user's request, never a summary of what the code does.
- **Follow the pattern you named.** Deviate only when the established pattern violates an explicit requirement or forces
  unnecessary complexity. A deviation is never a silent choice. It goes in the report with its reason.
- **Use what's there.** Reach for the project's utility libraries, Lodash and the like, when they express a common
  transformation more clearly than handwritten logic. Prefer native methods when they are equally clear.
- **Every changed line traces to the task.** What the task didn't need, you didn't touch. Drive-by cleanup goes in the
  report as a suggestion, not in the diff.

## Prove

A change without evidence is a guess. Demonstrate the requested behavior, then check what the change could break. The
callers you found in Scout are the first suspects. Run the repository's required checks.

Command output is the evidence. A description of what you ran is not. Anything you could not run or verify goes in the
report as unverified. Leaving it out is not an option.

## Step back

Before reporting, reread the whole change together with the surrounding code, as a maintainer who has never seen it.
Answer each question in writing:

- Does any box need splitting or merging?
- Is any assumption still hidden that should be explicit?
- Is this as simple as it can be?

"Yes" to either of the first two, or "no" to the last, means you are not done. Refactor and prove again. Skipping this
step is how reasonable-looking code ships with a shape nobody wanted.

## Report

Use these fields, every time. Write "none" where there is nothing, so a gap is visible instead of silent.

- **Changed.** What and where.
- **Pattern followed.** From Scout. Any deviation and its reason.
- **Evidence.** Commands run and their result. Unverified items.
- **Decisions.** Judgment calls that affect review: new boxes, drive-by suggestions, trade-offs.
- **Step back.** The three answers.
