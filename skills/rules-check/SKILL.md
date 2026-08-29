---
name: rules-check
description: Check the current diff against the repo's written rules, one subagent per rule bucket.
disable-model-invocation: true
---

Check the current changes against the repo's own written rules. Every rule is a suspect until a subagent returns a
verdict on it.

1. **Collect the rules.** Read every rules source the repo has: CLAUDE.md files (root and nested), `RULES.md`,
   AGENTS.md, and any doc those files name as standards. Done when you hold a flat numbered list of concrete rules, each
   quoted verbatim with its source path.

2. **Get the diff.** On the default branch: uncommitted work (`git diff HEAD` plus untracked files). On a feature
   branch: `git diff main...HEAD` plus uncommitted work. Done when you know which files changed and how.

3. **Shortlist suspects.** Keep the rules the diff could plausibly violate; dismiss the rest with a reason (a TypeScript
   rule with no TS changes, a migration rule with no migrations). Done when every collected rule is either a suspect or
   dismissed.

4. **Bucket the suspects.** Invent up to 4 themes from the suspects at hand and group them — fewer suspects, fewer
   buckets. Done when every suspect sits in exactly one bucket.

5. **Verdicts.** Launch one subagent per bucket, all in a single message so they run in parallel. Each prompt carries
   the exact git command from step 2, the bucket's rules verbatim with sources, and this charge:

   > For each rule return a verdict: CLEAN, or VIOLATION with file:line and the offending lines quoted. Judge only the
   diff — pre-existing code is out of scope. Every rule gets a verdict.

6. **Report.** Violations only, worst first, each with rule, source, file:line. Every suspect accounted for. If none:
   say the diff is clean.
