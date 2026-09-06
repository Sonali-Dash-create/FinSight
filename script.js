// ======================================================
// FINSIGHT - JAVASCRIPT
// PART 1 OF 2
// ======================================================


// ======================================================
// GET TODAY'S DATE
// ======================================================

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// ======================================================
// DATA
// ======================================================

let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];

let total = 0;

let expenseChart = null;

let analyticsViewed =
    localStorage.getItem("analyticsViewed") === "true";

let simulatorUsed =
    localStorage.getItem("simulatorUsed") === "true";

let challengeCompleted =
    localStorage.getItem("challengeCompleted") === "true";


// ======================================================
// SET DEFAULT DATE
// ======================================================

const expenseDate =
    document.getElementById("expenseDate");

if (expenseDate) {
    expenseDate.value = getTodayDate();
}


// ======================================================
// NAVIGATION
// ======================================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".app-section");

    sections.forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });


    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    // Bottom navigation

    const navButtons =
        document.querySelectorAll(".nav-btn");

    navButtons.forEach(function(button) {

        button.classList.remove("active");

    });


    navButtons.forEach(function(button) {

        if (
            button.getAttribute("onclick") ===
            "showSection('" + sectionId + "')"
        ) {

            button.classList.add("active");

        }

    });


    // Special sections

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

}


// ======================================================
// TOAST MESSAGE
// ======================================================

function showToast(message, icon) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const toastIcon =
        document.getElementById("toastIcon");


    if (!toast) {
        return;
    }


    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon || "✅";


    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2000);

}


// ======================================================
// ADD EXPENSE
// ======================================================

function addExpense() {

    const name =
        document
        .getElementById("expenseName")
        .value
        .trim();


    const amount =
        document
        .getElementById("expenseAmount")
        .value;


    const category =
        document
        .getElementById("expenseCategory")
        .value;


    const date =
        document
        .getElementById("expenseDate")
        .value;


    // Validation

    if (
        name === "" ||
        amount === "" ||
        date === "" ||
        category === "Select Category"
    ) {

        showToast(
            "Please fill all the fields!",
            "⚠️"
        );

        return;

    }


    if (Number(amount) <= 0) {

        showToast(
            "Amount must be greater than 0!",
            "⚠️"
        );

        return;

    }


    // Add expense

    expenses.push({

        name: name,

        amount: Number(amount),

        category: category,

        date: date

    });


    // Save expense

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    // Refresh app

    displayExpenses();


    // Clear fields

    document
        .getElementById("expenseName")
        .value = "";


    document
        .getElementById("expenseAmount")
        .value = "";


    document
        .getElementById("expenseCategory")
        .selectedIndex = 0;


    // Keep today's date

    document
        .getElementById("expenseDate")
        .value = getTodayDate();


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
        document.getElementById(
            "expenseList"
        );


    if (!expenseList) {
        return;
    }


    expenseList.innerHTML = "";

    total = 0;


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


            total =
                total +
                Number(expense.amount);

        }
    );


    const totalAmount =
        document.getElementById(
            "totalAmount"
        );


    if (totalAmount) {

        totalAmount.textContent =
            total;

    }


    displayCategorySummary();

    updateDashboard();

    updateHomeSnapshot();

    displayAnalyticsSummary();

    updateChart();

    displayMoneyMood();

    updateJourney();

}


// ======================================================
// DELETE EXPENSE
// ======================================================

function deleteExpense(index) {

    expenses.splice(index, 1);


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    displayExpenses();


    showToast(
        "Expense deleted!",
        "🗑️"
    );

}


// ======================================================
// CATEGORY TOTALS
// ======================================================

function getCategoryTotals() {

    const categoryTotals = {

        Food: 0,

        Travel: 0,

        Shopping: 0,

        Education: 0,

        Other: 0

    };


    expenses.forEach(
        function(expense) {

            if (
                categoryTotals[
                    expense.category
                ] !== undefined
            ) {

                categoryTotals[
                    expense.category
                ] += Number(
                    expense.amount
                );

            }

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


    if (!categorySummary) {
        return;
    }


    const totals =
        getCategoryTotals();


    categorySummary.innerHTML =

        "<div class=\"category-card\">" +

        "<h2>📂 Category-wise Spending</h2>" +

        "<p>🍔 Food: ₹" +
        totals.Food +
        "</p>" +

        "<p>🚗 Travel: ₹" +
        totals.Travel +
        "</p>" +

        "<p>🛍️ Shopping: ₹" +
        totals.Shopping +
        "</p>" +

        "<p>📚 Education: ₹" +
        totals.Education +
        "</p>" +

        "<p>📦 Other: ₹" +
        totals.Other +
        "</p>" +

        "</div>";

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
            total /
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


    if (homeTotal) {

        homeTotal.textContent =
            total;

    }


    if (homeCount) {

        homeCount.textContent =
            expenses.length;

    }


    if (
        homeTopCategory &&
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

    let highest =
        0;


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


    if (homeTopCategory) {

        homeTopCategory.textContent =
            topCategory;

    }

}

// ======================================================
// FINSIGHT - JAVASCRIPT
// PART 2 OF 2
// ======================================================


// ======================================================
// ANALYTICS CATEGORY SUMMARY
// ======================================================

function displayAnalyticsSummary() {

    const summary =
        document.getElementById(
            "analyticsCategorySummary"
        );

    if (!summary) {
        return;
    }

    const totals =
        getCategoryTotals();

    summary.innerHTML =

        "<div class=\"category-card\">" +

        "<h2>📊 Category Breakdown</h2>" +

        "<p>🍔 Food: ₹" +
        totals.Food +
        "</p>" +

        "<p>🚗 Travel: ₹" +
        totals.Travel +
        "</p>" +

        "<p>🛍️ Shopping: ₹" +
        totals.Shopping +
        "</p>" +

        "<p>📚 Education: ₹" +
        totals.Education +
        "</p>" +

        "<p>📦 Other: ₹" +
        totals.Other +
        "</p>" +

        "</div>";
}


// ======================================================
// PIE CHART
// ======================================================

function updateChart() {

    const canvas =
        document.getElementById(
            "expenseChart"
        );

    if (!canvas) {
        return;
    }


    // If Chart.js has not loaded

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;
    }


    const totals =
        getCategoryTotals();


    const labels = [
        "Food",
        "Travel",
        "Shopping",
        "Education",
        "Other"
    ];


    const values = [

        totals.Food,

        totals.Travel,

        totals.Shopping,

        totals.Education,

        totals.Other

    ];


    const hasExpenses =
        values.some(
            function(value) {
                return value > 0;
            }
        );


    const message =
        document.getElementById(
            "analyticsMessage"
        );


    if (message) {

        if (hasExpenses) {

            message.textContent =
                "Here is where your money is going! 💸";

        } else {

            message.textContent =
                "Add some expenses to see your spending pattern.";

        }

    }


    // Destroy old chart

    if (expenseChart) {

        expenseChart.destroy();

        expenseChart = null;

    }


    // Don't create empty chart

    if (!hasExpenses) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const chartPlugins = [];


    // Add number labels if plugin exists

    if (
        typeof ChartDataLabels !==
        "undefined"
    ) {

        chartPlugins.push(
            ChartDataLabels
        );

    }


    expenseChart =
        new Chart(
            ctx,
            {

                type: "pie",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor: [

                                "#FF6B6B",

                                "#4D96FF",

                                "#FFD93D",

                                "#6BCB77",

                                "#C77DFF"

                            ],

                            borderWidth: 3,

                            borderColor: "#ffffff"

                        }

                    ]

                },


                plugins: chartPlugins,


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            position: "bottom"

                        },


                        datalabels: {

                            color: "#000000",

                            font: {

                                weight: "bold",

                                size: 16

                            },


                            formatter:
                                function(value) {

                                    if (
                                        value <= 0
                                    ) {

                                        return "";

                                    }

                                    return "₹" +
                                        value;

                                }

                        }

                    }

                }

            }
        );

}


// ======================================================
// MONEY MOOD
// ======================================================

function displayMoneyMood() {

    const mood =
        document.getElementById(
            "moneyMood"
        );


    if (!mood) {
        return;
    }


    if (expenses.length === 0) {

        mood.innerHTML =

            "<p>" +
            "Add some expenses and FinSight will " +
            "discover your money personality." +
            "</p>";

        return;

    }


    const totals =
        getCategoryTotals();


    let topCategory =
        "Other";

    let highest =
        0;


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


    let moodTitle =
        "";

    let moodText =
        "";

    let emoji =
        "";


    if (topCategory === "Food") {

        emoji = "🍔";

        moodTitle =
            "The Foodie";

        moodText =
            "Food is currently your biggest spending category. " +
            "You really know how to enjoy the good stuff! 😋";

    }

    else if (
        topCategory === "Shopping"
    ) {

        emoji = "🛍️";

        moodTitle =
            "The Trend Explorer";

        moodText =
            "Shopping is your biggest category. " +
            "You love discovering new things! ✨";

    }

    else if (
        topCategory === "Travel"
    ) {

        emoji = "✈️";

        moodTitle =
            "The Explorer";

        moodText =
            "Travel takes the top spot. " +
            "You value experiences and adventures! 🌍";

    }

    else if (
        topCategory === "Education"
    ) {

        emoji = "📚";

        moodTitle =
            "The Future Builder";

        moodText =
            "Education is your biggest category. " +
            "You're investing in your future! 🚀";

    }

    else {

        emoji = "🌟";

        moodTitle =
            "The Balanced Spender";

        moodText =
            "Your spending is spread across different areas. " +
            "You have a balanced money style! 💰";

    }


    mood.innerHTML =

        "<div class=\"mood-result\">" +

        "<h2>" +
        emoji +
        " " +
        moodTitle +
        "</h2>" +

        "<p>" +
        moodText +
        "</p>" +

        "</div>";

}


// ======================================================
// WHAT-IF SIMULATOR
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


    if (!slider) {
        return;
    }


    const weekly =
        Number(slider.value);


    const monthly =
        weekly * 4.33;


    const yearly =
        weekly * 52;


    if (savingAmount) {

        savingAmount.textContent =
            weekly;

    }


    if (monthlySaving) {

        monthlySaving.textContent =
            Math.round(monthly);

    }


    if (yearlySaving) {

        yearlySaving.textContent =
            Math.round(yearly);

    }

}


// ======================================================
// COMPLETE SIMULATION
// ======================================================

function completeSimulator() {

    simulatorUsed = true;


    localStorage.setItem(
        "simulatorUsed",
        "true"
    );


    showToast(
        "Scenario saved! Small changes can make a big difference. 🚀",
        "🔮"
    );


    updateJourney();

}


// ======================================================
// MONEY JOURNEY
// ======================================================

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


    if (
        !progress ||
        !level ||
        !achievements
    ) {

        return;

    }


    let points =
        0;


    // Add first expense

    if (expenses.length >= 1) {

        points += 20;

    }


    // Add five expenses

    if (expenses.length >= 5) {

        points += 20;

    }


    // View analytics

    if (analyticsViewed) {

        points += 20;

    }


    // Try simulator

    if (simulatorUsed) {

        points += 20;

    }


    // Complete challenge

    if (challengeCompleted) {

        points += 20;

    }


    progress.style.width =
        points + "%";


    if (points >= 100) {

        level.textContent =
            "Level 5 — Money Master 🏆";

    }

    else if (points >= 80) {

        level.textContent =
            "Level 4 — Money Strategist 🚀";

    }

    else if (points >= 60) {

        level.textContent =
            "Level 3 — Smart Spender 💡";

    }

    else if (points >= 40) {

        level.textContent =
            "Level 2 — Money Explorer 🌟";

    }

    else {

        level.textContent =
            "Level 1 — Money Beginner 🌱";

    }


    achievements.innerHTML = "";


    if (expenses.length >= 1) {

        createAchievement(
            "💸",
            "First Expense",
            "You added your first expense!"
        );

    }


    if (expenses.length >= 5) {

        createAchievement(
            "🔥",
            "Expense Tracker",
            "You tracked 5 expenses!"
        );

    }


    if (analyticsViewed) {

        createAchievement(
            "📊",
            "Data Detective",
            "You checked your spending analytics!"
        );

    }


    if (simulatorUsed) {

        createAchievement(
            "🔮",
            "Future Planner",
            "You tried the What-If Simulator!"
        );

    }


    if (challengeCompleted) {

        createAchievement(
            "🏆",
            "Savings Champion",
            "You completed a savings challenge!"
        );

    }

}


// ======================================================
// CREATE ACHIEVEMENT
// ======================================================

function createAchievement(
    icon,
    title,
    description
) {

    const achievements =
        document.getElementById(
            "achievements"
        );


    if (!achievements) {
        return;
    }


    const achievement =
        document.createElement(
            "div"
        );


    achievement.className =
        "achievement";


    achievement.innerHTML =

        "<span class=\"achievement-icon\">" +

        icon +

        "</span>" +

        "<div>" +

        "<strong>" +
        escapeHTML(title) +
        "</strong>" +

        "<p>" +
        escapeHTML(description) +
        "</p>" +

        "</div>";


    achievements.appendChild(
        achievement
    );

}


// ======================================================
// SAVINGS CHALLENGE
// ======================================================

function completeSavingsChallenge() {

    challengeCompleted =
        true;


    localStorage.setItem(
        "challengeCompleted",
        "true"
    );


    showToast(
        "Savings Challenge completed! 🏆",
        "💰"
    );


    updateJourney();

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ======================================================
// ENTER KEY SUPPORT
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            document.activeElement &&
            (
                document.activeElement.id ===
                "expenseName" ||

                document.activeElement.id ===
                "expenseAmount" ||

                document.activeElement.id ===
                "expenseCategory" ||

                document.activeElement.id ===
                "expenseDate"
            )
        ) {

            event.preventDefault();

            addExpense();

        }

    }
);


// ======================================================
// SLIDER SUPPORT
// ======================================================

const savingSlider =
    document.getElementById(
        "savingSlider"
    );
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById("greeting");

    if (hour >= 5 && hour < 12) {
        greeting.textContent = "Good Morning! 👋";
    } else if (hour >= 12 && hour < 17) {
        greeting.textContent = "Good Afternoon! ☀️";
    } else if (hour >= 17 && hour < 21) {
        greeting.textContent = "Good Evening! 🌆";
    } else {
        greeting.textContent = "Good Night! 🌙";
    }
}

updateGreeting();

if (savingSlider) {

    savingSlider.addEventListener(
        "input",
        updateSimulator
    );

}


// ======================================================
// STARTUP
// ======================================================

displayExpenses();

updateDashboard();

updateHomeSnapshot();

displayAnalyticsSummary();

updateSimulator();

updateJourney();

showSection("home");


