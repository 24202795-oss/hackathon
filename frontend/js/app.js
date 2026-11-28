/* ============================================================
   SmartSpend — app.js
   ------------------------------------------------------------
   UI orchestration: routing, rendering, forms, modals, toasts.
   ALL data comes from Api (api.js) — this file never computes
   financial results itself; it only formats backend values.
   Money arrives as integer SEN; dates as ISO YYYY-MM-DD.
   ============================================================ */

(() => {
  "use strict";

  // ---------- constants ----------
  const PAGES = ["dashboard", "income", "expenses", "budgets", "savings", "reports", "alerts", "advisor", "admin"];
  const TITLES = {
    dashboard: "Dashboard", income: "Income", expenses: "Expenses",
    budgets: "Budgets", savings: "Savings Goals", reports: "Financial Reports",
    alerts: "Budget Alerts", advisor: "AI Financial Advisor", admin: "Admin Panel"
  };
  // Pages a normal user may open (admin panel is role-gated separately)
  const USER_PAGES = ["dashboard", "income", "expenses", "budgets", "savings", "reports", "alerts", "advisor"];
  const STATUS_LABEL = { within: "Within budget", approaching: "Approaching limit", reached: "Limit reached", exceeded: "Exceeded" };
  const STATUS_CLASS = { within: "status-green", approaching: "status-yellow", reached: "status-orange", exceeded: "status-red" };

  // ---------- state ----------
  const state = {
    meta: null,
    dashboard: null,
    income: [],
    expenses: [],
    budgets: null,
    savings: [],
    reports: null,
    alerts: [],
    editIncomeId: null,
    editExpenseId: null,
    editGoalId: null,
    chatHistory: []
  };

  // ---------- tiny helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtRM = (sen) => "RM " + (Api.senToRinggit(sen)).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  const monthLabel = (ym) => new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1, 1)
    .toLocaleString("en-MY", { month: "long", year: "numeric" });
  const nowYm = () => new Date().toISOString().slice(0, 7);
  const todayIso = () => new Date().toISOString().slice(0, 10);

  function labelFor(category) { return state.meta.labels[category] || category; }
  function colorFor(category) { return state.meta.colors[category] || "#94a3b8"; }

  // ---------- toast ----------
  function toast(message, type = "default") {
    const region = $("#toastRegion");
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    region.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 300); }, 3200);
  }

  // ---------- modal helpers ----------
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.hidden = false; const f = m.querySelector("input, select, button"); if (f) f.focus(); }
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.hidden = true;
  }
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-modal]");
    if (opener) { handleModalOpen(opener.getAttribute("data-open-modal")); return; }
    if (e.target.closest("[data-close-modal]")) {
      const m = e.target.closest(".modal-overlay");
      if (m) m.hidden = true;
      return;
    }
    if (e.target.classList && e.target.classList.contains("modal-overlay")) e.target.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal-overlay").forEach((m) => { m.hidden = true; });
  });

  function showFormError(formId, message) {
    const elErr = $(`#${formId}Error`);
    if (elErr) { elErr.textContent = message; elErr.hidden = false; }
  }
  function clearFormError(formId) {
    const elErr = $(`#${formId}Error`);
    if (elErr) elErr.hidden = true;
  }

  let confirmCallback = null;
  function confirmDialog(message, onYes) {
    $("#confirmMessage").textContent = message;
    confirmCallback = onYes;
    openModal("confirmModal");
  }
  $("#confirmYes").addEventListener("click", () => {
    closeModal("confirmModal");
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  });

  // ---------- routing ----------
  function navigate(page) {
    if (!PAGES.includes(page)) page = "dashboard";
    // Role-based navigation guards, mirroring the Java console app:
    // - Menu.adminMenu() requires `instanceof Admin` for the admin panel
    // - Menu.isNormalUser() blocks admins from personal finance actions
    const session = Api.getSession();
    const isAdmin = session && session.role === "admin";
    if (page === "admin" && !isAdmin) page = "dashboard";
    if (isAdmin && USER_PAGES.includes(page)) page = "admin";
    // keep the URL hash in sync with the page actually displayed
    const expectedHash = "#/" + page;
    if (location.hash !== expectedHash) {
      history.replaceState(null, "", expectedHash);
    }
    $$(".page").forEach((p) => { p.hidden = p.id !== `page-${page}`; });
    $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.page === page));
    $("#pageTitle").textContent = TITLES[page];
    closeSidebar();
    window.scrollTo(0, 0);
    loadPage(page);
  }

  // Show/hide role-specific navigation (Admin Panel link)
  function applyRoleVisibility() {
    const session = Api.getSession();
    const isAdmin = !!(session && session.role === "admin");
    $$(".nav-item.admin-only").forEach((n) => { n.hidden = !isAdmin; });
    // Admins manage the system, not personal finances — hide user-finance
    // pages for them, exactly like Menu.isNormalUser() blocks admins in Java.
    $$(".nav-item:not(.admin-only)").forEach((n) => { n.hidden = isAdmin; });
  }
  window.addEventListener("hashchange", () => navigate(location.hash.replace("#/", "")));

  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").classList.remove("show");
  }
  $("#menuBtn").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
    $("#sidebarOverlay").classList.toggle("show");
  });
  $("#sidebarOverlay").addEventListener("click", closeSidebar);
  $("#alertsBell").addEventListener("click", () => navigate("alerts"));

  // ---------- loading / error / empty primitives ----------
  function setLoading(container, rows = 3) {
    container.innerHTML = Array.from({ length: rows }, () => `<div class="skeleton"></div>`).join("");
  }
  function renderError(container, err, retry) {
    // Session expired (live mode 401): return to the login screen
    if (err.status === 401 && !Api.getSession()) {
      renderUserChip(null);
      showAuth(true);
      switchAuthTab(true);
      return;
    }
    container.innerHTML = `
      <div class="error-banner">
        <span>⚠️ ${esc(err.message || "Something went wrong")}</span>
        <button class="btn btn-ghost btn-sm" id="retryBtn">Retry</button>
      </div>`;
    const b = container.querySelector("#retryBtn");
    if (b) b.addEventListener("click", retry);
  }
  function emptyState(icon, title, desc) {
    return `<div class="empty-state"><div class="es-icon">${icon}</div><div class="es-title">${esc(title)}</div>${esc(desc)}</div>`;
  }

  // ---------- option builders ----------
  function fillSelect(selectEl, options, { allLabel = null, allValue = "" } = {}) {
    selectEl.innerHTML = "";
    if (allLabel !== null) {
      const o = document.createElement("option");
      o.value = allValue; o.textContent = allLabel;
      selectEl.appendChild(o);
    }
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt; o.textContent = labelFor(opt);
      selectEl.appendChild(o);
    });
  }

  // ============================================================
  // PAGE LOADERS
  // ============================================================
  function loadPage(page) {
    const safe = {
      dashboard: loadDashboard, income: loadIncome, expenses: loadExpenses,
      budgets: loadBudgets, savings: loadSavings, reports: loadReports,
      alerts: loadAlerts, advisor: initChat, admin: loadAdmin
    };
    (safe[page] || (() => {}))();
  }

  // ---------- ADMIN PANEL (role: admin) ----------
  async function loadAdmin() {
    setLoading($("#adminOverview"), 2);
    setLoading($("#adminCategoryList"), 3);
    setLoading($("#adminUserList"), 3);
    try {
      const [cats, users] = await Promise.all([Api.listCategories(), Api.listUsers()]);
      renderAdmin(cats, users);
    } catch (err) {
      renderError($("#adminOverview"), err, loadAdmin);
    }
  }

  function renderAdmin(cats, users) {
    const session = Api.getSession();
    const admins = users.filter((u) => u.role === "admin").length;
    $("#adminOverview").innerHTML = `
      <div class="stat-list">
        <div class="stat-row"><span>Registered users</span><span class="s-val">${users.length}</span></div>
        <div class="stat-row"><span>Administrators</span><span class="s-val">${admins}</span></div>
        <div class="stat-row"><span>Expense categories</span><span class="s-val">${cats.length}</span></div>
        <div class="stat-row"><span>Signed in as</span><span class="s-val">${esc(session.fullName || session.username)} (${esc(session.role)})</span></div>
      </div>
      <p class="muted" style="font-size:.82rem; margin:10px 0 0;">
        This panel mirrors the console app's admin menu (add/view categories, view users, register users).
        In live mode these lists come from Java via <code>/api/categories</code> and <code>/api/users</code>.
      </p>`;

    $("#adminCategoryList").innerHTML = cats.length
      ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Category name</th></tr></thead><tbody>
          ${cats.map((c, i) => `<tr><td>${i + 1}</td><td><span class="chip cat-chip">${esc(c.name)}</span></td></tr>`).join("")}
        </tbody></table></div>`
      : emptyState("🏷️", "No categories", "Add the first expense category above.");

    $("#adminUserList").innerHTML = users.length
      ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Username</th><th>Full name</th><th>Role</th></tr></thead><tbody>
          ${users.map((u) => `<tr><td><strong>${esc(u.username)}</strong></td><td>${esc(u.fullName)}</td>
            <td>${u.role === "admin" ? '<span class="chip type-chip-discretionary">Admin</span>' : '<span class="chip type-chip-essential">User</span>'}</td></tr>`).join("")}
        </tbody></table></div>`
      : emptyState("👥", "No users", "Register a user below.");
  }

  $("#adminCategoryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = $("#adminCategoryName");
    try {
      await Api.addCategory(input.value);
      toast("Category added (sent to Java in live mode)", "success");
      input.value = "";
      loadAdmin();
    } catch (err) {
      toast(err.message, "error");
    }
  });

  $("#adminRegisterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("adminRegister");
    const form = e.target;
    if (!form.fullName.value.trim()) return showFormError("adminRegister", "Please enter a full name.");
    if (!form.username.value.trim()) return showFormError("adminRegister", "Please enter a username.");
    if (form.password.value.length < 4) return showFormError("adminRegister", "Password must be at least 4 characters.");
    try {
      await Api.registerUser({
        username: form.username.value.trim(),
        password: form.password.value,
        fullName: form.fullName.value.trim(),
        role: form.role.value
      });
      toast(`User "${form.username.value.trim()}" registered`, "success");
      form.reset();
      loadAdmin();
    } catch (err) {
      showFormError("adminRegister", err.message);
    }
  });

  // ---------- DASHBOARD ----------
  async function loadDashboard() {
    const cards = $("#dashSummaryCards");
    ["#dashDonut", "#dashTrend"].forEach((s) => setLoading($(s), 4));
    setLoading($("#dashBudgetOverview"), 3);
    setLoading($("#dashGoalOverview"), 3);
    setLoading($("#dashRecentTx"), 4);
    setLoading($("#dashAlerts"), 2);

    try {
      const d = await Api.getDashboard();
      state.dashboard = d;
      renderDashboard(d);
    } catch (err) {
      renderError(cards, err, loadDashboard);
    }
  }

  function renderDashboard(d) {
    const month = nowYm();
    $("#dashMonth").textContent = monthLabel(month);
    $("#welcomeMsg").textContent = "Welcome back 👋";

    const cardData = [
      { label: "Total income (all time)", value: fmtRM(d.totals.income), sub: `${fmtRM(d.totals.monthIncome)} this month`, accent: "#059669", icon: iconSvg("income") },
      { label: "Total expenses (all time)", value: fmtRM(d.totals.expenses), sub: `${fmtRM(d.totals.monthExpenses)} this month`, accent: "#f97316", icon: iconSvg("expense") },
      { label: "Available balance", value: fmtRM(d.totals.balance), sub: "Income − expenses", accent: "#3b82f6", icon: iconSvg("balance") },
      { label: "Total savings", value: fmtRM(d.totals.savings), sub: `${state.savings.length || d.goals.length} active goals`, accent: "#8b5cf6", icon: iconSvg("savings") }
    ];
    $("#dashSummaryCards").innerHTML = cardData.map((c) => `
      <div class="card summary-card" style="--accent:${c.accent}">
        <div class="sc-icon">${c.icon}</div>
        <div class="sc-label">${esc(c.label)}</div>
        <div class="sc-value">${esc(c.value)}</div>
        <div class="sc-sub">${esc(c.sub)}</div>
      </div>`).join("");

    // donut
    Charts.donut($("#dashDonut"),
      d.breakdown.map((b) => ({ label: labelFor(b.category), value: b.amount, color: colorFor(b.category) })),
      { centerLabel: "Spent this month" });
    $("#dashDonutLegend").innerHTML = d.breakdown.slice(0, 6).map((b) => legendItem(b)).join("") || "";

    // trend
    Charts.groupedBars($("#dashTrend"), d.trend);

    // budget overview
    const m = d.budgets.monthly;
    $("#dashBudgetOverview").innerHTML = `
      <div class="${STATUS_CLASS[m.status]}" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:.85rem; margin-bottom:6px;">
          <span>Overall monthly limit ${fmtRM(m.limit)}</span>
          <span class="bc-pct">${m.utilisationPercent}%</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${Math.min(100, m.utilisationPercent)}%"></div></div>
        <div style="display:flex; justify-content:space-between; font-size:.78rem; color:var(--ink-500); margin-top:4px;">
          <span class="status-pill">${STATUS_LABEL[m.status]}</span>
          <span>${m.remaining >= 0 ? fmtRM(m.remaining) + " left" : fmtRM(-m.remaining) + " over"}</span>
        </div>
      </div>
      ${d.budgets.categories.map(budgetRowHtml).join("")}`;

    // goals overview
    $("#dashGoalOverview").innerHTML = d.goals.length
      ? d.goals.map(goalRowHtml).join("")
      : emptyState("🎯", "No goals yet", "Create a savings goal to see progress here.");

    // recent transactions
    $("#dashRecentTx").innerHTML = d.recentTransactions.length
      ? d.recentTransactions.map(txRowHtml).join("")
      : emptyState("🧾", "No transactions yet", "Add income or expenses to get started.");

    // alerts preview
    $("#dashAlerts").innerHTML = d.alerts.length
      ? d.alerts.map((a) => alertItemHtml(a)).join("")
      : emptyState("🔔", "All clear", "No budget alerts right now. Keep it up!");

    // SDG
    $("#dashSdg").innerHTML = sdgHtml(d.sdg);

    $("#dashAiInsight").textContent = d.aiInsight;
    updateAlertBadge();
  }

  function legendItem(b) {
    return `<span class="legend-item"><span class="legend-dot" style="background:${colorFor(b.category)}"></span>
      ${esc(labelFor(b.category))} <span class="li-val">${esc(fmtRM(b.amount))}</span></span>`;
  }
  function budgetRowHtml(b) {
    return `
      <div class="${STATUS_CLASS[b.status]}" style="padding:6px 0;">
        <div style="display:flex; justify-content:space-between; font-size:.82rem; margin-bottom:5px;">
          <span style="font-weight:600;">${esc(labelFor(b.category))}</span>
          <span style="color:var(--ink-500);">${esc(fmtRM(b.spent))} / ${esc(fmtRM(b.limit))}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${Math.min(100, b.utilisationPercent)}%"></div></div>
      </div>`;
  }
  function goalRowHtml(g) {
    return `
      <div style="padding:6px 0;">
        <div style="display:flex; justify-content:space-between; font-size:.82rem; margin-bottom:5px;">
          <span style="font-weight:600;">${esc(g.name)} ${g.completed ? "✅" : ""}</span>
          <span style="color:var(--ink-500);">${esc(fmtRM(g.saved))} / ${esc(fmtRM(g.target))}</span>
        </div>
        <div class="progress ${g.completed ? "status-green" : ""}"><div class="progress-bar" style="width:${g.progressPercent}%; background:${g.completed ? "var(--emerald-500)" : "var(--violet-500)"}"></div></div>
        <div style="font-size:.75rem; color:var(--ink-500); margin-top:3px;">${g.progressPercent}% · by ${fmtDate(g.targetDate)}</div>
      </div>`;
  }
  function txRowHtml(t) {
    const isIncome = t.kind === "income";
    return `
      <div class="tx-row">
        <span class="tx-dot" style="--cat-color:${colorFor(t.category)}"></span>
        <div class="tx-main">
          <div class="t-name">${esc(t.name)}</div>
          <div class="t-date">${fmtDate(t.date)} · ${esc(labelFor(t.category))}${!isIncome && t.essential === false ? " · discretionary" : ""}</div>
        </div>
        <div class="tx-amt ${isIncome ? "income" : "expense"}">${isIncome ? "+" : "−"}${esc(fmtRM(t.amount))}</div>
      </div>`;
  }
  function sdgHtml(sdg) {
    return `
      <div class="sdg-stat-row">
        <div class="sdg-stat"><span>Discretionary spending this month</span><span class="num">${sdg.discretionaryPercent}% · ${esc(fmtRM(sdg.discretionaryTotal))}</span></div>
        <div class="sdg-stat"><span>Essential spending</span><span class="num">${esc(fmtRM(sdg.essentialTotal))}</span></div>
      </div>
      <div class="sdg-tip">💡 ${esc(sdg.tips[0])}</div>
      <div class="sdg-tip">🌱 ${esc(sdg.tips[1])}</div>`;
  }

  function iconSvg(kind) {
    const paths = {
      income: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
      expense: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
      balance: '<rect x="2" y="6" width="20" height="13" rx="2"/><line x1="2" y1="11" x2="22" y2="11"/>',
      savings: '<path d="M19 5c-1.5-1.5-4-2-7-2-5 0-9 3-9 7 0 2.5 1.5 4.5 3.5 5.7L6 21h3l.8-2.3c.7.1 1.4.3 2.2.3l.8 2h3l.5-3.9C18.5 16 20 13.8 20 11"/><circle cx="15" cy="10" r="1"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[kind]}</svg>`;
  }

  // ---------- INCOME ----------
  async function loadIncome() {
    setLoading($("#incomeTableWrap"), 4);
    try {
      const filters = readIncomeFilters();
      state.income = await Api.listIncome(filters);
      renderIncome();
    } catch (err) {
      renderError($("#incomeTableWrap"), err, loadIncome);
    }
  }

  function readIncomeFilters() {
    return {
      search: $("#incomeSearch").value.trim(),
      category: $("#incomeCategoryFilter").value,
      month: $("#incomeMonthFilter").value
    };
  }

  function renderIncome() {
    const rows = state.income;
    const total = rows.reduce((s, r) => s + r.amount, 0);
    $("#incomeTotalCard").innerHTML = `
      <span class="muted">Showing ${rows.length} record${rows.length === 1 ? "" : "s"}</span>
      <span class="muted">Filtered total</span>
      <span class="big-num" style="color:var(--emerald-700)">${fmtRM(total)}</span>`;

    if (!rows.length) {
      $("#incomeTableWrap").innerHTML = emptyState("💰", "No income records", "Add your first income record using the “Add income” button.");
      return;
    }
    $("#incomeTableWrap").innerHTML = `
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Date</th><th>Source</th><th>Category</th><th>Recurring</th><th style="text-align:right;">Amount</th><th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td>${fmtDate(r.date)}</td>
              <td><strong>${esc(r.source)}</strong>${r.notes ? `<br><span class="muted" style="font-size:.78rem;">${esc(r.notes)}</span>` : ""}</td>
              <td><span class="chip cat-chip">${esc(labelFor(r.category))}</span></td>
              <td>${r.recurring ? '<span class="chip type-chip-essential">Monthly</span>' : '<span class="muted">One-time</span>'}</td>
              <td class="num" style="text-align:right; color:var(--emerald-700);">+${fmtRM(r.amount)}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-edit-income="${r.id}" title="Edit" aria-label="Edit income">✏️</button>
                <button class="icon-btn danger" data-del-income="${r.id}" title="Delete" aria-label="Delete income">🗑️</button>
              </div></td>
            </tr>`).join("")}
        </tbody>
      </table></div>`;
  }

  ["#incomeSearch", "#incomeCategoryFilter", "#incomeMonthFilter"].forEach((s) => {
    $(s).addEventListener("input", () => loadIncome());
  });
  $("#incomeClearFilters").addEventListener("click", () => {
    $("#incomeSearch").value = "";
    $("#incomeCategoryFilter").value = "";
    $("#incomeMonthFilter").value = "";
    loadIncome();
  });

  function handleModalOpen(modalId) {
    if (modalId === "incomeModal") {
      clearFormError("income");
      $("#incomeModalTitle").textContent = state.editIncomeId ? "Edit income" : "Add income";
      const form = $("#incomeForm");
      if (!state.editIncomeId) form.reset();
      form.date.value = form.date.value || todayIso();
      openModal(modalId);
    } else if (modalId === "expenseModal") {
      clearFormError("expense");
      $("#expenseModalTitle").textContent = state.editExpenseId ? "Edit expense" : "Add expense";
      const form = $("#expenseForm");
      if (!state.editExpenseId) form.reset();
      form.date.value = form.date.value || todayIso();
      openModal(modalId);
    } else if (modalId === "budgetModal") {
      clearFormError("budget");
      $("#budgetForm").reset();
      openModal(modalId);
    } else if (modalId === "savingsModal") {
      clearFormError("savings");
      $("#savingsForm").reset();
      $("#savingsModalTitle").textContent = state.editGoalId ? "Edit savings goal" : "Create savings goal";
      openModal(modalId);
    } else if (modalId === "monthlyLimitModal") {
      clearFormError("monthlyLimit");
      if (state.budgets) $("#monthlyLimitForm").limitRinggit.value = Api.senToRinggit(state.budgets.monthly.limit).toFixed(2);
      openModal(modalId);
    } else {
      openModal(modalId);
    }
  }

  document.addEventListener("click", (e) => {
    const editInc = e.target.closest("[data-edit-income]");
    if (editInc) {
      const idNum = Number(editInc.getAttribute("data-edit-income"));
      const r = state.income.find((x) => x.id === idNum);
      if (!r) return;
      state.editIncomeId = idNum;
      const form = $("#incomeForm");
      form.source.value = r.source;
      form.amountRinggit.value = Api.senToRinggit(r.amount).toFixed(2);
      form.date.value = r.date;
      form.category.value = r.category;
      form.recurring.value = String(!!r.recurring);
      form.notes.value = r.notes || "";
      handleModalOpen("incomeModal");
      return;
    }
    const delInc = e.target.closest("[data-del-income]");
    if (delInc) {
      const idNum = Number(delInc.getAttribute("data-del-income"));
      confirmDialog("Delete this income record? This cannot be undone.", async () => {
        try {
          await Api.deleteIncome(idNum);
          toast("Income record deleted", "success");
          loadIncome();
        } catch (err) { toast(err.message, "error"); }
      });
    }
  });

  $("#incomeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("income");
    const form = e.target;
    const amountSen = Api.ringgitToSen(form.amountRinggit.value);
    if (!form.source.value.trim()) return showFormError("income", "Please enter a source description.");
    if (!(amountSen > 0)) return showFormError("income", "Amount must be greater than RM 0.");
    if (!form.date.value) return showFormError("income", "Please choose a date.");

    const payload = {
      source: form.source.value.trim(),
      amount: amountSen,
      date: form.date.value,
      category: form.category.value,
      recurring: form.recurring.value === "true",
      notes: form.notes.value.trim()
    };
    try {
      if (state.editIncomeId) {
        await Api.updateIncome(state.editIncomeId, payload);
        toast("Income updated (sent to Java in live mode)", "success");
        state.editIncomeId = null;
      } else {
        await Api.createIncome(payload);
        toast("Income added (sent to Java in live mode)", "success");
      }
      closeModal("incomeModal");
      loadIncome();
    } catch (err) {
      showFormError("income", err.message);
    }
  });

  // ---------- EXPENSES ----------
  async function loadExpenses() {
    setLoading($("#expenseTableWrap"), 4);
    try {
      const filters = {
        search: $("#expenseSearch").value.trim(),
        category: $("#expenseCategoryFilter").value,
        type: $("#expenseTypeFilter").value,
        month: $("#expenseMonthFilter").value
      };
      state.expenses = await Api.listExpenses(filters);
      renderExpenses();
    } catch (err) {
      renderError($("#expenseTableWrap"), err, loadExpenses);
    }
  }

  function renderExpenses() {
    const rows = state.expenses;
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const essential = rows.filter((r) => r.essential).reduce((s, r) => s + r.amount, 0);
    $("#expenseTotalCard").innerHTML = `
      <span class="muted">Showing ${rows.length} record${rows.length === 1 ? "" : "s"}</span>
      <span class="muted">Filtered total</span>
      <span class="big-num">${fmtRM(total)}</span>
      <span class="chip type-chip-essential">Essential ${fmtRM(essential)}</span>
      <span class="chip type-chip-discretionary">Discretionary ${fmtRM(total - essential)}</span>`;

    if (!rows.length) {
      $("#expenseTableWrap").innerHTML = emptyState("🧾", "No expense records", "Track your first expense using the “Add expense” button.");
      return;
    }
    $("#expenseTableWrap").innerHTML = `
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style="text-align:right;">Amount</th><th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td>${fmtDate(r.date)}</td>
              <td><strong>${esc(r.description)}</strong>${r.notes ? `<br><span class="muted" style="font-size:.78rem;">${esc(r.notes)}</span>` : ""}</td>
              <td><span class="chip cat-chip">${esc(labelFor(r.category))}</span></td>
              <td>${r.essential
                ? '<span class="chip type-chip-essential">Essential</span>'
                : '<span class="chip type-chip-discretionary">Discretionary</span>'}</td>
              <td class="num" style="text-align:right;">−${fmtRM(r.amount)}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-edit-expense="${r.id}" title="Edit" aria-label="Edit expense">✏️</button>
                <button class="icon-btn danger" data-del-expense="${r.id}" title="Delete" aria-label="Delete expense">🗑️</button>
              </div></td>
            </tr>`).join("")}
        </tbody>
      </table></div>`;
  }

  ["#expenseSearch", "#expenseCategoryFilter", "#expenseTypeFilter", "#expenseMonthFilter"].forEach((s) => {
    $(s).addEventListener("input", () => loadExpenses());
  });
  $("#expenseClearFilters").addEventListener("click", () => {
    $("#expenseSearch").value = "";
    $("#expenseCategoryFilter").value = "";
    $("#expenseTypeFilter").value = "";
    $("#expenseMonthFilter").value = "";
    loadExpenses();
  });

  document.addEventListener("click", (e) => {
    const editEx = e.target.closest("[data-edit-expense]");
    if (editEx) {
      const idNum = Number(editEx.getAttribute("data-edit-expense"));
      const r = state.expenses.find((x) => x.id === idNum);
      if (!r) return;
      state.editExpenseId = idNum;
      const form = $("#expenseForm");
      form.description.value = r.description;
      form.amountRinggit.value = Api.senToRinggit(r.amount).toFixed(2);
      form.date.value = r.date;
      form.category.value = r.category;
      form.essential.value = r.essential ? "essential" : "discretionary";
      form.notes.value = r.notes || "";
      handleModalOpen("expenseModal");
      return;
    }
    const delEx = e.target.closest("[data-del-expense]");
    if (delEx) {
      const idNum = Number(delEx.getAttribute("data-del-expense"));
      confirmDialog("Delete this expense record? This cannot be undone.", async () => {
        try {
          await Api.deleteExpense(idNum);
          toast("Expense record deleted", "success");
          loadExpenses();
        } catch (err) { toast(err.message, "error"); }
      });
    }
  });

  $("#expenseForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("expense");
    const form = e.target;
    const amountSen = Api.ringgitToSen(form.amountRinggit.value);
    if (!form.description.value.trim()) return showFormError("expense", "Please enter a description.");
    if (!(amountSen > 0)) return showFormError("expense", "Amount must be greater than RM 0.");
    if (!form.date.value) return showFormError("expense", "Please choose a date.");

    const payload = {
      description: form.description.value.trim(),
      amount: amountSen,
      date: form.date.value,
      category: form.category.value,
      essential: form.essential.value === "essential",
      notes: form.notes.value.trim()
    };
    try {
      if (state.editExpenseId) {
        await Api.updateExpense(state.editExpenseId, payload);
        toast("Expense updated (sent to Java in live mode)", "success");
        state.editExpenseId = null;
      } else {
        await Api.createExpense(payload);
        toast("Expense added (sent to Java in live mode)", "success");
      }
      closeModal("expenseModal");
      loadExpenses();
    } catch (err) {
      showFormError("expense", err.message);
    }
  });

  // ---------- BUDGETS ----------
  async function loadBudgets() {
    setLoading($("#budgetList"), 3);
    try {
      state.budgets = await Api.getBudgets();
      renderBudgets();
    } catch (err) {
      renderError($("#budgetList"), err, loadBudgets);
    }
  }

  function renderBudgets() {
    const { monthly, categories } = state.budgets;
    $("#budgetSummaryCard").innerHTML = `
      <span class="muted">Month</span><strong>${monthLabel(nowYm())}</strong>
      <span class="muted">Total spent</span>
      <span class="big-num">${fmtRM(monthly.spent)}</span>
      <span class="status-pill ${monthly.status === "within" ? "" : ""}">${STATUS_LABEL[monthly.status]}</span>`;

    const mPct = Math.min(100, monthly.utilisationPercent);
    $("#budgetMonthlyLimit").innerHTML = `
      <div class="${STATUS_CLASS[monthly.status]}">
        <div style="display:flex; justify-content:space-between; font-size:.9rem; margin-bottom:8px;">
          <span><strong>${fmtRM(monthly.spent)}</strong> of ${fmtRM(monthly.limit)} used</span>
          <span class="bc-pct">${monthly.utilisationPercent}%</span>
        </div>
        <div class="progress" style="height:14px;"><div class="progress-bar" style="width:${mPct}%"></div></div>
        <div style="display:flex; justify-content:space-between; margin-top:8px;">
          <span class="status-pill">${STATUS_LABEL[monthly.status]}</span>
          <span class="muted" style="font-size:.85rem;">${monthly.remaining >= 0 ? fmtRM(monthly.remaining) + " remaining" : fmtRM(-monthly.remaining) + " over budget"}</span>
        </div>
      </div>`;

    $("#budgetList").innerHTML = categories.length
      ? categories.map((b) => `
          <div class="card budget-card ${STATUS_CLASS[b.status]}" data-cat="${esc(b.category)}">
            <div class="bc-head">
              <span class="bc-cat"><span class="bc-dot"></span>${esc(labelFor(b.category))}</span>
              <span class="status-pill">${STATUS_LABEL[b.status]}</span>
            </div>
            <div class="bc-amounts">
              <span>Spent <strong>${fmtRM(b.spent)}</strong></span>
              <span>Limit <strong>${fmtRM(b.limit)}</strong></span>
            </div>
            <div class="bc-row">
              <div class="progress"><div class="progress-bar" style="width:${Math.min(100, b.utilisationPercent)}%"></div></div>
              <span class="bc-pct">${b.utilisationPercent}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="muted" style="font-size:.8rem;">${b.remaining >= 0 ? fmtRM(b.remaining) + " remaining" : fmtRM(-b.remaining) + " over"}</span>
              <button class="btn btn-ghost btn-sm" data-edit-budget="${b.id}">Edit</button>
            </div>
          </div>`).join("")
      : emptyState("🥧", "No budgets set", "Set a category budget to track your monthly limits.");
  }

  document.addEventListener("click", (e) => {
    const editB = e.target.closest("[data-edit-budget]");
    if (editB) {
      const idNum = Number(editB.getAttribute("data-edit-budget"));
      const b = state.budgets.categories.find((x) => x.id === idNum);
      if (!b) return;
      const form = $("#budgetForm");
      form.category.value = b.category;
      form.limitRinggit.value = Api.senToRinggit(b.limit).toFixed(2);
      openModal("budgetModal");
    }
  });

  $("#budgetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("budget");
    const form = e.target;
    const sen = Api.ringgitToSen(form.limitRinggit.value);
    if (!(sen > 0)) return showFormError("budget", "Limit must be greater than RM 0.");
    try {
      await Api.setBudget({ category: form.category.value, limit: sen });
      toast("Budget saved (sent to Java in live mode)", "success");
      closeModal("budgetModal");
      loadBudgets();
    } catch (err) { showFormError("budget", err.message); }
  });

  $("#monthlyLimitForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("monthlyLimit");
    const sen = Api.ringgitToSen(e.target.limitRinggit.value);
    if (!(sen > 0)) return showFormError("monthlyLimit", "Limit must be greater than RM 0.");
    try {
      await Api.setMonthlyLimit(sen);
      toast("Monthly limit saved", "success");
      closeModal("monthlyLimitModal");
      loadBudgets();
    } catch (err) { showFormError("monthlyLimit", err.message); }
  });

  // ---------- SAVINGS ----------
  async function loadSavings() {
    setLoading($("#savingsList"), 3);
    try {
      state.savings = await Api.listSavings();
      renderSavings();
    } catch (err) {
      renderError($("#savingsList"), err, loadSavings);
    }
  }

  function renderSavings() {
    const totalSaved = state.savings.reduce((s, g) => s + g.saved, 0);
    const totalTarget = state.savings.reduce((s, g) => s + g.target, 0);
    $("#savingsTotalCard").innerHTML = `
      <span class="muted">Goals</span><strong>${state.savings.length}</strong>
      <span class="muted">Total saved</span>
      <span class="big-num" style="color:var(--violet-500)">${fmtRM(totalSaved)}</span>
      <span class="muted">of ${fmtRM(totalTarget)} target</span>`;

    $("#savingsList").innerHTML = state.savings.length
      ? state.savings.map((g) => `
          <div class="card goal-card" style="--cat-color:var(--violet-500);">
            <div class="bc-head">
              <span class="bc-cat"><span class="bc-dot"></span>${esc(g.name)}</span>
              <div class="row-actions">
                <button class="icon-btn" data-edit-goal="${g.id}" title="Add saved amount / edit" aria-label="Edit goal">✏️</button>
                <button class="icon-btn danger" data-del-goal="${g.id}" title="Delete" aria-label="Delete goal">🗑️</button>
              </div>
            </div>
            ${g.completed ? '<div class="goal-complete-banner">🎉 Goal reached!</div>' : ""}
            <div class="bc-row">
              <div class="progress" style="height:12px;"><div class="progress-bar" style="width:${g.progressPercent}%; background:${g.completed ? "var(--emerald-500)" : "var(--violet-500)"}"></div></div>
              <span class="bc-pct">${g.progressPercent}%</span>
            </div>
            <div class="gc-meta">
              <span>${fmtRM(g.saved)} of ${fmtRM(g.target)}</span>
              <span>${g.completed ? "Fully funded" : fmtRM(g.remaining) + " to go"}</span>
            </div>
            <div class="gc-meta">
              <span>Target date ${fmtDate(g.targetDate)}</span>
              <span>${estTimeText(g)}</span>
            </div>
          </div>`).join("")
      : emptyState("🎯", "No savings goals", "Create your first goal — emergency fund, laptop, travel or tuition.");
  }

  function estTimeText(g) {
    // Backend-provided estimate in live mode; mock estimate mirrors the same rule.
    if (g.completed) return "Completed";
    if (g.estimatedMonthsToEnd !== undefined && g.estimatedMonthsToEnd !== null) {
      return `≈ ${g.estimatedMonthsToEnd} months left`;
    }
    const monthsLeft = Math.max(0, Math.round((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30.4)));
    return monthsLeft === 0 ? "Due now" : `${monthsLeft} month${monthsLeft === 1 ? "" : "s"} left`;
  }

  document.addEventListener("click", (e) => {
    const editG = e.target.closest("[data-edit-goal]");
    if (editG) {
      const idNum = Number(editG.getAttribute("data-edit-goal"));
      const g = state.savings.find((x) => x.id === idNum);
      if (!g) return;
      state.editGoalId = idNum;
      const form = $("#savingsForm");
      form.name.value = g.name;
      form.targetRinggit.value = Api.senToRinggit(g.target).toFixed(2);
      form.savedRinggit.value = Api.senToRinggit(g.saved).toFixed(2);
      form.targetDate.value = g.targetDate;
      handleModalOpen("savingsModal");
      return;
    }
    const delG = e.target.closest("[data-del-goal]");
    if (delG) {
      const idNum = Number(delG.getAttribute("data-del-goal"));
      confirmDialog("Delete this savings goal? This cannot be undone.", async () => {
        try {
          await Api.deleteSaving(idNum);
          toast("Goal deleted", "success");
          loadSavings();
        } catch (err) { toast(err.message, "error"); }
      });
    }
  });

  $("#savingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("savings");
    const form = e.target;
    const targetSen = Api.ringgitToSen(form.targetRinggit.value);
    const savedSen = Api.ringgitToSen(form.savedRinggit.value || 0);
    if (!form.name.value.trim()) return showFormError("savings", "Please enter a goal name.");
    if (!(targetSen > 0)) return showFormError("savings", "Target amount must be greater than RM 0.");
    if (savedSen < 0) return showFormError("savings", "Saved amount cannot be negative.");
    if (savedSen > targetSen) return showFormError("savings", "Saved amount cannot exceed the target.");
    if (!form.targetDate.value) return showFormError("savings", "Please choose a target date.");

    const payload = {
      name: form.name.value.trim(),
      target: targetSen,
      saved: savedSen,
      targetDate: form.targetDate.value
    };
    try {
      if (state.editGoalId) {
        await Api.updateSaving(state.editGoalId, payload);
        toast("Goal updated", "success");
        state.editGoalId = null;
      } else {
        await Api.createSaving(payload);
        toast("Goal created", "success");
      }
      closeModal("savingsModal");
      loadSavings();
    } catch (err) { showFormError("savings", err.message); }
  });

  // ---------- REPORTS ----------
  async function loadReports() {
    const monthInput = $("#reportMonth");
    if (!monthInput.value) monthInput.value = nowYm();
    ["#reportDonut", "#reportLine", "#reportTypeBars"].forEach((s) => setLoading($(s), 4));
    setLoading($("#reportStats"), 4);
    try {
      state.reports = await Api.getReports(monthInput.value);
      renderReports();
    } catch (err) {
      renderError($("#reportSummaryCards"), err, loadReports);
    }
  }
  $("#reportMonth").addEventListener("change", loadReports);

  function renderReports() {
    const r = state.reports;
    const pct = (v, base) => (base ? `${v >= 0 ? "+" : ""}${Math.round((v / base) * 100)}%` : "—");

    $("#reportSummaryCards").innerHTML = [
      { label: `Income · ${monthLabel(r.month)}`, value: fmtRM(r.totals.income), sub: `vs last month ${r.comparison.incomeChangePercent >= 0 ? "▲" : "▼"} ${Math.abs(r.comparison.incomeChangePercent)}%`, accent: "#059669" },
      { label: `Expenses · ${monthLabel(r.month)}`, value: fmtRM(r.totals.expenses), sub: `vs last month ${r.comparison.expensesChangePercent >= 0 ? "▲" : "▼"} ${Math.abs(r.comparison.expensesChangePercent)}%`, accent: "#f97316" },
      { label: "Remaining balance", value: fmtRM(r.totals.balance), sub: pct(r.totals.balance, r.totals.income) + " of income kept", accent: "#3b82f6" },
      { label: "Total savings", value: fmtRM(r.totals.savings), sub: "Across all goals", accent: "#8b5cf6" }
    ].map((c) => `
      <div class="card summary-card" style="--accent:${c.accent}">
        <div class="sc-label">${esc(c.label)}</div>
        <div class="sc-value">${esc(c.value)}</div>
        <div class="sc-sub">${esc(c.sub)}</div>
      </div>`).join("");

    Charts.donut($("#reportDonut"),
      r.breakdown.map((b) => ({ label: labelFor(b.category), value: b.amount, color: colorFor(b.category) })),
      { centerLabel: "Total spent" });
    $("#reportDonutLegend").innerHTML = r.breakdown.map((b) => legendItem(b)).join("");

    const evd = r.essentialVsDiscretionary;
    Charts.hBars($("#reportTypeBars"), [
      { label: "Essential", value: evd.essential, color: "#059669" },
      { label: "Discretionary", value: evd.discretionary, color: "#ec4899" }
    ]);
    const totalEvd = evd.essential + evd.discretionary;
    $("#reportTypeBars").insertAdjacentHTML("beforeend", `
      <p class="muted" style="font-size:.83rem; margin:10px 0 0;">
        Essential: ${totalEvd ? Math.round((evd.essential / totalEvd) * 100) : 0}% ·
        Discretionary: ${totalEvd ? Math.round((evd.discretionary / totalEvd) * 100) : 0}% —
        keeping discretionary spending under 30–40% supports responsible consumption (SDG 12).
      </p>`);

    Charts.line($("#reportLine"), r.trend);

    $("#reportStatsMonth").textContent = monthLabel(r.month);
    const le = r.largestExpense;
    $("#reportStats").innerHTML = `
      <div class="stat-list">
        <div class="stat-row"><span>Highest spending category</span><span class="s-val" style="color:${r.breakdown[0] ? colorFor(r.breakdown[0].category) : "inherit"}">${r.breakdown[0] ? esc(labelFor(r.breakdown[0].category)) + " · " + fmtRM(r.breakdown[0].amount) : "—"}</span></div>
        <div class="stat-row"><span>Largest expense</span><span class="s-val">${le ? esc(le.description) + " · " + fmtRM(le.amount) : "—"}</span></div>
        <div class="stat-row"><span>Average expense</span><span class="s-val">${fmtRM(r.averageExpense)}</span></div>
        <div class="stat-row"><span>Number of expenses</span><span class="s-val">${r.expenseCount}</span></div>
        <div class="stat-row"><span>Expense-to-income ratio</span><span class="s-val">${r.totals.income ? Math.round((r.totals.expenses / r.totals.income) * 100) + "%" : "—"}</span></div>
      </div>`;
  }

  // ---------- ALERTS ----------
  async function loadAlerts() {
    setLoading($("#alertsList"), 3);
    try {
      state.alerts = await Api.getAlerts();
      renderAlerts();
    } catch (err) {
      renderError($("#alertsList"), err, loadAlerts);
    }
  }

  const ALERT_ICONS = {
    warning: "⚠️", exceeded: "🚨", success: "🎉", info: "💡"
  };

  function alertItemHtml(a) {
    return `
      <div class="alert-item severity-${esc(a.severity)} ${a.read ? "" : "unread"}">
        <div class="alert-icon">${ALERT_ICONS[a.severity] || "🔔"}</div>
        <div style="flex:1;">
          <div class="alert-title">${esc(a.title)} ${a.read ? "" : '<span class="unread-dot" title="Unread"></span>'}</div>
          <div class="alert-desc">${esc(a.message)}</div>
          <div class="alert-desc" style="margin-top:4px;">${fmtDate(a.date)}</div>
        </div>
      </div>`;
  }

  function renderAlerts() {
    const unread = state.alerts.filter((a) => !a.read).length;
    $("#alertsSummary").textContent = `${state.alerts.length} alert${state.alerts.length === 1 ? "" : "s"} · ${unread} unread`;
    $("#alertsList").innerHTML = state.alerts.length
      ? state.alerts.map(alertItemHtml).join("")
      : emptyState("🔔", "No alerts", "You are within your budgets — no warnings to show. Great job staying on track!");
    updateAlertBadge();
  }

  function updateAlertBadge() {
    const n = state.alerts.filter((a) => !a.read).length;
    const badge = $("#alertBadge");
    const dot = $("#bellDot");
    badge.hidden = n === 0;
    dot.hidden = n === 0;
    badge.textContent = n;
  }

  $("#markAllRead").addEventListener("click", async () => {
    try {
      await Api.markAlertsRead();
      state.alerts.forEach((a) => { a.read = true; });
      renderAlerts();
      toast("All alerts marked as read", "success");
    } catch (err) { toast(err.message, "error"); }
  });

  // ---------- AI ADVISOR ----------
  const SUGGESTED_QUESTIONS = [
    "How can I save more money this month?",
    "Which spending category should I reduce?",
    "Am I spending too much on entertainment?",
    "How can I achieve my savings goal?",
    "How can I practise responsible consumption?"
  ];
  let chatInitialised = false;

  function initChat(force) {
    if (chatInitialised && !force) return;
    chatInitialised = true;
    const body = $("#chatBody");
    if (!body.children.length) {
      body.innerHTML = `<div class="msg ai">👋 Hi! I'm your SmartSpend advisor. Ask me anything about your income, expenses, budgets or savings goals. Your question is sent to the Java backend, which calls the AI service — no keys are stored in your browser.</div>`;
    }
    $("#chatSuggestions").innerHTML = SUGGESTED_QUESTIONS.map((q) => `<button type="button" class="suggest-btn">${esc(q)}</button>`).join("");
  }
  $("#chatSuggestions").addEventListener("click", (e) => {
    const btn = e.target.closest(".suggest-btn");
    if (btn) askAdvisor(btn.textContent);
  });

  $("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chatInput");
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    askAdvisor(q);
  });

  async function askAdvisor(question) {
    initChat();
    const body = $("#chatBody");
    body.insertAdjacentHTML("beforeend", `<div class="msg user">${esc(question)}</div>`);
    const loadingId = "chatLoading-" + Date.now();
    body.insertAdjacentHTML("beforeend", `<div class="msg ai loading" id="${loadingId}">Thinking…</div>`);
    body.scrollTop = body.scrollHeight;

    try {
      const answer = await Api.getAdvice(question, { hasDashboard: !!state.dashboard });
      document.getElementById(loadingId).remove();
      state.chatHistory.push({ question, answer });
      body.insertAdjacentHTML("beforeend", `<div class="msg ai">${esc(answer)}</div>`);
    } catch (err) {
      document.getElementById(loadingId).remove();
      const retryId = "chatRetry-" + Date.now();
      body.insertAdjacentHTML("beforeend", `
        <div class="msg ai msg-error">
          Sorry, I could not reach the advisor service: ${esc(err.message)}<br>
          <div class="msg-actions"><button class="btn btn-ghost" id="${retryId}">Retry</button></div>
        </div>`);
      document.getElementById(retryId).addEventListener("click", () => askAdvisor(question));
    }
    body.scrollTop = body.scrollHeight;
  }

  // ---------- AUTHENTICATION ----------
  function showAuth(show) {
    $("#authScreen").hidden = !show;
    $("#sidebar").style.display = show ? "none" : "";
    $(".topbar").style.display = show ? "none" : "";
    // hide page content while logging in
    $$(".page").forEach((p) => { if (show) p.hidden = true; });
  }

  function renderUserChip(session) {
    const chip = $("#userChip"), logout = $("#logoutBtn");
    chip.hidden = !session;
    logout.hidden = !session;
    if (session) {
      const initials = (session.fullName || session.username || "?")
        .split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      $("#userAvatar").textContent = initials;
      $("#userFullName").textContent = session.fullName || session.username;
      $("#userRole").textContent = session.role === "admin" ? "Administrator" : "Student";
      document.querySelector(".avatar").textContent = initials;
    }
    applyRoleVisibility();
  }

  function switchAuthTab(login) {
    $("#tabLogin").classList.toggle("active", login);
    $("#tabRegister").classList.toggle("active", !login);
    $("#tabLogin").setAttribute("aria-selected", String(login));
    $("#tabRegister").setAttribute("aria-selected", String(!login));
    $("#loginForm").hidden = !login;
    $("#registerForm").hidden = login;
  }
  $("#tabLogin").addEventListener("click", () => switchAuthTab(true));
  $("#tabRegister").addEventListener("click", () => switchAuthTab(false));

  // show/hide password toggles
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle-pw]");
    if (!t) return;
    const scope = document.getElementById(t.getAttribute("data-toggle-pw"));
    const input = scope.querySelector(".pw-row input");
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    t.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
    t.textContent = isPw ? "🙈" : "👁️";
  });

  function authError(form, message) {
    const elErr = $(`#${form}Error`);
    if (elErr) { elErr.textContent = message; elErr.hidden = false; }
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("loginForm");
    const form = e.target;
    if (!form.username.value.trim()) return authError("loginForm", "Please enter your username.");
    if (!form.password.value) return authError("loginForm", "Please enter your password.");
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Logging in…";
    try {
      const session = await Api.login(form.username.value.trim(), form.password.value);
      form.reset();
      startApp(session);
      toast(`Welcome back, ${session.fullName || session.username}!`, "success");
    } catch (err) {
      authError("loginForm", err.message);
    } finally {
      btn.disabled = false; btn.textContent = "Log in";
    }
  });

  $("#registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("registerForm");
    const form = e.target;
    if (!form.fullName.value.trim()) return authError("registerForm", "Please enter your full name.");
    if (!form.username.value.trim()) return authError("registerForm", "Please choose a username.");
    if (form.password.value.length < 4) return authError("registerForm", "Password must be at least 4 characters.");
    if (form.password.value !== form.password2.value) return authError("registerForm", "Passwords do not match.");
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Creating account…";
    try {
      const session = await Api.register(form.username.value.trim(), form.password.value, form.fullName.value.trim());
      form.reset();
      startApp(session);
      toast(`Account created — welcome, ${session.fullName}!`, "success");
    } catch (err) {
      authError("registerForm", err.message);
    } finally {
      btn.disabled = false; btn.textContent = "Create account";
    }
  });

  $("#logoutBtn").addEventListener("click", async () => {
    await Api.logout();
    renderUserChip(null);
    showAuth(true);
    switchAuthTab(true);
    toast("You have been logged out.");
  });

  function startApp(session) {
    renderUserChip(session);
    showAuth(false);
    // Role-based landing page: admins land on the Admin Panel,
    // normal users on their Dashboard.
    const landing = session.role === "admin" ? "admin" : "dashboard";
    if (!location.hash || location.hash === "#/" || location.hash === `#/${landing}`) {
      location.hash = `#/${landing}`;
    }
    navigate(location.hash.replace("#/", "") || landing);
    init();
  }

  // ---------- INIT ----------
  async function init() {
    // Protected navigation: no session -> show login screen
    const session = Api.getSession();
    if (!session) {
      showAuth(true);
      return;
    }
    renderUserChip(session);
    showAuth(false);
    // Admins skip personal-finance data loading entirely
    if (session.role === "admin") return;
    try {
      state.meta = await Api.getMeta();
    } catch (err) {
      state.meta = { labels: {}, colors: {}, incomeCategories: [], expenseCategories: [] };
      toast("Could not load categories: " + err.message, "error");
    }
    fillSelect($("#incomeCategoryFilter"), state.meta.incomeCategories, { allLabel: "All categories" });
    fillSelect($("#expenseCategoryFilter"), state.meta.expenseCategories, { allLabel: "All categories" });
    fillSelect($("#incomeForm").category, state.meta.incomeCategories);
    fillSelect($("#expenseForm").category, state.meta.expenseCategories);
    fillSelect($("#budgetForm").category, state.meta.expenseCategories);

    // demo-mode chip
    const chip = $("#apiModeChip");
    const isMock = Api.isMock();
    chip.textContent = isMock ? "Demo data — not live" : "Live Java backend";
    chip.classList.toggle("live", !isMock);
    $("#footerMode").textContent = isMock
      ? "Running on demonstration data. Switch api.js to live mode to connect the Java backend."
      : "Connected to Java backend.";

    // default dates
    $("#incomeForm").date.value = todayIso();
    $("#expenseForm").date.value = todayIso();
    $("#dashDate").textContent = new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    // load alerts once for the badge, then route
    Api.getAlerts().then((a) => { state.alerts = a; updateAlertBadge(); }).catch(() => {});

    const initial = location.hash.replace("#/", "") || "dashboard";
    navigate(PAGES.includes(initial) ? initial : "dashboard");
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Auth gate runs first: without a session only the login screen shows.
    const session = Api.getSession();
    if (!session) {
      showAuth(true);
      return;
    }
    renderUserChip(session);
    showAuth(false);
    init();
  });
})();
