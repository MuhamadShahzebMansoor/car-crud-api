import "./style.css";

const API_URL = "http://localhost:3000";

let currentPage = "login";


/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

function safeValue(value, fallback = "—") {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return String(value);
}


function safeUsername() {

    const username = localStorage.getItem("username");

    return safeValue(username, "User");
}


function safeRole() {

    const role = localStorage.getItem("role");

    return safeValue(role, "customer");
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value ?? "—")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getToken() {

    return localStorage.getItem("token");
}


function getUsername() {

    return localStorage.getItem("username");
}


function getRole() {

    return localStorage.getItem("role");
}


/* =========================================================
   GET USERNAME FROM JWT
========================================================= */

function getUsernameFromToken(token) {

    if (!token) {
        return null;
    }

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return payload.username || null;

    } catch (error) {

        console.error(
            "Could not read username from token."
        );

        return null;
    }
}


/* =========================================================
   SAVE LOGIN DATA
========================================================= */

function saveLoginData(data) {

    const token = data?.token;

    if (token) {

        localStorage.setItem(
            "token",
            token
        );
    }


    /*
       Username can come from:

       1. Login response
       2. JWT token
    */

    let username = data?.username;

    if (!username && token) {

        username =
            getUsernameFromToken(token);
    }

    if (username) {

        localStorage.setItem(
            "username",
            username
        );

    } else {

        localStorage.setItem(
            "username",
            "User"
        );
    }


    /*
       Role can come from the login response.
    */

    const role =
        data?.role || "customer";

    localStorage.setItem(
        "role",
        role
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    showLoginPage();
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    try {

        const response = await fetch(
            `${API_URL}${url}`,
            {
                ...options,
                headers
            }
        );


        let data = null;


        try {

            data = await response.json();

        } catch {

            data = null;
        }


        /*
           Token expired or invalid.
        */

        if (response.status === 401) {

            logout();

            return null;
        }


        return {

            ok: response.ok,

            status: response.status,

            data: data ?? {}

        };


    } catch (error) {

        return {

            ok: false,

            status: 0,

            data: {
                message:
                    "Unable to connect to the server."
            }

        };
    }
}


/* =========================================================
   ICONS
========================================================= */

const icons = {

    car: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 17h14l1-5-2-5H6L4 12l1 5Z"/>
            <path d="M4 12h16"/>
            <path d="M7 17v2"/>
            <path d="M17 17v2"/>
            <circle cx="7" cy="16" r="1"/>
            <circle cx="17" cy="16" r="1"/>
        </svg>
    `,

    users: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="3"/>
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
            <path d="M16 5.5a3 3 0 0 1 0 5.8"/>
            <path d="M18 14.5c1.8.8 3 2.7 3 5"/>
        </svg>
    `,

    plus: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
        </svg>
    `,

    edit: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 6 4 4"/>
            <path d="m4 20 3.5-.7L18.8 8a2 2 0 0 0-2.8-2.8L4.7 16.5 4 20Z"/>
        </svg>
    `,

    trash: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M6 7l1 13h10l1-13"/>
            <path d="M9 7V4h6v3"/>
        </svg>
    `,

    logout: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 5H5v14h5"/>
            <path d="M13 8l4 4-4 4"/>
            <path d="M17 12H9"/>
        </svg>
    `,

    arrow: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14"/>
            <path d="m13 6 6 6-6 6"/>
        </svg>
    `,

    back: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5"/>
            <path d="m11 18-6-6 6-6"/>
        </svg>
    `,

    refresh: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.7-4L3 10"/>
            <path d="M3 5v5h5"/>
            <path d="M4 13a8 8 0 0 0 14.7 4L21 14"/>
            <path d="M21 19v-5h-5"/>
        </svg>
    `,

    shield: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/>
            <path d="m9 12 2 2 4-4"/>
        </svg>
    `,

    dashboard: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="6" height="6" rx="1"/>
            <rect x="14" y="4" width="6" height="6" rx="1"/>
            <rect x="4" y="14" width="6" height="6" rx="1"/>
            <rect x="14" y="14" width="6" height="6" rx="1"/>
        </svg>
    `
};


/* =========================================================
   LOGIN PAGE
========================================================= */

function showLoginPage() {

    currentPage = "login";

    app.innerHTML = `

        <div class="auth-page">

            <div class="auth-decoration auth-decoration-one"></div>
            <div class="auth-decoration auth-decoration-two"></div>

            <div class="auth-box">

                <div class="brand-mark">
                    ${icons.car}
                </div>

                <div class="eyebrow">
                    CAR MANAGEMENT SYSTEM
                </div>

                <h1>Welcome Back</h1>

                <p class="auth-subtitle">
                    Sign in to manage your vehicles and account.
                </p>


                <form id="loginForm">

                    <div class="input-group">

                        <label for="loginUsername">
                            Username
                        </label>

                        <input
                            type="text"
                            id="loginUsername"
                            placeholder="Enter your username"
                            required
                        >

                    </div>


                    <div class="input-group">

                        <label for="loginPassword">
                            Password
                        </label>

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Enter your password"
                            required
                        >

                    </div>


                    <button
                        type="submit"
                        class="primary-button full-button"
                    >

                        <span>Sign In</span>

                        ${icons.arrow}

                    </button>


                    <p
                        id="loginMessage"
                        class="form-message"
                    ></p>

                </form>


                <div class="auth-switch">

                    Don't have an account?

                    <button
                        id="showRegisterBtn"
                        class="link-button"
                    >
                        Create account
                    </button>

                </div>

            </div>

        </div>
    `;


    document
        .getElementById("loginForm")
        .addEventListener(
            "submit",
            handleLogin
        );


    document
        .getElementById("showRegisterBtn")
        .addEventListener(
            "click",
            showRegisterPage
        );
}


/* =========================================================
   REGISTER PAGE
========================================================= */

function showRegisterPage() {

    currentPage = "register";

    app.innerHTML = `

        <div class="auth-page">

            <div class="auth-decoration auth-decoration-one"></div>
            <div class="auth-decoration auth-decoration-two"></div>

            <div class="auth-box">

                <div class="brand-mark">
                    ${icons.car}
                </div>

                <div class="eyebrow">
                    CAR MANAGEMENT SYSTEM
                </div>

                <h1>Create Account</h1>

                <p class="auth-subtitle">
                    Create your customer account to get started.
                </p>


                <form id="registerForm">

                    <div class="input-group">

                        <label for="registerUsername">
                            Username
                        </label>

                        <input
                            type="text"
                            id="registerUsername"
                            placeholder="Choose a username"
                            required
                        >

                    </div>


                    <div class="input-group">

                        <label for="registerPassword">
                            Password
                        </label>

                        <input
                            type="password"
                            id="registerPassword"
                            placeholder="Create a password"
                            required
                        >

                    </div>


                    <button
                        type="submit"
                        class="primary-button full-button"
                    >

                        <span>Create Account</span>

                        ${icons.arrow}

                    </button>


                    <p
                        id="registerMessage"
                        class="form-message"
                    ></p>

                </form>


                <div class="auth-switch">

                    Already have an account?

                    <button
                        id="showLoginBtn"
                        class="link-button"
                    >
                        Sign in
                    </button>

                </div>

            </div>

        </div>
    `;


    document
        .getElementById("registerForm")
        .addEventListener(
            "submit",
            handleRegister
        );


    document
        .getElementById("showLoginBtn")
        .addEventListener(
            "click",
            showLoginPage
        );
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

    event.preventDefault();


    const username = document
        .getElementById("loginUsername")
        .value
        .trim();


    const password = document
        .getElementById("loginPassword")
        .value;


    const message =
        document.getElementById("loginMessage");


    setMessage(
        message,
        "Signing in..."
    );


    try {

        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        let data = {};

        try {

            data = await response.json();

        } catch {

            data = {};
        }


        if (!response.ok) {

            setMessage(
                message,
                safeValue(
                    data.message,
                    "Login failed."
                ),
                "error"
            );

            return;
        }


        saveLoginData(data);


        setMessage(
            message,
            "Login successful.",
            "success"
        );


        setTimeout(() => {

            if (getRole() === "owner") {

                showOwnerDashboard();

            } else {

                showCustomerDashboard();
            }

        }, 400);


    } catch (error) {

        setMessage(
            message,
            "Unable to connect to the server.",
            "error"
        );
    }
}


/* =========================================================
   REGISTER
========================================================= */

async function handleRegister(event) {

    event.preventDefault();


    const username = document
        .getElementById("registerUsername")
        .value
        .trim();


    const password = document
        .getElementById("registerPassword")
        .value;


    const message =
        document.getElementById(
            "registerMessage"
        );


    setMessage(
        message,
        "Creating account..."
    );


    try {

        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        let data = {};

        try {

            data = await response.json();

        } catch {

            data = {};
        }


        if (!response.ok) {

            setMessage(
                message,
                safeValue(
                    data.message,
                    "Registration failed."
                ),
                "error"
            );

            return;
        }


        setMessage(
            message,
            "Account created successfully.",
            "success"
        );


        setTimeout(() => {

            showLoginPage();

        }, 700);


    } catch (error) {

        setMessage(
            message,
            "Unable to connect to the server.",
            "error"
        );
    }
}


/* =========================================================
   HEADER
========================================================= */

function createHeader(
    title,
    subtitle
) {

    const username =
        safeUsername();


    const role =
        safeRole();


    const displayRole =
        role.toLowerCase() === "owner"
            ? "Owner"
            : "Customer";


    const avatarLetter =
        username !== "User"
            ? username.charAt(0).toUpperCase()
            : "U";


    return `

        <header class="top-header">


            <div class="header-brand">

                <div class="header-logo">
                    ${icons.car}
                </div>


                <div>

                    <div class="header-brand-name">
                        CarManager
                    </div>

                    <div class="header-brand-subtitle">
                        Management System
                    </div>

                </div>

            </div>


            <div class="header-user">


                <div class="user-info">

                    <div class="user-avatar">
                        ${escapeHTML(
                            avatarLetter
                        )}
                    </div>


                    <div class="user-details">

                        <strong>
                            ${escapeHTML(
                                username
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                displayRole
                            )}
                        </span>

                    </div>

                </div>


                <button
                    id="logoutBtn"
                    class="logout-button"
                    title="Logout"
                >

                    ${icons.logout}

                    <span>Logout</span>

                </button>

            </div>

        </header>


        <div class="page-heading">

            <div>

                <div class="page-eyebrow">

                    ${
                        role.toLowerCase() === "owner"
                            ? "OWNER PORTAL"
                            : "CUSTOMER PORTAL"
                    }

                </div>


                <h1>
                    ${escapeHTML(
                        safeValue(
                            title,
                            "Dashboard"
                        )
                    )}
                </h1>


                <p>
                    ${escapeHTML(
                        safeValue(
                            subtitle,
                            ""
                        )
                    )}
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   OWNER DASHBOARD
========================================================= */

function showOwnerDashboard() {

    currentPage =
        "owner-dashboard";


    const username =
        safeUsername();


    app.innerHTML = `

        <div class="dashboard-page">


            ${createHeader(
                "Dashboard",
                "Manage your vehicles and customers from one place."
            )}


            <main class="dashboard-content">


                <section class="welcome-card">


                    <div class="welcome-text">

                        <span class="welcome-label">
                            Welcome back
                        </span>


                        <h2>
                            ${escapeHTML(
                                username
                            )}
                        </h2>


                        <p>
                            Everything you need to manage your
                            car management system is right here.
                        </p>

                    </div>


                    <div class="welcome-icon">
                        ${icons.dashboard}
                    </div>

                </section>


                <section class="stats-grid">


                    <div class="stat-card">

                        <div class="stat-icon">
                            ${icons.car}
                        </div>


                        <div>

                            <span>
                                Vehicle Management
                            </span>

                            <strong>
                                Cars
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon customer-stat">
                            ${icons.users}
                        </div>


                        <div>

                            <span>
                                Account Management
                            </span>

                            <strong>
                                Customers
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon security-stat">
                            ${icons.shield}
                        </div>


                        <div>

                            <span>
                                Access Level
                            </span>

                            <strong>
                                Owner
                            </strong>

                        </div>

                    </div>

                </section>


                <section class="dashboard-section">


                    <div class="section-heading">

                        <div>

                            <span class="section-eyebrow">
                                MANAGEMENT
                            </span>

                            <h2>
                                Choose an area
                            </h2>

                            <p>
                                Select what you want to manage.
                            </p>

                        </div>

                    </div>


                    <div class="dashboard-options">


                        <button
                            id="showCarsBtn"
                            class="dashboard-card"
                        >

                            <div class="dashboard-card-icon">
                                ${icons.car}
                            </div>


                            <div class="dashboard-card-content">

                                <span>
                                    Manage
                                </span>

                                <h3>
                                    Cars
                                </h3>

                                <p>
                                    View, add, update and delete
                                    vehicles.
                                </p>

                            </div>


                            <div class="card-arrow">
                                ${icons.arrow}
                            </div>

                        </button>


                        <button
                            id="showCustomersBtn"
                            class="dashboard-card customer-card"
                        >

                            <div class="dashboard-card-icon">
                                ${icons.users}
                            </div>


                            <div class="dashboard-card-content">

                                <span>
                                    Manage
                                </span>

                                <h3>
                                    Customers
                                </h3>

                                <p>
                                    View and manage customer
                                    accounts.
                                </p>

                            </div>


                            <div class="card-arrow">
                                ${icons.arrow}
                            </div>

                        </button>

                    </div>

                </section>

            </main>

        </div>
    `;


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById("showCarsBtn")
        .addEventListener(
            "click",
            showCarsPage
        );


    document
        .getElementById("showCustomersBtn")
        .addEventListener(
            "click",
            showCustomersPage
        );
}


/* =========================================================
   CUSTOMER DASHBOARD
========================================================= */

function showCustomerDashboard() {

    currentPage =
        "customer-dashboard";


    const username =
        safeUsername();


    app.innerHTML = `

        <div class="dashboard-page">


            ${createHeader(
                "Dashboard",
                "View available vehicles and manage your account."
            )}


            <main class="dashboard-content">


                <section class="welcome-card">


                    <div class="welcome-text">

                        <span class="welcome-label">
                            Welcome back
                        </span>


                        <h2>
                            ${escapeHTML(
                                username
                            )}
                        </h2>


                        <p>
                            Browse the available vehicles
                            in the system.
                        </p>

                    </div>


                    <div class="welcome-icon">
                        ${icons.car}
                    </div>

                </section>


                <section class="stats-grid customer-stats">


                    <div class="stat-card">

                        <div class="stat-icon">
                            ${icons.car}
                        </div>


                        <div>

                            <span>
                                Available Action
                            </span>

                            <strong>
                                View Cars
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon customer-stat">
                            ${icons.users}
                        </div>


                        <div>

                            <span>
                                Account Type
                            </span>

                            <strong>
                                Customer
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon security-stat">
                            ${icons.shield}
                        </div>


                        <div>

                            <span>
                                Authentication
                            </span>

                            <strong>
                                Secure
                            </strong>

                        </div>

                    </div>

                </section>


                <section class="dashboard-section">


                    <div class="section-heading">

                        <div>

                            <span class="section-eyebrow">
                                VEHICLES
                            </span>

                            <h2>
                                Explore Cars
                            </h2>

                            <p>
                                View all vehicles currently
                                available in the system.
                            </p>

                        </div>

                    </div>


                    <button
                        id="customerCarsButton"
                        class="dashboard-card customer-main-card"
                    >

                        <div class="dashboard-card-icon">
                            ${icons.car}
                        </div>


                        <div class="dashboard-card-content">

                            <span>
                                Browse
                            </span>

                            <h3>
                                View Cars
                            </h3>

                            <p>
                                See vehicle brands, models
                                and years.
                            </p>

                        </div>


                        <div class="card-arrow">
                            ${icons.arrow}
                        </div>

                    </button>

                </section>

            </main>

        </div>
    `;


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById("customerCarsButton")
        .addEventListener(
            "click",
            showCustomerCarsPage
        );
}


/* =========================================================
   CARS PAGE
========================================================= */

function showCarsPage() {

    currentPage = "cars";


    app.innerHTML = `

        <div class="dashboard-page">


            ${createHeader(
                "Cars",
                "Manage all vehicles in your system."
            )}


            <main class="content-page">


                <button
                    id="backToDashboardFromCars"
                    class="back-button"
                >

                    ${icons.back}

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <section class="content-hero">


                    <div class="content-hero-icon">
                        ${icons.car}
                    </div>


                    <div>

                        <span>
                            VEHICLE MANAGEMENT
                        </span>

                        <h2>
                            Car Inventory
                        </h2>

                        <p>
                            View and manage all registered vehicles.
                        </p>

                    </div>

                </section>


                <section class="section">


                    <div class="section-heading compact">

                        <div>

                            <span class="section-eyebrow">
                                DATABASE
                            </span>

                            <h2>
                                All Cars
                            </h2>

                        </div>


                        <button
                            id="getCarsBtn"
                            class="secondary-button"
                        >

                            ${icons.refresh}

                            <span>
                                Load Cars
                            </span>

                        </button>

                    </div>


                    <div
                        id="ownerCarsList"
                        class="car-grid"
                    ></div>

                </section>


                <div class="forms-grid">


                    <section class="section form-section">


                        <div class="form-section-header">

                            <div class="form-icon add-icon">
                                ${icons.plus}
                            </div>


                            <div>

                                <span>
                                    CREATE
                                </span>

                                <h2>
                                    Add New Car
                                </h2>

                            </div>

                        </div>


                        <form id="addCarForm">


                            <div class="input-group">

                                <label for="addBrand">
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    id="addBrand"
                                    placeholder="e.g. BMW"
                                    required
                                >

                            </div>


                            <div class="input-group">

                                <label for="addModel">
                                    Model
                                </label>

                                <input
                                    type="text"
                                    id="addModel"
                                    placeholder="e.g. M5"
                                    required
                                >

                            </div>


                            <div class="input-group">

                                <label for="addYear">
                                    Year
                                </label>

                                <input
                                    type="number"
                                    id="addYear"
                                    placeholder="e.g. 2025"
                                    required
                                >

                            </div>


                            <button
                                type="submit"
                                class="primary-button"
                            >

                                ${icons.plus}

                                <span>
                                    Add Car
                                </span>

                            </button>


                            <p
                                id="addCarMessage"
                                class="form-message"
                            ></p>

                        </form>

                    </section>


                    <section class="section form-section">


                        <div class="form-section-header">

                            <div class="form-icon edit-icon">
                                ${icons.edit}
                            </div>


                            <div>

                                <span>
                                    UPDATE
                                </span>

                                <h2>
                                    Update Car
                                </h2>

                            </div>

                        </div>


                        <form id="updateCarForm">


                            <div class="input-group">

                                <label for="updateId">
                                    Car ID
                                </label>

                                <input
                                    type="number"
                                    id="updateId"
                                    placeholder="Enter car ID"
                                    required
                                >

                            </div>


                            <div class="input-group">

                                <label for="updateBrand">
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    id="updateBrand"
                                    placeholder="New brand"
                                    required
                                >

                            </div>


                            <div class="input-group">

                                <label for="updateModel">
                                    Model
                                </label>

                                <input
                                    type="text"
                                    id="updateModel"
                                    placeholder="New model"
                                    required
                                >

                            </div>


                            <div class="input-group">

                                <label for="updateYear">
                                    Year
                                </label>

                                <input
                                    type="number"
                                    id="updateYear"
                                    placeholder="New year"
                                    required
                                >

                            </div>


                            <button
                                type="submit"
                                class="secondary-button"
                            >

                                ${icons.edit}

                                <span>
                                    Update Car
                                </span>

                            </button>


                            <p
                                id="updateCarMessage"
                                class="form-message"
                            ></p>

                        </form>

                    </section>


                    <section
                        class="section form-section danger-section"
                    >


                        <div class="form-section-header">

                            <div class="form-icon delete-icon">
                                ${icons.trash}
                            </div>


                            <div>

                                <span>
                                    REMOVE
                                </span>

                                <h2>
                                    Delete Car
                                </h2>

                            </div>

                        </div>


                        <form id="deleteCarForm">


                            <div class="input-group">

                                <label for="deleteId">
                                    Car ID
                                </label>

                                <input
                                    type="number"
                                    id="deleteId"
                                    placeholder="Enter car ID"
                                    required
                                >

                            </div>


                            <button
                                type="submit"
                                class="danger-button"
                            >

                                ${icons.trash}

                                <span>
                                    Delete Car
                                </span>

                            </button>


                            <p
                                id="deleteCarMessage"
                                class="form-message"
                            ></p>

                        </form>

                    </section>

                </div>

            </main>

        </div>
    `;


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById(
            "backToDashboardFromCars"
        )
        .addEventListener(
            "click",
            showOwnerDashboard
        );


    document
        .getElementById("getCarsBtn")
        .addEventListener(
            "click",
            getOwnerCars
        );


    document
        .getElementById("addCarForm")
        .addEventListener(
            "submit",
            addCar
        );


    document
        .getElementById("updateCarForm")
        .addEventListener(
            "submit",
            updateCar
        );


    document
        .getElementById("deleteCarForm")
        .addEventListener(
            "submit",
            deleteCar
        );


    getOwnerCars();
}


/* =========================================================
   GET OWNER CARS
========================================================= */

async function getOwnerCars() {

    const list =
        document.getElementById(
            "ownerCarsList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="loading-state">

            <div class="spinner"></div>

            <span>
                Loading cars...
            </span>

        </div>
    `;


    const result =
        await apiRequest("/cars");


    if (!result) {
        return;
    }


    if (!result.ok) {

        list.innerHTML = `

            <div class="empty-state error-state">

                ${escapeHTML(
                    safeValue(
                        result.data?.message,
                        "Unable to load cars."
                    )
                )}

            </div>
        `;

        return;
    }


    /*
       Normally /cars returns an array.

       This also safely handles:
       { cars: [...] }
    */

    const cars =
        Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data?.cars)
                ? result.data.cars
                : [];


    renderCars(
        list,
        cars
    );
}


/* =========================================================
   RENDER CARS
========================================================= */

function renderCars(
    container,
    cars
) {

    if (
        !Array.isArray(cars) ||
        cars.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ${icons.car}
                </div>

                <h3>
                    No cars found
                </h3>

                <p>
                    There are currently no vehicles
                    in the system.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        cars.map(car => {

            const id =
                safeValue(
                    car?.id
                );

            const brand =
                safeValue(
                    car?.brand
                );

            const model =
                safeValue(
                    car?.model
                );

            const year =
                safeValue(
                    car?.year
                );


            return `

                <article class="car-card">


                    <div class="car-card-top">


                        <div class="car-icon">
                            ${icons.car}
                        </div>


                        <span class="car-id">

                            ID #${escapeHTML(
                                id
                            )}

                        </span>

                    </div>


                    <div class="car-info">


                        <span class="car-label">
                            VEHICLE
                        </span>


                        <h3>

                            ${escapeHTML(
                                brand
                            )}

                            ${escapeHTML(
                                model
                            )}

                        </h3>


                        <div class="car-meta">


                            <div>

                                <span>
                                    Brand
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        brand
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Model
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        model
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Year
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        year
                                    )}
                                </strong>

                            </div>


                        </div>

                    </div>

                </article>

            `;
        }).join("");
}


/* =========================================================
   ADD CAR
========================================================= */

async function addCar(event) {

    event.preventDefault();


    const brand =
        document
            .getElementById("addBrand")
            .value
            .trim();


    const model =
        document
            .getElementById("addModel")
            .value
            .trim();


    const year =
        Number(
            document
                .getElementById("addYear")
                .value
        );


    const message =
        document.getElementById(
            "addCarMessage"
        );


    setMessage(
        message,
        "Adding car..."
    );


    const result =
        await apiRequest(
            "/cars",
            {

                method: "POST",

                body: JSON.stringify({
                    brand,
                    model,
                    year
                })

            }
        );


    if (!result) {
        return;
    }


    if (!result.ok) {

        setMessage(
            message,
            safeValue(
                result.data?.message,
                "Failed to add car."
            ),
            "error"
        );

        return;
    }


    setMessage(
        message,
        "Car added successfully.",
        "success"
    );


    document
        .getElementById(
            "addCarForm"
        )
        .reset();


    getOwnerCars();
}


/* =========================================================
   UPDATE CAR
========================================================= */

async function updateCar(event) {

    event.preventDefault();


    const id =
        Number(
            document
                .getElementById("updateId")
                .value
        );


    const brand =
        document
            .getElementById("updateBrand")
            .value
            .trim();


    const model =
        document
            .getElementById("updateModel")
            .value
            .trim();


    const year =
        Number(
            document
                .getElementById("updateYear")
                .value
        );


    const message =
        document.getElementById(
            "updateCarMessage"
        );


    setMessage(
        message,
        "Updating car..."
    );


    const result =
        await apiRequest(
            `/cars/${id}`,
            {

                method: "PUT",

                body: JSON.stringify({
                    brand,
                    model,
                    year
                })

            }
        );


    if (!result) {
        return;
    }


    if (!result.ok) {

        setMessage(
            message,
            safeValue(
                result.data?.message,
                "Failed to update car."
            ),
            "error"
        );

        return;
    }


    setMessage(
        message,
        "Car updated successfully.",
        "success"
    );


    document
        .getElementById(
            "updateCarForm"
        )
        .reset();


    getOwnerCars();
}


/* =========================================================
   DELETE CAR
========================================================= */

async function deleteCar(event) {

    event.preventDefault();


    const id =
        Number(
            document
                .getElementById("deleteId")
                .value
        );


    const message =
        document.getElementById(
            "deleteCarMessage"
        );


    setMessage(
        message,
        "Deleting car..."
    );


    const result =
        await apiRequest(
            `/cars/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!result) {
        return;
    }


    if (!result.ok) {

        setMessage(
            message,
            safeValue(
                result.data?.message,
                "Failed to delete car."
            ),
            "error"
        );

        return;
    }


    setMessage(
        message,
        "Car deleted successfully.",
        "success"
    );


    document
        .getElementById(
            "deleteCarForm"
        )
        .reset();


    getOwnerCars();
}


/* =========================================================
   CUSTOMERS PAGE
========================================================= */

function showCustomersPage() {

    currentPage =
        "customers";


    app.innerHTML = `

        <div class="dashboard-page">


            ${createHeader(
                "Customers",
                "View and manage customer accounts."
            )}


            <main class="content-page">


                <button
                    id="backToDashboardFromCustomers"
                    class="back-button"
                >

                    ${icons.back}

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <section
                    class="content-hero customer-hero"
                >

                    <div class="content-hero-icon">
                        ${icons.users}
                    </div>


                    <div>

                        <span>
                            CUSTOMER MANAGEMENT
                        </span>

                        <h2>
                            Customer Accounts
                        </h2>

                        <p>
                            View registered customers and
                            remove accounts when necessary.
                        </p>

                    </div>

                </section>


                <section class="section">


                    <div class="section-heading compact">


                        <div>

                            <span class="section-eyebrow">
                                ACCOUNTS
                            </span>

                            <h2>
                                Customers
                            </h2>

                        </div>


                        <button
                            id="getCustomersBtn"
                            class="secondary-button"
                        >

                            ${icons.refresh}

                            <span>
                                Load Customers
                            </span>

                        </button>

                    </div>


                    <div
                        id="customersList"
                        class="customers-list"
                    ></div>

                </section>


                <section
                    class="section form-section danger-section customer-delete-section"
                >


                    <div class="form-section-header">


                        <div class="form-icon delete-icon">
                            ${icons.trash}
                        </div>


                        <div>

                            <span>
                                REMOVE ACCOUNT
                            </span>

                            <h2>
                                Delete Customer
                            </h2>

                        </div>

                    </div>


                    <form id="deleteCustomerForm">


                        <div class="input-group">

                            <label
                                for="deleteCustomerUsername"
                            >
                                Customer Username
                            </label>


                            <input
                                type="text"
                                id="deleteCustomerUsername"
                                placeholder="Enter username"
                                required
                            >

                        </div>


                        <button
                            type="submit"
                            class="danger-button"
                        >

                            ${icons.trash}

                            <span>
                                Delete Customer
                            </span>

                        </button>


                        <p
                            id="deleteCustomerMessage"
                            class="form-message"
                        ></p>

                    </form>

                </section>

            </main>

        </div>
    `;


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById(
            "backToDashboardFromCustomers"
        )
        .addEventListener(
            "click",
            showOwnerDashboard
        );


    document
        .getElementById("getCustomersBtn")
        .addEventListener(
            "click",
            getCustomers
        );


    document
        .getElementById(
            "deleteCustomerForm"
        )
        .addEventListener(
            "submit",
            deleteCustomer
        );


    getCustomers();
}


/* =========================================================
   GET CUSTOMERS
========================================================= */

async function getCustomers() {

    const list =
        document.getElementById(
            "customersList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="loading-state">

            <div class="spinner"></div>

            <span>
                Loading customers...
            </span>

        </div>
    `;


    const result =
        await apiRequest("/users");


    if (!result) {
        return;
    }


    if (!result.ok) {

        list.innerHTML = `

            <div class="empty-state error-state">

                ${escapeHTML(
                    safeValue(
                        result.data?.message,
                        "Unable to load customers."
                    )
                )}

            </div>
        `;

        return;
    }


    const customers =
        Array.isArray(result.data)
            ? result.data
            : Array.isArray(
                result.data?.customers
            )
                ? result.data.customers
                : [];


    renderCustomers(
        list,
        customers
    );
}


/* =========================================================
   RENDER CUSTOMERS
========================================================= */

function renderCustomers(
    container,
    customers
) {

    if (
        !Array.isArray(customers) ||
        customers.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ${icons.users}
                </div>

                <h3>
                    No customers found
                </h3>

                <p>
                    There are currently no customer
                    accounts.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        customers.map(customer => {

            const username =
                safeValue(
                    customer?.username
                );


            const role =
                safeValue(
                    customer?.role,
                    "customer"
                );


            const avatarLetter =
                username !== "—"
                    ? username
                        .charAt(0)
                        .toUpperCase()
                    : "U";


            return `

                <article class="customer-card">


                    <div class="customer-avatar">

                        ${escapeHTML(
                            avatarLetter
                        )}

                    </div>


                    <div class="customer-info">


                        <span>
                            CUSTOMER ACCOUNT
                        </span>


                        <h3>
                            ${escapeHTML(
                                username
                            )}
                        </h3>


                        <p>

                            Role:

                            <strong>
                                ${escapeHTML(
                                    role
                                )}
                            </strong>

                        </p>

                    </div>


                    <div class="customer-status">

                        <span class="status-dot"></span>

                        Active

                    </div>

                </article>

            `;
        }).join("");
}


/* =========================================================
   DELETE CUSTOMER
========================================================= */

async function deleteCustomer(event) {

    event.preventDefault();


    const username =
        document
            .getElementById(
                "deleteCustomerUsername"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "deleteCustomerMessage"
        );


    setMessage(
        message,
        "Deleting customer..."
    );


    const result =
        await apiRequest(
            `/users/${encodeURIComponent(username)}`,
            {
                method: "DELETE"
            }
        );


    if (!result) {
        return;
    }


    if (!result.ok) {

        setMessage(
            message,
            safeValue(
                result.data?.message,
                "Failed to delete customer."
            ),
            "error"
        );

        return;
    }


    setMessage(
        message,
        "Customer deleted successfully.",
        "success"
    );


    document
        .getElementById(
            "deleteCustomerForm"
        )
        .reset();


    getCustomers();
}


/* =========================================================
   CUSTOMER CARS PAGE
========================================================= */

function showCustomerCarsPage() {

    currentPage =
        "customer-cars";


    app.innerHTML = `

        <div class="dashboard-page">


            ${createHeader(
                "Available Cars",
                "Browse vehicles currently available in the system."
            )}


            <main class="content-page">


                <button
                    id="backToDashboardFromCustomerCars"
                    class="back-button"
                >

                    ${icons.back}

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <section class="content-hero">


                    <div class="content-hero-icon">
                        ${icons.car}
                    </div>


                    <div>

                        <span>
                            VEHICLE CATALOG
                        </span>

                        <h2>
                            Available Cars
                        </h2>

                        <p>
                            Browse the current vehicle collection.
                        </p>

                    </div>

                </section>


                <section class="section">


                    <div class="section-heading compact">


                        <div>

                            <span class="section-eyebrow">
                                VEHICLES
                            </span>

                            <h2>
                                Car Collection
                            </h2>

                        </div>


                        <button
                            id="getCustomerCarsBtn"
                            class="secondary-button"
                        >

                            ${icons.refresh}

                            <span>
                                Refresh
                            </span>

                        </button>

                    </div>


                    <div
                        id="customerCarsList"
                        class="car-grid"
                    ></div>

                </section>

            </main>

        </div>
    `;


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById(
            "backToDashboardFromCustomerCars"
        )
        .addEventListener(
            "click",
            showCustomerDashboard
        );


    document
        .getElementById(
            "getCustomerCarsBtn"
        )
        .addEventListener(
            "click",
            getCustomerCars
        );


    getCustomerCars();
}


/* =========================================================
   GET CUSTOMER CARS
========================================================= */

async function getCustomerCars() {

    const list =
        document.getElementById(
            "customerCarsList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="loading-state">

            <div class="spinner"></div>

            <span>
                Loading cars...
            </span>

        </div>
    `;


    const result =
        await apiRequest("/cars");


    if (!result) {
        return;
    }


    if (!result.ok) {

        list.innerHTML = `

            <div class="empty-state error-state">

                ${escapeHTML(
                    safeValue(
                        result.data?.message,
                        "Unable to load cars."
                    )
                )}

            </div>
        `;

        return;
    }


    const cars =
        Array.isArray(result.data)
            ? result.data
            : Array.isArray(
                result.data?.cars
            )
                ? result.data.cars
                : [];


    renderCars(
        list,
        cars
    );
}


/* =========================================================
   MESSAGE HELPER
========================================================= */

function setMessage(
    element,
    text,
    type = ""
) {

    if (!element) {
        return;
    }


    element.className =
        "form-message";


    if (type) {

        element.classList.add(
            type
        );
    }


    element.textContent =
        safeValue(
            text,
            ""
        );
}


/* =========================================================
   START APPLICATION
========================================================= */

function startApp() {

    const token =
        getToken();


    const role =
        getRole();


    if (!token) {

        showLoginPage();

        return;
    }


    if (
        role === "owner"
    ) {

        showOwnerDashboard();

        return;
    }


    if (
        role === "customer"
    ) {

        showCustomerDashboard();

        return;
    }


    /*
       If localStorage contains an invalid
       or incomplete login, clear it.
    */

    logout();
}


/* =========================================================
   START
========================================================= */

startApp();

