# SmartSpend 💰

Personal finance manager for Malaysian university students (MYR).
**WIX1002 Fundamentals of Programming · ILMUcode Hackathon · Track 8 — Fintech & Personal Finance · SDG 12**

> Track income, expenses, budgets and savings goals, understand spending habits and practise responsible consumption.

## Quick start (frontend)

```powershell
# Windows: serve the frontend at http://localhost:8090
powershell -ExecutionPolicy Bypass -File serve.ps1
```

or any static server from `frontend/` (`python -m http.server 8080` / `npx serve .`), then open the printed URL. The app currently runs on clearly-labelled **demo data** until the Java backend is connected (one-line switch in `frontend/js/api.js`).

## Team modules

| Member | Module |
|---|---|
| 1 | Financial / budget / savings calculations & analysis (Java) |
| 2 | Transaction management, arrays+counters, inheritance & polymorphism, custom exceptions, text-file storage (Java) |
| 3 | **Frontend: UI/UX, dashboard, forms, charts, navigation, responsive design, testing** ← this repository part |
| 4 | Java web server, API endpoints, AI API integration, final system integration |

## Documentation (in `docs/`)

- `FRONTEND_README.md` — run instructions & file structure
- `API_CONTRACT.md` — proposed endpoints, JSON shapes, sen/ISO-date conventions
- `INTEGRATION_GUIDE.md` — step-by-step for Member 4
- `FEATURE_CHECKLIST.md` — what's done, what awaits backend
- `TESTING_REPORT.md` — tests performed, bugs fixed, limitations
- `FRONTEND_CODE_EXPLANATION.md` — beginner-friendly + 中文 explanation, lecturer Q&A, report draft, presentation script

## University requirements respected

Backend in Java · all calculations in Java · plain arrays + counters · inheritance & polymorphism · custom exceptions · text-file persistence · GUI (this web frontend) · AI feature via backend · frontend ↔ backend communication. The frontend computes nothing financial itself and stores nothing permanently in the browser.

## Status

✅ Frontend complete and browser-tested (demo data) · ⬜ Java backend in progress by Members 1, 2, 4.
