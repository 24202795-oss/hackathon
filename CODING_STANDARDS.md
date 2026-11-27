# Coding Standards — Personal Finance System

Read during code review. These rules come from bugs that actually occurred in
this project; each one exists because violating it broke the program.

## Hard rules (violations = must fix)

### 1. Loop to the counter, never the capacity

Every loop over a record array uses the counter (`expenseCount`,
`incomeCount`, `budgetCount`, `goalCount`, `categoryCount`, or the
`getMyXCount()` variants) — never `array.length`. The arrays are
fixed-capacity (100/50 slots); trailing slots are `null` and iterating them
crashes with a NullPointerException.

This bug occurred three times (test displays, `AHelper.giveTips`,
near-miss elsewhere). Any `for (int i = 0; i < x.length; i++)` over a record
array in this repo is a bug unless the loop is provably over a
trimmed/filtered array (`getMyIncomes()` etc. return exact-size arrays, so
`.length` is correct *only* there).

### 2. Owner-filter every record loop in views, reports and analysis

The FinanceManager arrays hold **all users'** records. Anything that
displays, sums, ranks, or deletes records must filter by
`getOwner().equals(currentOwner)` — or use the pre-filtered accessors
(`getMyIncomes()`, `getMyExpenses()`, `getMyBudgets()`, `getMyGoals()` and
their counts). Unfiltered loops leak other users' financial data, which is
both a correctness bug (per-user isolation requirement) and a privacy bug.

Two real bugs came from this (View-All screens, ReportGenerator mixing
users' finances).

### 3. Update the file-format docs in the same commit as any save/load change

The authoritative file-format block lives in `FileManager.java`'s class
javadoc (and `UserStore.java` for users.txt). Any change to what a save or
load method writes/reads must update that block in the same commit. The
owner field was added to all five files but not the docs; the spec review
caught the drift.

## Judgement-call rules

- **Menu exit numbers**: submenus currently use inconsistent Back/Exit
  numbers (income/expense: 6; budget/savings/reports/AHelper: their own;
  main menu: 10). If you change one submenu's numbering, consider aligning
  them all — consistency here is a UX judgement, not a mechanical rule.
- **Calculated, not stored**: values that can be computed from records
  (balance, remaining budget, progress percent) must be computed on demand,
  never cached in a field. Storing them invites stale-data bugs (this was
  the root cause of the budget-backfill desync bug).
- **Beginner-scope refactoring**: this is a Weeks 1–10 course project. Known
  duplication (five save/load shapes, repeated owner-filter loops, the
  AHelper/ReportGenerator twin ranking logic) is deliberately left
  un-refactored; do not introduce patterns beyond the course scope
  (interfaces, generics, lambdas, streams) to fix it. Note known duplication
  in documentation instead.

## Pre-commit check (mandatory before every commit)

```
cd src
javac hackathon/*.java
```

Compile must succeed with zero errors. If the change touched menu flows or
record logic, also smoke-run one scripted session (login → action → exit)
and confirm the `.txt` files changed as expected. Committing code that does
not compile is the single most disruptive failure this project can have for
a group working in parallel.
