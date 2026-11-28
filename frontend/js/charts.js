/* ============================================================
   SmartSpend — charts.js
   Lightweight dependency-free SVG charts.
   All values are INTEGER SEN; labels formatted in Ringgit.

   Charts: donut (category breakdown), grouped bar (income vs
   expenses), horizontal bars (essential vs discretionary),
   line chart (monthly trend).
   ============================================================ */

const Charts = (() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const fmtRM = (sen) => "RM " + (sen / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const monthLabel = (ym) => {
    const [y, m] = ym.split("-");
    return new Date(+y, +m - 1, 1).toLocaleString("en-MY", { month: "short" });
  };

  function el(name, attrs = {}) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function attachTooltip(container) {
    const tip = document.createElement("div");
    tip.className = "chart-tooltip";
    tip.hidden = true;
    document.body.appendChild(tip);
    container.addEventListener("mousemove", (e) => {
      const text = e.target.getAttribute && e.target.getAttribute("data-tip");
      if (text) {
        tip.textContent = text;
        tip.hidden = false;
        tip.style.left = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 8) + "px";
        tip.style.top = (e.clientY + 14) + "px";
      } else {
        tip.hidden = true;
      }
    });
    container.addEventListener("mouseleave", () => { tip.hidden = true; });
    // cleanup when container is re-rendered
    const obs = new MutationObserver(() => {
      if (!document.contains(container)) { tip.remove(); obs.disconnect(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function makeSvg(container, width, height) {
    container.innerHTML = "";
    const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, width: "100%", height: "auto", role: "img" });
    container.appendChild(svg);
    attachTooltip(container);
    return svg;
  }

  // ---------- Donut chart ----------
  // data: [{ label, value (sen), color }]
  function donut(container, data, opts = {}) {
    if (!data.length || data.every((d) => d.value === 0)) {
      container.innerHTML = `<div class="empty-state"><div class="es-icon">🥧</div><div class="es-title">No data yet</div>Add transactions to see the breakdown.</div>`;
      return;
    }
    const size = 230, cx = size / 2, cy = size / 2, r = size / 2 - 16, stroke = 30;
    const svg = makeSvg(container, size, size);
    const total = data.reduce((s, d) => s + d.value, 0);

    // background ring
    svg.appendChild(el("circle", { cx, cy, r, fill: "none", stroke: "#eef2f6", "stroke-width": stroke }));

    let angle = -90; // start at top
    data.forEach((d) => {
      if (d.value <= 0) return;
      const sweep = (d.value / total) * 360;
      const large = sweep > 180 ? 1 : 0;
      const start = polar(cx, cy, r, angle);
      const end = polar(cx, cy, r, angle + Math.min(sweep, 359.99));
      const path = el("path", {
        d: `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`,
        fill: "none",
        stroke: d.color,
        "stroke-width": stroke,
        "data-tip": `${d.label}: ${fmtRM(d.value)} (${Math.round((d.value / total) * 100)}%)`,
        style: "cursor:pointer; transition: stroke-width .15s;"
      });
      path.addEventListener("mouseenter", () => path.setAttribute("stroke-width", stroke + 5));
      path.addEventListener("mouseleave", () => path.setAttribute("stroke-width", stroke));
      svg.appendChild(path);
      angle += sweep;
    });

    if (opts.centerLabel) {
      const t1 = el("text", { x: cx, y: cy - 4, "text-anchor": "middle", "font-size": 13, fill: "#667085", "font-weight": 600 });
      t1.textContent = opts.centerLabel;
      const t2 = el("text", { x: cx, y: cy + 18, "text-anchor": "middle", "font-size": 16, fill: "#101828", "font-weight": 800 });
      t2.textContent = fmtRM(total);
      svg.appendChild(t1); svg.appendChild(t2);
    }
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // ---------- Grouped bar chart ----------
  // data: [{ month, income, expenses }] (sen)
  function groupedBars(container, data) {
    if (!data.length) return;
    const W = 480, H = 260, padL = 52, padB = 30, padT = 16;
    const svg = makeSvg(container, W, H);
    const max = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1000);
    const chartW = W - padL - 10, chartH = H - padB - padT;
    const groupW = chartW / data.length;
    const barW = Math.min(28, groupW / 3.2);

    // gridlines + y labels
    for (let i = 0; i <= 4; i++) {
      const yVal = (max / 4) * i;
      const y = padT + chartH - (yVal / max) * chartH;
      svg.appendChild(el("line", { x1: padL, y1: y, x2: W - 10, y2: y, stroke: "#eef2f6", "stroke-width": 1 }));
      const t = el("text", { x: padL - 6, y: y + 4, "text-anchor": "end", "font-size": 10, fill: "#98a2b3" });
      t.textContent = "RM" + Math.round(yVal / 100);
      svg.appendChild(t);
    }

    data.forEach((d, i) => {
      const gx = padL + i * groupW;
      const h1 = (d.income / max) * chartH;
      const h2 = (d.expenses / max) * chartH;
      const x1 = gx + groupW / 2 - barW - 3;
      const x2 = gx + groupW / 2 + 3;
      const r1 = el("rect", {
        x: x1, y: padT + chartH - h1, width: barW, height: h1, rx: 5,
        fill: "#059669", "data-tip": `${monthLabel(d.month)} income: ${fmtRM(d.income)}`, style: "cursor:pointer;"
      });
      const r2 = el("rect", {
        x: x2, y: padT + chartH - h2, width: barW, height: h2, rx: 5,
        fill: "#f97316", "data-tip": `${monthLabel(d.month)} expenses: ${fmtRM(d.expenses)}`, style: "cursor:pointer;"
      });
      [r1, r2].forEach((r) => {
        r.addEventListener("mouseenter", () => r.setAttribute("opacity", "0.8"));
        r.addEventListener("mouseleave", () => r.removeAttribute("opacity"));
      });
      svg.appendChild(r1); svg.appendChild(r2);
      const t = el("text", { x: gx + groupW / 2, y: H - 10, "text-anchor": "middle", "font-size": 11, fill: "#667085", "font-weight": 600 });
      t.textContent = monthLabel(d.month);
      svg.appendChild(t);
    });
  }

  // ---------- Horizontal comparison bars ----------
  // data: [{ label, value (sen), color }]
  function hBars(container, data) {
    const max = Math.max(...data.map((d) => d.value), 1);
    container.innerHTML = "";
    data.forEach((d) => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:10px 0;";
      const label = document.createElement("div");
      label.style.cssText = "font-size:.85rem; font-weight:600; min-width:110px;";
      label.textContent = d.label;
      const track = document.createElement("div");
      track.className = "progress";
      track.style.height = "16px";
      const bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.style.width = `${(d.value / max) * 100}%`;
      bar.style.background = d.color;
      track.appendChild(bar);
      const val = document.createElement("div");
      val.style.cssText = "font-weight:800; font-variant-numeric:tabular-nums; font-size:.85rem;";
      val.textContent = fmtRM(d.value);
      row.append(label, track, val);
      container.appendChild(row);
    });
  }

  // ---------- Line chart ----------
  // data: [{ month, income, expenses }] (sen)
  function line(container, data) {
    if (data.length < 2) return;
    const W = 480, H = 260, padL = 52, padB = 30, padT = 16;
    const svg = makeSvg(container, W, H);
    const max = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1000);
    const chartW = W - padL - 16, chartH = H - padB - padT;

    for (let i = 0; i <= 4; i++) {
      const yVal = (max / 4) * i;
      const y = padT + chartH - (yVal / max) * chartH;
      svg.appendChild(el("line", { x1: padL, y1: y, x2: W - 12, y2: y, stroke: "#eef2f6", "stroke-width": 1 }));
      const t = el("text", { x: padL - 6, y: y + 4, "text-anchor": "end", "font-size": 10, fill: "#98a2b3" });
      t.textContent = "RM" + Math.round(yVal / 100);
      svg.appendChild(t);
    }

    const xOf = (i) => padL + (i / (data.length - 1)) * chartW;
    const yOf = (v) => padT + chartH - (v / max) * chartH;

    const drawSeries = (key, color) => {
      const pts = data.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(" ");
      // soft area fill
      const area = el("polygon", {
        points: `${xOf(0)},${padT + chartH} ${pts} ${xOf(data.length - 1)},${padT + chartH}`,
        fill: color, opacity: "0.08"
      });
      svg.appendChild(area);
      svg.appendChild(el("polyline", { points: pts, fill: "none", stroke: color, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      data.forEach((d, i) => {
        const c = el("circle", {
          cx: xOf(i), cy: yOf(d[key]), r: 4, fill: "#fff", stroke: color, "stroke-width": 2.5,
          "data-tip": `${monthLabel(d.month)} ${key}: ${fmtRM(d[key])}`, style: "cursor:pointer;"
        });
        svg.appendChild(c);
      });
    };
    drawSeries("income", "#059669");
    drawSeries("expenses", "#f97316");

    data.forEach((d, i) => {
      const t = el("text", { x: xOf(i), y: H - 10, "text-anchor": "middle", "font-size": 11, fill: "#667085", "font-weight": 600 });
      t.textContent = monthLabel(d.month);
      svg.appendChild(t);
    });
  }

  return { donut, groupedBars, hBars, line };
})();
