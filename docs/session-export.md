# Session Export: Building the Personal Budget and Expense Monitoring System

**Date:** 28 November 2026
**Project:** Personal Budget and Expense Monitoring System (Java, NetBeans)
**Repo:** https://github.com/24202795-oss/hackathon
**Scope of this export:** coding agent sessions from project start (Stage 3) through completion

---

# 1. Summary of what was built

A complete console-based personal finance system in Java, implementing the
group project plan: 15 classes, per-user data isolation, text-file
persistence, reports, an admin role, and a rule-based AI advisor (AHelper).
All 10 tests from the project plan's testing table passed. Code review
(Standards + Spec axes) was run over the entire history; all critical
findings were fixed. A retrospective produced `CODING_STANDARDS.md`.

## Final class list (15 classes, package `hackathon`)

| # | Class | Responsibility |
|---|-------|----------------|
| 1 | `Hackathon` | Main program: load → login → menu loop → save |
| 2 | `Transaction` | Parent class: owner, date, description, amount |
| 3 | `Income` | Extends Transaction; adds `source` |
| 4 | `Expense` | Extends Transaction; adds `category` |
| 5 | `User` | Parent class: username, password, fullName; `login()` |
| 6 | `Admin` | Extends User; role display |
| 7 | `Category` | Expense category (overloaded constructors) |
| 8 | `Budget` | Limit + spent per category; status/warning levels |
| 9 | `SavingsGoal` | Target + saved; progress percent; completion |
| 10 | `FinanceManager` | All arrays + counters; CRUD; owner filtering; totals |
| 11 | `FileManager` | Save/load five .txt files (pipe-separated) |
| 12 | `UserStore` | users.txt persistence; register; login lookup |
| 13 | `ReportGenerator` | Totals, ranked breakdown, monthly summary, report.txt |
| 14 | `Menu` | All menus, Scanner input with validation, role guards |
| 15 | `AHelper` | Rule-based AI advisor (5 behaviours) |

## Commit history (12 commits)

```
1d8d531 Initial commit: Transaction, Income, Expense classes + AHelper spec
8c48343 added user java and admin java
f9c2966 added Category.java, Budget.java, and SavingsGoal.java
37d4ce6 FinanceManager java
6bba7e3 added FileManager.java with save/load txt support
00c4326 added ReportGenerator.java with breakdown, summary and report.txt
05451bd added Menu.java and wired up main program
ad5693c added UserStore with register/login from users.txt and admin menu
f1dac77 per-user records: owner field on all records, filtered views and totals
d8f13ad added AHelper AI advisor: spending analysis, budget prediction, savings suggestions, tips
23e593d code review fixes: owner-filtered views/reports, filtered delete indexes, updated file format docs, removed dead Admin methods
f8de16c retro: add CODING_STANDARDS.md, project plan in repo, AGENTS.md pointers
```

---

# 2. Feature walkthrough (demo order)

1. **Startup + persistence** — five `.txt` files load at start; missing files
   are not errors (first run).
2. **Login / register** — accounts persist in `users.txt`
   (`username|password|fullName|role`). Defaults on first run: `ali/1234`,
   `admin/admin`.
3. **Per-user session** — FinanceManager stamps every record with the
   logged-in username (`currentOwner`); all views/totals/reports are
   owner-filtered.
4. **Dashboard** — balance, totals (computed live, never stored), budget
   alerts at 80%/100%.
5. **Income CRUD** — add (amount > 0), view, search by source, update,
   delete (shift-left array pattern).
6. **Expense CRUD** — validated (amount > 0, category must exist);
   add/update/delete auto-syncs the matching budget.
7. **Budgets** — one per category per user; backfills spending that existed
   before the budget; status levels: under 80% / 80%+ approaching / 100%+
   exceeded.
8. **Savings goals** — target > 0, add savings (validated), progress %,
   "GOAL ACHIEVED!".
9. **Reports** — totals; breakdown by category (parallel arrays + bubble
   sort, no HashMap); monthly summary; save to `report.txt`.
10. **Admin** — manages shared categories, views/registers users; blocked
    from editing financial records (`isNormalUser()` guard, `instanceof`).
11. **Exit** — saves all users' records (full arrays, not the filtered view).
12. **AHelper (AI)** — spending analysis, budget prediction (pace × 31 days),
    savings suggestions, personalised tips, preset-question chat.

---

# 3. File formats (authoritative)

All record files are pipe-separated, one record per line. **First field on
every record line is the owner's username** (added in commit f1dac77).

```
income.txt     Owner|Date|Description|Amount|Source
expenses.txt   Owner|Date|Description|Amount|Category
budgets.txt    Owner|Category|Limit|Spent
savings.txt    Owner|GoalName|TargetAmount|SavedAmount
categories.txt CategoryName                      (system-wide, no owner)
users.txt      Username|Password|FullName|Role   (handled by UserStore)
report.txt     human-readable report (regenerated)
```

⚠️ Files saved before the owner field was added do not load (format changed).
Delete old `.txt` files to regenerate.

---

# 4. Design decisions worth documenting in the report

1. **AHelper is rule-based, not an API** — expert-system/decision-support
   design: offline-capable, no API keys, within course scope. Full spec in
   `.scratch/ai-helper/spec.md` (published before any CRUD was written, so
   the getters it needed were designed in from the start).
2. **Categories are shared system-wide; financial records are private per
   user** — matches the roles table in the project plan.
3. **Balances are calculated on demand, never stored** — prevents
   stale-data bugs (plan section 9.6).
4. **Whole-file rewrite on save, never append** — prevents duplicate/outdated
   records (plan section 10).
5. **Known deliberate duplication** (not refactored, to stay within Weeks
   1–10 scope): five save/load method shapes in FileManager; owner-filter
   loops repeated across FinanceManager; AHelper and ReportGenerator both
   implement the ranking logic; Menu mixes I/O with orchestration.
6. **Passwords stored in plain text** in users.txt — acceptable for a course
   project; real systems would hash them (worth one sentence in the report).
7. **Menu exit numbers are inconsistent across submenus** (6 vs 4/5 vs 10) —
   cosmetic; noted in CODING_STANDARDS.md as a UX judgement call.

---

# 5. Bugs found and fixed during development (with lessons)

| Bug | Root cause | Lesson |
|-----|-----------|--------|
| Budget showed RM0 spent after creation over existing expenses | No backfill of pre-existing expenses | Budgets must sync with records; `setBudget` now backfills |
| Food listed twice in expense breakdown | Loader added duplicate category | Validate at the gateway: `addCategory` rejects duplicates |
| Budget double-counted after load | `setBudget` backfill re-added loaded spending | FileManager uses `restoreBudget()` — a second door that skips the clever logic |
| NullPointerException in `giveTips` | Loop used `categories.length` (capacity 50) not `categoryCount` | **Loop to the counter, never the capacity** — occurred 3× total |
| Users saw each other's records; report.txt mixed users | View loops unfiltered over shared arrays | **Owner-filter every record loop**; fixed with `getMyX()` filtered accessors |
| Menu's delete number could hit the wrong record | Menu displayed unfiltered list; delete used filtered index | Fix = display the filtered list so indexes match |
| FileManager javadoc formats stale after owner field added | Docs not updated with code | **Format docs change in the same commit as save/load code** |
| Multiple scripted-input test crashes | Test harness keystroke miscounts, not program bugs | Menu validation ("Please enter a number!") worked as designed throughout |

---

# 6. Verification status

- **Compile:** `javac hackathon/*.java` from `src/` — zero errors (now a
  mandatory pre-commit gate in CODING_STANDARDS.md).
- **Test table (plan section 12):** all 10 tests PASS, plus extra edge tests
  (delete, update, admin guard, wrong password, empty records).
  Final demo data state: user `tester/test123`, 4 categories, income
  RM1500, 3 expenses, Food budget at 116.7% (exceeded-budget demo state).
- **Code review:** two-axis review (Standards vs Spec) over the full
  history. No hard standards violations; 2 real spec bugs (owner leak,
  index mismatch) fixed in commit 23e593d; remaining findings are
  documented judgement calls (see §4.5–4.7).

---

# 7. Course-concept mapping (Weeks 1–10)

| Week | Topic | Where demonstrated |
|------|-------|--------------------|
| 1 | Variables, types, operators | Fields and calculations in every class |
| 2 | Scanner I/O | Menu.readInt/readDouble/readLine |
| 3 | if/else, switch | Budget warning levels, all menu switches |
| 4 | Loops | do-while menus, for over arrays, while readLine |
| 5 | Methods and parameters | Getters/setters, boolean validators, readInt(prompt) |
| 6 | Arrays | Five plain arrays + int counters in FinanceManager |
| 7 | Array algorithms | Linear search, shift-left delete, bubble sort |
| 8 | Objects and classes | Constructors, `this`, encapsulation |
| 9 | String methods | equals, equalsIgnoreCase, contains, split("\\|"), format |
| 10 | Inheritance & polymorphism | Transaction→Income/Expense, User→Admin, @Override, super(), instanceof |

Deliberately NOT used (per assignment rules / course scope): ArrayList,
HashMap, interfaces, generics, lambdas.

---

# 8. Repo state and conventions

- **GitHub:** https://github.com/24202795-oss/hackathon (branch `main`,
  fully synced, clean tree).
- **AGENTS.md** — pointers to: issue tracker (local markdown under
  `.scratch/<feature>/`), triage labels, domain docs (single-context
  GLOSSARY.md + docs/adr/), coding standards, spec source
  (`docs/project-plan.md`).
- **CODING_STANDARDS.md** — three hard rules (counter-not-length;
  owner-filter record loops; format-doc-sync), judgement rules, mandatory
  compile gate.
- **`.scratch/ai-helper/spec.md`** — the AHelper design spec, published
  before implementation.
- **docs/project-plan.md** — the authoritative project plan.
- **.gitignore** — excludes build/, dist/, *.class, nbproject/private/.

---

# 9. Remaining work (group-facing)

1. Write the project report — §2, §4, §5, §6 and §7 of this export map
   directly onto the standard report sections (design, decisions, testing,
   concept coverage).
2. Run the demo (login `ali/1234` or `admin/admin`; note the demo data state
   in §6).
3. Optional polish if time allows: align submenu exit numbers; wrap
   `countMyActiveDays` date parsing in try/catch (a non-numeric date crashes
   AHelper's prediction); decide whether admin "Register New User" stays
   (slightly beyond the plan's roles table).
