// ======================================================
// FINSIGHT - JAVASCRIPT
// FINAL COMPLETE VERSION - PART 1 OF 3
// ======================================================


// ======================================================
// DATA
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

let currentSection = "home";

let navigationReady = false;


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
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


// ======================================================
// GREETING
// ======================================================

function updateGreeting() {

    const greeting =
        document.getElementById(
            "greeting"
        );

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
// NAVIGATION
// ======================================================

function showSection(
    sectionId,
    fromHistory
) {

    const selectedSection =
        document.getElementById(
            sectionId
        );

    if (!selectedSection) return;


    const sections =
        document.querySelectorAll(
            ".app-section"
        );

    sections.forEach(
        function(section) {

            section.classList.remove(
                "active-section"
            );
        }
    );


    selectedSection.classList.add(
        "active-section"
    );


    currentSection =
        sectionId;


    // ----------------------------------------------
    // UPDATE BOTTOM NAVIGATION
    // ----------------------------------------------

    const navButtons =
        document.querySelectorAll(
            ".nav-btn"
        );

    navButtons.forEach(
        function(button) {

            button.classList.remove(
                "active"
            );

            const onclick =
                button.getAttribute(
                    "onclick"
                );

            if (
                onclick ===
                "showSection('" +
                sectionId +
                "')"
            ) {

                button.classList.add(
                    "active"
                );
            }
        }
    );


    // ----------------------------------------------
    // BROWSER HISTORY
    // ----------------------------------------------

    if (
        navigationReady &&
        !fromHistory
    ) {

        const currentHash =
            window.location.hash
                ? window.location.hash.substring(1)
                : "";

        if (
            currentHash !== sectionId
        ) {

            history.pushState(
                {
                    section: sectionId
                },
                "",
                "#" + sectionId
            );
        }
    }


    // ----------------------------------------------
    // SPECIAL SECTIONS
    // ----------------------------------------------

    if (
        sectionId === "analytics"
    ) {

        analyticsViewed = true;

        localStorage.setItem(
            "analyticsViewed",
            "true"
        );

        updateChart();
        displayAnalyticsSummary();
        updateJourney();
    }


    if (
        sectionId === "mood"
    ) {

        displayMoneyMood();
    }


    if (
        sectionId === "simulator"
    ) {

        updateSimulator();
    }


    if (
        sectionId === "journey"
    ) {

        updateJourney();
    }


    // Scroll to top

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// BACK BUTTON
// ======================================================

window.addEventListener(
    "popstate",
    function(event) {

        let section =
            event.state &&
            event.state.section
                ? event.state.section
                : "home";

        if (
            !document.getElementById(
                section
            )
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
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    if (!toast) return;

    if (toastMessage) {

        toastMessage.textContent =
            message;
    }

    if (toastIcon) {

        toastIcon.textContent =
            icon || "✅";
    }

    toast.classList.add(
        "show"
    );

    setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );

        },
        2000
    );
}


// ======================================================
// ADD EXPENSE
// ======================================================

function addExpense() {

    const nameInput =
        document.getElementById(
            "expenseName"
        );

    const amountInput =
        document.getElementById(
            "expenseAmount"
        );

    const categoryInput =
        document.getElementById(
            "expenseCategory"
        );

    const dateInput =
        document.getElementById(
            "expenseDate"
        );

    if (
        !nameInput ||
        !amountInput ||
        !categoryInput ||
        !dateInput
    ) {

        return;
    }


    const name =
        nameInput.value.trim();

    const amount =
        Number(
            amountInput.value
        );

    const category =
        categoryInput.value;

    const date =
        dateInput.value;


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

    clearExpenseForm();

    updateAll();

    showToast(
        "Expense added successfully!",
        "💸"
    );
}


// ======================================================
// CLEAR EXPENSE FORM
// ======================================================

function clearExpenseForm() {

    const name =
        document.getElementById(
            "expenseName"
        );

    const amount =
        document.getElementById(
            "expenseAmount"
        );

    const category =
        document.getElementById(
            "expenseCategory"
        );

    const date =
        document.getElementById(
            "expenseDate"
        );


    if (name) {

        name.value = "";
    }

    if (amount) {

        amount.value = "";
    }

    if (category) {

        category.selectedIndex = 0;
    }

    if (date) {

        date.value =
            getTodayDate();
    }
}


// ======================================================
// DISPLAY EXPENSES
// ======================================================

function displayExpenses() {

    const expenseList =
        document.getElementById(
            "expenseList"
        );

    if (!expenseList) return;


    expenseList.innerHTML = "";

    total = 0;


    if (
        expenses.length === 0
    ) {

        expenseList.innerHTML =
            "<p>No expenses added yet.</p>";

    } else {

        expenses.forEach(
            function(
                expense,
                index
            ) {

                const expenseDiv =
                    document.createElement(
                        "div"
                    );


                const formattedDate =
                    expense.date
                        ? expense.date
                            .split("-")
                            .reverse()
                            .join("-")
                        : "";


                expenseDiv.innerHTML =
                    "<div>" +
                    escapeHTML(
                        expense.name
                    ) +
                    " - ₹" +
                    Number(
                        expense.amount
                    ).toFixed(2) +
                    " - " +
                    escapeHTML(
                        expense.category
                    ) +
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


                total += Number(
                    expense.amount
                );
            }
        );
    }


    const totalAmount =
        document.getElementById(
            "totalAmount"
        );

    if (totalAmount) {

        totalAmount.textContent =
            total.toFixed(2);
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
// TOTAL SPENT
// ======================================================

function getTotalSpent() {

    return expenses.reduce(
        function(
            sum,
            expense
        ) {

            return (
                sum +
                Number(
                    expense.amount || 0
                )
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


    expenses.forEach(
        function(expense) {

            const category =
                expense.category ||
                "Other";

            if (
                categoryTotals[
                    category
                ] === undefined
            ) {

                categoryTotals[
                    category
                ] = 0;
            }


            categoryTotals[
                category
            ] += Number(
                expense.amount || 0
            );
        }
    );


    return categoryTotals;
}


// ======================================================
// CATEGORY SUMMARY
// ======================================================

function displayCategorySummary() {

    const categorySummary =
        document.getElementById(
            "categorySummary"
        );

    if (!categorySummary) return;


    const totals =
        getCategoryTotals();


    const categories =
        Object.keys(
            totals
        );


    if (
        categories.length === 0
    ) {

        categorySummary.innerHTML =
            "<div class=\"category-card\">" +
            "<h2>📂 Category-wise Spending</h2>" +
            "<p>No spending yet.</p>" +
            "</div>";

        return;
    }


    let html =
        "<div class=\"category-card\">" +
        "<h2>📂 Category-wise Spending</h2>";


    categories.forEach(
        function(category) {

            html +=
                "<p>" +
                escapeHTML(
                    category
                ) +
                ": ₹" +
                totals[
                    category
                ].toFixed(2) +
                "</p>";
        }
    );


    html +=
        "</div>";


    categorySummary.innerHTML =
        html;
}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    const expenseCount =
        expenses.length;

    const spent =
        getTotalSpent();

    let average = 0;


    if (
        expenseCount > 0
    ) {

        average =
            spent /
            expenseCount;
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

    const dashboardBudgetRemaining =
        document.getElementById(
            "dashboardBudgetRemaining"
        );


    if (dashboardTotal) {

        dashboardTotal.textContent =
            spent.toFixed(2);
    }


    if (count) {

        count.textContent =
            expenseCount;
    }


    if (averageExpense) {

        averageExpense.textContent =
            average.toFixed(2);
    }


    if (dashboardBudgetRemaining) {

        if (budget > 0) {

            const remaining =
                budget - spent;

            dashboardBudgetRemaining.textContent =
                remaining >= 0
                    ? "₹" +
                      remaining.toFixed(2)
                    : "-₹" +
                      Math.abs(
                          remaining
                      ).toFixed(2);

        } else {

            dashboardBudgetRemaining.textContent =
                "Not set";
        }
    }
}


// ======================================================
// HOME SNAPSHOT
// ======================================================

function updateHomeSnapshot() {

    const homeTotal =
        document.getElementById(
            "homeTotal"
        );

    const homeCount =
        document.getElementById(
            "homeCount"
        );

    const homeTopCategory =
        document.getElementById(
            "homeTopCategory"
        );


    const spent =
        getTotalSpent();


    if (homeTotal) {

        homeTotal.textContent =
            spent.toFixed(2);
    }


    if (homeCount) {

        homeCount.textContent =
            expenses.length;
    }


    if (
        !homeTopCategory
    ) {

        return;
    }


    if (
        expenses.length === 0
    ) {

        homeTopCategory.textContent =
            "None";

        return;
    }


    const totals =
        getCategoryTotals();


    let topCategory =
        "None";

    let highest = 0;


    Object.keys(
        totals
    ).forEach(
        function(category) {

            if (
                totals[
                    category
                ] > highest
            ) {

                highest =
                    totals[
                        category
                    ];

                topCategory =
                    category;
            }
        }
    );


    homeTopCategory.textContent =
        topCategory;
}
// ======================================================
// BUDGET
// ======================================================

function setBudget() {

    const budgetInput =
        document.getElementById(
            "budgetAmount"
        );

    if (!budgetInput) return;

    const newBudget =
        Number(
            budgetInput.value
        );


    if (
        !newBudget ||
        newBudget <= 0
    ) {

        showToast(
            "Enter a valid budget!",
            "⚠️"
        );

        return;
    }


    budget =
        newBudget;


    saveData();

    updateAll();

    showToast(
        "Budget set successfully!",
        "💰"
    );
}


// ======================================================
// RESET MAIN BUDGET
// ======================================================

function resetBudget() {

    budget = 0;

    localStorage.setItem(
        "finsightBudget",
        "0"
    );

    const budgetInput =
        document.getElementById(
            "budgetAmount"
        );

    if (budgetInput) {

        budgetInput.value = "";
    }

    updateAll();

    showToast(
        "Budget reset successfully!",
        "🔄"
    );
}


// ======================================================
// CREATE RESET BUTTON
// ======================================================

function createResetBudgetButton() {

    const setButton =
        document.querySelector(
            'button[onclick="setBudget()"]'
        );

    if (!setButton) return;


    if (
        document.getElementById(
            "resetBudgetButton"
        )
    ) {

        return;
    }


    const resetButton =
        document.createElement(
            "button"
        );


    resetButton.type =
        "button";

    resetButton.id =
        "resetBudgetButton";

    resetButton.textContent =
        "🔄 Reset Budget";

    resetButton.onclick =
        resetBudget;


    setButton.insertAdjacentElement(
        "afterend",
        resetButton
    );
}


// ======================================================
// UPDATE MAIN BUDGET
// ======================================================

function updateBudget() {

    const budgetTotal =
        document.getElementById(
            "budgetTotal"
        );

    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );

    const budgetProgress =
        document.getElementById(
            "budgetProgress"
        );

    const budgetMessage =
        document.getElementById(
            "budgetMessage"
        );


    const spent =
        getTotalSpent();


    if (budgetTotal) {

        budgetTotal.textContent =
            budget > 0
                
                ? budget.toFixed(2)
                : "₹0.00";
    }


    if (budgetSpent) {

        budgetSpent.textContent =
        
            spent.toFixed(2);
    }


    let remaining =
        budget -
        spent;


    if (budgetRemaining) {

        if (budget <= 0) {

            budgetRemaining.textContent =
                "₹0.00";

        } else if (
            remaining >= 0
        ) {

            budgetRemaining.textContent =
                "₹" +
                remaining.toFixed(2);

        } else {

            budgetRemaining.textContent =
                "-₹" +
                Math.abs(
                    remaining
                ).toFixed(2);
        }
    }


    // ----------------------------------------------
    // PROGRESS BAR
    // ----------------------------------------------

    if (budgetProgress) {

        let percentage = 0;

        if (budget > 0) {

            percentage =
                (
                    spent /
                    budget
                ) *
                100;
        }


        percentage =
            Math.max(
                0,
                Math.min(
                    percentage,
                    100
                )
            );


        budgetProgress.style.width =
            percentage + "%";

        budgetProgress.style.display =
            "block";


        if (
            spent > budget
        ) {

            budgetProgress.style.opacity =
                "1";
        }
    }


    // ----------------------------------------------
    // MESSAGE
    // ----------------------------------------------

    if (budgetMessage) {

        if (budget <= 0) {

            budgetMessage.textContent =
                "Set a budget to start tracking your spending.";

        } else if (
            spent > budget
        ) {

            budgetMessage.textContent =
                "⚠️ You have exceeded your budget by ₹" +
                (
                    spent - budget
                ).toFixed(2);

        } else if (
            spent === budget
        ) {

            budgetMessage.textContent =
                "⚠️ You have reached your budget.";

        } else {

            const percentage =
                (
                    spent /
                    budget
                ) *
                100;


            if (
                percentage >= 80
            ) {

                budgetMessage.textContent =
                    "⚠️ You have used " +
                    percentage.toFixed(0) +
                    "% of your budget.";

            } else {

                budgetMessage.textContent =
                    "✅ You are within your budget.";
            }
        }
    }
}


// ======================================================
// CATEGORY BUDGET
// ======================================================

function setCategoryBudget() {

    const nameInput =
        document.getElementById(
            "categoryBudgetName"
        );

    const amountInput =
        document.getElementById(
            "categoryBudgetAmount"
        );


    if (
        !nameInput ||
        !amountInput
    ) {

        return;
    }


    const category =
        nameInput.value;

    const amount =
        Number(
            amountInput.value
        );


    if (
        !category ||
        category === "Select Category" ||
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Enter a category and valid amount!",
            "⚠️"
        );

        return;
    }


    categoryBudgets[
        category
    ] = amount;


    saveData();

    updateAll();


    amountInput.value =
        "";


    showToast(
        category +
        " budget set!",
        "🎯"
    );
}


// ======================================================
// GET CATEGORY SPENT
// ======================================================

function getCategorySpent(
    category
) {

    return expenses.reduce(
        function(
            sum,
            expense
        ) {

            if (
                String(
                    expense.category
                ).toLowerCase() ===
                String(
                    category
                ).toLowerCase()
            ) {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );
            }


            return sum;

        },
        0
    );
}


// ======================================================
// UPDATE CATEGORY BUDGETS
// ======================================================

function updateCategoryBudgets() {

    const list =
        document.getElementById(
            "categoryBudgetList"
        );

    if (!list) return;


    list.innerHTML = "";


    const categories =
        Object.keys(
            categoryBudgets
        );


    if (
        categories.length === 0
    ) {

        list.innerHTML =
            "<p>No category budgets set yet.</p>";

        return;
    }


    categories.forEach(
        function(category) {

            const limit =
                Number(
                    categoryBudgets[
                        category
                    ]
                );


            const spent =
                getCategorySpent(
                    category
                );


            const remaining =
                limit -
                spent;


            let percentage =
                0;


            if (
                limit > 0
            ) {

                percentage =
                    (
                        spent /
                        limit
                    ) *
                    100;
            }


            const displayPercentage =
                Math.max(
                    0,
                    Math.min(
                        percentage,
                        100
                    )
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "category-budget-item";


            let statusText = "";


            if (
                spent > limit
            ) {

                statusText =
                    "⚠️ Over budget by ₹" +
                    (
                        spent - limit
                    ).toFixed(2);

            } else if (
                spent === limit
            ) {

                statusText =
                    "⚠️ Budget reached";

            } else {

                statusText =
                    "₹" +
                    remaining.toFixed(2) +
                    " remaining";
            }


            item.innerHTML =
                "<h3>" +
                escapeHTML(
                    category
                ) +
                "</h3>" +

                "<p>Budget: ₹" +
                limit.toFixed(2) +
                "</p>" +

                "<p>Spent: ₹" +
                spent.toFixed(2) +
                "</p>" +

                "<p>" +
                statusText +
                "</p>" +

                "<div class=\"budget-progress\">" +

                "<div class=\"budget-progress-fill\" " +
                "style=\"width:" +
                displayPercentage +
                "%\"></div>" +

                "</div>" +

                "<button type=\"button\" onclick=\"deleteCategoryBudget('" +
                escapeJSString(
                    category
                ) +
                "')\">" +

                "🗑️ Remove Budget" +

                "</button>";


            list.appendChild(
                item
            );
        }
    );
}


// ======================================================
// DELETE CATEGORY BUDGET
// ======================================================

function deleteCategoryBudget(
    category
) {

    if (
        categoryBudgets[
            category
        ] === undefined
    ) {

        return;
    }


    delete categoryBudgets[
        category
    ];


    saveData();

    updateAll();


    showToast(
        category +
        " budget removed!",
        "🗑️"
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ======================================================
// ESCAPE JAVASCRIPT STRING
// ======================================================

function escapeJSString(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );
}


// ======================================================
// ANALYTICS SUMMARY
// ======================================================

function displayAnalyticsSummary() {

    const summary =
        document.getElementById(
            "analyticsCategorySummary"
        );

    if (!summary) return;


    const totals =
        getCategoryTotals();


    const categories =
        Object.keys(
            totals
        );


    if (
        categories.length === 0
    ) {

        summary.innerHTML =
            "<p>No expense data available yet.</p>";

        return;
    }


    categories.sort(
        function(a, b) {

            return (
                totals[b] -
                totals[a]
            );
        }
    );


    let html = "";


    categories.forEach(
        function(category) {

            const amount =
                totals[
                    category
                ];


            const percentage =
                total > 0
                    ? (
                        amount /
                        total
                    ) *
                    100
                    : 0;


            html +=
                "<div>" +

                "<strong>" +
                escapeHTML(
                    category
                ) +
                "</strong>" +

                ": ₹" +
                amount.toFixed(2) +

                " (" +
                percentage.toFixed(1) +
                "%)" +

                "</div>";
        }
    );


    summary.innerHTML =
        html;
}


// ======================================================
// CHART
// ======================================================

function updateChart() {

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


    const totals =
        getCategoryTotals();


    const labels =
        Object.keys(
            totals
        );


    const data =
        labels.map(
            function(category) {

                return totals[
                    category
                ];
            }
        );


    if (expenseChart) {

        expenseChart.destroy();

        expenseChart =
            null;
    }


    if (
        labels.length === 0
    ) {

        return;
    }


    expenseChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            data: data
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false
                }
            }
        );
}


// ======================================================
// MONEY MOOD
// ======================================================

function updateMoneyMood() {

    const mood =
        document.getElementById(
            "moneyMood"
        );

    if (!mood) return;


    if (
        budget <= 0
    ) {

        mood.textContent =
            "💭 Set a budget to understand your money mood.";

        return;
    }


    const spent =
        getTotalSpent();


    const percentage =
        (
            spent /
            budget
        ) *
        100;


    if (
        percentage > 100
    ) {

        mood.textContent =
            "😟 You've gone over your budget. Time to slow down.";

    } else if (
        percentage >= 80
    ) {

        mood.textContent =
            "😬 You're getting close to your budget limit.";

    } else if (
        percentage >= 50
    ) {

        mood.textContent =
            "🙂 You're halfway through your budget. Keep watching.";

    } else {

        mood.textContent =
            "😎 Great job! You're comfortably within your budget.";
    }
}


// ======================================================
// MONEY MOOD DISPLAY
// ======================================================

function displayMoneyMood() {

    updateMoneyMood();
}


// ======================================================
// SIMULATOR
// ======================================================

function updateSimulator() {

    const slider =
        document.getElementById(
            "savingSlider"
        );

    const savingAmount =
        document.getElementById(
            "savingAmount"
        );

    const monthlySaving =
        document.getElementById(
            "monthlySaving"
        );

    const yearlySaving =
        document.getElementById(
            "yearlySaving"
        );


    if (!slider) return;


    const value =
        Number(
            slider.value
        ) || 0;


    if (savingAmount) {

        savingAmount.textContent =
            "₹" +
            value.toFixed(0);
    }


    if (monthlySaving) {

        monthlySaving.textContent =
            "₹" +
            value.toFixed(0);
    }


    if (yearlySaving) {

        yearlySaving.textContent =
            "₹" +
            (
                value * 12
            ).toFixed(0);
    }


    simulatorUsed = true;


    localStorage.setItem(
        "simulatorUsed",
        "true"
    );
}


// ======================================================
// SETUP SIMULATOR
// ======================================================

function setupSimulator() {

    const slider =
        document.getElementById(
            "savingSlider"
        );

    if (!slider) return;


    slider.addEventListener(
        "input",
        updateSimulator
    );


    updateSimulator();
}
/* =========================================================
   PART 3 OF 3 — FINAL SETUP + JOURNEY + START APP
   ========================================================= */

function updateJourney() {
    const journeyProgress = document.getElementById("journeyProgress");
    const journeyLevel = document.getElementById("journeyLevel");
    const achievements = document.getElementById("achievements");

    if (!journeyProgress && !journeyLevel && !achievements) return;

    let completed = 0;

    if (expenses.length > 0) completed++;
    if (budget > 0) completed++;
    if (analyticsViewed) completed++;
    if (simulatorUsed) completed++;
    if (challengeCompleted) completed++;

    const progress = Math.round((completed / 5) * 100);

    if (journeyProgress) {
        journeyProgress.style.width = progress + "%";
    }

    if (journeyLevel) {
        if (progress === 0) {
            journeyLevel.textContent = "Beginner";
        } else if (progress <= 40) {
            journeyLevel.textContent = "Getting Started";
        } else if (progress <= 80) {
            journeyLevel.textContent = "Money Manager";
        } else {
            journeyLevel.textContent = "Financial Pro";
        }
    }

    if (achievements) {
        achievements.innerHTML = `
            <div class="achievement-item ${expenses.length > 0 ? "completed" : ""}">
                ${expenses.length > 0 ? "✓" : "○"} Add your first expense
            </div>

            <div class="achievement-item ${budget > 0 ? "completed" : ""}">
                ${budget > 0 ? "✓" : "○"} Set a monthly budget
            </div>

            <div class="achievement-item ${analyticsViewed ? "completed" : ""}">
                ${analyticsViewed ? "✓" : "○"} Check your analytics
            </div>

            <div class="achievement-item ${simulatorUsed ? "completed" : ""}">
                ${simulatorUsed ? "✓" : "○"} Try the savings simulator
            </div>

            <div class="achievement-item ${challengeCompleted ? "completed" : ""}">
                ${challengeCompleted ? "✓" : "○"} Complete the savings challenge
            </div>
        `;
    }
}


/* ---------- SAVINGS CHALLENGE ---------- */

function completeSavingsChallenge() {
    if (challengeCompleted) {
        showToast("Already completed!", "🏆");
        return;
    }

    challengeCompleted = true;
    localStorage.setItem("challengeCompleted", "true");

    updateJourney();

    showToast("Savings challenge completed! 🎉", "🏆");
}


/* Compatibility with older button/function names */
function completeChallenge() {
    completeSavingsChallenge();
}


/* ---------- DATE SETUP ---------- */

function setupDate() {
    const dateInput = document.getElementById("expenseDate");

    if (dateInput && !dateInput.value) {
        dateInput.value = getTodayDate();
    }
}


/* ---------- ENTER KEY SUPPORT ---------- */

function setupInputSupport() {
    const budgetInput = document.getElementById("budgetAmount");
    const categoryAmount = document.getElementById("categoryBudgetAmount");

    if (budgetInput) {
        budgetInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                setBudget();
            }
        });
    }

    if (categoryAmount) {
        categoryAmount.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                setCategoryBudget();
            }
        });
    }
}


/* ---------- UPDATE EVERYTHING ---------- */

function updateAll() {
    displayExpenses();
    updateBudget();
    updateCategoryBudgets();
    updateDashboard();
    updateHomeSnapshot();
    displayAnalyticsSummary();
    updateChart();
    displayMoneyMood();
    updateSimulator();
    updateJourney();

    createResetBudgetButton();
}


/* ---------- NAVIGATION ---------- */

function setupNavigation() {
    const validSections = [
        "home",
        "add",
        "expenses",
        "dashboard",
        "analytics"
    ];

    let startingSection = "home";

    const hash = window.location.hash.replace("#", "");

    if (validSections.includes(hash)) {
        startingSection = hash;
    }

    history.replaceState(
        { section: startingSection },
        "",
        "#" + startingSection
    );

    showSection(startingSection, true);

    navigationReady = true;
}


/* ---------- BACK BUTTON SUPPORT ---------- */

window.addEventListener("popstate", function (event) {
    const validSections = [
        "home",
        "add",
        "expenses",
        "dashboard",
        "analytics"
    ];

    const section =
        event.state && validSections.includes(event.state.section)
            ? event.state.section
            : "home";

    showSection(section, true);
});


/* ---------- MARK ANALYTICS AS VISITED ---------- */

const originalShowSection = showSection;

showSection = function (sectionId, fromHistory) {
    originalShowSection(sectionId, fromHistory);

    if (sectionId === "analytics") {
        analyticsViewed = true;
        localStorage.setItem("analyticsViewed", "true");

        setTimeout(function () {
            updateJourney();
        }, 100);
    }
};


/* ---------- START APPLICATION ---------- */

document.addEventListener("DOMContentLoaded", function () {

    setupDate();

    setupInputSupport();

    setupSimulator();

    updateGreeting();

    updateAll();

    setupNavigation();
});


/* Keep greeting updated */
setInterval(updateGreeting, 60000);
