/* ============================================================
   SmartSpend — mock-data.js
   ------------------------------------------------------------
   DEMONSTRATION DATA ONLY.
   This file exists purely so the frontend can be developed and
   tested before the Java backend (Member 4) is ready.

   CONVENTIONS (must match the real backend, see API_CONTRACT.md):
   - All money values are INTEGER SEN (RM 1.00 = 100 sen)
   - All dates are ISO strings "YYYY-MM-DD"
   - All ids are integers
   ------------------------------------------------------------
   When the Java backend is ready, switch api.js to live mode
   and this file becomes unused (kept for offline demos).
   ============================================================ */

const MOCK_DATA = (() => {

  // Current month reference (YYYY-MM) — data is generated around "now"
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ym = (offsetMonths) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  };
  const date = (offsetMonths, day) => `${ym(offsetMonths)}-${pad(Math.min(day, 28))}`;

  const INCOME_CATEGORIES = ["allowance", "scholarship", "part-time", "internship", "freelance", "other"];
  const EXPENSE_CATEGORIES = [
    "food", "transport", "education", "accommodation",
    "shopping", "entertainment", "healthcare", "utilities", "other"
  ];

  // Human-readable labels
  const LABELS = {
    allowance: "Allowance", scholarship: "Scholarship", "part-time": "Part-time job",
    internship: "Internship", freelance: "Freelance", other: "Other",
    food: "Food & Beverages", transport: "Transportation", education: "Education",
    accommodation: "Accommodation", shopping: "Shopping", entertainment: "Entertainment",
    healthcare: "Healthcare", utilities: "Utilities"
  };

  // UI accent colours per category (frontend presentation only)
  const COLORS = {
    allowance: "#10b981", scholarship: "#3b82f6", "part-time": "#8b5cf6",
    internship: "#06b6d4", freelance: "#f59e0b", other: "#94a3b8",
    food: "#10b981", transport: "#3b82f6", education: "#8b5cf6",
    accommodation: "#06b6d4", shopping: "#ec4899", entertainment: "#f59e0b",
    healthcare: "#ef4444", utilities: "#f97316"
  };

  let nextId = 1;
  const id = () => nextId++;

  // ---------- Income (sen) ----------
  const income = [
    { id: id(), source: "Monthly allowance from parents", category: "allowance",  amount: 120000, date: date(0, 5),  recurring: true,  notes: "" },
    { id: id(), source: "PTPTN disbursement",            category: "scholarship", amount: 150000, date: date(0, 10), recurring: false, notes: "Semester disbursement" },
    { id: id(), source: "Part-time at campus library",   category: "part-time",   amount: 36000,  date: date(0, 18), recurring: true,  notes: "8 hours x RM4.50" },
    { id: id(), source: "Freelance poster design",       category: "freelance",   amount: 15000,  date: date(0, 21), recurring: false, notes: "For a student club event" },
    { id: id(), source: "Monthly allowance from parents", category: "allowance",  amount: 120000, date: date(-1, 5), recurring: true,  notes: "" },
    { id: id(), source: "Part-time at campus library",   category: "part-time",   amount: 31500,  date: date(-1, 18), recurring: true, notes: "" },
    { id: id(), source: "Tuition refund (dropped elective)", category: "other",   amount: 9000,   date: date(-1, 22), recurring: false, notes: "" },
    { id: id(), source: "Monthly allowance from parents", category: "allowance",  amount: 120000, date: date(-2, 5), recurring: true,  notes: "" },
    { id: id(), source: "Part-time at campus library",   category: "part-time",   amount: 40500,  date: date(-2, 18), recurring: true, notes: "" },
    { id: id(), source: "Monthly allowance from parents", category: "allowance",  amount: 120000, date: date(-3, 5), recurring: true, notes: "" },
    { id: id(), source: "Internship stipend (Dec break)", category: "internship", amount: 180000, date: date(-3, 15), recurring: false, notes: "" }
  ];

  // ---------- Expenses (sen) ----------
  const expenses = [
    // current month
    { id: id(), description: "Lunch at FC cafe",            category: "food",          amount: 950,   date: date(0, 1),  essential: true,  notes: "" },
    { id: id(), description: "Grab ride to Mid Valley",     category: "transport",     amount: 1850,  date: date(0, 2),  essential: false, notes: "" },
    { id: id(), description: "Groceries at Lotus's",        category: "food",          amount: 6200,  date: date(0, 3),  essential: true,  notes: "Weekly groceries" },
    { id: id(), description: "Bus card top-up",             category: "transport",     amount: 3000,  date: date(0, 4),  essential: true,  notes: "" },
    { id: id(), description: "Cinema ticket with friends",  category: "entertainment", amount: 2400,  date: date(0, 6),  essential: false, notes: "" },
    { id: id(), description: "Reference book (Statistics)", category: "education",     amount: 4500,  date: date(0, 8),  essential: true,  notes: "Second-hand" },
    { id: id(), description: "Bubble tea",                  category: "food",          amount: 890,   date: date(0, 9),  essential: false, notes: "" },
    { id: id(), description: "Uniqlo sale",                 category: "shopping",      amount: 12900, date: date(0, 11), essential: false, notes: "3 t-shirts" },
    { id: id(), description: "Hostel monthly fee",          category: "accommodation", amount: 30000, date: date(0, 12), essential: true,  notes: "KK3" },
    { id: id(), description: "Wifi and electricity",        category: "utilities",     amount: 6500,  date: date(0, 13), essential: true,  notes: "" },
    { id: id(), description: "Clinic visit",                category: "healthcare",    amount: 5000,  date: date(0, 15), essential: true,  notes: "Flu" },
    { id: id(), description: "Dinner at mamak",             category: "food",          amount: 1500,  date: date(0, 16), essential: false, notes: "Teh ais + roti canai" },
    { id: id(), description: "Spotify subscription",        category: "entertainment", amount: 1490,  date: date(0, 17), essential: false, notes: "Student plan" },
    { id: id(), description: "Shopee impulse buy",          category: "shopping",      amount: 3600,  date: date(0, 19), essential: false, notes: "Phone case + stickers" },
    { id: id(), description: "Lunch at FC cafe",            category: "food",          amount: 1000,  date: date(0, 20), essential: true,  notes: "" },
    { id: id(), description: "Printing assignment",         category: "education",     amount: 600,   date: date(0, 22), essential: true,  notes: "" },
    { id: id(), description: "Weekend trip fuel",           category: "transport",     amount: 4000,  date: date(0, 24), essential: false, notes: "" },
    { id: id(), description: "Skincare restock",            category: "shopping",      amount: 5500,  date: date(0, 25), essential: false, notes: "" },
    { id: id(), description: "Mamak supper",                category: "food",          amount: 1200,  date: date(0, 26), essential: false, notes: "" },
    { id: id(), description: "Lunch at FC cafe",            category: "food",          amount: 950,   date: date(0, 27), essential: true,  notes: "" },
    // previous months (for trends / reports)
    { id: id(), description: "Monthly food & essentials",   category: "food",          amount: 45000, date: date(-1, 15), essential: true, notes: "" },
    { id: id(), description: "Hostel monthly fee",          category: "accommodation", amount: 30000, date: date(-1, 12), essential: true, notes: "" },
    { id: id(), description: "Transport pass & rides",      category: "transport",     amount: 11000, date: date(-1, 14), essential: true, notes: "" },
    { id: id(), description: "Online shopping haul",        category: "shopping",      amount: 18900, date: date(-1, 20), essential: false, notes: "" },
    { id: id(), description: "Entertainment & subscriptions", category: "entertainment", amount: 5200, date: date(-1, 21), essential: false, notes: "" },
    { id: id(), description: "Utilities",                   category: "utilities",     amount: 6000,  date: date(-1, 13), essential: true, notes: "" },
    { id: id(), description: "Monthly food & essentials",   category: "food",          amount: 51000, date: date(-2, 15), essential: true, notes: "" },
    { id: id(), description: "Hostel monthly fee",          category: "accommodation", amount: 30000, date: date(-2, 12), essential: true, notes: "" },
    { id: id(), description: "Transport pass & rides",      category: "transport",     amount: 9800,  date: date(-2, 14), essential: true, notes: "" },
    { id: id(), description: "Birthday gift & celebration", category: "shopping",      amount: 24500, date: date(-2, 18), essential: false, notes: "" },
    { id: id(), description: "Entertainment",               category: "entertainment", amount: 7100,  date: date(-2, 22), essential: false, notes: "" },
    { id: id(), description: "Monthly food & essentials",   category: "food",          amount: 48000, date: date(-3, 15), essential: true, notes: "" },
    { id: id(), description: "Hostel monthly fee",          category: "accommodation", amount: 30000, date: date(-3, 12), essential: true, notes: "" },
    { id: id(), description: "Transport",                   category: "transport",     amount: 10500, date: date(-3, 14), essential: true, notes: "" },
    { id: id(), description: "Education books",             category: "education",     amount: 12000, date: date(-3, 10), essential: true, notes: "" },
    { id: id(), description: "Entertainment",               category: "entertainment", amount: 6400,  date: date(-3, 20), essential: false, notes: "" }
  ];

  // ---------- Budgets (sen, monthly limits) ----------
  const budgets = [
    { id: id(), category: "food",          limit: 70000 },
    { id: id(), category: "transport",     limit: 15000 },
    { id: id(), category: "shopping",      limit: 10000 },
    { id: id(), category: "entertainment", limit: 3000 },
    { id: id(), category: "education",     limit: 8000 },
    { id: id(), category: "accommodation", limit: 30000 }
  ];

  const monthlyLimit = 100000; // RM 1000.00

  // ---------- Savings goals (sen) ----------
  const savings = [
    { id: id(), name: "Emergency fund", target: 150000, saved: 96000, targetDate: date(6, 28),  createdAt: date(-2, 1) },
    { id: id(), name: "New laptop",     target: 350000, saved: 125000, targetDate: date(12, 28), createdAt: date(-4, 1) },
    { id: id(), name: "Travel — Langkawi", target: 80000, saved: 80000, targetDate: date(4, 28),  createdAt: date(-6, 1) },
    { id: id(), name: "Personal savings",  target: 50000, saved: 18500, targetDate: date(5, 28),  createdAt: date(-1, 1) }
  ];

  // ---------- Alerts ----------
  // NOTE: in live mode these come from Java (GET /api/alerts).
  const alerts = [
    { id: id(), severity: "exceeded", type: "budget_exceeded",
      title: "Budget exceeded: Shopping",
      message: "You have spent RM 220.00 of your RM 100.00 shopping budget this month (220%). Consider pausing non-essential purchases.",
      date: date(0, 25), read: false },
    { id: id(), severity: "warning", type: "budget_approaching",
      title: "Approaching budget: Food & Beverages",
      message: "You are at 92% of your RM 700.00 food budget. Only RM 58.50 remains for the rest of the month.",
      date: date(0, 27), read: false },
    { id: id(), severity: "success", type: "goal_completed",
      title: "Savings goal reached: Travel — Langkawi 🎉",
      message: "You have saved RM 800.00. The goal is fully funded ahead of your target date.",
      date: date(0, 24), read: false },
    { id: id(), severity: "info", type: "tip",
      title: "SDG 12 tip: review before you buy",
      message: "58% of this month's spending so far was discretionary. Reviewing your cart for 24 hours before buying helps you separate wants from needs.",
      date: date(0, 20), read: true }
  ];

  return {
    meta: {
      currency: "MYR", unit: "sen", dateFormat: "YYYY-MM-DD", demo: true,
      incomeCategories: INCOME_CATEGORIES,
      expenseCategories: EXPENSE_CATEGORIES,
      labels: LABELS,
      colors: COLORS
    },
    incomeCategories: INCOME_CATEGORIES,
    expenseCategories: EXPENSE_CATEGORIES,
    labels: LABELS,
    colors: COLORS,
    income, expenses, budgets, savings, alerts,
    monthlyLimit,
    stats: {
      // Frontend never computes these itself in live mode;
      // mock report stats are provided here for parity with /api/reports.
    }
  };
})();

// Convenience formatter used ONLY by mock mode rendering glue in api.js.
// In live mode, the Java backend already sends sen and the same
// formatting helpers are used — see app.js formatMoney().
