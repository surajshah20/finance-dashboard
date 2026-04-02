const MOCK_DATA = [
  { id: "t1", title: "Salary",             date: "2026-03-01", amount: 80000, category: "Salary",        type: "income"  },
  { id: "t2", title: "Rent Payment",        date: "2026-03-02", amount: 25000, category: "Rent",          type: "expense" },
  { id: "t3", title: "Groceries",           date: "2026-03-05", amount: 3500,  category: "Food",          type: "expense" },
  { id: "t4", title: "Freelance Work",      date: "2026-03-10", amount: 12000, category: "Freelance",     type: "income"  },
  { id: "t5", title: "Netflix Subscription",date: "2026-03-12", amount: 999,   category: "Entertainment", type: "expense" },
  { id: "t6", title: "Electricity Bill",    date: "2026-03-15", amount: 2100,  category: "Bills",         type: "expense" },
  { id: "t7", title: "Shopping",            date: "2026-03-18", amount: 4500,  category: "Shopping",      type: "expense" },
  { id: "t8", title: "Bonus",               date: "2026-03-22", amount: 15000, category: "Salary",        type: "income"  },
  { id: "t9", title: "Restaurant",          date: "2026-03-25", amount: 1800,  category: "Food",          type: "expense" }
];

let transactions = [];
let role = "viewer";
let lineChartInstance = null;
let pieChartInstance = null;

// ── Utilities ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);
}

function save() {
  localStorage.setItem("ledger_txs", JSON.stringify(transactions));
}

function load() {
  const stored = localStorage.getItem("ledger_txs");
  transactions = stored ? JSON.parse(stored) : [...MOCK_DATA];
  if (!stored) save();
}

// ── Calculations ───────────────────────────────────────────────────────────────

function getTotalIncome() {
  return transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
}

function getTotalExpense() {
  return transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
}

function getBalance() {
  return getTotalIncome() - getTotalExpense();
}

function getCategoryData() {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return { labels: Object.keys(map), values: Object.values(map) };
}

function getTrendData() {
  const map = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString("en-US", { month: "short" });
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    if (t.type === "income") map[month].income += t.amount;
    else map[month].expense += t.amount;
  });
  const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let balance = 0;
  const labels = [], values = [];
  order.forEach(m => {
    if (map[m]) {
      balance += map[m].income - map[m].expense;
      labels.push(m);
      values.push(balance);
    }
  });
  return { labels, values };
}

// ── Render: Summary ────────────────────────────────────────────────────────────

function renderSummary() {
  const b = getBalance(), i = getTotalIncome(), e = getTotalExpense();

  const balEl = document.getElementById("balanceAmt");
  balEl.textContent = fmt(b);
  balEl.style.color = b >= 0 ? "var(--green)" : "var(--red)";
  document.getElementById("balanceSub").textContent = b >= 0 ? "Surplus this period" : "Deficit this period";

  document.getElementById("incomeAmt").textContent = fmt(i);
  document.getElementById("incomeSub").textContent = transactions.filter(t => t.type === "income").length + " income entries";

  document.getElementById("expenseAmt").textContent = fmt(e);
  document.getElementById("expenseSub").textContent = transactions.filter(t => t.type === "expense").length + " expense entries";
}

// ── Render: Transactions ───────────────────────────────────────────────────────

function getFiltered() {
  let list = [...transactions];
  const ft = document.getElementById("filterType").value;
  const q  = document.getElementById("searchInput").value.toLowerCase();
  const s  = document.getElementById("sortBy").value;

  if (ft !== "all") list = list.filter(t => t.type === ft);
  if (q) list = list.filter(t =>
    t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  );

  if (s === "date-desc")   list.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (s === "date-asc")    list.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (s === "amount-desc") list.sort((a, b) => b.amount - a.amount);
  if (s === "amount-asc")  list.sort((a, b) => a.amount - b.amount);

  return list;
}

function renderTable() {
  const list   = getFiltered();
  const body   = document.getElementById("txBody");
  const noData = document.getElementById("noData");

  body.innerHTML = "";

  if (!list.length) {
    noData.style.display = "block";
    return;
  }
  noData.style.display = "none";

  list.forEach(t => {
    const dateStr = new Date(t.date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
    const amtClass  = t.type === "income" ? "amount-income" : "amount-expense";
    const amtPrefix = t.type === "income" ? "+" : "−";
    const actionCell = role === "admin"
      ? `<td><button class="del-btn" onclick="deleteTx('${t.id}')">Delete</button></td>`
      : "<td></td>";

    body.innerHTML += `
      <tr>
        <td style="color:var(--muted)">${dateStr}</td>
        <td><strong>${t.title}</strong></td>
        <td style="color:var(--muted)">${t.category}</td>
        <td><span class="type-pill ${t.type}">${t.type}</span></td>
        <td class="${amtClass}">${amtPrefix}${fmt(t.amount)}</td>
        ${actionCell}
      </tr>`;
  });
}

function deleteTx(id) {
  if (role !== "admin") return;
  transactions = transactions.filter(t => t.id !== id);
  save();
  updateAll();
}

// ── Render: Charts ─────────────────────────────────────────────────────────────

function renderCharts() {
  const lineCtx = document.getElementById("lineChart").getContext("2d");
  const pieCtx  = document.getElementById("pieChart").getContext("2d");
  const trend   = getTrendData();
  const cats    = getCategoryData();

  if (lineChartInstance) lineChartInstance.destroy();
  if (pieChartInstance)  pieChartInstance.destroy();

  Chart.defaults.color           = "#7a8090";
  Chart.defaults.font.family     = "'DM Sans', sans-serif";
  Chart.defaults.font.size       = 11;

  const tooltipDefaults = {
    backgroundColor: "#161920",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    titleColor: "#f0ede6",
    bodyColor: "#7a8090",
    padding: 10
  };

  lineChartInstance = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: trend.labels,
      datasets: [{
        label: "Balance",
        data: trend.values,
        borderColor: "#d4a843",
        borderWidth: 2,
        pointBackgroundColor: "#d4a843",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: "rgba(212,168,67,0.07)",
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltipDefaults, callbacks: { label: ctx => fmt(ctx.raw) } }
      },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#7a8090" } },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#7a8090", callback: v => fmt(v) },
          border: { display: false }
        }
      }
    }
  });

  const palette = ["#d4a843","#3ecf6e","#5b9cf6","#e879a0","#8b5cf6","#f97316","#14b8a6"];

  pieChartInstance = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: cats.labels,
      datasets: [{
        data: cats.values,
        backgroundColor: palette,
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#7a8090", padding: 10, boxWidth: 10, usePointStyle: true, pointStyle: "circle" }
        },
        tooltip: {
          ...tooltipDefaults,
          callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` }
        }
      }
    }
  });
}

// ── Render: Insights ───────────────────────────────────────────────────────────

function renderInsights() {
  const cats = getCategoryData();

  if (cats.labels.length) {
    const maxIdx = cats.values.indexOf(Math.max(...cats.values));
    document.getElementById("topCat").textContent    = cats.labels[maxIdx];
    document.getElementById("topCatAmt").textContent = fmt(cats.values[maxIdx]);
  } else {
    document.getElementById("topCat").textContent    = "—";
    document.getElementById("topCatAmt").textContent = "";
  }

  const b  = getBalance();
  const hv = document.getElementById("healthVal");
  hv.textContent = b > 0 ? "Positive" : b < 0 ? "Negative" : "Neutral";
  hv.className   = "insight-val " + (b > 0 ? "positive" : b < 0 ? "negative" : "");
  document.getElementById("healthSub").textContent =
    `${fmt(getTotalIncome())} income · ${fmt(getTotalExpense())} spent`;

  document.getElementById("totalTx").textContent = transactions.length;
}

// ── Role UI ────────────────────────────────────────────────────────────────────

function updateRoleUI() {
  const addBtn    = document.getElementById("addBtn");
  const actionHead = document.getElementById("actionHead");
  addBtn.style.display      = role === "admin" ? "inline-block" : "none";
  actionHead.textContent    = role === "admin" ? "Action" : "";
}

// ── Master update ──────────────────────────────────────────────────────────────

function updateAll() {
  renderSummary();
  renderTable();
  renderCharts();
  renderInsights();
  updateRoleUI();
}

// ── Event Listeners ────────────────────────────────────────────────────────────

// Custom role dropdown
const csTrigger  = document.getElementById("csTrigger");
const csDropdown = document.getElementById("csDropdown");
const csSelect   = document.getElementById("customRoleSelect");

csTrigger.addEventListener("click", e => {
  e.stopPropagation();
  csSelect.classList.toggle("open");
});

document.querySelectorAll(".cs-option").forEach(opt => {
  opt.addEventListener("click", () => {
    role = opt.dataset.value;
    csTrigger.childNodes[0].textContent = opt.textContent + " ";
    document.querySelectorAll(".cs-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
    csSelect.classList.remove("open");
    updateAll();
  });
});

document.addEventListener("click", () => csSelect.classList.remove("open"));

document.getElementById("searchInput").addEventListener("input",  () => renderTable());
document.getElementById("filterType").addEventListener("change",  () => renderTable());
document.getElementById("sortBy").addEventListener("change",      () => renderTable());

document.getElementById("addBtn").addEventListener("click", () => {
  if (role !== "admin") return;
  document.getElementById("modalOverlay").classList.remove("hidden");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("modalOverlay").classList.add("hidden");
});

document.getElementById("submitBtn").addEventListener("click", () => {
  if (role !== "admin") return;

  const title    = document.getElementById("titleInput").value.trim();
  const date     = document.getElementById("dateInput").value;
  const amount   = Number(document.getElementById("amountInput").value);
  const category = document.getElementById("categoryInput").value.trim();
  const type     = document.getElementById("typeInput").value;

  if (!title || !date || !amount || !category) return;

  transactions.unshift({ id: crypto.randomUUID(), title, date, amount, category, type });
  save();

  document.getElementById("modalOverlay").classList.add("hidden");
  ["titleInput", "dateInput", "amountInput", "categoryInput"].forEach(id => {
    document.getElementById(id).value = "";
  });

  updateAll();
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  document.getElementById("themeBtn").textContent =
    document.body.classList.contains("light-mode") ? "☾" : "☀";
  renderCharts();
});

// ── Init ───────────────────────────────────────────────────────────────────────

load();
updateAll();