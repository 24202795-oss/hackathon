/* ============================================================
   SmartSpend — api.js
   ------------------------------------------------------------
   CENTRAL API COMMUNICATION LAYER.
   Every page/component gets data ONLY through this file — no
   component talks to the Java server or mock data directly.

   MODE SWITCH (single line to change):
     const API_CONFIG = {
       mode: "mock",          // "mock" = demo data, "live" = Java backend
       baseUrl: "http://localhost:8080"
     };

   See docs/API_CONTRACT.md for the full endpoint contract.
   ============================================================ */

const API_CONFIG = {
  // -------- SWITCH MODE HERE --------
  mode: "mock",                 // "mock" | "live"
  baseUrl: "http://localhost:8080", // Member 4: change to your Java server
  requestTimeoutMs: 15000
};

const Api = (() => {
  "use strict";

  // ---------- helpers ----------
  function timeoutFetch(url, options) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), API_CONFIG.requestTimeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(t));
  }

  async function request(method, path, body) {
    const res = await timeoutFetch(`${API_CONFIG.baseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...authHeaders()
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      // Expected backend error format: { "error": { "code": "...", "message": "..." } }
      let message = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data && data.error && data.error.message) message = data.error.message;
      } catch (_) { /* non-JSON error body */ }
      // 401 = session expired / not logged in: drop session, app.js redirects to login
      if (res.status === 401) saveSession(null);
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  // Convert RM (user input, e.g. "12.50") -> integer sen, matching the API contract.
  function ringgitToSen(ringgit) {
    return Math.round(parseFloat(ringgit) * 100);
  }
  // Convert integer sen -> RM float for display formatting in app.js.
  function senToRinggit(sen) {
    return sen / 100;
  }

  // ---------- AUTH SESSION (frontend-side session handling) ----------
  // Only a lightweight session token is kept in sessionStorage — this is
  // NOT financial data storage. Permanent data lives in Java text files.
  const SESSION_KEY = "smartspend_session";
  function saveSession(session) {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  }
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (_) { return null; }
  }

  // authHeader() is attached to every live request once logged in.
  function authHeaders() {
    const s = getSession();
    return s && s.token ? { "Authorization": "Bearer " + s.token } : {};
  }

  // ---------- LIVE MODE (real Java backend) ----------
  // Endpoint paths follow docs/API_CONTRACT.md — confirm with Member 4.
  // Auth endpoints map 1:1 to the existing Java classes:
  //   login    -> UserStore.findUser() + User.login(password)
  //   register -> UserStore.register(username, password, fullName, false)
  //   roles    -> "user" | "admin" (Admin extends User — polymorphism)
  // See docs/AUTHENTICATION_INTEGRATION.md for what Member 4 must add.
  const live = {
    login: (username, password) => request("POST", "/api/auth/login", { username, password }),
    register: (username, password, fullName) => request("POST", "/api/auth/register", { username, password, fullName }),
    logout: () => request("POST", "/api/auth/logout"),
    getMe: () => request("GET", "/api/auth/me"),
    getMeta: () => request("GET", "/api/meta"),
    getDashboard: () => request("GET", "/api/dashboard"),
    listIncome: (filters) => request("GET", `/api/income${qs(filters)}`),
    createIncome: (tx) => request("POST", "/api/income", tx),
    updateIncome: (id, tx) => request("PUT", `/api/income/${id}`, tx),
    deleteIncome: (id) => request("DELETE", `/api/income/${id}`),
    listExpenses: (filters) => request("GET", `/api/expenses${qs(filters)}`),
    createExpense: (tx) => request("POST", "/api/expenses", tx),
    updateExpense: (id, tx) => request("PUT", `/api/expenses/${id}`, tx),
    deleteExpense: (id) => request("DELETE", `/api/expenses/${id}`),
    getBudgets: () => request("GET", "/api/budgets"),
    setBudget: (b) => request("POST", "/api/budgets", b),
    updateBudget: (id, b) => request("PUT", `/api/budgets/${id}`, b),
    setMonthlyLimit: (lim) => request("PUT", "/api/budgets/monthly-limit", lim),
    listSavings: () => request("GET", "/api/savings"),
    createSaving: (g) => request("POST", "/api/savings", g),
    updateSaving: (id, g) => request("PUT", `/api/savings/${id}`, g),
    deleteSaving: (id) => request("DELETE", `/api/savings/${id}`),
    getReports: (month) => request("GET", `/api/reports${qs(month ? { month } : null)}`),
    getAlerts: () => request("GET", "/api/alerts"),
    markAlertsRead: () => request("PUT", "/api/alerts/read-all"),
    getAdvice: (question, context) => request("POST", "/api/advice", { question, context })
  };

  function qs(params) {
    if (!params) return "";
    const entries = Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined);
    if (!entries.length) return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  }

  // ---------- MOCK MODE ----------
  // Mock auth mirrors the Java backend's real data model
  // (users.txt: username|password|fullName|role, demo accounts ali/1234
  // and admin/admin) so the UI can be tested before Member 4's HTTP layer.
  let mockUsers = null;
  function ensureUsers() {
    if (!mockUsers) {
      mockUsers = [
        { username: "ali", password: "1234", fullName: "Ali bin Ahmad", role: "user" },
        { username: "admin", password: "admin", fullName: "System Administrator", role: "admin" }
      ];
    }
    return mockUsers;
  }
  const mockAuth = {
    login: async (username, password) => {
      await new Promise((r) => setTimeout(r, 400));
      const u = ensureUsers().find((x) => x.username === username);
      if (!u) throw new Error("Account not found. Please register first.");
      if (u.password !== password) throw new Error("Incorrect password. Please try again.");
      return { username: u.username, fullName: u.fullName, role: u.role, token: "mock-token-" + Date.now() };
    },
    register: async (username, password, fullName) => {
      await new Promise((r) => setTimeout(r, 400));
      const users = ensureUsers();
      if (users.some((x) => x.username.toLowerCase() === username.toLowerCase()))
        throw new Error("Username already taken. Please choose another.");
      users.push({ username, password, fullName: fullName || username, role: "user" });
      return { username, fullName: fullName || username, role: "user", token: "mock-token-" + Date.now() };
    },
    logout: async () => {},
    getMe: async () => { const s = getSession(); if (!s) throw new Error("Not logged in"); return s; }
  };

  // In-memory copy of the demo dataset so mutations persist during
  // the current browser session (NOT permanent storage — the Java
  // backend text files remain the real, permanent store).
  let db = null;
  function ensureDb() {
    if (!db) db = JSON.parse(JSON.stringify(MOCK_DATA));
    return db;
  }
  const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
  const ym = (iso) => iso.slice(0, 7);
  const nowYm = () => new Date().toISOString().slice(0, 7);
  const sum = (arr, f) => arr.reduce((acc, x) => acc + f(x), 0);

  // All derived mock "calculations" below mirror what the Java
  // backend will compute in live mode (see API_CONTRACT.md).
  // The real authority in production is ALWAYS the Java backend.
  const mock = {
    getMeta: async () => ensureDb().meta,

    listIncome: async (filters = {}) => {
      let rows = ensureDb().income;
      if (filters.month) rows = rows.filter((r) => ym(r.date) === filters.month);
      if (filters.category) rows = rows.filter((r) => r.category === filters.category);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        rows = rows.filter((r) => r.source.toLowerCase().includes(s) || (r.notes || "").toLowerCase().includes(s));
      }
      return rows.slice().sort((a, b) => b.date.localeCompare(a.date));
    },
    createIncome: async (tx) => {
      const d = ensureDb();
      const row = { id: nextId(d.income), ...tx };
      d.income.push(row);
      return row;
    },
    updateIncome: async (idT, tx) => {
      const d = ensureDb();
      const row = d.income.find((r) => r.id === idT);
      if (!row) throw new Error("Income record not found");
      Object.assign(row, tx);
      return row;
    },
    deleteIncome: async (idT) => {
      const d = ensureDb();
      const i = d.income.findIndex((r) => r.id === idT);
      if (i === -1) throw new Error("Income record not found");
      d.income.splice(i, 1);
    },

    listExpenses: async (filters = {}) => {
      let rows = ensureDb().expenses;
      if (filters.month) rows = rows.filter((r) => ym(r.date) === filters.month);
      if (filters.category) rows = rows.filter((r) => r.category === filters.category);
      if (filters.type) rows = rows.filter((r) => (filters.type === "essential") === r.essential);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        rows = rows.filter((r) => r.description.toLowerCase().includes(s) || (r.notes || "").toLowerCase().includes(s));
      }
      return rows.slice().sort((a, b) => b.date.localeCompare(a.date));
    },
    createExpense: async (tx) => {
      const d = ensureDb();
      const row = { id: nextId(d.expenses), ...tx };
      d.expenses.push(row);
      return row;
    },
    updateExpense: async (idT, tx) => {
      const d = ensureDb();
      const row = d.expenses.find((r) => r.id === idT);
      if (!row) throw new Error("Expense record not found");
      Object.assign(row, tx);
      return row;
    },
    deleteExpense: async (idT) => {
      const d = ensureDb();
      const i = d.expenses.findIndex((r) => r.id === idT);
      if (i === -1) throw new Error("Expense record not found");
      d.expenses.splice(i, 1);
    },

    getBudgets: async () => {
      const d = ensureDb();
      const month = nowYm();
      const spentByCat = {};
      d.expenses.filter((e) => ym(e.date) === month)
        .forEach((e) => { spentByCat[e.category] = (spentByCat[e.category] || 0) + e.amount; });
      const rows = d.budgets.map((b) => {
        const spent = spentByCat[b.category] || 0;
        const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
        return {
          ...b,
          spent,
          remaining: b.limit - spent,
          utilisationPercent: pct,
          // Status logic mirrors Member 1's planned Java rules:
          status: pct > 100 ? "exceeded" : pct >= 100 ? "reached" : pct >= 75 ? "approaching" : "within"
        };
      });
      const totalSpent = sum(d.expenses.filter((e) => ym(e.date) === month), (e) => e.amount);
      const monthly = {
        limit: d.monthlyLimit,
        spent: totalSpent,
        remaining: d.monthlyLimit - totalSpent,
        utilisationPercent: d.monthlyLimit > 0 ? Math.round((totalSpent / d.monthlyLimit) * 100) : 0,
        status: totalSpent > d.monthlyLimit ? "exceeded" : totalSpent >= d.monthlyLimit ? "reached"
          : totalSpent >= d.monthlyLimit * 0.75 ? "approaching" : "within"
      };
      return { monthly, categories: rows };
    },
    setBudget: async (b) => {
      const d = ensureDb();
      const existing = d.budgets.find((x) => x.category === b.category);
      if (existing) { existing.limit = b.limit; return existing; }
      const row = { id: nextId(d.budgets), ...b };
      d.budgets.push(row);
      return row;
    },
    updateBudget: async (idT, b) => {
      const d = ensureDb();
      const row = d.budgets.find((x) => x.id === idT);
      if (!row) throw new Error("Budget not found");
      Object.assign(row, b);
      return row;
    },
    setMonthlyLimit: async (lim) => { ensureDb().monthlyLimit = lim; },

    listSavings: async () => {
      const d = ensureDb();
      return d.savings.map((g) => ({
        ...g,
        remaining: Math.max(0, g.target - g.saved),
        progressPercent: g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0,
        completed: g.saved >= g.target
      })).sort((a, b) => (a.completed === b.completed ? a.id - b.id : (a.completed ? 1 : -1)));
    },
    createSaving: async (g) => {
      const d = ensureDb();
      const row = { id: nextId(d.savings), ...g, createdAt: new Date().toISOString().slice(0, 10) };
      d.savings.push(row);
      return row;
    },
    updateSaving: async (idT, g) => {
      const d = ensureDb();
      const row = d.savings.find((x) => x.id === idT);
      if (!row) throw new Error("Savings goal not found");
      Object.assign(row, g);
      return row;
    },
    deleteSaving: async (idT) => {
      const d = ensureDb();
      const i = d.savings.findIndex((x) => x.id === idT);
      if (i === -1) throw new Error("Savings goal not found");
      d.savings.splice(i, 1);
    },

    getDashboard: async () => {
      const d = ensureDb();
      const month = nowYm();
      const inc = sum(d.income, (i) => i.amount);
      const expAll = sum(d.expenses, (e) => e.amount);
      const expMonthRows = d.expenses.filter((e) => ym(e.date) === month);
      const expMonth = sum(expMonthRows, (e) => e.amount);
      const savingsTotal = sum(d.savings, (g) => g.saved);

      // 6-month trend
      const trend = [];
      for (let m = -5; m <= 0; m++) {
        const y = ymOffset(m);
        trend.push({
          month: y,
          income: sum(d.income.filter((i) => ym(i.date) === y), (i) => i.amount),
          expenses: sum(d.expenses.filter((e) => ym(e.date) === y), (e) => e.amount)
        });
      }

      // category breakdown this month
      const byCat = {};
      expMonthRows.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
      const breakdown = Object.entries(byCat)
        .map(([category, amount]) => ({ category, amount, percent: expMonth ? Math.round((amount / expMonth) * 100) : 0 }))
        .sort((a, b) => b.amount - a.amount);

      const essential = sum(expMonthRows.filter((e) => e.essential), (e) => e.amount);
      const discretionary = expMonth - essential;

      const budgets = await mock.getBudgets();
      const savingsList = await mock.listSavings();
      const alerts = d.alerts.slice().sort((a, b) => b.date.localeCompare(a.date));

      const demoInsight = "Your food spending is the largest category this month (RM 289.50). Cooking in your hostel kitchen twice a week could free up roughly RM 60–80 for your emergency fund. 42% of this month's spending so far is discretionary — try the 24-hour rule before your next non-essential purchase.";

      return {
        totals: {
          income: inc,
          expenses: expAll,
          balance: inc - expAll,
          savings: savingsTotal,
          monthIncome: sum(d.income.filter((i) => ym(i.date) === month), (i) => i.amount),
          monthExpenses: expMonth
        },
        trend, breakdown,
        essentialVsDiscretionary: { essential, discretionary },
        topCategory: breakdown[0] || null,
        budgets: { monthly: budgets.monthly, categories: budgets.categories.slice(0, 4) },
        goals: savingsList.slice(0, 3),
        recentTransactions: recentTx(d),
        alerts: alerts.slice(0, 3),
        sdg: sdgStats(expMonthRows),
        aiInsight: demoInsight,
        demo: true
      };
    },

    getReports: async (month) => {
      const d = ensureDb();
      const m = month || nowYm();
      const incRows = d.income.filter((i) => ym(i.date) === m);
      const expRows = d.expenses.filter((e) => ym(e.date) === m);
      const inc = sum(incRows, (i) => i.amount);
      const exp = sum(expRows, (e) => e.amount);
      const savings = sum(d.savings, (g) => g.saved);

      const byCat = {};
      expRows.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
      const breakdown = Object.entries(byCat)
        .map(([category, amount]) => ({ category, amount, percent: exp ? Math.round((amount / exp) * 100) : 0 }))
        .sort((a, b) => b.amount - a.amount);

      const essential = sum(expRows.filter((e) => e.essential), (e) => e.amount);
      const largest = expRows.slice().sort((a, b) => b.amount - a.amount)[0] || null;

      const prevM = ymOffset(-1);
      const prevExp = sum(d.expenses.filter((e) => ym(e.date) === prevM), (e) => e.amount);
      const prevInc = sum(d.income.filter((i) => ym(i.date) === prevM), (i) => i.amount);

      const trend = [];
      for (let k = -5; k <= 0; k++) {
        const y = ymOffset(k);
        trend.push({
          month: y,
          income: sum(d.income.filter((i) => ym(i.date) === y), (i) => i.amount),
          expenses: sum(d.expenses.filter((e) => ym(e.date) === y), (e) => e.amount)
        });
      }

      return {
        month: m,
        totals: { income: inc, expenses: exp, balance: inc - exp, savings },
        breakdown,
        essentialVsDiscretionary: { essential, discretionary: exp - essential },
        largestExpense: largest,
        averageExpense: expRows.length ? Math.round(exp / expRows.length) : 0,
        expenseCount: expRows.length,
        comparison: {
          expensesChangePercent: prevExp ? Math.round(((exp - prevExp) / prevExp) * 100) : 0,
          incomeChangePercent: prevInc ? Math.round(((inc - prevInc) / prevInc) * 100) : 0
        },
        trend,
        demo: true
      };
    },

    getAlerts: async () => {
      const d = ensureDb();
      return d.alerts.slice().sort((a, b) => b.date.localeCompare(a.date));
    },
    markAlertsRead: async () => { ensureDb().alerts.forEach((a) => { a.read = true; }); },

    getAdvice: async (question) => {
      // In live mode this POSTs to /api/advice; Java calls the AI API
      // (keys stay server-side). Mock mode returns a canned response
      // after a short delay so loading states can be tested.
      await new Promise((r) => setTimeout(r, 900));
      const q = (question || "").toLowerCase();
      if (q.includes("entertainment")) {
        return "This month you have spent RM 38.90 on entertainment, which is above your RM 30.00 budget. Consider switching to student plans and free campus events for the rest of the month to bring this category back on track.";
      }
      if (q.includes("reduce") || q.includes("category")) {
        return "Food & Beverages is your largest spending category at about 29% of monthly expenses, and roughly half of it is discretionary (bubble tea, mamak suppers). Cutting two discretionary food purchases a week could save about RM 50 a month.";
      }
      if (q.includes("goal") || q.includes("save") || q.includes("saving")) {
        return "Your most urgent goal is the Emergency Fund at 64% funded. Automating a RM 50 transfer right after your allowance arrives would complete it about 2 months earlier. Small consistent transfers beat occasional large ones.";
      }
      if (q.includes("responsible") || q.includes("consumption") || q.includes("sdg")) {
        return "Responsible consumption (SDG 12) starts with knowing the difference between essential and discretionary spending. Right now about 42% of your spending is discretionary. Try the 24-hour rule, review your subscriptions quarterly, and prefer repairing or reusing items before replacing them.";
      }
      return "Based on your demo data: your income this month is about RM 1,401.00 and expenses are around RM 970.15, so you are spending roughly 69% of income. Keep essentials below 60% and channel the surplus into your Emergency Fund. For personalised guidance, connect the Java backend with the AI service.";
    }
  };

  function ymOffset(offset) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toISOString().slice(0, 7);
  }

  function recentTx(d) {
    const incomeRows = d.income.map((i) => ({ kind: "income", id: i.id, name: i.source, amount: i.amount, date: i.date, category: i.category }));
    const expenseRows = d.expenses.map((e) => ({ kind: "expense", id: e.id, name: e.description, amount: e.amount, date: e.date, category: e.category, essential: e.essential }));
    return incomeRows.concat(expenseRows).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }

  function sdgStats(expMonthRows) {
    const total = sum(expMonthRows, (e) => e.amount);
    const discretionary = sum(expMonthRows.filter((e) => !e.essential), (e) => e.amount);
    const pct = total ? Math.round((discretionary / total) * 100) : 0;
    return {
      discretionaryPercent: pct,
      discretionaryTotal: discretionary,
      essentialTotal: total - discretionary,
      tips: [
        pct > 40
          ? "Over 40% of your spending this month was discretionary. Planning purchases ahead supports more responsible consumption."
          : "Good balance — most of your spending this month went to essentials.",
        "Try the 24-hour rule: wait a day before non-essential purchases to decide whether you truly need them."
      ]
    };
  }

  // ---------- Public API (mode-dispatched) ----------
  const api = {};
  const bind = (liveFn, mockFn) => async (...args) => {
    if (API_CONFIG.mode === "live") return liveFn(...args);
    return mockFn(...args);
  };

  api.isMock = () => API_CONFIG.mode === "mock";
  api.ringgitToSen = ringgitToSen;
  api.senToRinggit = senToRinggit;

  // Auth API — session is kept in sessionStorage (token only, not financial data)
  api.getSession = getSession;
  api.saveSession = saveSession;
  const loginFn = bind(live.login, mockAuth.login);
  const registerFn = bind(live.register, mockAuth.register);
  const logoutFn = bind(live.logout, mockAuth.logout);
  api.login = async (u, p) => {
    const session = await loginFn(u, p);
    saveSession(session);
    return session;
  };
  api.register = async (u, p, f) => {
    const session = await registerFn(u, p, f);
    saveSession(session);
    return session;
  };
  api.logout = async () => {
    try { await logoutFn(); } catch (_) { /* best-effort server logout */ }
    saveSession(null);
  };
  api.getMe = bind(live.getMe, mockAuth.getMe);

  api.getMeta = bind(live.getMeta, mock.getMeta);
  api.getDashboard = bind(live.getDashboard, mock.getDashboard);
  api.listIncome = bind(live.listIncome, mock.listIncome);
  api.createIncome = bind(live.createIncome, mock.createIncome);
  api.updateIncome = bind(live.updateIncome, mock.updateIncome);
  api.deleteIncome = bind(live.deleteIncome, mock.deleteIncome);
  api.listExpenses = bind(live.listExpenses, mock.listExpenses);
  api.createExpense = bind(live.createExpense, mock.createExpense);
  api.updateExpense = bind(live.updateExpense, mock.updateExpense);
  api.deleteExpense = bind(live.deleteExpense, mock.deleteExpense);
  api.getBudgets = bind(live.getBudgets, mock.getBudgets);
  api.setBudget = bind(live.setBudget, mock.setBudget);
  api.updateBudget = bind(live.updateBudget, mock.updateBudget);
  api.setMonthlyLimit = bind(live.setMonthlyLimit, mock.setMonthlyLimit);
  api.listSavings = bind(live.listSavings, mock.listSavings);
  api.createSaving = bind(live.createSaving, mock.createSaving);
  api.updateSaving = bind(live.updateSaving, mock.updateSaving);
  api.deleteSaving = bind(live.deleteSaving, mock.deleteSaving);
  api.getReports = bind(live.getReports, mock.getReports);
  api.getAlerts = bind(live.getAlerts, mock.getAlerts);
  api.markAlertsRead = bind(live.markAlertsRead, mock.markAlertsRead);
  api.getAdvice = bind(live.getAdvice, mock.getAdvice);

  return api;
})();
