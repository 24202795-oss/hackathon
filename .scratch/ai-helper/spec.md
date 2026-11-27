# Spec: AHelper — AI Financial Advisor

**Feature slug:** `ai-helper`
**Status:** draft (needs group confirmation)
**Priority:** high — biggest missing requirement

## 1. Problem

The assignment's distinguishing requirement is an AI feature. Everything else
(budgets, expenses, reports) is standard CRUD that graders see in every
submission. AHelper is what makes this project different, so we design it
BEFORE writing more CRUD classes, because:

1. AHelper needs data from `FinanceManager` (expenses, budgets, goals). If we
   add CRUD classes first without knowing what AHelper reads, we may forget
   to expose a getter AHelper needs.
2. The AI feature affects the main menu (a new option), so `Menu` design
   waits for this spec.

## 2. What the AI actually does (decision)

**Decision: rule-based analysis engine, no external API.**

AHelper is a Java class that reads the user's real records from
`FinanceManager`, applies decision rules (thresholds, comparisons, ranking),
and produces natural-language advice — like a simplified expert system.

Why not call a real LLM API (e.g. an online chat model)?

- Needs an API key and internet — not allowed/portable in a classroom demo.
- Requires HTTP libraries beyond the course scope (Weeks 1–10).
- Graders must be able to re-run the demo offline.

The rule-based approach still legitimately counts as AI: it is an
expert-system / decision-support feature that analyses data and generates
recommendations. If the group later wants a real LLM, Section 7 shows where
it plugs in without changing any other class.

## 3. AHelper's five behaviours

Each behaviour is one public method, all reading from `FinanceManager`:

### 3.1 `analyzeSpending()` — spending pattern analysis

- Totals expenses per category (loops over the expense array, groups by
  `getCategory()`).
- Ranks categories from highest to lowest.
- Output example:
  > "Your biggest spending category is Food (RM250, 42% of expenses).
  > It is 2.5x larger than your next category."

### 3.2 `predictBudgetStatus()` — budget forecast

- Computes spending pace: total expenses ÷ days elapsed in the month
  (day parsed from the expense date string).
- Multiplies by days in the month to project month-end spending.
- Compares the projection with each budget limit.
- Output example:
  > "At your current pace you will spend about RM720 this month.
  > Your Food budget is RM300 and you are projected to exceed it by RM90."

### 3.3 `suggestSavings()` — savings recommendations

- Uses balance = total income − total expenses.
- Compares balance against each savings goal's remaining amount.
- Suggests a monthly saving amount and a finish date.
- Output example:
  > "You can save about RM400/month. At that rate your Laptop goal
  > (RM1,200 remaining) completes in 3 months."

### 3.4 `giveTips()` — personalised tips

- If-else rules over the same numbers, e.g.:
  - any category > 40% of total expenses → warn about that category;
  - budget usage ≥ 80% → "approaching limit" tip;
  - balance < 10% of income → emergency tip;
  - no savings goal set → suggest creating one.
- Output: a numbered list of 2–4 tips, never empty (fallback tip: "You are
  on track — keep recording your expenses daily.")

### 3.5 `chat()` — simple Q&A (optional stretch goal)

- Menu of preset questions (1. Where does my money go? 2. Will I exceed my
  budget? 3. How can I save more?) — each maps to a method above.
- NOT free-text: keyword matching on Scanner input is unreliable and hard to
  test. If we do it, match keywords like "budget", "save", "spend" against
  a small keyword→method table (a plain 2D String array, no HashMap).

## 4. Class design

```
AHelper
├── attribute: FinanceManager fm   (reads data through it)
├── analyzeSpending()      void
├── predictBudgetStatus()  void
├── suggestSavings()       void
├── giveTips()             void
└── chat()                 void   (optional)
```

- AHelper owns NO arrays of its own — it never stores records, it only reads
  through `FinanceManager` getters. One source of truth.
- Helper method `double percent(double part, double whole)` shared by the
  behaviours (guarded against divide-by-zero).
- Dates are Strings ("dd/MM/yyyy"); parsing uses `split("/")` — consistent
  with the file format already documented.

## 5. Integration points (what this spec blocks)

- `FinanceManager`: needs getters the AI reads —
  `getExpenses()`, `getExpenseCount()`, `getBudgets()`, `getBudgetCount()`,
  `getGoals()`, `getGoalCount()`, `getTotalIncome()`, `getTotalExpenses()`.
- `Menu`: new main-menu option `6. Ask AHelper` (reports menu renumbers).
- `Main`/`Hackathon`: constructs AHelper once, passes the same
  FinanceManager instance to Menu.
- Report file: `report.txt` gains an "AI Advisor Summary" section written by
  the same methods (satisfies "save generated reports to a file").

## 6. Testing plan

| Test | Data | Expected AHelper output |
| --- | --- | --- |
| Food dominates spending | 250 food / 100 others | Food flagged as top category with % |
| Projected over budget | RM10/day pace, budget RM300 | "projected to exceed" warning |
| On track | low spending, high income | fallback positive tip |
| No goals set | zero goals | "create a savings goal" tip |
| Empty records | no data at all | friendly "no data yet" message, no crash |

## 7. Extension: real LLM (only if the group insists)

Plug-in point: replace the method bodies with calls to a new
`LLMClient` class that formats a prompt from the same FinanceManager
numbers and prints the model's reply. Menu, FinanceManager and all CRUD
classes stay untouched. Requires an API key + internet — record it as a
separate decision ticket before attempting.

## Comments
