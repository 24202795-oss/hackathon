# SmartSpend — Frontend Testing Report

Date: 28 November 2026 (updated with authentication test round) · Environment: ILMUcode in-app browser (Chromium), Windows 10/11
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
| 9 | **Auth: login gate** — fresh visit with no session shows login screen; app shell hidden | ✅ Pass |
| 10 | **Auth: invalid login (wrong password)** — "Incorrect password. Please try again." shown | ✅ Pass |
| 11 | **Auth: invalid login (unknown user)** — "Account not found. Please register first." shown | ✅ Pass |
| 12 | **Auth: show/hide password** — input type toggles password ⇄ text | ✅ Pass (after fix, see bug #4) |
| 13 | **Auth: valid login ali/1234** — app opens, chip shows "Ali bin Ahmad / Student", dashboard renders 4 cards + charts | ✅ Pass |
| 14 | **Auth: logout** — returns to login screen; session cleared | ✅ Pass |
| 15 | **Auth: registration** — new account "meiling / Tan Mei Ling" created, auto-logged-in, chip updated | ✅ Pass |
| 16 | **Auth: duplicate username registration** — "Username already taken." shown | ✅ Pass |
| 17 | **Auth: session persistence** — page reload keeps user logged in | ✅ Pass |
| 18 | **Expense CRUD regression** — add "CRUD test item" RM 12.34 → appears; delete with confirmation dialog → removed | ✅ Pass |
| 19 | **Mobile 390×844**: hamburger menu shows, slide-in drawer opens/closes, all 8 pages navigate with drawer auto-close, no error banners, charts render | ✅ Pass |
| 20 | **Mobile screenshot review** of login and dashboard/drawer | ✅ Pass |

## Bugs found and fixed during testing

1. **Mock `GET /api/meta` missing category lists** — filters and form dropdowns were empty on first load. Fixed by including `incomeCategories`, `expenseCategories`, `labels`, `colors` in the mock meta object (`mock-data.js`).
2. **Hidden modals blocked all clicks** — `.modal-overlay` used `display: grid`, which overrode the HTML `hidden` attribute, so an invisible modal overlay covered the page. Fixed with `[hidden] { display: none !important; }` in `style.css`.
3. **`Api.login` binding crash** — auth wrappers chained `.then()` on a plain function, throwing at script parse-time and taking the whole app down (`Api undefined`). Fixed with plain wrapper functions in `api.js`.
4. **Password show/hide toggled the wrong field** — the selector `input[type=password], input[type=text]` matched the username field first, so the eye button flipped the username input's type. Fixed by scoping to `.pw-row input`; also added `aria-pressed` and verified the field types now cycle `password → text → password`.

## Incomplete / not performed (disclosed limitations)

- **Live Java backend tests** — impossible until Member 4's HTTP server exists. The backend is currently a console app (`Menu.java`, Scanner I/O); the auth endpoints proposed in `AUTHENTICATION_INTEGRATION.md` do not exist yet, so live login, `Authorization: Bearer` handling and 401 auto-logout are untested against real Java.
- **Real AI service tests** — mock advisor returns canned responses; latency, token limits and error paths of the real AI API are untested.
- **Cross-browser testing** (Firefox, Safari, Edge) and real-device mobile testing — Chromium in-app browser only (desktop 1280×720 and mobile viewport 390×844).
- **Screen-reader / full WCAG audit** — semantic roles and aria attributes are in place but no assistive-technology test was run.
- **Password security in transit** — mock mode compares passwords in JS for demo purposes only; real password verification must happen server-side in Java (never in the browser).

## How to re-run the tests

Serve `frontend/` (e.g. `powershell -File serve.ps1`), open `http://localhost:8090`, and walk through: login gate → invalid login → login ali/1234 → all 8 pages → add/edit/delete a record → filters → AI chat → logout → register a new account → reload (session persists) → resize to mobile width.
