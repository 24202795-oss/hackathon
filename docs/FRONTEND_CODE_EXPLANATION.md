# SmartSpend — Frontend Code Explanation (前端代码说明)

A beginner-friendly explanation of every important file, how the frontend talks to the Java backend, likely lecturer questions with answers, and a draft for the FOP report.

---

## 1. What each file does (每个文件的作用)

| File | Purpose |
|---|---|
| `frontend/index.html` | The single page of the app. Contains the sidebar navigation, all 8 sections (Dashboard, Income, Expenses, Budgets, Savings, Reports, Alerts, AI Advisor), and the pop-up forms (modals). It contains structure only — no data or logic. |
| `frontend/css/style.css` | The design system: colours (emerald green accent), fonts, cards, buttons, tables, progress bars, chat bubbles, toasts, modals. |
| `frontend/css/responsive.css` | Media queries so the same page adapts to tablet (≤1100px) and mobile (≤820px/≤600px): the sidebar collapses into a slide-in menu. |
| `frontend/js/mock-data.js` | Demonstration data only (income, expenses, budgets, goals, alerts). All amounts are integer **sen** and dates are `YYYY-MM-DD`, exactly like the Java backend will send. |
| `frontend/js/api.js` | ⭐ The most important file. The **only** place the app gets data from. It has two modes: `mock` (demo data) and `live` (real Java server via `fetch()`). Switching modes is one line. |
| `frontend/js/charts.js` | Draws charts (donut, bars, line) using hand-written SVG — no external chart library, so there are zero dependencies. |
| `frontend/js/app.js` | The UI brain: shows the correct page when you click navigation, renders tables/cards/charts from data returned by `api.js`, handles form submissions, confirmations and error messages. |

Key idea: **app.js never invents financial numbers.** It only displays what `api.js` gives it. In live mode, those numbers are computed by Java — satisfying the requirement that all business logic is in Java.

## 2. How the frontend communicates with Java (前端如何与Java后端通信)

In `api.js`, live mode uses the browser's built-in `fetch()` function:

```js
async function request(method, path, body) {
  const res = await fetch(`http://localhost:8080${path}`, {
    method,                                    // "GET", "POST", "PUT", "DELETE"
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error((await res.json()).error.message);
  return res.json();
}
```

Example flow — adding an expense:

1. User fills the form and clicks Save.
2. `app.js` converts RM to **sen** (`85.50 → 8550`) so the backend works with exact integers.
3. `Api.createExpense({ description, amount: 8550, date: "2026-11-28", ... })` is called.
4. In live mode this becomes `POST /api/expenses` with a JSON body. Java validates, stores it in a **text file**, and recomputes totals.
5. The page re-fetches the list and re-renders.

Every page follows the same pattern: **call Api → receive sen/ISO data → format for display → render.** Nothing bypasses `api.js`.

## 3. Important snippets (重要代码片段)

**Money conversion (avoids floating-point errors):**
```js
const ringgitToSen = (rm) => Math.round(parseFloat(rm) * 100); // "12.50" -> 1250
const senToRinggit = (sen) => sen / 100;                       // 1250 -> 12.5
```

**Budget status colours** (values come from Java; CSS classes only style them):
```js
status: pct > 100 ? "exceeded" : pct >= 100 ? "reached"
      : pct >= 75 ? "approaching" : "within"
// mapped to green / yellow / orange / red progress bars
```

**Safe rendering** — all text from data is escaped before going into HTML, preventing broken layout (and basic XSS):
```js
const esc = (s) => String(s).replace(/[&<>"']/g, ...);
```

## 4. Likely lecturer questions & answers (讲师可能的问题)

**Q: Why integer sen instead of decimal Ringgit?**
A: Decimal fractions like 0.1 cannot be represented exactly in binary floating point, so sums can drift (0.1+0.2 = 0.30000000000000004). Storing money as integer sen makes arithmetic exact; we only convert to RM for display.

**Q: Where are your Collections / arrays?**
A: The frontend deliberately keeps no business data structures — that is the Java backend's job (plain arrays with counters, per the course requirements). The frontend only holds what it is currently displaying. Inside the UI code you can see simple array methods (`filter`, `map`, `reduce`) used purely for rendering lists and totals of *displayed* rows.

**Q: How does the frontend connect to the Java backend?**
A: Through one central file, `api.js`, using HTTP `fetch()` with JSON. There is a documented contract (`docs/API_CONTRACT.md`) and a one-line switch between demo mode and live mode, so integration does not require touching any UI code.

**Q: Is localStorage used to store the money data?**
A: No — permanent storage is Java's text files. Mock mode keeps changes only in memory for the current session so the UI can be demonstrated before the backend exists, and it is clearly labelled "Demo data — not live".

**Q: Where is the AI feature?**
A: The AI Advisor page sends the user's question via `POST /api/advice` to Java, which calls the AI API **server-side**. No API key ever exists in the frontend — that would be a security leak.

**Q: Why hand-written SVG charts instead of a library?**
A: The requirements say to avoid unnecessary dependencies. Donut/bar/line charts are straightforward SVG primitives (circle arcs, rectangles, polylines), so we wrote ~200 lines instead of importing a library.

**Q: How is SDG 12 included?**
A: Every expense is tagged essential or discretionary; the dashboard shows the split with responsible-consumption tips (24-hour rule, subscription reviews). We only make claims the data supports — no environmental claims.

**Q: What is polymorphism's role here?**
A: That lives in the Java backend (e.g. `Transaction` parent with `Income`/`Expense` subclasses overriding calculation methods). The frontend simply consumes the JSON results, which is why it stays unchanged regardless of backend implementation.

---

## 5. FOP report draft — Frontend & backend communication (报告草稿)

> The SmartSpend user interface is implemented as a single-page application using HTML5, CSS3 and vanilla JavaScript, deliberately avoiding frameworks so the code remains explainable at an introductory level. All application data reaches the interface through one centralised communication layer, `api.js`, which wraps the browser's native `fetch()` API. Each frontend operation — listing, creating, updating or deleting records — is expressed as an HTTP request with a JSON body against endpoints documented in an API contract agreed with the integration developer (for example `POST /api/expenses`, `GET /api/reports?month=2026-11`).
>
> Two conventions keep the front end and back end consistent. First, all monetary values are transmitted as integer sen, eliminating binary floating-point rounding errors and converting to Ringgit only at display time. Second, all dates use the ISO `YYYY-MM-DD` format. Because the interface renders only values received from the server, every financial calculation — totals, budget utilisation percentages, alert conditions and savings projections — is performed by the Java backend, satisfying the requirement that business logic reside in Java. During development the communication layer operates in a mock mode that serves demonstration data through the identical function signatures used in live mode, allowing the interface to be completed and tested independently and later connected to the Java HTTP server by changing a single configuration value. Sensitive AI functionality is accessed through a server-side endpoint, ensuring API credentials never reach the client.

## 6. Presentation script (~90 seconds, Member 3's contribution)

> Hi, I handled the entire frontend of SmartSpend. My goal was to make it look like a real fintech product, not a class assignment.
>
> The app is a single page with eight sections — Dashboard, Income, Expenses, Budgets, Savings, Reports, Alerts, and an AI Advisor — all in HTML, CSS and pure JavaScript, with no frameworks.
>
> I designed a consistent system: emerald green accent, rounded cards, and clean typography. All charts — the spending donut, the income-versus-expenses bars, and the six-month trend line — are hand-drawn SVG, so we have zero external dependencies.
>
> The important architectural decision is the central API layer. Every piece of data flows through one file. Right now it serves clearly-labelled demo data so we could build and test everything before the backend was ready; when our teammate's Java server is connected, we change one word and the whole app goes live — no redesign.
>
> Everything financial is computed in Java; the frontend only formats and displays, using integer sen and ISO dates on the wire. Budget health is shown with four colour states, every delete asks for confirmation, and forms show inline validation errors.
>
> For SDG 12, every expense is tagged essential or discretionary, and the dashboard surfaces that split with practical tips like the 24-hour rule before impulse purchases.
>
> I tested all eight pages, the forms, filters and the chat flow in a real browser, found and fixed two bugs along the way, and documented everything for the team. Thank you.
