# SmartSpend — Frontend README

SmartSpend is a personal finance web application for Malaysian university students (MYR), built for the WIX1002 FOP / ILMUcode Hackathon, Track 8 (Fintech & Personal Finance), aligned with SDG 12 — Responsible Consumption and Production.

**Status: frontend complete, running on demonstration (mock) data.** The Java backend (Members 1, 2 and 4) is developed separately; this frontend is prepared to connect to it with a one-line switch.

## How to run (preview the website)

The frontend is plain HTML/CSS/JavaScript — no build step.

**Option A — any static server (recommended):**

```bash
# from the frontend/ folder, pick whichever tool exists on your machine:
python -m http.server 8080
npx serve .
```

Then open `http://localhost:8080`.

**Option B — Windows PowerShell (a ready script is included):**

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

(serve.ps1 lives in the project root and serves `frontend/` at `http://localhost:8090`.)

**Option C — double-click `index.html`.** Mock mode works from `file://` too, but a local server is preferred.

## File structure

```
SmartSpend/
├── frontend/
│   ├── index.html          # Single-page app: all 8 sections + modals
│   ├── css/
│   │   ├── style.css       # Design system + component styles
│   │   └── responsive.css  # Tablet/mobile breakpoints
│   ├── js/
│   │   ├── mock-data.js    # DEMO dataset (sen + ISO dates)
│   │   ├── api.js          # ★ Central API layer + mock/live switch
│   │   ├── charts.js       # Dependency-free SVG charts
│   │   └── app.js          # Routing, rendering, forms, modals
│   └── assets/             # icons/, images/ (reserved)
├── docs/                   # All project documentation
├── serve.ps1               # Windows preview server
└── README.md
```

## Technologies

- HTML5, CSS3, vanilla JavaScript (ES6) — no frameworks, no build tools
- Hand-rolled SVG charts (donut, grouped bar, line, horizontal bars) — zero chart dependencies
- Google Fonts (Inter, Sora) — the only external request; the app still works offline with system fonts

## Switching between demo and live modes

Open `frontend/js/api.js` and change one line:

```js
const API_CONFIG = {
  mode: "mock",                     // "mock" = demo data | "live" = Java backend
  baseUrl: "http://localhost:8080"  // Member 4: set your Java server URL
};
```

In mock mode a yellow "Demo data — not live" chip appears in the sidebar footer so demonstration data is never mistaken for real data. See `docs/INTEGRATION_GUIDE.md` for full instructions.

## Conventions (must match the Java backend)

- **Money: integer sen** (RM 1.00 = 100 sen) — avoids floating-point errors
- **Dates: ISO `YYYY-MM-DD`**
- **IDs: integers**

Full endpoint details: `docs/API_CONTRACT.md`.
