/* =========================================================
   FINSIGHT — COMPLETE JAVASCRIPT REPLACEMENT
   PART 1/5 — CORE SETUP, STORAGE & NAVIGATION
   ========================================================= */

"use strict";

/* =========================
   STORAGE
   ========================= */

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* Preserve existing FinSight data */

let expenses = readStorage("expenses", []);

if (!Array.isArray(expenses)) {
    expenses = [];
}

let monthlyBudget = Number(
    readStorage("finsightBudget", 0)
) || 0;

let categoryBudgets = readStorage(
    "finsightCategoryBudgets",
    {}
);

let savingsGoals = readStorage("finsightGoals", []);

let challenges = readStorage("finsightChallenges", []);

let analyticsViewed = readStorage("analyticsViewed", false);
let simulatorUsed = readStorage("simulatorUsed", false);
let challengeCompleted = readStorage("challengeCompleted", false);

let expenseChart = null;
let selectedMood = "";


/* =========================
   SAVE DATA
   ========================= */

function saveExpenses() {
    saveStorage("expenses", expenses);
}

function saveBudget() {
    saveStorage("finsightBudget", monthlyBudget);
}

function saveCategoryBudgets() {
    saveStorage("finsightCategoryBudgets", categoryBudgets);
}

function saveGoals() {
    saveStorage("finsightGoals", savingsGoals);
}

function saveChallenges() {
    saveStorage("finsightChallenges", challenges);
}


/* =========================
   DOM HELPERS
   ========================= */

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function setHTML(id, value) {
    const element = getElement(id);

    if (element) {
        element.innerHTML = value;
    }
}

function setValue(id, value) {
    const element = getElement(id);

    if (element) {
        element.value = value;
    }
}


/* =========================
   MONEY FORMATTING
   ========================= */

function formatMoney(amount) {
    const number = Number(amount) || 0;

    return "₹" + number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


/* =========================
   DATE HELPERS
   ========================= */

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isCurrentMonth(dateString) {
    if (!dateString) return false;

    const date = new Date(dateString + "T00:00:00");
    const today = new Date();

    return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString + "T00:00:00");

    if (isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================
   EXPENSE HELPERS
   ========================= */

function getExpenseAmount(expense) {
    return Number(expense.amount) || 0;
}

function getExpenseName(expense) {
    return String(expense.name || expense.title || "Untitled expense");
}

function getExpenseCategory(expense) {
    return String(expense.category || "Other");
}

function getCategoryEmoji(category) {
    const icons = {
        Food: "🍔",
        Travel: "🚕",
        Shopping: "🛍️",
        Bills: "🧾",
        Education: "📚",
        Health: "💊",
        Entertainment: "🎬",
        Other: "📌"
    };

    return icons[category] || "📌";
}

function getTotalExpenses() {
    return expenses.reduce(
        (total, expense) => total + getExpenseAmount(expense),
        0
    );
}

function getMonthlyExpenses() {
    return expenses.filter(expense =>
        isCurrentMonth(expense.date)
    );
}

function getMonthlyTotal() {
    return getMonthlyExpenses().reduce(
        (total, expense) => total + getExpenseAmount(expense),
        0
    );
}


/* =========================
   TOAST NOTIFICATIONS
   ========================= */

let toastTimer;

function showToast(message, icon = "✓") {
    const toast = getElement("toast");
    const toastIcon = getElement("toastIcon");
    const toastMessage = getElement("toastMessage");

    if (!toast) return;

    if (toastIcon) {
        toastIcon.textContent = icon;
    }

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


/* =========================
   SECTION NAVIGATION
   ========================= */

function showSection(sectionId) {
    const sections = document.querySelectorAll(".app-section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection = getElement(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    document.querySelectorAll("[data-section]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionId
        );
    });

    const heading = document.querySelector(".topbar h1");

    if (heading && selectedSection) {
        const title = selectedSection.dataset.title ||
            selectedSection.querySelector("h2")?.textContent ||
            "FinSight";

        heading.textContent = title.trim();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (sectionId === "analytics") {
        analyticsViewed = true;
        saveStorage("analyticsViewed", true);

        setTimeout(renderAnalytics, 100);
    }

    if (sectionId === "budget") {
        renderBudget();
    }

    if (sectionId === "goals") {
        renderGoals();
    }

    if (sectionId === "journey") {
        renderJourney();
    }
}

/* Make navigation available to HTML buttons */

window.showSection = showSection;


/* =========================
   NAVIGATION BUTTON EVENTS
   ========================= */

document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });
});


/* =========================
   INITIAL DATE
   ========================= */

if (getElement("expenseDate")) {
    getElement("expenseDate").value = getToday();
}
/* =========================================================
   FINSIGHT — PART 2/5
   EXPENSE MANAGEMENT, TRANSACTIONS & DASHBOARD
   ========================================================= */


/* =========================
   SAFE HTML TEXT
   ========================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


/* =========================
   ADD NEW EXPENSE
   ========================= */

const expenseForm = getElement("expenseForm");

if (expenseForm) {
    expenseForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = getElement("expenseName")?.value.trim();
        const amount = Number(getElement("expenseAmount")?.value);
        const category = getElement("expenseCategory")?.value;
        const date = getElement("expenseDate")?.value;

        if (!name || !amount || amount <= 0 || !category || !date) {
            showToast("Please enter valid expense details.", "!");
            return;
        }

        const newExpense = {
            id: Date.now().toString(),
            name: name,
            amount: amount,
            category: category,
            date: date
        };

        expenses.push(newExpense);

        saveExpenses();

        expenseForm.reset();

        if (getElement("expenseDate")) {
            getElement("expenseDate").value = getToday();
        }

        refreshFinSight();

        showToast("Expense added successfully!", "✓");
    });
}


/* =========================
   DELETE EXPENSE
   ========================= */

function deleteExpense(id) {
    const originalLength = expenses.length;

    expenses = expenses.filter(expense =>
        String(expense.id) !== String(id)
    );

    if (expenses.length === originalLength) {
        showToast("Expense could not be found.", "!");
        return;
    }

    saveExpenses();
    refreshFinSight();

    showToast("Expense deleted successfully.", "🗑");
}

window.deleteExpense = deleteExpense;


/* =========================
   CATEGORY TOTALS
   ========================= */

function getCategoryTotals(list = expenses) {
    const totals = {};

    list.forEach(expense => {
        const category = getExpenseCategory(expense);

        totals[category] =
            (totals[category] || 0) + getExpenseAmount(expense);
    });

    return totals;
}

function getTopCategory() {
    const totals = getCategoryTotals();

    const categories = Object.entries(totals);

    if (categories.length === 0) {
        return "None";
    }

    categories.sort((a, b) => b[1] - a[1]);

    return categories[0][0];
}


/* =========================
   DASHBOARD STATISTICS
   ========================= */

function renderDashboard() {
    const total = getTotalExpenses();
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;

    setText("totalExpenses", formatMoney(total));
    setText("expenseCount", count);
    setText("averageExpense", formatMoney(average));
    setText("topCategory", getTopCategory());

    const monthlyList = getMonthlyExpenses();
    const monthlyTotal = getMonthlyTotal();

    setText("monthlyExpenses", formatMoney(monthlyTotal));
    setText("monthlyCount", monthlyList.length);

    renderCategoryBreakdown();
    renderRecentExpenses();
    renderBudget();
}


/* =========================
   CATEGORY BREAKDOWN
   ========================= */

function renderCategoryBreakdown() {
    const container = getElement("categoryBreakdown");

    if (!container) return;

    const totals = getCategoryTotals();
    const entries = Object.entries(totals)
        .sort((a, b) => b[1] - a[1]);

    const total = getTotalExpenses();

    if (entries.length === 0 || total === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h4>No spending data yet</h4>
                <p>Add your first expense to see your category breakdown.</p>
            </div>
        `;
        return;
    }

    const colors = [
        "#8055f7",
        "#ec4899",
        "#4285f4",
        "#16b8a6",
        "#f59e0b",
        "#f97316",
        "#8b5cf6",
        "#64748b"
    ];

    container.innerHTML = entries.map(([category, amount], index) => {
        const percentage = (amount / total) * 100;
        const color = colors[index % colors.length];

        return `
            <div class="category-item">
                <div class="category-info">
                    <span>
                        ${getCategoryEmoji(category)}
                        ${escapeHTML(category)}
                    </span>
                    <span>
                        ${formatMoney(amount)} · ${percentage.toFixed(1)}%
                    </span>
                </div>

                <div class="category-progress">
                    <div
                        class="category-progress-fill"
                        style="width:${percentage}%;background:${color};"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}


/* =========================
   RECENT EXPENSES
   ========================= */

function renderRecentExpenses() {
    const container = getElement("recentExpenses");

    if (!container) return;

    const recent = [...expenses]
        .sort((a, b) => {
            const dateDifference =
                new Date(b.date || 0) - new Date(a.date || 0);

            return dateDifference ||
                Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧾</div>
                <h4>No transactions yet</h4>
                <p>Your latest expenses will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recent.map(expense => `
        <div class="expense-item">
            <div class="expense-left">
                <div class="expense-icon">
                    ${getCategoryEmoji(getExpenseCategory(expense))}
                </div>

                <div class="expense-details">
                    <strong>${escapeHTML(getExpenseName(expense))}</strong>
                    <small>${escapeHTML(getExpenseCategory(expense))}</small>
                </div>
            </div>

            <div class="expense-right">
                <span class="expense-amount">
                    ${formatMoney(getExpenseAmount(expense))}
                </span>
                <span class="expense-date">
                    ${formatDate(expense.date)}
                </span>
            </div>
        </div>
    `).join("");
}


/* =========================
   ALL TRANSACTIONS
   ========================= */

function renderExpenseList() {
    const container = getElement("expenseList");

    if (!container) return;

    const search = (
        getElement("expenseSearch")?.value || ""
    ).toLowerCase().trim();

    const categoryFilter =
        getElement("filterCategory")?.value || "all";

    const filtered = [...expenses]
        .filter(expense => {
            const matchesSearch =
                getExpenseName(expense).toLowerCase().includes(search) ||
                getExpenseCategory(expense).toLowerCase().includes(search);

            const matchesCategory =
                categoryFilter === "all" ||
                getExpenseCategory(expense) === categoryFilter;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) =>
            new Date(b.date || 0) - new Date(a.date || 0)
        );

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔎</div>
                <h4>No matching expenses</h4>
                <p>Try another search or add a new transaction.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(expense => `
        <div class="transaction-card">
            <div class="expense-left">
                <div class="expense-icon">
                    ${getCategoryEmoji(getExpenseCategory(expense))}
                </div>

                <div class="expense-details">
                    <strong>${escapeHTML(getExpenseName(expense))}</strong>
                    <small>
                        ${escapeHTML(getExpenseCategory(expense))}
                        · ${formatDate(expense.date)}
                    </small>
                </div>
            </div>

            <div class="transaction-actions">
                <strong class="expense-amount">
                    ${formatMoney(getExpenseAmount(expense))}
                </strong>

                <button
                    class="danger-button"
                    type="button"
                    data-delete-expense="${escapeHTML(expense.id)}"
                >
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}


/* =========================
   TRANSACTION SEARCH
   ========================= */

if (getElement("expenseSearch")) {
    getElement("expenseSearch").addEventListener(
        "input",
        renderExpenseList
    );
}

if (getElement("filterCategory")) {
    getElement("filterCategory").addEventListener(
        "change",
        renderExpenseList
    );
}


/* =========================
   DELETE BUTTON EVENTS
   ========================= */

if (getElement("expenseList")) {
    getElement("expenseList").addEventListener("click", event => {
        const button = event.target.closest("[data-delete-expense]");

        if (!button) return;

        deleteExpense(button.dataset.deleteExpense);
    });
}


/* =========================
   REFRESH ALL MAIN VIEWS
   ========================= */

function refreshFinSight() {
    renderDashboard();
    renderExpenseList();
    renderAnalytics();
    renderGoals();
    renderJourney();
}

window.refreshFinSight = refreshFinSight;
/* =========================================================
   FINSIGHT — PART 3/5
   BUDGET MANAGEMENT & ANALYTICS
   ========================================================= */


/* =========================
   UPDATE DUPLICATE ELEMENTS
   ========================= */

/* Updates both dashboard and budget-page previews */

function setAllText(id, value) {
    document.querySelectorAll(`[id="${id}"]`).forEach(element => {
        element.textContent = value;
    });
}

function setAllWidth(id, value) {
    document.querySelectorAll(`[id="${id}"]`).forEach(element => {
        element.style.width = value;
    });
}


/* =========================
   MONTHLY BUDGET
   ========================= */

function renderBudget() {
    const spent = getMonthlyTotal();
    const remaining = monthlyBudget - spent;

    const percentage = monthlyBudget > 0
        ? Math.min((spent / monthlyBudget) * 100, 100)
        : 0;

    setAllText("budgetLimit", formatMoney(monthlyBudget));
    setAllText("budgetSpent", formatMoney(spent));
    setAllText("budgetRemaining", formatMoney(Math.max(remaining, 0)));

    setAllWidth("budgetProgress", percentage + "%");

    let status = "Set a monthly budget to begin.";

    if (monthlyBudget > 0) {
        if (spent > monthlyBudget) {
            status = "Budget exceeded. Review your spending.";
        } else if (percentage >= 80) {
            status = "You're approaching your budget limit.";
        } else {
            status = "You're within your monthly budget.";
        }
    }

    setAllText("budgetStatus", status);

    if (getElement("monthlyBudget")) {
        getElement("monthlyBudget").value =
            monthlyBudget > 0 ? monthlyBudget : "";
    }

    renderCategoryBudgets();
}


/* =========================
   SAVE MONTHLY BUDGET
   ========================= */

if (getElement("saveBudgetBtn")) {
    getElement("saveBudgetBtn").addEventListener("click", () => {
        const amount = Number(
            getElement("monthlyBudget")?.value
        );

        if (!amount || amount <= 0) {
            showToast("Enter a valid monthly budget.", "!");
            return;
        }

        monthlyBudget = amount;

        saveBudget();
        renderBudget();
        renderDashboard();

        showToast("Monthly budget updated!", "✓");
    });
}


/* =========================
   CATEGORY BUDGETS
   ========================= */

function renderCategoryBudgets() {
    const container = getElement("categoryBudgetList");

    if (!container) return;

    const categories = Object.keys(categoryBudgets);

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <h4>No category budgets</h4>
                <p>Create individual spending limits for your categories.</p>
            </div>
        `;
        return;
    }

    const monthlyTotals = getCategoryTotals(getMonthlyExpenses());

    container.innerHTML = categories.map(category => {
        const limit = Number(categoryBudgets[category]) || 0;
        const spent = monthlyTotals[category] || 0;

        const percentage = limit > 0
            ? Math.min((spent / limit) * 100, 100)
            : 0;

        return `
            <div class="budget-category-item">
                <div style="flex:1;min-width:0;">
                    <strong>
                        ${getCategoryEmoji(category)}
                        ${escapeHTML(category)}
                    </strong>

                    <small>
                        ${formatMoney(spent)} spent of ${formatMoney(limit)}
                    </small>

                    <div class="category-progress" style="margin-top:9px;">
                        <div
                            class="category-progress-fill"
                            style="width:${percentage}%;
                            background:${percentage >= 100 ? '#ec4899' : '#8055f7'};"
                        ></div>
                    </div>
                </div>

                <button
                    class="danger-button"
                    type="button"
                    data-delete-category-budget="${escapeHTML(category)}"
                >
                    Remove
                </button>
            </div>
        `;
    }).join("");
}


/* =========================
   ADD CATEGORY BUDGET
   ========================= */

if (getElement("saveCategoryBudgetBtn")) {
    getElement("saveCategoryBudgetBtn").addEventListener("click", () => {
        const category = getElement("budgetCategory")?.value;
        const amount = Number(
            getElement("categoryBudgetAmount")?.value
        );

        if (!category || !amount || amount <= 0) {
            showToast("Select a category and enter a valid limit.", "!");
            return;
        }

        categoryBudgets[category] = amount;

        saveCategoryBudgets();

        setValue("categoryBudgetAmount", "");

        renderCategoryBudgets();

        showToast("Category budget saved!", "✓");
    });
}


/* =========================
   REMOVE CATEGORY BUDGET
   ========================= */

if (getElement("categoryBudgetList")) {
    getElement("categoryBudgetList").addEventListener("click", event => {
        const button = event.target.closest(
            "[data-delete-category-budget]"
        );

        if (!button) return;

        const category = button.dataset.deleteCategoryBudget;

        delete categoryBudgets[category];

        saveCategoryBudgets();
        renderCategoryBudgets();

        showToast("Category budget removed.", "🗑");
    });
}


/* =========================
   ANALYTICS SUMMARY
   ========================= */

function renderAnalytics() {
    const total = getTotalExpenses();
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;

    setText("analyticsTotal", formatMoney(total));
    setText("analyticsCount", count);
    setText("analyticsAverage", formatMoney(average));

    renderExpenseChart();
}


/* =========================
   EXPENSE PIE CHART
   ========================= */

function renderExpenseChart() {
    const canvas = getElement("expenseChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const totals = getCategoryTotals();

    const entries = Object.entries(totals)
        .filter(([, amount]) => amount > 0);

    const labels = entries.map(([category]) => category);
    const values = entries.map(([, amount]) => amount);

    const colors = [
        "#8055f7",
        "#ec4899",
        "#4285f4",
        "#16b8a6",
        "#f59e0b",
        "#f97316",
        "#a78bfa",
        "#64748b"
    ];

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (values.length === 0) {
        const context = canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;
    }

    const plugins = [];

    if (typeof ChartDataLabels !== "undefined") {
        plugins.push(ChartDataLabels);
    }

    expenseChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: labels,

            datasets: [{
                data: values,

                backgroundColor: colors.slice(0, values.length),

                borderColor: "#ffffff",
                borderWidth: 4,

                hoverOffset: 9
            }]
        },

        plugins: plugins,

        options: {
            responsive: true,
            maintainAspectRatio: false,

            cutout: "62%",

            plugins: {
                legend: {
                    position: "bottom",

                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18,

                        font: {
                            family: "DM Sans",
                            size: 11,
                            weight: "600"
                        }
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return " " + context.label +
                                ": " + formatMoney(context.raw);
                        }
                    }
                },

                datalabels: {
                    color: "#ffffff",

                    font: {
                        weight: "bold",
                        size: 11
                    },

                    formatter: function(value) {
                        return formatMoney(value);
                    },

                    display: function(context) {
                        return context.dataset.data.length <= 6;
                    }
                }
            }
        }
    });
}
/* =========================================================
   FINSIGHT — PART 4/5
   SMART ADVISOR, GOALS, PREDICTOR & CHALLENGES
   ========================================================= */


/* =========================
   SMART FINANCIAL ADVISOR
   ========================= */

function renderAdvisor() {
    const container = getElement("advisorContent");

    if (!container) return;

    const total = getTotalExpenses();
    const monthlyTotal = getMonthlyTotal();
    const topCategory = getTopCategory();

    const tips = [];

    if (expenses.length === 0) {
        tips.push({
            icon: "💡",
            title: "Start tracking",
            text: "Add your first expense to unlock personalised spending insights."
        });
    } else {
        tips.push({
            icon: "📊",
            title: "Your spending overview",
            text: `You've recorded ${expenses.length} transactions with total spending of ${formatMoney(total)}.`
        });

        if (topCategory !== "None") {
            tips.push({
                icon: "🎯",
                title: "Highest spending category",
                text: `${topCategory} is currently your largest spending category. Review it to find opportunities to save.`
            });
        }

        if (monthlyBudget > 0) {
            const percentage = (monthlyTotal / monthlyBudget) * 100;

            if (percentage > 100) {
                tips.push({
                    icon: "⚠️",
                    title: "Budget exceeded",
                    text: "Your monthly spending is above your planned budget. Review upcoming expenses."
                });
            } else if (percentage >= 80) {
                tips.push({
                    icon: "🔔",
                    title: "Budget alert",
                    text: "You've used at least 80% of your monthly budget. Be mindful of additional spending."
                });
            } else {
                tips.push({
                    icon: "🌟",
                    title: "Budget progress",
                    text: `You've used ${percentage.toFixed(1)}% of your monthly budget. Keep tracking your expenses.`
                });
            }
        } else {
            tips.push({
                icon: "💰",
                title: "Create a budget",
                text: "Set a monthly budget to compare your actual spending against your financial target."
            });
        }
    }

    container.innerHTML = tips.map(tip => `
        <div class="advisor-tip">
            <div class="advisor-tip-icon">${tip.icon}</div>
            <div>
                <strong style="font-size:12px;">
                    ${escapeHTML(tip.title)}
                </strong>
                <p class="muted-text" style="margin-top:5px;">
                    ${escapeHTML(tip.text)}
                </p>
            </div>
        </div>
    `).join("");
}


/* =========================
   SAVINGS GOALS
   ========================= */

function renderGoals() {
    const container = getElement("goalsList");

    if (!container) return;

    if (savingsGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <h4>No savings goals yet</h4>
                <p>Create a goal and track your savings progress here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = savingsGoals.map(goal => {
        const target = Number(goal.target) || 0;
        const saved = Number(goal.saved) || 0;

        const percentage = target > 0
            ? Math.min((saved / target) * 100, 100)
            : 0;

        return `
            <div class="goal-card">
                <h4>🎯 ${escapeHTML(goal.name)}</h4>

                <strong>${formatMoney(saved)}</strong>
                <p>Saved of ${formatMoney(target)}</p>

                <div class="progress-track">
                    <div
                        class="progress-fill"
                        style="width:${percentage}%;"
                    ></div>
                </div>

                <p>${percentage.toFixed(1)}% completed</p>

                <button
                    class="danger-button"
                    type="button"
                    data-delete-goal="${escapeHTML(goal.id)}"
                    style="margin-top:12px;"
                >
                    Remove goal
                </button>
            </div>
        `;
    }).join("");
}


/* =========================
   ADD SAVINGS GOAL
   ========================= */

if (getElement("addGoalBtn")) {
    getElement("addGoalBtn").addEventListener("click", () => {
        const name = getElement("goalName")?.value.trim();
        const target = Number(getElement("goalTarget")?.value);
        const saved = Number(getElement("goalSaved")?.value || 0);

        if (!name || !target || target <= 0 || saved < 0) {
            showToast("Enter valid savings goal details.", "!");
            return;
        }

        if (saved > target) {
            showToast("Saved amount cannot exceed the target.", "!");
            return;
        }

        savingsGoals.push({
            id: Date.now().toString(),
            name,
            target,
            saved
        });

        saveGoals();

        setValue("goalName", "");
        setValue("goalTarget", "");
        setValue("goalSaved", "");

        renderGoals();
        renderJourney();

        showToast("Savings goal created!", "🏆");
    });
}


/* =========================
   DELETE SAVINGS GOAL
   ========================= */

if (getElement("goalsList")) {
    getElement("goalsList").addEventListener("click", event => {
        const button = event.target.closest("[data-delete-goal]");

        if (!button) return;

        const id = button.dataset.deleteGoal;

        savingsGoals = savingsGoals.filter(
            goal => String(goal.id) !== String(id)
        );

        saveGoals();
        renderGoals();
        renderJourney();

        showToast("Savings goal removed.", "🗑");
    });
}


/* =========================
   SPENDING PREDICTOR
   ========================= */

function renderPredictor() {
    const result = getElement("predictedAmount");
    const details = getElement("predictionDetails");

    if (!result || !details) return;

    const monthlyExpenses = getMonthlyExpenses();

    if (monthlyExpenses.length === 0) {
        result.textContent = "₹0";

        details.textContent =
            "Add expenses this month to generate a spending estimate.";

        return;
    }

    const now = new Date();

    const daysPassed = now.getDate();
    const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();

    const spent = getMonthlyTotal();

    const predicted = (spent / daysPassed) * daysInMonth;

    result.textContent = formatMoney(predicted);

    details.textContent =
        `Based on your current daily average of ${formatMoney(spent / daysPassed)}. This is an estimate, not a guaranteed future expense.`;
}


/* =========================
   SAVING CHALLENGES
   ========================= */

const defaultChallenges = [
    {
        id: "track",
        title: "Track Every Expense",
        description: "Record your spending regularly.",
        icon: "📝"
    },
    {
        id: "budget",
        title: "Set a Monthly Budget",
        description: "Create a realistic spending limit.",
        icon: "💰"
    },
    {
        id: "goal",
        title: "Create a Savings Goal",
        description: "Give your savings a clear purpose.",
        icon: "🎯"
    },
    {
        id: "review",
        title: "Review Your Spending",
        description: "Check your analytics and categories.",
        icon: "📊"
    }
];


function renderChallenges() {
    const container = getElement("challengesList");

    if (!container) return;

    container.innerHTML = defaultChallenges.map(challenge => {
        const completed = challenges.includes(challenge.id);

        return `
            <div class="challenge-card ${completed ? "completed" : ""}">
                <div style="font-size:25px;">
                    ${challenge.icon}
                </div>

                <h4>${challenge.title}</h4>

                <p>${challenge.description}</p>

                <button
                    class="${completed ? "secondary-button" : "primary-button"}"
                    type="button"
                    data-challenge="${challenge.id}"
                    style="margin-top:13px;"
                >
                    ${completed ? "Completed ✓" : "Mark complete"}
                </button>

                <p style="margin-top:8px;">
                    Completion is self-reported.
                </p>
            </div>
        `;
    }).join("");
}


/* =========================
   CHALLENGE COMPLETION
   ========================= */

if (getElement("challengesList")) {
    getElement("challengesList").addEventListener("click", event => {
        const button = event.target.closest("[data-challenge]");

        if (!button) return;

        const id = button.dataset.challenge;

        if (challenges.includes(id)) {
            challenges = challenges.filter(item => item !== id);
        } else {
            challenges.push(id);
        }

        challengeCompleted = challenges.length > 0;

        saveChallenges();
        saveStorage("challengeCompleted", challengeCompleted);

        renderChallenges();
        renderJourney();

        showToast(
            challenges.includes(id)
                ? "Challenge completed!"
                : "Challenge updated.",
            "🏆"
        );
    });
}


/* =========================
   FINANCIAL MOOD
   ========================= */

function renderMood() {
    const container = getElement("moodContent");

    if (!container) return;

    const moods = [
        { id: "great", emoji: "😄", label: "Confident" },
        { id: "okay", emoji: "🙂", label: "Doing okay" },
        { id: "worried", emoji: "😟", label: "Concerned" },
        { id: "learning", emoji: "📚", label: "Learning" }
    ];

    container.innerHTML = `
        <div class="advisor-box">
            <h3>How do you feel about your finances?</h3>

            <p>Select the option that best describes how you feel today.</p>

            <div class="mood-options" style="margin-top:18px;">
                ${moods.map(mood => `
                    <button
                        class="mood-option ${selectedMood === mood.id ? "selected" : ""}"
                        type="button"
                        data-mood="${mood.id}"
                    >
                        <span>${mood.emoji}</span>
                        ${mood.label}
                    </button>
                `).join("")}
            </div>

            <p id="moodFeedback" class="muted-text" style="margin-top:15px;">
                ${selectedMood ? "Your selection has been updated." : "Your financial journey starts with awareness."}
            </p>
        </div>
    `;
}


/* =========================
   MOOD BUTTON EVENTS
   ========================= */

if (getElement("moodContent")) {
    getElement("moodContent").addEventListener("click", event => {
        const button = event.target.closest("[data-mood]");

        if (!button) return;

        selectedMood = button.dataset.mood;

        renderMood();

        showToast("Financial mood updated.", "✓");
    });
}


/* =========================
   EXPENSE SIMULATOR
   ========================= */

if (getElement("runSimulatorBtn")) {
    getElement("runSimulatorBtn").addEventListener("click", () => {
        const amount = Number(
            getElement("simulatorAmount")?.value
        );

        if (!amount || amount <= 0) {
            showToast("Enter a valid amount to simulate.", "!");
            return;
        }

        const result = getElement("simulatorResult");

        if (!result) return;

        const monthlySaving = amount;
        const yearlySaving = amount * 12;

        result.innerHTML = `
            <small>If you save this amount regularly</small>

            <strong>${formatMoney(monthlySaving)}</strong>

            <p>
                Potential savings in 12 months:
                <strong style="display:inline;font-size:17px;color:white;">
                    ${formatMoney(yearlySaving)}
                </strong>
            </p>

            <p>
                This calculation assumes the same amount is saved
                every month, without interest.
            </p>
        `;

        simulatorUsed = true;
        saveStorage("simulatorUsed", true);

        renderJourney();

        showToast("Simulation calculated!", "📈");
    });
}


/* =========================
   FINANCIAL JOURNEY
   ========================= */

function renderJourney() {
    const achievementContainer = getElement("achievementsList");

    const completedAchievements = [];

    if (expenses.length > 0) {
        completedAchievements.push("firstExpense");
    }

    if (monthlyBudget > 0) {
        completedAchievements.push("budgetSetter");
    }

    if (savingsGoals.length > 0) {
        completedAchievements.push("goalCreator");
    }

    if (analyticsViewed) {
        completedAchievements.push("analyticsExplorer");
    }

    if (simulatorUsed) {
        completedAchievements.push("smartSimulator");
    }

    if (challenges.length > 0) {
        completedAchievements.push("challengeStarter");
    }

    const achievements = [
        {
            id: "firstExpense",
            icon: "🧾",
            title: "First Transaction",
            description: "Record your first expense."
        },
        {
            id: "budgetSetter",
            icon: "💰",
            title: "Budget Planner",
            description: "Create your monthly budget."
        },
        {
            id: "goalCreator",
            icon: "🎯",
            title: "Goal Setter",
            description: "Create a savings goal."
        },
        {
            id: "analyticsExplorer",
            icon: "📊",
            title: "Analytics Explorer",
            description: "Explore your spending analytics."
        },
        {
            id: "smartSimulator",
            icon: "📈",
            title: "Smart Simulator",
            description: "Try your first savings simulation."
        },
        {
            id: "challengeStarter",
            icon: "🏆",
            title: "Challenge Starter",
            description: "Complete your first challenge."
        }
    ];

    const totalAchievements = achievements.length;
    const unlocked = completedAchievements.length;

    setText("achievementCount", `${unlocked}/${totalAchievements}`);

    setAllWidth(
        "journeyProgress",
        `${(unlocked / totalAchievements) * 100}%`
    );

    if (!achievementContainer) return;

    achievementContainer.innerHTML = achievements.map(achievement => {
        const isUnlocked = completedAchievements.includes(achievement.id);

        return `
            <div class="achievement-card ${isUnlocked ? "" : "locked"}">
                <div class="achievement-icon">
                    ${isUnlocked ? achievement.icon : "🔒"}
                </div>

                <h4>${achievement.title}</h4>

                <p>${achievement.description}</p>

                <p style="margin-top:9px;font-weight:800;">
                    ${isUnlocked ? "UNLOCKED ✓" : "LOCKED"}
                </p>
            </div>
        `;
    }).join("");
}
/* =========================================================
   FINSIGHT — PART 5/5
   INITIALIZATION, FINAL CONNECTIONS & DATA PROTECTION
   ========================================================= */


/* =========================
   DATA VALIDATION
   ========================= */

// Protect existing saved data from unexpected formats.

if (!Array.isArray(expenses)) {
    expenses = [];
}

if (!Array.isArray(savingsGoals)) {
    savingsGoals = [];
}

if (!Array.isArray(challenges)) {
    challenges = [];
}

if (
    !categoryBudgets ||
    typeof categoryBudgets !== "object" ||
    Array.isArray(categoryBudgets)
) {
    categoryBudgets = {};
}

// Give older expenses an ID if they do not have one.
expenses = expenses.map((expense, index) => ({
    ...expense,
    id: expense.id || `legacy-${index}-${Date.now()}`
}));

saveExpenses();


/* =========================
   REFRESH SMART FEATURES
   ========================= */

function refreshSmartFeatures() {
    renderAdvisor();
    renderPredictor();
    renderChallenges();
    renderMood();
    renderJourney();
}


/* =========================
   INITIALIZE APPLICATION
   ========================= */

function initializeFinSight() {

    // Restore today's date.
    if (getElement("expenseDate")) {
        getElement("expenseDate").value = getToday();
    }

    // Render dashboard and transactions.
    renderDashboard();
    renderExpenseList();

    // Render analytics.
    renderAnalytics();

    // Render financial tools.
    renderBudget();
    renderGoals();

    // Render smart features.
    refreshSmartFeatures();

    // Start on the home dashboard.
    showSection("home");

    console.log("FinSight initialized successfully.");
}


/* =========================
   INITIALIZATION SAFETY
   ========================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeFinSight
    );
} else {
    initializeFinSight();
}


/* =========================
   GLOBAL FUNCTIONS
   ========================= */

window.renderDashboard = renderDashboard;
window.renderExpenseList = renderExpenseList;
window.renderAnalytics = renderAnalytics;
window.renderBudget = renderBudget;
window.renderGoals = renderGoals;
window.renderAdvisor = renderAdvisor;
window.renderPredictor = renderPredictor;
window.renderChallenges = renderChallenges;
window.renderMood = renderMood;
window.renderJourney = renderJourney;

console.log("FinSight JavaScript loaded.");
