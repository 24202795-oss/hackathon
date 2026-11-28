# SmartSpend — Integration Guide (for Member 4)

This guide explains how to connect the finished frontend to the Java backend. The frontend was built so that **no redesign is needed** — the switch is one line.

## 1. The switch

`frontend/js/api.js`, top of file:

```js
const API_CONFIG = {
  mode: "live",                     // was "mock"
  baseUrl: "http://localhost:8080", // your Java HTTP server
  requestTimeoutMs: 15000
};
```

When `mode` is `"live"`, every data call goes through `request(method, path, body)` in the same file, which does `fetch()` against `baseUrl`. Nothing else in the frontend changes.

## 2. What the frontend expects from Java

- The exact endpoints and JSON shapes in `docs/API_CONTRACT.md` (to be confirmed jointly).
- Money as **integer sen**, dates as **ISO YYYY-MM-DD**, integer ids.
- CORS enabled if frontend and server run on different ports, e.g. header
  `Access-Control-Allow-Origin: *` and allow methods `GET, POST, PUT, DELETE` with header `Content-Type`.
  Simplest alternative: serve the `frontend/` folder **from the Java server itself** (recommended — then CORS is not needed at all).
- Errors as JSON: `{ "error": { "code": "...", "message": "..." } }` with a 4xx/5xx status. The frontend shows `error.message` in toasts and form errors automatically.

## 3. Where every mock dependency lives

| File | Role | Action needed |
|---|---|---|
| `js/api.js` | Only place that talks to mock or live data | Switch `mode`; adjust endpoint paths if the contract changes |
| `js/mock-data.js` | Demo dataset (marked "DEMONSTRATION DATA ONLY") | None — becomes unused in live mode, kept for offline demos |
| `js/app.js` | UI only; formats sen → RM for display | None. It never computes financial results |
| `js/charts.js` | Draws SVG charts from values already in sen | None |

Search in `api.js` for `mock` to find every mock implementation — each is paired with its `live` counterpart on the adjacent line.

## 4. Recommended integration order

1. Implement `GET /api/meta`, `GET /api/income`, `POST /api/income` first; switch to live and test the Income page.
2. Expenses (same pattern), then budgets, savings, dashboard, reports, alerts, and finally `POST /api/advice` with the AI API.
3. Keep mock mode until each endpoint passes; the frontend can be switched back any time for demos.

## 5. Handling backend errors

The frontend already handles: network failure/timeouts (error banner + Retry button), non-2xx responses (shows backend `error.message`), and empty results (empty states). No extra work needed beyond the JSON error format.

## 6. Rules the frontend depends on (university requirements)

- All financial calculations, validation, budget status and alert conditions are computed **in Java** — the frontend only renders values it receives.
- Data persists in Java text files; the frontend stores nothing permanently (mock mode's in-memory data intentionally resets on reload).
- AI keys stay server-side in Java; `POST /api/advice` is a plain question/answer call.
