// ======================================================
// FINSIGHT - JAVASCRIPT
// COMPLETE FIXED VERSION - PART 1
// ======================================================

let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];

let budget =
    Number(localStorage.getItem("finsightBudget")) || 0;

let categoryBudgets =
    JSON.parse(
        localStorage.getItem("finsightCategoryBudgets")
    ) || {};

let total = 0;

let expenseChart = null;

let analyticsViewed =
    localStorage.getItem("analyticsViewed") === "true";

let simulatorUsed =
    localStorage.getItem("simulatorUsed") === "true";

let challengeCompleted =
    localStorage.getItem("challengeCompleted") === "true";


// ======================================================
// SAVE DATA
// ======================================================

function saveData() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    localStorage.setItem(
        "finsightBudget",
        String(budget)
    );

    localStorage.setItem(
        "finsightCategoryBudgets",
        JSON.stringify(categoryBudgets)
    );

    localStorage.setItem(
        "analyticsViewed",
        String(analyticsViewed)
    );

    localStorage.setItem(
        "simulatorUsed",
        String(simulatorUsed)
    );

    localStorage.setItem(
        "challengeCompleted",
        String(challengeCompleted)
    );
}


// ======================================================
// TODAY'S DATE
// ======================================================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// ======================================================
// GREETING
// ======================================================

function updateGreeting() {

    const greeting =
        document.getElementById("greeting");

    if (!greeting) return;

    const hour =
        new Date().getHours();

    if (hour < 12) {

        greeting.textContent =
            "Good Morning";

    } else if (hour < 18) {

        greeting.textContent =
            "Good Afternoon";

    } else {

        greeting.textContent =
            "Good Evening";

    }
}


// ======================================================
// NAVIGATION + BACK BUTTON
// ======================================================

let currentSection = "home";

let navigationReady = false;


function showSection(
    sectionId,
    fromHistory
) {

    const selectedSection =
        document.getElementById(sectionId);

    if (!selectedSection) return;


    const sections =
        document.querySelectorAll(".app-section");

    sections.forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });


    selectedSection.classList.add(
        "active-section"
    );


    currentSection =
        sectionId;


    const navButtons =
        document.querySelectorAll(".nav-btn");

    navButtons.forEach(function(button) {

        button.classList.remove("active");

    });


    navButtons.forEach(function(button) {

        const onclick =
            button.getAttribute("onclick");

        if (
            onclick ===
            "showSection('" +
            sectionId +
            "')"
        ) {

            button.classList.add("active");

        }

    });


    if (
        navigationReady &&
        !fromHistory
    ) {

        history.pushState(
            {
                section: sectionId
            },
            "",
            "#" + sectionId
        );

    }


    if (sectionId === "analytics") {

        analyticsViewed = true;

        localStorage.setItem(
            "analyticsViewed",
            "true"
        );

        updateChart();

        displayAnalyticsSummary();

        updateJourney();

    }


    if (sectionId === "mood") {

        displayMoneyMood();

    }


    if (sectionId === "simulator") {

        updateSimulator();

    }


    if (sectionId === "journey") {

        updateJourney();

    }


    if (sectionId === "budget") {

        updateBudget();

        updateCategoryBudgets();

    }

}


// ======================================================
// PHONE / BROWSER BACK BUTTON
// ======================================================

window.addEventListener(
    "popstate",
    function(event) {

        let section = "home";


        if (
            event.state &&
            event.state.section
        ) {

            section =
                event.state.section;

        } else if (location.hash) {

            section =
                location.hash.substring(1);

        }


        if (
            !document.getElementById(section)
        ) {

            section = "home";

        }


        showSection(
            section,
            true
        );

    }
);


// ======================================================
// TOAST
// ======================================================

function showToast(
    message,
    icon
) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const toastIcon =
        document.getElementById("toastIcon");


    if (!toast) return;


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    if (toastIcon) {

        toastIcon.textContent =
            icon || "✅";

    }


    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2000);

}


// ======================================================
// ADD EXPENSE
// ======================================================

function addExpense() {

    const nameElement =
        document.getElementById("expenseName");

    const amountElement =
        document.getElementById("expenseAmount");

    const categoryElement =
        document.getElementById("expenseCategory");

    const dateElement =
        document.getElementById("expenseDate");


    if (
        !nameElement ||
        !amountElement ||
        !categoryElement ||
        !dateElement
    ) {

        return;

    }


    const name =
        nameElement.value.trim();

    const amount =
        Number(amountElement.value);

    const category =
        categoryElement.value;

    const date =
        dateElement.value;


    if (
        name === "" ||
        !amount ||
        amount <= 0 ||
        date === "" ||
        category === "Select Category"
    ) {

        showToast(
            "Please fill all the fields!",
            "⚠️"
        );

        return;

    }


    expenses.push({

        name: name,

        amount: amount,

        category: category,

        date: date

    });


    saveData();

    updateAll();


    nameElement.value = "";

    amountElement.value = "";

    categoryElement.selectedIndex = 0;

    dateElement.value =
        getTodayDate();


    showToast(
        "Expense added successfully!",
        "💸"
    );

}


// ======================================================
// DISPLAY EXPENSES
// ======================================================

function displayExpenses() {

    const expenseList =
        document.getElementById("expenseList");


    total = 0;


    expenses.forEach(function(expense) {

        total +=
            Number(expense.amount) || 0;

    });


    if (!expenseList) return;


    expenseList.innerHTML = "";


    expenses.forEach(
        function(expense, index) {

            const expenseDiv =
                document.createElement("div");


            const formattedDate =
                expense.date
                    ? expense.date
                        .split("-")
                        .reverse()
                        .join("-")
                    : "";


            expenseDiv.innerHTML =

                "<div>" +
                escapeHTML(expense.name) +
                " - ₹" +
                Number(expense.amount) +
                " - " +
                escapeHTML(expense.category) +
                "</div>" +

                "<div>📅 " +
                formattedDate +
                "</div>" +

                "<button type=\"button\" onclick=\"deleteExpense(" +
                index +
                ")\">Delete</button>";


            expenseList.appendChild(
                expenseDiv
            );

        }
    );


    const totalAmount =
        document.getElementById("totalAmount");


    if (totalAmount) {

        totalAmount.textContent =
            total;

    }

}


// ======================================================
// DELETE EXPENSE
// ======================================================

function deleteExpense(index) {

    if (
        index < 0 ||
        index >= expenses.length
    ) {

        return;

    }


    expenses.splice(
        index,
        1
    );


    saveData();

    updateAll();


    showToast(
        "Expense deleted!",
        "🗑️"
    );

}


// ======================================================
// GET TOTAL SPENT
// ======================================================

function getTotalSpent() {

    return expenses.reduce(
        function(sum, expense) {

            return (
                sum +
                Number(expense.amount)
            );

        },
        0
    );

}


// ======================================================
// CATEGORY TOTALS
// ======================================================

function getCategoryTotals() {

    const categoryTotals = {};


    expenses.forEach(function(expense) {

        const category =
            expense.category || "Other";


        if (
            !categoryTotals[category]
        ) {

            categoryTotals[category] = 0;

        }


        categoryTotals[category] +=
            Number(expense.amount) || 0;

    });


    return categoryTotals;

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    const expenseCount =
        expenses.length;


    let average = 0;


    if (expenseCount > 0) {

        average =
            total / expenseCount;

    }


    const dashboardTotal =
        document.getElementById(
            "dashboardTotal"
        );

    const count =
        document.getElementById(
            "expenseCount"
        );

    const averageExpense =
        document.getElementById(
            "averageExpense"
        );

    const dashboardRemaining =
        document.getElementById(
            "dashboardBudgetRemaining"
        );


    if (dashboardTotal) {

        dashboardTotal.textContent =
            total;

    }


    if (count) {

        count.textContent =
            expenseCount;

    }


    if (averageExpense) {

        averageExpense.textContent =
            average.toFixed(2);

    }


    if (dashboardRemaining) {

        const remaining =
            budget - total;

        dashboardRemaining.textContent =
            budget > 0
                ? Math.max(
                    remaining,
                    0
                )
                : 0;

    }

}


// ======================================================
// HOME SNAPSHOT
// ======================================================

function updateHomeSnapshot() {

    const homeTotal =
        document.getElementById("homeTotal");

    const homeCount =
        document.getElementById("homeCount");

    const homeTopCategory =
        document.getElementById(
            "homeTopCategory"
        );


    if (homeTotal) {

        homeTotal.textContent =
            total;

    }


    if (homeCount) {

        homeCount.textContent =
            expenses.length;

    }


    if (!homeTopCategory) return;


    if (expenses.length === 0) {

        homeTopCategory.textContent =
            "None";

        return;

    }


    const totals =
        getCategoryTotals();


    let topCategory = "None";

    let highest = 0;


    Object.keys(totals).forEach(
        function(category) {

            if (
                totals[category] >
                highest
            ) {

                highest =
                    totals[category];

                topCategory =
                    category;

            }

        }
    );


    homeTopCategory.textContent =
        topCategory;

}

// ===============================
// PART 2 — BUDGET SYSTEM
// ===============================

function setBudget() {
    const input = document.getElementById("budgetAmount");

    if (!input) return;

    const amount = Number(input.value);

    if (!amount || amount <= 0) {
        showToast("⚠️", "Please enter a valid budget amount.");
        return;
    }

    budget = amount;
    saveData();

    updateBudget();
    updateDashboard();

    input.value = "";

    showToast("💰", "Main budget updated successfully!");
}


// -------------------------------
// RESET MAIN BUDGET
// -------------------------------

function resetBudget() {
    if (budget <= 0) {
        showToast("ℹ️", "No budget is currently set.");
        return;
    }

    const confirmReset = confirm(
        "Are you sure you want to reset your main budget?"
    );

    if (!confirmReset) return;

    budget = 0;
    saveData();

    updateBudget();
    updateDashboard();

    showToast("🔄", "Main budget has been reset.");
}


// -------------------------------
// CREATE RESET BUTTON
// -------------------------------

function createResetBudgetButton() {
    const budgetInput = document.getElementById("budgetAmount");

    if (!budgetInput) return;

    const setButton = budgetInput.nextElementSibling;

    if (!setButton) return;

    if (document.getElementById("resetBudgetBtn")) return;

    const resetButton = document.createElement("button");

    resetButton.id = "resetBudgetBtn";
    resetButton.type = "button";
    resetButton.textContent = "Reset Budget";
    resetButton.onclick = resetBudget;

    setButton.insertAdjacentElement("afterend", resetButton);
}


// -------------------------------
// UPDATE MAIN BUDGET
// -------------------------------

function updateBudget() {
    const totalElement = document.getElementById("budgetTotal");
    const spentElement = document.getElementById("budgetSpent");
    const remainingElement = document.getElementById("budgetRemaining");
    const progressElement = document.getElementById("budgetProgress");
    const messageElement = document.getElementById("budgetMessage");

    if (!totalElement || !spentElement || !remainingElement) {
        return;
    }

    const spent = getTotalSpent();

    totalElement.textContent = `₹${budget.toFixed(2)}`;
    spentElement.textContent = `₹${spent.toFixed(2)}`;

    if (budget <= 0) {
        remainingElement.textContent = "₹0.00";

        if (progressElement) {
            progressElement.style.width = "0%";
        }

        if (messageElement) {
            messageElement.textContent = "Set a budget to start tracking.";
        }

        return;
    }

    const remaining = budget - spent;

    remainingElement.textContent =
        `₹${Math.abs(remaining).toFixed(2)}`;

    const percentage = Math.min(
        (spent / budget) * 100,
        100
    );

    if (progressElement) {
        progressElement.style.width = `${percentage}%`;
        progressElement.style.display = "block";
    }

    if (messageElement) {
        if (spent > budget) {
            messageElement.textContent =
                `⚠️ You are ₹${(spent - budget).toFixed(2)} over budget.`;
        } else if (percentage >= 80) {
            messageElement.textContent =
                `⚠️ You have used ${percentage.toFixed(0)}% of your budget.`;
        } else {
            messageElement.textContent =
                `You have ₹${remaining.toFixed(2)} remaining.`;
        }
    }
}


// -------------------------------
// MAKE SURE PROGRESS BAR IS VISIBLE
// -------------------------------

function setupBudgetProgress() {
    const progress = document.getElementById("budgetProgress");

    if (!progress) return;

    progress.style.width = "0%";
    progress.style.display = "block";
    progress.style.transition = "width 0.4s ease";
}


// ===============================
// CATEGORY BUDGET
// ===============================

function setCategoryBudget() {
    const nameInput =
        document.getElementById("categoryBudgetName");

    const amountInput =
        document.getElementById("categoryBudgetAmount");

    if (!nameInput || !amountInput) return;

    const category = nameInput.value.trim();
    const amount = Number(amountInput.value);

    if (!category) {
        showToast("⚠️", "Please enter a category.");
        return;
    }

    if (!amount || amount <= 0) {
        showToast("⚠️", "Please enter a valid amount.");
        return;
    }

    categoryBudgets[category] = amount;

    saveData();

    updateCategoryBudgets();

    nameInput.value = "";
    amountInput.value = "";

    showToast(
        "🎯",
        `${category} budget set to ₹${amount.toFixed(2)}`
    );
}


// -------------------------------
// GET CATEGORY SPENDING
// -------------------------------

function getCategorySpent(category) {
    return expenses
        .filter(expense =>
            String(expense.category).toLowerCase() ===
            String(category).toLowerCase()
        )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );
}


// -------------------------------
// UPDATE CATEGORY BUDGETS
// -------------------------------

function updateCategoryBudgets() {
    const container =
        document.getElementById("categoryBudgetList");

    if (!container) return;

    const budgetNames = Object.keys(categoryBudgets);

    if (budgetNames.length === 0) {
        container.innerHTML =
            `<p class="empty-message">No category budgets set yet.</p>`;
        return;
    }

    container.innerHTML = "";

    budgetNames.forEach(category => {
        const limit = Number(categoryBudgets[category]) || 0;
        const spent = getCategorySpent(category);
        const remaining = limit - spent;

        let percentage = 0;

        if (limit > 0) {
            percentage = Math.min(
                (spent / limit) * 100,
                100
            );
        }

        const item = document.createElement("div");

        item.className = "category-budget-item";

        item.innerHTML = `
            <div class="category-budget-header">
                <strong>${escapeHTML(category)}</strong>

                <button
                    type="button"
                    onclick="deleteCategoryBudget('${escapeJSString(category)}')"
                    class="category-budget-delete">
                    ✕
                </button>
            </div>

            <div class="category-budget-amounts">
                <span>
                    Spent: ₹${spent.toFixed(2)}
                </span>

                <span>
                    Budget: ₹${limit.toFixed(2)}
                </span>
            </div>

            <div class="category-budget-progress">
                <div
                    class="category-budget-progress-fill"
                    style="width:${percentage}%;">
                </div>
            </div>

            <div class="category-budget-status">
                ${
                    remaining >= 0
                        ? `₹${remaining.toFixed(2)} remaining`
                        : `₹${Math.abs(remaining).toFixed(2)} over budget`
                }
            </div>
        `;

        container.appendChild(item);
    });
}


// -------------------------------
// DELETE CATEGORY BUDGET
// -------------------------------

function deleteCategoryBudget(category) {
    if (!categoryBudgets.hasOwnProperty(category)) {
        return;
    }

    const confirmDelete = confirm(
        `Delete the ${category} budget?`
    );

    if (!confirmDelete) return;

    delete categoryBudgets[category];

    saveData();
    updateCategoryBudgets();

    showToast(
        "🗑️",
        `${category} budget deleted.`
    );
}


// -------------------------------
// HTML SAFETY HELPERS
// -------------------------------

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeJSString(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}


// ===============================
// ANALYTICS
// ===============================

function displayAnalyticsSummary() {
    const container =
        document.getElementById("analyticsCategorySummary");

    if (!container) return;

    const totals = getCategoryTotals();
    const categories = Object.keys(totals);

    if (categories.length === 0) {
        container.innerHTML =
            `<p class="empty-message">No expense data available yet.</p>`;
        return;
    }

    const sorted = categories.sort(
        (a, b) => totals[b] - totals[a]
    );

    container.innerHTML = "";

    sorted.forEach(category => {
        const amount = totals[category];

        const row = document.createElement("div");

        row.className = "analytics-category-row";

        row.innerHTML = `
            <span>${escapeHTML(category)}</span>
            <strong>₹${amount.toFixed(2)}</strong>
        `;

        container.appendChild(row);
    });
}


// -------------------------------
// CHART
// -------------------------------

function updateChart() {
    const canvas =
        document.getElementById("expenseChart");

    if (!canvas) return;

    if (typeof Chart === "undefined") {
        return;
    }

    const totals = getCategoryTotals();

    const labels = Object.keys(totals);
    const values = Object.values(totals);

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (labels.length === 0) {
        return;
    }

    const ctx = canvas.getContext("2d");

    expenseChart = new Chart(ctx, {
        type: "doughnut",

        data: {
            labels: labels,

            datasets: [{
                data: values
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// -------------------------------
// MONEY MOOD
// -------------------------------

function updateMoneyMood() {
    const moodElement =
        document.getElementById("moneyMood");

    if (!moodElement) return;

    const spent = getTotalSpent();

    if (spent === 0) {
        moodElement.textContent =
            "😊 You're off to a great start!";
        return;
    }

    if (budget > 0) {
        const percentage = (spent / budget) * 100;

        if (percentage >= 100) {
            moodElement.textContent =
                "😟 You've crossed your budget. Time to slow down.";
        } else if (percentage >= 80) {
            moodElement.textContent =
                "😬 You're getting close to your budget.";
        } else if (percentage >= 50) {
            moodElement.textContent =
                "🙂 You're doing okay. Keep an eye on spending.";
        } else {
            moodElement.textContent =
                "😄 Great job! Your spending is under control.";
        }

        return;
    }

    moodElement.textContent =
        "🙂 Keep tracking your expenses!";
}


// ===============================
// SAVING SIMULATOR
// ===============================

function updateSimulator() {
    const slider =
        document.getElementById("savingSlider");

    const amountElement =
        document.getElementById("savingAmount");

    const monthlyElement =
        document.getElementById("monthlySaving");

    const yearlyElement =
        document.getElementById("yearlySaving");

    if (!slider) return;

    const value = Number(slider.value) || 0;

    if (amountElement) {
        amountElement.textContent =
            `₹${value}`;
    }

    if (monthlyElement) {
        monthlyElement.textContent =
            `₹${value}`;
    }

    if (yearlyElement) {
        yearlyElement.textContent =
            `₹${value * 12}`;
    }

    simulatorUsed = true;
    localStorage.setItem(
        "simulatorUsed",
        "true"
    );
}


// -------------------------------
// SIMULATOR EVENT
// -------------------------------

function setupSimulator() {
    const slider =
        document.getElementById("savingSlider");

    if (!slider) return;

    slider.addEventListener(
        "input",
        updateSimulator
    );

    updateSimulator();
}

// ===============================
// PART 3 — REMAINING FEATURES
// ===============================


// ===============================
// UPDATE EVERYTHING
// ===============================

function updateAll() {
    displayExpenses();
    updateDashboard();
    updateHomeSnapshot();

    updateBudget();
    updateCategoryBudgets();

    displayAnalyticsSummary();
    updateChart();

    updateMoneyMood();
    updateSimulator();
    updateJourney();
}


// ===============================
// JOURNEY / PROGRESS
// ===============================

function updateJourney() {
    const progressElement =
        document.getElementById("journeyProgress");

    const levelElement =
        document.getElementById("journeyLevel");

    const achievementsElement =
        document.getElementById("achievements");

    const count = expenses.length;

    let progress = Math.min(
        (count / 20) * 100,
        100
    );

    if (progressElement) {
        progressElement.style.width =
            `${progress}%`;
    }

    if (levelElement) {
        if (count === 0) {
            levelElement.textContent =
                "Beginner";
        } else if (count < 5) {
            levelElement.textContent =
                "Getting Started";
        } else if (count < 10) {
            levelElement.textContent =
                "Money Tracker";
        } else if (count < 20) {
            levelElement.textContent =
                "Smart Spender";
        } else {
            levelElement.textContent =
                "Finance Master";
        }
    }

    if (achievementsElement) {
        const achievements = [];

        if (count >= 1) {
            achievements.push("🏆 First Expense");
        }

        if (count >= 5) {
            achievements.push("⭐ 5 Expenses Tracked");
        }

        if (count >= 10) {
            achievements.push("🔥 10 Expenses Tracked");
        }

        if (budget > 0 && getTotalSpent() <= budget) {
            achievements.push("💰 Under Budget");
        }

        achievementsElement.innerHTML =
            achievements.length
                ? achievements.map(item =>
                    `<div>${item}</div>`
                  ).join("")
                : "<div>Start tracking to unlock achievements!</div>";
    }
}


// ===============================
// SAVINGS CHALLENGE
// ===============================

function completeChallenge() {
    challengeCompleted = true;

    localStorage.setItem(
        "challengeCompleted",
        "true"
    );

    updateJourney();

    showToast(
        "🏆",
        "Savings challenge completed!"
    );
}


// ===============================
// ANALYTICS VIEW TRACKING
// ===============================

function markAnalyticsViewed() {
    analyticsViewed = true;

    localStorage.setItem(
        "analyticsViewed",
        "true"
    );
}


// ===============================
// NAVIGATION BUTTON HANDLING
// ===============================

function setupNavigation() {
    const navButtons =
        document.querySelectorAll(
            "[onclick^='showSection']"
        );

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 50);
        });
    });
}


// ===============================
// FORM ENTER KEY SUPPORT
// ===============================

function setupFormKeyboardSupport() {
    const amountInput =
        document.getElementById("amount");

    const descriptionInput =
        document.getElementById("description");

    const categoryInput =
        document.getElementById("category");

    [amountInput, descriptionInput, categoryInput]
        .forEach(input => {
            if (!input) return;

            input.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        addExpense();
                    }
                }
            );
        });
}


// ===============================
// DATE SETUP
// ===============================

function setupDate() {
    const dateInput =
        document.getElementById("date");

    if (!dateInput) return;

    if (!dateInput.value) {
        dateInput.value = getTodayDate();
    }
}


// ===============================
// BUDGET INPUT VALIDATION
// ===============================

function setupBudgetInputs() {
    const mainBudget =
        document.getElementById("budgetAmount");

    const categoryBudget =
        document.getElementById(
            "categoryBudgetAmount"
        );

    [mainBudget, categoryBudget]
        .forEach(input => {
            if (!input) return;

            input.addEventListener(
                "input",
                () => {
                    if (Number(input.value) < 0) {
                        input.value = "";
                    }
                }
            );
        });
}


// ===============================
// BACK BUTTON FIX
// ===============================

function setupBackButton() {
    let currentSection =
        window.location.hash
            ? window.location.hash.substring(1)
            : "home";

    if (!document.getElementById(currentSection)) {
        currentSection = "home";
    }

    history.replaceState(
        { section: currentSection },
        "",
        `#${currentSection}`
    );

    window.addEventListener(
        "popstate",
        event => {
            const section =
                event.state &&
                event.state.section
                    ? event.state.section
                    : "home";

            showSection(
                section,
                true
            );
        }
    );

    window.addEventListener(
        "hashchange",
        () => {
            const section =
                window.location.hash
                    ? window.location.hash.substring(1)
                    : "home";

            if (
                document.getElementById(section)
            ) {
                showSection(
                    section,
                    true
                );
            }
        }
    );
}


// ===============================
// START APPLICATION
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupDate();

        updateGreeting();

        createResetBudgetButton();

        setupBudgetProgress();

        setupSimulator();

        setupNavigation();

        setupFormKeyboardSupport();

        setupBudgetInputs();

        setupBackButton();

        let startingSection =
            window.location.hash
                ? window.location.hash.substring(1)
                : "home";

        if (
            !document.getElementById(
                startingSection
            )
        ) {
            startingSection = "home";
        }

        history.replaceState(
            { section: startingSection },
            "",
            `#${startingSection}`
        );

        updateAll();

        showSection(
            startingSection,
            true
        );
    }
);


// ===============================
// KEEP GREETING UPDATED
// ===============================

setInterval(
    updateGreeting,
    60000
);
