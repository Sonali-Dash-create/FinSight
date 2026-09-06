// ======================================================
// FINSIGHT - JAVASCRIPT
// PART 1 OF 3
// ======================================================

// DATA
let expenses = JSON.parse(localStorage.getItem("finsightExpenses")) || [];
let budget = Number(localStorage.getItem("finsightBudget")) || 0;

let categoryBudgets =
    JSON.parse(localStorage.getItem("finsightCategoryBudgets")) || {};

let savingsChallenges =
    Number(localStorage.getItem("finsightChallenges")) || 0;


// SAVE DATA
function saveData() {
    localStorage.setItem("finsightExpenses", JSON.stringify(expenses));
    localStorage.setItem("finsightBudget", budget);

    localStorage.setItem(
        "finsightCategoryBudgets",
        JSON.stringify(categoryBudgets)
    );

    localStorage.setItem(
        "finsightChallenges",
        savingsChallenges
    );
}


// TODAY'S DATE
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// GREETING
function updateGreeting() {
    const greeting =
        document.getElementById("greeting");

    if (!greeting) return;

    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent =
            "Good Morning! 👋";
    }
    else if (hour < 18) {
        greeting.textContent =
            "Good Afternoon! ☀️";
    }
    else {
        greeting.textContent =
            "Good Evening! 🌙";
    }
}


// SHOW SECTION
function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".app-section");

    sections.forEach(section => {
        section.classList.remove(
            "active-section"
        );
    });

    const selected =
        document.getElementById(sectionId);

    if (selected) {
        selected.classList.add(
            "active-section"
        );
    }

    const navButtons =
        document.querySelectorAll(".nav-btn");

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    navButtons.forEach(button => {

        const text =
            button.getAttribute("onclick");

        if (
            text &&
            text.includes(`'${sectionId}'`)
        ) {
            button.classList.add("active");
        }

    });

    updateAll();
}


// ADD EXPENSE
function addExpense() {

    const name =
        document
            .getElementById("expenseName")
            .value
            .trim();

    const date =
        document
            .getElementById("expenseDate")
            .value;

    const amount =
        Number(
            document
                .getElementById("expenseAmount")
                .value
        );

    const category =
        document
            .getElementById("expenseCategory")
            .value;


    if (!name) {
        showToast(
            "⚠️",
            "Please enter an expense name."
        );
        return;
    }


    if (!amount || amount <= 0) {
        showToast(
            "⚠️",
            "Please enter a valid amount."
        );
        return;
    }


    if (
        !category ||
        category === "Select Category"
    ) {
        showToast(
            "⚠️",
            "Please select a category."
        );
        return;
    }


    const expense = {

        id: Date.now(),

        name: name,

        date:
            date || getTodayDate(),

        amount: amount,

        category: category

    };


    expenses.push(expense);

    saveData();

    clearExpenseForm();

    updateAll();

    showToast(
        "✅",
        "Expense added successfully!"
    );
}


// CLEAR EXPENSE FORM
function clearExpenseForm() {

    document
        .getElementById("expenseName")
        .value = "";

    document
        .getElementById("expenseDate")
        .value = getTodayDate();

    document
        .getElementById("expenseAmount")
        .value = "";

    document
        .getElementById("expenseCategory")
        .value = "Select Category";
}


// DELETE EXPENSE
function deleteExpense(id) {

    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );

    saveData();

    updateAll();

    showToast(
        "🗑️",
        "Expense deleted."
    );
}


// TOTAL
function getTotalSpent() {

    return expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount),
        0
    );
}


// EXPENSE LIST
function updateExpenseList() {

    const list =
        document.getElementById(
            "expenseList"
        );

    if (!list) return;


    if (expenses.length === 0) {

        list.innerHTML =
            "<p>No expenses added yet. 💸</p>";

        return;
    }


    const sortedExpenses =
        [...expenses].reverse();


    list.innerHTML =
        sortedExpenses.map(
            expense => `

        <div class="expense-item">

            <div>

                <strong>
                    ${escapeHTML(expense.name)}
                </strong>

                <small>
                    ${escapeHTML(expense.category)}
                    •
                    ${expense.date}
                </small>

            </div>

            <div>

                <strong>
                    ₹${Number(
                        expense.amount
                    ).toLocaleString("en-IN")}
                </strong>

                <button
                    type="button"
                    onclick="deleteExpense(${expense.id})"
                >
                    🗑️
                </button>

            </div>

        </div>

    `
        ).join("");
}


// CATEGORY TOTALS
function getCategoryTotals() {

    const totals = {};

    expenses.forEach(expense => {

        const category =
            expense.category;

        totals[category] =
            (totals[category] || 0) +
            Number(expense.amount);

    });

    return totals;
}


// CATEGORY SUMMARY
function updateCategorySummary() {

    const container =
        document.getElementById(
            "categorySummary"
        );

    if (!container) return;


    const totals =
        getCategoryTotals();

    const categories =
        Object.keys(totals);


    if (categories.length === 0) {

        container.innerHTML = "";

        return;
    }


    container.innerHTML = `

        <div class="category-summary-card">

            <h2>📂 Category Summary</h2>

            ${categories.map(
                category => `

                <div class="summary-row">

                    <span>
                        ${escapeHTML(category)}
                    </span>

                    <strong>
                        ₹${totals[
                            category
                        ].toLocaleString("en-IN")}
                    </strong>

                </div>

            `
            ).join("")}

        </div>

    `;
}


// HOME SNAPSHOT
function updateHome() {

    const total =
        getTotalSpent();


    const homeTotal =
        document.getElementById(
            "homeTotal"
        );

    if (homeTotal) {

        homeTotal.textContent =
            total.toLocaleString("en-IN");

    }


    const homeCount =
        document.getElementById(
            "homeCount"
        );

    if (homeCount) {

        homeCount.textContent =
            expenses.length;

    }


    const categoryTotals =
        getCategoryTotals();

    let topCategory = "None";

    const categories =
        Object.keys(categoryTotals);


    if (categories.length > 0) {

        topCategory =
            categories.reduce(
                (top, category) =>

                    categoryTotals[category] >
                    categoryTotals[top]

                        ? category
                        : top,

                categories[0]
            );

    }


    const topElement =
        document.getElementById(
            "homeTopCategory"
        );

    if (topElement) {

        topElement.textContent =
            topCategory;

    }
}


// DASHBOARD
function updateDashboard() {

    const total =
        getTotalSpent();


    const dashboardTotal =
        document.getElementById(
            "dashboardTotal"
        );

    if (dashboardTotal) {

        dashboardTotal.textContent =
            total.toLocaleString("en-IN");

    }


    const count =
        document.getElementById(
            "expenseCount"
        );

    if (count) {

        count.textContent =
            expenses.length;

    }


    const average =
        expenses.length
            ? total / expenses.length
            : 0;


    const averageElement =
        document.getElementById(
            "averageExpense"
        );

    if (averageElement) {

        averageElement.textContent =
            Math.round(
                average
            ).toLocaleString("en-IN");

    }


    const remaining =
        Math.max(
            budget - total,
            0
        );


    const dashboardRemaining =
        document.getElementById(
            "dashboardBudgetRemaining"
        );

    if (dashboardRemaining) {

        dashboardRemaining.textContent =
            remaining.toLocaleString("en-IN");

    }
}
// ======================================================
// FINSIGHT - JAVASCRIPT
// PART 2 OF 3
// ======================================================


// BUDGET
function setBudget() {

    const input =
        document.getElementById(
            "budgetAmount"
        );

    const amount =
        Number(input.value);


    if (!amount || amount <= 0) {

        showToast(
            "⚠️",
            "Please enter a valid budget."
        );

        return;
    }


    budget = amount;

    saveData();

    input.value = "";

    updateBudget();


    showToast(
        "🎯",
        "Monthly budget set successfully!"
    );
}


// UPDATE BUDGET
function updateBudget() {

    const total =
        getTotalSpent();

    const remaining =
        budget - total;

    const safeRemaining =
        Math.max(
            remaining,
            0
        );


    const budgetTotal =
        document.getElementById(
            "budgetTotal"
        );

    if (budgetTotal) {

        budgetTotal.textContent =
            budget.toLocaleString("en-IN");

    }


    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    if (budgetSpent) {

        budgetSpent.textContent =
            total.toLocaleString("en-IN");

    }


    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );

    if (budgetRemaining) {

        budgetRemaining.textContent =
            safeRemaining.toLocaleString("en-IN");

    }


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    let percentage = 0;


    if (budget > 0) {

        percentage =
            (total / budget) * 100;

    }


    if (progress) {

        progress.style.width =
            Math.min(
                percentage,
                100
            ) + "%";

    }


    const message =
        document.getElementById(
            "budgetMessage"
        );


    if (!message) return;


    if (budget === 0) {

        message.textContent =
            "Set your budget to start tracking.";

        return;
    }


    if (total > budget) {

        message.textContent =
            "🚨 You have exceeded your budget!";

    }

    else if (percentage >= 80) {

        message.textContent =
            "⚠️ You're close to your budget limit.";

    }

    else if (percentage >= 50) {

        message.textContent =
            "💡 More than half of your budget is used.";

    }

    else {

        message.textContent =
            "🎉 You're doing well! Keep tracking your spending.";

    }
}


// CATEGORY BUDGET
function setCategoryBudget() {

    const nameInput =
        document.getElementById(
            "categoryBudgetName"
        );

    const amountInput =
        document.getElementById(
            "categoryBudgetAmount"
        );


    const category =
        nameInput.value.trim();

    const amount =
        Number(amountInput.value);


    if (!category) {

        showToast(
            "⚠️",
            "Please enter a category."
        );

        return;
    }


    if (!amount || amount <= 0) {

        showToast(
            "⚠️",
            "Please enter a valid category limit."
        );

        return;
    }


    categoryBudgets[category] =
        amount;


    saveData();


    nameInput.value = "";

    amountInput.value = "";


    updateCategoryBudgets();


    showToast(
        "🎯",
        `${category} budget added.`
    );
}


// CATEGORY BUDGET DISPLAY
function updateCategoryBudgets() {

    const container =
        document.getElementById(
            "categoryBudgetList"
        );

    if (!container) return;


    const categories =
        Object.keys(
            categoryBudgets
        );


    if (categories.length === 0) {

        container.innerHTML =
            "<p>No category budgets set yet.</p>";

        return;
    }


    const totals =
        getCategoryTotals();


    container.innerHTML =
        categories.map(
            category => {

                const limit =
                    Number(
                        categoryBudgets[
                            category
                        ]
                    );


                const spent =
                    Number(
                        totals[
                            category
                        ] || 0
                    );


                const remaining =
                    limit - spent;


                const percentage =
                    limit > 0

                        ? Math.min(
                            (spent / limit) * 100,
                            100
                        )

                        : 0;


                let status =
                    "✅ Within limit";


                if (spent > limit) {

                    status =
                        "🚨 Budget exceeded";

                }

                else if (
                    percentage >= 80
                ) {

                    status =
                        "⚠️ Close to limit";

                }


                return `

                    <div class="category-budget-item">

                        <h3>
                            ${escapeHTML(category)}
                        </h3>

                        <p>
                            Spent:
                            ₹${spent.toLocaleString("en-IN")}
                        </p>

                        <p>
                            Limit:
                            ₹${limit.toLocaleString("en-IN")}
                        </p>

                        <p>

                            ${
                                remaining >= 0

                                    ? `Remaining: ₹${remaining.toLocaleString("en-IN")}`

                                    : `Over by: ₹${Math.abs(
                                        remaining
                                    ).toLocaleString("en-IN")}`

                            }

                        </p>


                        <div class="budget-progress">

                            <div
                                class="budget-progress-fill"
                                style="width:${percentage}%"
                            ></div>

                        </div>


                        <strong>
                            ${status}
                        </strong>


                        <button
                            type="button"
                            onclick="deleteCategoryBudget('${escapeAttribute(category)}')"
                        >
                            🗑️ Remove
                        </button>

                    </div>

                `;

            }
        ).join("");
}


// DELETE CATEGORY BUDGET
function deleteCategoryBudget(
    category
) {

    delete categoryBudgets[
        category
    ];

    saveData();

    updateCategoryBudgets();

    showToast(
        "🗑️",
        "Category budget removed."
    );
}


// ANALYTICS
let expenseChart = null;


function updateAnalytics() {

    const message =
        document.getElementById(
            "analyticsMessage"
        );


    const totals =
        getCategoryTotals();

    const categories =
        Object.keys(totals);


    if (categories.length === 0) {

        if (message) {

            message.textContent =
                "Add some expenses to see your spending pattern.";

        }


        if (expenseChart) {

            expenseChart.destroy();

            expenseChart = null;

        }

        return;
    }


    if (message) {

        message.textContent =
            "Here's how your spending is divided.";

    }


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) return;


    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    if (expenseChart) {

        expenseChart.destroy();

    }


    expenseChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "doughnut",

                data: {

                    labels:
                        categories,

                    datasets: [
                        {
                            data:
                                categories.map(
                                    category =>
                                        totals[
                                            category
                                        ]
                                )
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            position:
                                "bottom"
                        },

                        datalabels: {

                            formatter:
                                (
                                    value,
                                    context
                                ) => {

                                    const data =
                                        context
                                            .chart
                                            .data
                                            .datasets[0]
                                            .data;


                                    const total =
                                        data.reduce(
                                            (a, b) =>
                                                a + b,
                                            0
                                        );


                                    return Math.round(
                                        (value /
                                            total) *
                                        100
                                    ) + "%";

                                }

                        }

                    }

                },

                plugins:
                    typeof ChartDataLabels !==
                    "undefined"

                        ? [ChartDataLabels]

                        : []

            }
        );


    updateAnalyticsCategorySummary();
}


// ANALYTICS CATEGORY SUMMARY
function updateAnalyticsCategorySummary() {

    const container =
        document.getElementById(
            "analyticsCategorySummary"
        );

    if (!container) return;


    const totals =
        getCategoryTotals();

    const categories =
        Object.keys(totals);


    if (categories.length === 0) {

        container.innerHTML = "";

        return;
    }


    const total =
        getTotalSpent();


    container.innerHTML = `

        <div class="category-summary-card">

            <h2>📊 Spending Breakdown</h2>

            ${categories.map(
                category => {

                    const percentage =
                        total > 0

                            ? Math.round(
                                (
                                    totals[
                                        category
                                    ] /
                                    total
                                ) * 100
                            )

                            : 0;


                    return `

                        <div class="summary-row">

                            <span>
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                            <strong>
                                ₹${totals[
                                    category
                                ].toLocaleString("en-IN")}
                                (${percentage}%)
                            </strong>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;
}
// ======================================================
// FINSIGHT - JAVASCRIPT
// PART 3 OF 3
// ======================================================


// MONEY MOOD
function updateMoneyMood() {

    const container =
        document.getElementById(
            "moneyMood"
        );

    if (!container) return;


    if (expenses.length === 0) {

        container.innerHTML = `

            <p>
                Add some expenses and FinSight will
                discover your money personality.
            </p>

        `;

        return;
    }


    const totals =
        getCategoryTotals();

    const total =
        getTotalSpent();


    const topCategory =
        Object.keys(totals).reduce(
            (top, category) =>
                totals[category] >
                totals[top]
                    ? category
                    : top,

            Object.keys(totals)[0]
        );


    const topPercentage =
        total > 0
            ? (
                totals[topCategory] /
                total
            ) * 100
            : 0;


    let personality =
        "Balanced Planner";


    let message =
        "You seem to keep a fairly balanced approach to spending.";


    if (topCategory === "Food") {

        personality =
            "Foodie Financier";

        message =
            "Food takes a big part of your spending. Enjoy it, but keep an eye on your food budget! 🍔";

    }

    else if (topCategory === "Shopping") {

        personality =
            "Smart Shopper";

        message =
            "Shopping is your biggest spending area. A little planning can help you save more. 🛍️";

    }

    else if (topCategory === "Travel") {

        personality =
            "Adventure Spender";

        message =
            "You love spending on experiences and travel. Keep exploring while staying within your limits! ✈️";

    }

    else if (topCategory === "Education") {

        personality =
            "Future Builder";

        message =
            "You're investing in learning and your future. That's a powerful habit! 📚";

    }

    else if (topPercentage >= 60) {

        personality =
            "Focused Spender";

        message =
            "A large portion of your spending goes toward one category. Consider setting a category budget.";

    }


    container.innerHTML = `

        <div class="money-personality">

            <h3>
                ✨ ${personality}
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;
}


// WHAT-IF SIMULATOR
function updateSimulator() {

    const slider =
        document.getElementById(
            "savingSlider"
        );

    if (!slider) return;


    const weekly =
        Number(slider.value);


    const monthly =
        Math.round(
            weekly * 52 / 12
        );


    const yearly =
        weekly * 52;


    const savingAmount =
        document.getElementById(
            "savingAmount"
        );

    if (savingAmount) {

        savingAmount.textContent =
            weekly;

    }


    const monthlySaving =
        document.getElementById(
            "monthlySaving"
        );

    if (monthlySaving) {

        monthlySaving.textContent =
            monthly.toLocaleString("en-IN");

    }


    const yearlySaving =
        document.getElementById(
            "yearlySaving"
        );

    if (yearlySaving) {

        yearlySaving.textContent =
            yearly.toLocaleString("en-IN");

    }
}


// COMPLETE SIMULATOR
function completeSimulator() {

    const slider =
        document.getElementById(
            "savingSlider"
        );


    const amount =
        slider
            ? Number(slider.value)
            : 0;


    showToast(
        "✨",
        `You could save ₹${(
            amount * 52
        ).toLocaleString("en-IN")} a year!`
    );
}


// MONEY JOURNEY
function updateJourney() {

    const progress =
        document.getElementById(
            "journeyProgress"
        );

    const level =
        document.getElementById(
            "journeyLevel"
        );

    const achievements =
        document.getElementById(
            "achievements"
        );


    const count =
        expenses.length;


    let levelNumber = 1;

    let levelName =
        "Money Beginner";


    if (count >= 5) {

        levelNumber = 2;

        levelName =
            "Money Learner";
    }


    if (count >= 10) {

        levelNumber = 3;

        levelName =
            "Money Tracker";
    }


    if (count >= 20) {

        levelNumber = 4;

        levelName =
            "Money Master";
    }


    if (count >= 50) {

        levelNumber = 5;

        levelName =
            "Money Champion";
    }


    const percentage =
        Math.min(
            count * 5,
            100
        );


    if (progress) {

        progress.style.width =
            percentage + "%";

    }


    if (level) {

        level.textContent =
            `Level ${levelNumber} — ${levelName}`;

    }


    if (!achievements) return;


    const achievementList = [];


    if (count >= 1) {

        achievementList.push(
            "🌱 First Expense"
        );

    }


    if (count >= 5) {

        achievementList.push(
            "🔥 5 Expenses Tracked"
        );

    }


    if (count >= 10) {

        achievementList.push(
            "⭐ 10 Expenses Tracked"
        );

    }


    if (
        budget > 0 &&
        getTotalSpent() <= budget
    ) {

        achievementList.push(
            "💰 Budget Guardian"
        );

    }


    if (savingsChallenges > 0) {

        achievementList.push(
            "🏆 Savings Challenge Completed"
        );

    }


    if (
        achievementList.length === 0
    ) {

        achievements.innerHTML =
            "<p>Keep tracking to unlock achievements! 🎯</p>";

    }

    else {

        achievements.innerHTML =
            achievementList.map(
                item => `

                    <div class="achievement">
                        ${item}
                    </div>

                `
            ).join("");

    }
}


// SAVINGS CHALLENGE
function completeSavingsChallenge() {

    savingsChallenges++;

    saveData();

    updateJourney();


    showToast(
        "🏆",
        "Savings challenge completed!"
    );
}


// TOAST
function showToast(
    icon,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) return;


    if (toastIcon) {

        toastIcon.textContent =
            icon;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}


// ENTER KEY SUPPORT
function setupEnterKey() {

    const inputs =
        document.querySelectorAll(
            "#add input"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    addExpense();

                }

            }
        );

    });
}


// SECURITY HELPERS
function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(value) {

    return String(value)

        .replaceAll(
            "\\",
            "\\\\"
        )

        .replaceAll(
            "'",
            "\\'"
        );
}


// UPDATE EVERYTHING
function updateAll() {

    updateHome();

    updateExpenseList();

    updateCategorySummary();

    updateDashboard();

    updateBudget();

    updateCategoryBudgets();

    updateAnalytics();

    updateMoneyMood();

    updateSimulator();

    updateJourney();
}


// INITIALIZE
document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateGreeting();


        const dateInput =
            document.getElementById(
                "expenseDate"
            );


        if (dateInput) {

            dateInput.value =
                getTodayDate();

        }


        const slider =
            document.getElementById(
                "savingSlider"
            );


        if (slider) {

            slider.addEventListener(
                "input",
                updateSimulator
            );

        }


        setupEnterKey();

        updateAll();

    }
);


// UPDATE GREETING EVERY MINUTE
setInterval(
    updateGreeting,
    60000
);
