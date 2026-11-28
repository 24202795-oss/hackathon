# SmartSpend — Feature Checklist

Legend: ✅ implemented and tested (mock mode) · 🔌 implemented, awaits Java backend for real data · ⬜ not started

## Core features

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Income management: summary, add/edit/delete, categories, dates, search & filters, confirmations, toasts, empty states | ✅ | All writes delegate to Api layer → Java in live mode |
| 2 | Expense management: history, edit/delete, date/category/type filters, search, essential vs discretionary labels | ✅ | |
| 3 | Budget management: monthly limit, category budgets, utilisation %, progress bars, 4-state colours (green/yellow/orange/red) | ✅ | Status values must come from Java (`status` field) |
| 4 | Savings goals: create/edit/delete, progress bars, completion indicators, estimated time | 🔌 | `estimatedMonthsToEnd` renders when Java provides it; mock estimate used meanwhile |
| 5 | Financial reports: totals, donut, essential/discretionary bars, 6-month line, top category, largest/average expense, month comparison | 🔌 | In live mode all stats come from `GET /api/reports` |
| 6 | Budget alerts: warnings, exceeded, goal-completed, badges, severity indicators, empty state, mark-all-read | 🔌 | Alert conditions must be determined by Java |
| 7 | AI advisor: chat layout, suggested questions, loading, error + retry | 🔌 | Live mode requires `POST /api/advice` (Java calls AI API; no keys in browser) |
| 8 | SDG 12 integration: essential/discretionary split, dashboard sustainability section, tips | ✅ | No environmental claims made |

## Dashboard

- [x] Welcome message, month chip, 4 summary cards
- [x] Spending breakdown donut + legend
- [x] Income vs expenses grouped bars (6 months)
- [x] Budget usage overview with status colour
- [x] Savings goal overview
- [x] Recent transactions
- [x] Budget alerts preview
- [x] AI insight strip
- [x] Responsible consumption (SDG 12) section

## UI/UX & technical

- [x] Sidebar navigation, 8 items, active state, alert badge
- [x] Responsive: desktop / tablet (≤1100px) / mobile (≤820px, ≤600px)
- [x] Modal dialogs with Escape/overlay close, focus handling
- [x] Confirmation dialogs before every delete
- [x] Loading skeletons, error banners with Retry, toasts, empty states
- [x] Design system: emerald accent, Inter/Sora, rounded cards, subtle shadows
- [x] Dependency-free SVG charts with tooltips
- [x] Central API layer (`api.js`) with mock/live switch and demo-mode indicator
- [x] Accessibility basics: aria-labels, aria-live regions, contrast, reduced-motion support

## Integration status

| Item | Status |
|---|---|
| API contract drafted for Member 4 | ✅ `docs/API_CONTRACT.md` |
| Integration guide | ✅ `docs/INTEGRATION_GUIDE.md` |
| Endpoints confirmed with Member 4 | ⬜ pending team discussion |
| Live-mode end-to-end test | ⬜ blocked on Java backend |
| AI API integration (server-side) | ⬜ Member 4 |
