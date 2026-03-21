---
name: plan-squisher
description: Reconcile implementation plans (PRDs, HLDs, LLDs) against the project's Constitution — a living set of architectural rules and constraints. Use this skill whenever the user mentions "squish", "squish plan", "review plan against constitution", "check plan constraints", "plan review", or provides a plan document and wants it validated against project rules. Also trigger when the user says things like "does this plan fit our architecture", "check this against our rules", "validate this design", or "reconcile this plan". The skill reads docs/Constitution.md, cross-references each plan item against both the constitution and the actual codebase, surfaces violations for the user to resolve, discovers new implicit rules from the plan, and produces a revised plan with all decisions applied.
---

# Plan Squisher

Reconcile an implementation plan against the project's Constitution and existing codebase. The goal: catch violations early, reuse what exists, skip what's redundant, and keep the Constitution alive.

## What is the Constitution?

`docs/Constitution.md` is a living document of architectural rules and constraints for the project. Each rule has a rationale and scope so anyone reading it understands *why* it exists and *where* it applies.

Example format:

```markdown
# Project Constitution

## Use Drizzle for all new database access

We are migrating away from MikroORM. All new queries, repositories, and data-access code must use Drizzle. Existing MikroORM code will be migrated incrementally — don't add to it.

Applies to: any code that touches the database layer.

## No backward-incompatible GraphQL changes

The project is in production with external consumers. All GQL schema changes must be additive — deprecate fields instead of removing them, add new types instead of modifying existing ones.

Applies to: anything that touches `schema.graphql` or GQL resolvers.
```

If `docs/Constitution.md` doesn't exist yet, inform the user and offer to create a starter document based on what you learn from the codebase during the review.

---

## Architecture: Subagent + Main Context

This skill runs the heavy analysis in a subagent to keep the main conversation clean. The main context only handles user decisions.

### Phase 1 — Analysis (subagent)

Spawn a subagent with this prompt structure:

```
You are a plan reviewer. Your job is to analyze a plan against a project's
constitution and codebase, then produce a structured report.

PLAN: <contents of the plan file>
CONSTITUTION: <contents of docs/Constitution.md>

Instructions:
1. Read the plan and constitution carefully.
2. Explore the codebase — focus on the areas the plan touches. Look for:
   - Existing code that the plan would duplicate
   - Patterns and abstractions already in place
   - Architecture the plan should reuse
3. For each constitutional rule, determine if the plan complies or violates.
4. Look for missed reuse opportunities — things the codebase already solves
   that the plan is reinventing.
5. Look for new implicit rules the plan introduces that should become
   constitutional rules.

Produce a JSON report (and nothing else) written to:
  <workspace>/squish-report.json

Schema:
{
  "violations": [
    {
      "id": 1,
      "title": "Short title",
      "rule": "Quote the constitutional rule",
      "plan_section": "Quote the conflicting part of the plan",
      "codebase_context": "What you found in the code",
      "suggestion_change_plan": "How to fix the plan",
      "suggestion_change_rule": "What the new rule would be"
    }
  ],
  "reuse_opportunities": [
    {
      "id": 1,
      "title": "Short title",
      "plan_section": "What the plan proposes",
      "existing_code": "File path and description of what already exists",
      "suggestion": "How to reuse it instead"
    }
  ],
  "proposed_rules": [
    {
      "id": 1,
      "title": "Proposed rule title",
      "derived_from": "Which part of the plan",
      "rationale": "Why this should be a rule",
      "scope": "Where it applies",
      "body": "Full text of the rule as it would appear in Constitution.md"
    }
  ],
  "summary": "Brief overview of findings"
}
```

The `<workspace>` should be a temp directory you create for this session (e.g., `/tmp/plan-squisher-<timestamp>/`).

### Phase 2 — Decision Loop (main context)

Read the subagent's `squish-report.json` and walk the user through decisions. Keep it tight — don't dump the whole report at once.

**Step 1: Summary.** Show the user a one-paragraph summary plus counts:
- N violations found
- N reuse opportunities found
- N proposed new rules

**Step 2: Violations.** Present each violation:

```
VIOLATION: [title]

Constitution says: [quote the rule]
Plan says: [quote the conflicting part]
Codebase context: [what the subagent found]

Options:
  1. Change the plan — [suggestion]
  2. Change the constitution — [what new rule would be]
  3. Custom decision — tell me what you want
```

Wait for the user's choice before moving to the next one. Record decisions.

**Step 3: Reuse opportunities.** Present each one:

```
REUSE: [title]

Plan proposes: [what it says]
Already exists: [file path and description]
Suggestion: [how to reuse]

Options:
  1. Update plan to reuse existing code
  2. Keep plan as-is (justify duplication)
  3. Custom decision
```

**Step 4: Proposed new rules.** Present each candidate:

```
PROPOSED RULE: [title]

Derived from: [which part of the plan]
Rationale: [why this should be a rule]
Scope: [where it applies]

Add to Constitution? (yes / no / edit)
```

### Phase 3 — Apply Changes (subagent)

Once all decisions are collected, spawn another subagent:

```
Apply the following decisions to the plan and constitution.

PLAN FILE: <path>
CONSTITUTION FILE: <path to docs/Constitution.md>
DECISIONS: <JSON array of all user decisions from Phase 2>

Instructions:
1. Rewrite the plan incorporating all "change plan" decisions and accepted
   reuse suggestions. Keep the original structure and format — only change
   what was decided.
2. For constitution changes:
   - If the user chose "change the constitution" for any violation, update
     the relevant rule in docs/Constitution.md.
   - Append any approved new rules to docs/Constitution.md, following the
     existing format (## title, rationale paragraph, "Applies to:" scope).
3. Write both files back.
```

After the subagent finishes, confirm to the user what was changed.

---

## Tone

This is a collaborative review, not an audit. The constitution exists to help the team ship better code, not to block progress. When presenting violations, be direct but not adversarial — explain *why* the rule exists and *what could go wrong* if the plan proceeds as-is. If a constitutional rule seems outdated or wrong given the plan's context, say so.
