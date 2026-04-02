# Ledger — Finance Dashboard

A clean, interactive personal finance dashboard built with **HTML, CSS, and Vanilla JavaScript** as part of a Frontend Developer Internship assignment.

---

## Live Demo

> Deploy to [Netlify](https://netlify.com), or [GitHub Pages]([https://pages.github.co](https://github.com/surajshah20/finance-dashboard))

---

## Project Structure

```
ledger-dashboard/
├── index.html      # App markup and layout
├── style.css       # All styles including dark mode and responsive breakpoints
├── script.js       # App logic — state, rendering, events
└── README.md       # This file
```

---

## Getting Started

1. Clone or download this repository
2. Open `index.html` directly in any modern browser
3. No dependencies to install, no build tools required

```bash
git clone https://github.com/surajshah20/finance-dashboard
cd ledger-dashboard
open index.html   # or just double-click the file
```

---

## Features

### Dashboard Overview
- **Net Balance card** — dynamically turns green (surplus) or red (deficit)
- **Total Income card** — sum of all income entries with count
- **Total Expenses card** — sum of all expense entries with count

### Visualizations
- **Balance Trend** (Line chart) — monthly running net balance over time
- **Spending Breakdown** (Doughnut chart) — expense distribution by category
- Both charts re-render automatically on every add or delete

### Transactions
- Full table with Date, Title, Category, Type, and Amount
- **Search** by title or category (live filter)
- **Filter** by type: All / Income / Expense
- **Sort** by: Newest, Oldest, Highest amount, Lowest amount
- Amount column shows `+` for income and `−` for expenses with color coding
- Horizontal scroll on small screens so no data is cut off

### Role-Based UI (Simulated)
| Role   | View Data | Add Transaction | Delete Transaction |
|--------|-----------|-----------------|-------------------|
| Viewer | ✅        | ❌              | ❌                |
| Admin  | ✅        | ✅              | ✅                |

Role is switched via a fully custom dropdown in the navbar (not a native select, so it respects dark/light theme correctly).

### Insights Section
- **Top Spending Category** — highest expense category with total amount
- **Financial Health** — Positive / Negative / Neutral based on balance
- **Total Transactions** — combined count of all income and expense entries

### Extra Enhancements
- **Dark / Light mode toggle** — charts re-render on switch
- **localStorage persistence** — transactions survive page refresh
- **Empty state handling** — "No transactions found" when filters return nothing
- **Custom role dropdown** — fully themed, works in both dark and light mode

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile ≤ 600px | Single column for all grids; navbar stacks vertically; filters stack; table scrolls horizontally; modal actions stack vertically |
| Tablet 601–860px | Summary and insights stay 3-column; charts stack to 1 column; filters stay compact |
| Desktop > 860px | Full layout — charts side by side, all grids at full width |

---

## Tech Stack

| Tool | Purpose |
|---|---|
| HTML5 | Structure and markup |
| CSS3 | Styling, CSS variables, responsive grid |
| Vanilla JavaScript (ES6+) | State management, DOM rendering, events |
| Chart.js 4.4 | Line and doughnut charts (via CDN) |
| DM Serif Display + DM Sans | Typography (via Google Fonts) |

---

## Design Decisions & Trade-offs

**Why Vanilla JS instead of React/Vue?**
The assignment allows any approach. Plain JS keeps the project dependency-free, instantly runnable in any browser without a build step, and easy to read. The trade-off is no component-based architecture — instead, a centralized `updateAll()` function orchestrates all renders to keep UI and data in sync.

**Why a custom dropdown instead of native select for roles?**
Native select elements ignore CSS in most browsers, so the dropdown would appear with OS-default white/grey styling even in dark mode. A custom ul-based dropdown fully inherits CSS variables and matches the theme correctly.

**State management approach**
All state lives in three variables: `transactions` (array), `role` (string), and two chart instances. Every UI interaction calls `updateAll()` or a targeted render function. localStorage is the persistence layer — straightforward for a frontend-only project.

**Chart.js via CDN**
No npm required. Chart.js UMD build loads from cdnjs and provides clean, accessible charts with minimal configuration.

---

## Limitations

- No real authentication — role switching is simulated via dropdown as per assignment requirements
- Transactions reset if the browser's localStorage is manually cleared
- No backend or API — all data is mock/local only

---

## Author

Built as a Frontend Developer Internship screening assignment.
