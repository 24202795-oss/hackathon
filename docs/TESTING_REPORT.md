# SmartSpend — Frontend Testing Report

Date: 28 November 2026 · Environment: ILMUcode in-app browser (Chromium), Windows 10/11
Served via: local HTTP server (PowerShell `serve.ps1`, port 8090) · Mode: **mock (demo data)**

## Tests performed and results

| # | Test | Result |
|---|---|---|
| 1 | App loads, no console-blocking errors; all 8 nav items present | ✅ Pass |
| 2 | Dashboard renders: 4 summary cards (RM 9,420.00 income etc.), donut with 6-category legend, grouped bar chart, budget usage (94% "Approaching limit"), goals overview, recent transactions, 3 alerts, SDG section, AI insight | ✅ Pass |
| 3 | Navigation to all 8 pages; each page visible with correct title, no error banners | ✅ Pass |
| 4 | Add income form: filled "Test tutoring gig", RM 85.50, Freelance → record appeared in table, total updated RM 9,420.00 → RM 9,505.50 | ✅ Pass |
| 5 | Income search filter ("library") → narrowed to part-time library rows | ✅ Pass |
| 6 | Expense type filter (Discretionary) → only discretionary rows shown | ✅ Pass |
| 7 | AI advisor: clicked suggested question → loading indicator → answer card rendered | ✅ Pass |
| 8 | Dashboard screenshot visual review: layout, colours, charts correct | ✅ Pass |

## Bugs found and fixed during testing

1. **Mock `GET /api/meta` missing category lists** — filters and form dropdowns were empty on first load. Fixed by including `incomeCategories`, `expenseCategories`, `labels`, `colors` in the mock meta object (`mock-data.js`).
2. **Hidden modals blocked all clicks** — `.modal-overlay` used `display: grid`, which overrode the HTML `hidden` attribute, so an invisible modal overlay covered the page. Fixed with `[hidden] { display: none !important; }` in `style.css`.

## Incomplete / not performed (disclosed limitations)

- **Live Java backend tests** — impossible until Member 4's server exists (endpoints, CORS, error format, persistence across restart).
- **Real AI service tests** — mock advisor returns canned responses; latency, token limits and error paths of the real AI API are untested.
- **Manual cross-browser testing** (Firefox, Safari, Edge) and real-device mobile testing — only Chromium in-app browser at 1280×720 was exercised; responsive CSS was written but not screenshot-verified at mobile widths.
- **Screen-reader / full WCAG audit** — semantic roles and aria attributes are in place but no assistive-technology test was run.
- **Delete confirmation end-to-end click** — confirmation modal logic reviewed; the delete flow was not fully clicked through in automation.

## How to re-run the tests

Serve `frontend/` (e.g. `powershell -File serve.ps1`), open `http://localhost:8090`, and walk through: each nav page → add/edit/delete a record → filters → AI chat → resize window to mobile width.
