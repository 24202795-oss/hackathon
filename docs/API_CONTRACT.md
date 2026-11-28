# SmartSpend — Proposed API Contract

> **Status: PROPOSAL.** Every endpoint here must be confirmed with Member 4 (integration developer) before final implementation. The frontend does not assume these exist yet — it currently runs in mock mode.

## Global conventions

| Item | Convention |
|---|---|
| Currency | Malaysian Ringgit, expressed as **integer sen** (RM 12.50 = `1250`) |
| Dates | ISO `YYYY-MM-DD` strings (`2026-11-28`) |
| Months | `YYYY-MM` (`2026-11`) |
| IDs | Integers |
| Content type | `application/json` |
| Error format | `{ "error": { "code": "string", "message": "human-readable string" } }` |

Example error:

```json
{ "error": { "code": "INVALID_AMOUNT", "message": "Amount must be greater than zero" } }
```

## Data types

### Income
```json
{
  "id": 1,
  "source": "Monthly allowance from parents",
  "category": "allowance",        // allowance | scholarship | part-time | internship | freelance | other
  "amount": 120000,               // sen (RM 1200.00)
  "date": "2026-11-05",
  "recurring": true,
  "notes": ""
}
```

### Expense
```json
{
  "id": 5,
  "description": "Lunch at FC cafe",
  "category": "food",             // food | transport | education | accommodation | shopping | entertainment | healthcare | utilities | other
  "amount": 950,                  // sen (RM 9.50)
  "date": "2026-11-01",
  "essential": true,              // SDG 12: essential vs discretionary
  "notes": ""
}
```

### Budget (computed response)
```json
{
  "id": 3,
  "category": "shopping",
  "limit": 10000,
  "spent": 22000,                 // computed by Java for the current month
  "remaining": -12000,            // limit - spent (negative = over)
  "utilisationPercent": 220,      // computed by Java
  "status": "exceeded"            // within | approaching (>=75%) | reached (==100%) | exceeded (>100%)
}
```

### Savings goal
```json
{
  "id": 2,
  "name": "New laptop",
  "target": 350000,
  "saved": 125000,
  "targetDate": "2027-11-28",
  "remaining": 225000,            // computed
  "progressPercent": 36,          // computed
  "completed": false,             // computed
  "estimatedMonthsToEnd": 12      // optional, computed by Java
}
```

### Alert
```json
{
  "id": 1,
  "severity": "exceeded",         // warning | exceeded | info | success
  "type": "budget_exceeded",      // budget_approaching | budget_exceeded | goal_completed | tip
  "title": "Budget exceeded: Shopping",
  "message": "You have spent RM 220.00 of your RM 100.00 shopping budget this month (220%).",
  "date": "2026-11-25",
  "read": false
}
```

## Endpoints

### GET /api/meta
Category lists, labels and colours so the frontend never hard-codes backend enums.
```json
{ "currency": "MYR", "unit": "sen", "dateFormat": "YYYY-MM-DD",
  "incomeCategories": ["allowance","scholarship","part-time","internship","freelance","other"],
  "expenseCategories": ["food","transport","education","accommodation","shopping","entertainment","healthcare","utilities","other"],
  "labels": { "food": "Food & Beverages" }, "colors": { "food": "#10b981" } }
```

### GET /api/dashboard
One call powering the dashboard page: totals, 6-month trend, month category breakdown, budget overview, goals overview, recent transactions, alerts preview, SDG stats, AI insight string.

### Income — `GET|POST /api/income`, `PUT|DELETE /api/income/{id}`
Query filters on GET: `?search=&category=&month=YYYY-MM`.
POST/PUT body: Income object (no `id` on POST).

### Expenses — `GET|POST /api/expenses`, `PUT|DELETE /api/expenses/{id}`
Query filters on GET: `?search=&category=&type=essential|discretionary&month=YYYY-MM`.

### Budgets — `GET /api/budgets`, `POST /api/budgets`, `PUT /api/budgets/{id}`, `PUT /api/budgets/monthly-limit`
GET response: `{ "monthly": { "limit", "spent", "remaining", "utilisationPercent", "status" }, "categories": [Budget...] }` — all computed by Java.
POST body: `{ "category": "food", "limit": 70000 }`.
Monthly-limit body: `{ "limit": 100000 }`.

### Savings — `GET|POST /api/savings`, `PUT|DELETE /api/savings/{id}`
GET returns goals with computed `remaining`, `progressPercent`, `completed`, optional `estimatedMonthsToEnd`.

### GET /api/reports?month=YYYY-MM
All analytics computed by Java: totals, category breakdown, essential-vs-discretionary, largest expense, average expense, expense count, month-over-month comparison, 6-month trend.

### GET /api/alerts , PUT /api/alerts/read-all
Java evaluates alert conditions.

### POST /api/advice
Request: `{ "question": "How can I save more money this month?", "context": {} }`
Response: `{ "answer": "..." }`
**Java calls the AI API server-side. API keys must never be sent to or stored in the browser.**

## Authentication endpoints (NEW — frontend implemented, awaiting Member 4)

Full details in `AUTHENTICATION_INTEGRATION.md`. The frontend sends `Authorization: Bearer <token>` on every request once logged in, and returns to the login screen on any `401`.

### POST /api/auth/login
Request: `{ "username": "ali", "password": "1234" }`
Success `200`: `{ "username": "ali", "fullName": "Ali bin Ahmad", "role": "user", "token": "<server-generated>" }`
Failure `401`: `{ "error": { "code": "INVALID_PASSWORD", "message": "Incorrect password. Please try again." } }`
Maps to existing Java: `UserStore.findUser()` + `User.login(password)`; `role` is `"admin"` when the object is an `Admin` instance.

### POST /api/auth/register
Request: `{ "username": "meiling", "password": "...", "fullName": "Tan Mei Ling" }`
Success `201`: same session shape as login (role `"user"`).
Failure `409`: `{ "error": { "code": "USERNAME_TAKEN", "message": "Username already taken." } }`
Maps to existing Java: `UserStore.register(username, password, fullName, false)`.

### POST /api/auth/logout → `204` (invalidate token server-side if stateful)
### GET /api/auth/me → `200` with `{username, fullName, role}` for the current token

After login, all data endpoints (`/api/income`, `/api/expenses`, …) must return only records whose `owner` matches the session user (`Transaction.getOwner()`); 401 for missing/expired tokens.

## HTTP status codes expected
- `200` success · `201` created · `204` deleted (no body)
- `400` validation error (with error body) · `401` not authenticated · `404` record not found · `409` conflict (duplicate username) · `500` server error
