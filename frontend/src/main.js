import "./style.css";

const API_URL = "http://localhost:3000";

let currentPage = "login";
let carsRequestInProgress = false;
let customersRequestInProgress = false;

/*
=========================================================
   CAR UPDATE SELECTION
=========================================================
*/

let updateCarSelectionMode = false;
let currentOwnerCars = [];

/*
=========================================================
   GLOBAL EVENT HANDLER STATE
=========================================================
*/

let carsMenuListenerAttached = false;

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
        console.error("Could not read username from token.");
        return null;
    }
}

/* =========================================================
   SAVE LOGIN DATA
========================================================= */

function saveLoginData(data) {
    const token = data?.token;

    if (token) {
        localStorage.setItem("token", token);
    }

    let username = data?.username;

    if (!username && token) {
        username = getUsernameFromToken(token);
    }

    if (username) {
        localStorage.setItem("username", username);
    } else {
        localStorage.setItem("username", "User");
    }

    const role = data?.role || "customer";

    localStorage.setItem("role", role);
}

/* =========================================================
   LOGOUT
========================================================= */

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    updateCarSelectionMode = false;
    currentOwnerCars = [];

    removeCarsMenuListener();

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
        headers.Authorization = `Bearer ${token}`;
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
                message: "Unable to connect to the server."
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
    `,

    more: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
    `
};

/* =========================================================
   SMALL UI STYLES
========================================================= */

function addControlStyles() {
    if (document.getElementById("carManagerControlStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "carManagerControlStyles";

    style.textContent = `

        .section-heading.compact {
            position: relative;
        }

        /*
        =====================================================
        CONTENT PAGE BACK BUTTON ALIGNMENT
        =====================================================
        */

        .content-page-back-row {
            width: 100%;
            display: flex;
            align-items: center;

            /* Moved slightly down and closer to heading */
            margin: 18px 0 6px;
        }

        .content-page-back-row .back-button {
            margin: 0;
        }

        .content-page-heading {
            margin-top: 0 !important;
        }

        .cars-menu-wrapper {
            position: relative;
        }

        .cars-menu-button {
            width: 46px;
            height: 46px;
            border: 1px solid #AFCBE0;
            border-radius: 12px;
            background: #E3F0FA;
            color: #123B63;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all .18s ease;
        }

        .cars-menu-button:hover {
            background: #D2E7F5;
            border-color: #8FB5D1;
            transform: translateY(-1px);
        }

        .cars-menu-button svg {
            width: 21px;
            height: 21px;
        }

        .cars-menu {
            position: absolute;
            right: 0;
            top: 54px;
            width: 190px;
            padding: 8px;
            background: white;
            border: 1px solid #C5D8E7;
            border-radius: 14px;
            box-shadow: 0 12px 30px rgba(20, 55, 85, .14);
            z-index: 100;
            display: none;
        }

        .cars-menu.open {
            display: block;
            animation: menuAppear .14s ease-out;
        }

        @keyframes menuAppear {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .cars-menu-item {
            width: 100%;
            border: 0;
            background: transparent;
            padding: 11px 12px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            color: #123F68;
            font-weight: 700;
            text-align: left;
        }

        .cars-menu-item:hover {
            background: #EAF4FB;
        }

        .cars-menu-item svg {
            width: 18px;
            height: 18px;
        }

        .card-action-delete {
            border: 1px solid #E7C5C5;
            background: #FFF7F7;
            color: #A52D2D;
            min-width: 42px;
            height: 38px;
            padding: 0 11px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            transition: all .18s ease;
            font-weight: 700;
        }

        .card-action-delete:hover {
            background: #FDECEC;
            border-color: #DCA5A5;
            transform: translateY(-1px);
        }

        .card-action-delete svg {
            width: 17px;
            height: 17px;
        }

        .card-action-update {
            border: 1px solid #A9CDE6;
            background: #EAF5FC;
            color: #155C8C;
            min-width: 42px;
            height: 38px;
            padding: 0 11px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            transition: all .18s ease;
            font-weight: 700;
        }

        .card-action-update:hover {
            background: #D7ECF9;
            border-color: #7FB2D3;
            transform: translateY(-1px);
        }

        .card-action-update svg {
            width: 17px;
            height: 17px;
        }

        .car-card-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .car-update-selection-bar {
            display: none;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin: 0 0 18px;
            padding: 13px 16px;
            background: #E6F3FB;
            border: 1px solid #AFCFE5;
            border-left: 4px solid #2F6FA5;
            border-radius: 10px;
        }

        .car-update-selection-bar.active {
            display: flex;
        }

        .car-update-selection-text {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #174F78;
            font-weight: 750;
        }

        .car-update-selection-text svg {
            width: 19px;
            height: 19px;
        }

        .cancel-selection-button {
            border: 1px solid #B7CBD9;
            background: white;
            color: #234A66;
            padding: 8px 13px;
            border-radius: 8px;
            font-size: .9rem;
            font-weight: 700;
            cursor: pointer;
        }

        .cancel-selection-button:hover {
            background: #F1F6F9;
        }

        .car-selection-active .car-card {
            cursor: default;
        }

        .car-selection-active .car-card:hover {
            transform: translateY(-2px);
        }

        .customer-delete-button {
            margin-left: auto;
        }

        .customer-card {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(8, 30, 48, .42);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 1000;
        }

        .management-modal {
            width: min(500px, 100%);
            background: white;
            border: 1px solid #D4E0EA;
            border-radius: 18px;
            padding: 26px;
            box-shadow: 0 25px 70px rgba(8, 35, 58, .25);
        }

        .management-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 22px;
        }

        .management-modal-header h2 {
            margin: 0;
        }

        .modal-close {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 9px;
            background: #EEF4F8;
            color: #163F63;
            cursor: pointer;
            font-size: 20px;
        }

        .modal-close:hover {
            background: #E0ECF4;
        }

        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }

        .modal-cancel {
            border: 1px solid #CBD9E4;
            background: #F7FAFC;
            color: #163F63;
            padding: 11px 18px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
        }

        .modal-cancel:hover {
            background: #EDF3F7;
        }

        .modal-submit {
            border: 0;
            background: #123F68;
            color: white;
            padding: 11px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
        }

        .modal-submit:hover {
            background: #0D3152;
        }

        .modal-submit svg {
            width: 17px;
            height: 17px;
        }

        .modal-message {
            margin-top: 12px;
        }

        #ownerCarsList .car-card {
            border-color: #B8D2E5;
            background:
                linear-gradient(
                    145deg,
                    #FFFFFF 0%,
                    #E8F3FA 100%
                );
        }

        #ownerCarsList .car-card::before {
            background:
                linear-gradient(
                    90deg,
                    #0E3B63,
                    #2F78AD,
                    #6AA8D0
                );
        }

        #ownerCarsList .car-card:hover {
            border-color: #83ADCA;
            box-shadow:
                0 12px 28px rgba(18, 59, 99, 0.16);
        }

        #ownerCarsList .car-icon {
            background:
                linear-gradient(
                    145deg,
                    #123B63,
                    #2F6FA5
                );
        }

        .back-button {
            background: #E4F0F8 !important;
            color: #123B63 !important;
            border: 1px solid #B7D0E2 !important;
            padding: 10px 16px !important;
            border-radius: 10px !important;
            box-shadow: 0 3px 9px rgba(18, 59, 99, .07);
            transition: all .18s ease !important;
        }

        .back-button:hover {
            background: #D2E5F2 !important;
            border-color: #91B6D0 !important;
            color: #0A2945 !important;
            transform: translateX(-2px);
        }

        .back-button svg {
            width: 18px;
            height: 18px;
        }

        .selected-car-info {
            margin-top: 5px;
            color: #617383;
            font-size: .92rem;
        }

        @media (max-width: 600px) {

            .cars-menu {
                right: 0;
            }

            .customer-card {
                flex-wrap: wrap;
            }

            .customer-delete-button {
                margin-left: auto;
            }

            .management-modal {
                padding: 20px;
            }

            .car-update-selection-bar {
                align-items: flex-start;
                flex-direction: column;
            }

            .cancel-selection-button {
                width: 100%;
            }

            .car-card-actions {
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            .content-page-back-row {
                margin-top: 14px;
                margin-bottom: 5px;
            }
        }
    `;

    document.head.appendChild(style);
}

/* =========================================================
   CARS MENU GLOBAL LISTENER
========================================================= */

function addCarsMenuListener() {
    if (carsMenuListenerAttached) {
        return;
    }

    document.addEventListener(
        "click",
        handleOutsideCarsMenu
    );

    carsMenuListenerAttached = true;
}

function removeCarsMenuListener() {
    if (!carsMenuListenerAttached) {
        return;
    }

    document.removeEventListener(
        "click",
        handleOutsideCarsMenu
    );

    carsMenuListenerAttached = false;
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function showLoginPage() {
    currentPage = "login";

    removeCarsMenuListener();

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

                    <p id="loginMessage" class="form-message"></p>

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
        .addEventListener("submit", handleLogin);

    document
        .getElementById("showRegisterBtn")
        .addEventListener("click", showRegisterPage);
}

/* =========================================================
   REGISTER PAGE
========================================================= */

function showRegisterPage() {
    currentPage = "register";

    removeCarsMenuListener();

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

                    <p id="registerMessage" class="form-message"></p>

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
        .addEventListener("submit", handleRegister);

    document
        .getElementById("showLoginBtn")
        .addEventListener("click", showLoginPage);
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

    const message = document.getElementById("loginMessage");

    setMessage(message, "Signing in...");

    try {
        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
                safeValue(data.message, "Login failed."),
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

    const message = document.getElementById(
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
                    "Content-Type": "application/json"
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

function createHeader(title, subtitle) {
    const username = safeUsername();
    const role = safeRole();

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
                        ${escapeHTML(avatarLetter)}
                    </div>

                    <div class="user-details">
                        <strong>
                            ${escapeHTML(username)}
                        </strong>

                        <span>
                            ${escapeHTML(displayRole)}
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
                        safeValue(title, "Dashboard")
                    )}
                </h1>

                <p>
                    ${escapeHTML(
                        safeValue(subtitle, "")
                    )}
                </p>

            </div>

        </div>
    `;
}

/* =========================================================
   PAGE HEADER WITHOUT PORTAL LABEL
========================================================= */

function createContentPageHeader(title, subtitle) {
    return `
        <div class="page-heading content-page-heading">

            <div>

                <h1>
                    ${escapeHTML(
                        safeValue(title, "")
                    )}
                </h1>

                <p>
                    ${escapeHTML(
                        safeValue(subtitle, "")
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
    currentPage = "owner-dashboard";

    updateCarSelectionMode = false;
    removeCarsMenuListener();

    const username = safeUsername();

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
                            ${escapeHTML(username)}
                        </h2>

                        <p>
                            Everything you need to manage your car management system is right here.
                        </p>

                    </div>

                    <div class="welcome-icon">
                        ${icons.dashboard}
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

                                <span>Manage</span>

                                <h3>Cars</h3>

                                <p>
                                    View, add, update and delete vehicles.
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

                                <span>Manage</span>

                                <h3>Customers</h3>

                                <p>
                                    View and manage customer accounts.
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
        .addEventListener("click", logout);

    document
        .getElementById("showCarsBtn")
        .addEventListener("click", showCarsPage);

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
    currentPage = "customer-dashboard";

    removeCarsMenuListener();

    const username = safeUsername();

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
                            ${escapeHTML(username)}
                        </h2>

                        <p>
                            Browse the available vehicles in the system.
                        </p>

                    </div>

                    <div class="welcome-icon">
                        ${icons.car}
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
                                View all vehicles currently available in the system.
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

                            <span>Browse</span>

                            <h3>
                                View Cars
                            </h3>

                            <p>
                                See vehicle brands, models and years.
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
        .addEventListener("click", logout);

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

    updateCarSelectionMode = false;

    addControlStyles();
    addCarsMenuListener();

    app.innerHTML = `
        <div class="dashboard-page">

            <main class="content-page">

                <div class="content-page-back-row">

                    <button
                        id="backToDashboardFromCars"
                        class="back-button"
                    >
                        ${icons.back}
                        <span>Back to Dashboard</span>
                    </button>

                </div>

                ${createContentPageHeader(
                    "Cars",
                    "Manage all vehicles in your system."
                )}

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

                        <div class="cars-menu-wrapper">

                            <button
                                id="carsMenuButton"
                                class="cars-menu-button"
                                title="Car options"
                            >
                                ${icons.more}
                            </button>

                            <div
                                id="carsMenu"
                                class="cars-menu"
                            >

                                <button
                                    id="menuAddCar"
                                    class="cars-menu-item"
                                >
                                    ${icons.plus}
                                    <span>Add Car</span>
                                </button>

                                <button
                                    id="menuUpdateCar"
                                    class="cars-menu-item"
                                >
                                    ${icons.edit}
                                    <span>Update Car</span>
                                </button>

                            </div>

                        </div>

                    </div>

                    <div
                        id="carUpdateSelectionBar"
                        class="car-update-selection-bar"
                    >
                        <div class="car-update-selection-text">
                            ${icons.edit}

                            <span>
                                Select the car you want to update.
                            </span>
                        </div>

                        <button
                            id="cancelCarSelection"
                            class="cancel-selection-button"
                        >
                            Cancel
                        </button>
                    </div>

                    <div
                        id="ownerCarsList"
                        class="car-grid"
                    ></div>

                </section>

            </main>

        </div>
    `;

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", logout);

    document
        .getElementById("backToDashboardFromCars")
        .addEventListener(
            "click",
            showOwnerDashboard
        );

    document
        .getElementById("carsMenuButton")
        .addEventListener(
            "click",
            toggleCarsMenu
        );

    document
        .getElementById("menuAddCar")
        .addEventListener(
            "click",
            () => {
                closeCarsMenu();
                showAddCarModal();
            }
        );

    document
        .getElementById("menuUpdateCar")
        .addEventListener(
            "click",
            () => {
                closeCarsMenu();
                startCarUpdateSelection();
            }
        );

    document
        .getElementById("cancelCarSelection")
        .addEventListener(
            "click",
            cancelCarUpdateSelection
        );

    getOwnerCars();
}

/* =========================================================
   CAR 3 DOT MENU
========================================================= */

function toggleCarsMenu(event) {
    event.stopPropagation();

    const menu = document.getElementById("carsMenu");

    if (!menu) {
        return;
    }

    menu.classList.toggle("open");
}

function closeCarsMenu() {
    const menu = document.getElementById("carsMenu");

    if (menu) {
        menu.classList.remove("open");
    }
}

function handleOutsideCarsMenu(event) {
    if (currentPage !== "cars") {
        return;
    }

    const wrapper = document.querySelector(
        ".cars-menu-wrapper"
    );

    if (!wrapper) {
        return;
    }

    if (!wrapper.contains(event.target)) {
        closeCarsMenu();
    }
}

/* =========================================================
   START CAR UPDATE SELECTION
========================================================= */

function startCarUpdateSelection() {
    updateCarSelectionMode = true;

    const bar = document.getElementById(
        "carUpdateSelectionBar"
    );

    const list = document.getElementById(
        "ownerCarsList"
    );

    if (bar) {
        bar.classList.add("active");
    }

    if (list) {
        list.classList.add("car-selection-active");
    }

    renderCurrentOwnerCars();
}

/* =========================================================
   CANCEL CAR UPDATE SELECTION
========================================================= */

function cancelCarUpdateSelection() {
    updateCarSelectionMode = false;

    const bar = document.getElementById(
        "carUpdateSelectionBar"
    );

    const list = document.getElementById(
        "ownerCarsList"
    );

    if (bar) {
        bar.classList.remove("active");
    }

    if (list) {
        list.classList.remove("car-selection-active");
    }

    renderCurrentOwnerCars();
}

/* =========================================================
   OPEN SELECTED CAR
========================================================= */

function selectCarForUpdate(id) {
    const numericId = Number(id);

    const car = currentOwnerCars.find(
        item => Number(item?.id) === numericId
    );

    if (!car) {
        window.alert("Car not found.");
        return;
    }

    updateCarSelectionMode = false;

    showUpdateCarModal(car);
}

/* =========================================================
   GET OWNER CARS
========================================================= */

async function getOwnerCars() {
    const list = document.getElementById(
        "ownerCarsList"
    );

    if (!list) {
        return;
    }

    if (carsRequestInProgress) {
        return;
    }

    carsRequestInProgress = true;

    list.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <span>Loading cars...</span>
        </div>
    `;

    const result = await apiRequest("/cars");

    carsRequestInProgress = false;

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
            : Array.isArray(result.data?.cars)
                ? result.data.cars
                : [];

    currentOwnerCars = cars;

    renderCars(
        list,
        cars,
        true
    );
}

/* =========================================================
   RENDER CURRENT OWNER CARS
========================================================= */

function renderCurrentOwnerCars() {
    const list = document.getElementById(
        "ownerCarsList"
    );

    if (!list) {
        return;
    }

    renderCars(
        list,
        currentOwnerCars,
        true
    );
}

/* =========================================================
   RENDER CARS
========================================================= */

function renderCars(
    container,
    cars,
    ownerMode = false
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
                    There are currently no vehicles in the system.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = cars
        .map(car => {

            const id = safeValue(car?.id);
            const brand = safeValue(car?.brand);
            const model = safeValue(car?.model);
            const year = safeValue(car?.year);

            const updateButton =
                ownerMode && updateCarSelectionMode
                    ? `
                        <button
                            class="card-action-update"
                            data-update-car-id="${escapeHTML(id)}"
                            title="Select ${escapeHTML(
                                brand
                            )} ${escapeHTML(model)}"
                        >
                            ${icons.edit}
                            <span>Select</span>
                        </button>
                    `
                    : "";

            const deleteButton =
                ownerMode
                    ? `
                        <button
                            class="card-action-delete"
                            data-delete-car-id="${escapeHTML(id)}"
                            title="Delete ${escapeHTML(
                                brand
                            )} ${escapeHTML(model)}"
                        >
                            ${icons.trash}
                            <span>Delete</span>
                        </button>
                    `
                    : "";

            return `
                <article class="car-card">

                    <div class="car-card-top">

                        <div class="car-icon">
                            ${icons.car}
                        </div>

                        ${
                            ownerMode
                                ? `
                                    <div class="car-card-actions">
                                        ${updateButton}
                                        ${deleteButton}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                    <div class="car-info">

                        <span class="car-label">
                            VEHICLE
                        </span>

                        <h3>
                            ${escapeHTML(brand)}
                            ${escapeHTML(model)}
                        </h3>

                        <div class="car-meta">

                            <div>
                                <span>Brand</span>

                                <strong>
                                    ${escapeHTML(brand)}
                                </strong>
                            </div>

                            <div>
                                <span>Model</span>

                                <strong>
                                    ${escapeHTML(model)}
                                </strong>
                            </div>

                            <div>
                                <span>Year</span>

                                <strong>
                                    ${escapeHTML(year)}
                                </strong>
                            </div>

                        </div>

                    </div>

                </article>
            `;
        })
        .join("");

    if (ownerMode) {
        container.onclick = handleOwnerCarsClick;
    } else {
        container.onclick = null;
    }
}

/* =========================================================
   OWNER CAR CLICK HANDLER
========================================================= */

function handleOwnerCarsClick(event) {
    const deleteButton =
        event.target.closest(
            "[data-delete-car-id]"
        );

    if (deleteButton) {
        const id =
            deleteButton.dataset.deleteCarId;

        deleteCarById(id);
        return;
    }

    const updateButton =
        event.target.closest(
            "[data-update-car-id]"
        );

    if (updateButton) {
        const id =
            updateButton.dataset.updateCarId;

        selectCarForUpdate(id);
    }
}

/* =========================================================
   DELETE CAR DIRECTLY FROM CARD
========================================================= */

async function deleteCarById(id) {
    const confirmed = window.confirm(
        `Are you sure you want to delete car ID ${id}?`
    );

    if (!confirmed) {
        return;
    }

    const result = await apiRequest(
        `/cars/${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );

    if (!result) {
        return;
    }

    if (!result.ok) {
        window.alert(
            safeValue(
                result.data?.message,
                "Failed to delete car."
            )
        );

        return;
    }

    getOwnerCars();
}

/* =========================================================
   ADD CAR MODAL
========================================================= */

function showAddCarModal() {
    closeManagementModal();

    const modal = document.createElement("div");

    modal.id = "managementModal";

    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div
            class="management-modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="management-modal-header">

                <div>
                    <span class="section-eyebrow">
                        CREATE
                    </span>

                    <h2>
                        Add New Car
                    </h2>
                </div>

                <button
                    type="button"
                    class="modal-close"
                    id="modalCloseButton"
                >
                    ×
                </button>

            </div>

            <form id="modalAddCarForm">

                <div class="input-group">

                    <label for="modalAddBrand">
                        Brand
                    </label>

                    <input
                        type="text"
                        id="modalAddBrand"
                        placeholder="e.g. BMW"
                        required
                    >

                </div>

                <div class="input-group">

                    <label for="modalAddModel">
                        Model
                    </label>

                    <input
                        type="text"
                        id="modalAddModel"
                        placeholder="e.g. M5"
                        required
                    >

                </div>

                <div class="input-group">

                    <label for="modalAddYear">
                        Year
                    </label>

                    <input
                        type="number"
                        id="modalAddYear"
                        placeholder="e.g. 2025"
                        required
                    >

                </div>

                <p
                    id="modalAddMessage"
                    class="form-message modal-message"
                ></p>

                <div class="modal-actions">

                    <button
                        type="button"
                        class="modal-cancel"
                        id="modalCancelButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="modal-submit"
                    >
                        ${icons.plus}
                        Add Car
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("modalCloseButton")
        .addEventListener(
            "click",
            closeManagementModal
        );

    document
        .getElementById("modalCancelButton")
        .addEventListener(
            "click",
            closeManagementModal
        );

    document
        .getElementById("modalAddCarForm")
        .addEventListener(
            "submit",
            handleAddCarModal
        );

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                closeManagementModal();
            }
        }
    );
}

/* =========================================================
   HANDLE ADD CAR
========================================================= */

async function handleAddCarModal(event) {
    event.preventDefault();

    const brand = document
        .getElementById("modalAddBrand")
        .value
        .trim();

    const model = document
        .getElementById("modalAddModel")
        .value
        .trim();

    const year = Number(
        document.getElementById(
            "modalAddYear"
        ).value
    );

    const message = document.getElementById(
        "modalAddMessage"
    );

    setMessage(
        message,
        "Adding car..."
    );

    const result = await apiRequest(
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

    setTimeout(() => {
        closeManagementModal();
        getOwnerCars();
    }, 500);
}

/* =========================================================
   UPDATE CAR MODAL
========================================================= */

function showUpdateCarModal(car) {
    closeManagementModal();

    const carId = Number(car?.id);

    if (!Number.isInteger(carId) || carId <= 0) {
        window.alert("Invalid car selected.");
        return;
    }

    const brand = safeValue(car?.brand, "");
    const model = safeValue(car?.model, "");
    const year = safeValue(car?.year, "");

    const modal = document.createElement("div");

    modal.id = "managementModal";

    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div
            class="management-modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="management-modal-header">

                <div>
                    <span class="section-eyebrow">
                        UPDATE
                    </span>

                    <h2>
                        Update Car
                    </h2>

                    <p class="selected-car-info">
                        Updating:
                        <strong>
                            ${escapeHTML(brand)}
                            ${escapeHTML(model)}
                        </strong>
                    </p>
                </div>

                <button
                    type="button"
                    class="modal-close"
                    id="modalCloseButton"
                >
                    ×
                </button>

            </div>

            <form id="modalUpdateCarForm">

                <div class="input-group">

                    <label for="modalUpdateBrand">
                        Brand
                    </label>

                    <input
                        type="text"
                        id="modalUpdateBrand"
                        value="${escapeHTML(brand)}"
                        placeholder="New brand"
                        required
                    >

                </div>

                <div class="input-group">

                    <label for="modalUpdateModel">
                        Model
                    </label>

                    <input
                        type="text"
                        id="modalUpdateModel"
                        value="${escapeHTML(model)}"
                        placeholder="New model"
                        required
                    >

                </div>

                <div class="input-group">

                    <label for="modalUpdateYear">
                        Year
                    </label>

                    <input
                        type="number"
                        id="modalUpdateYear"
                        value="${escapeHTML(year)}"
                        placeholder="New year"
                        required
                    >

                </div>

                <p
                    id="modalUpdateMessage"
                    class="form-message modal-message"
                ></p>

                <div class="modal-actions">

                    <button
                        type="button"
                        class="modal-cancel"
                        id="modalCancelButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="modal-submit"
                    >
                        ${icons.edit}
                        Update Car
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("modalCloseButton")
        .addEventListener(
            "click",
            () => {
                closeManagementModal();
                cancelCarUpdateSelection();
            }
        );

    document
        .getElementById("modalCancelButton")
        .addEventListener(
            "click",
            () => {
                closeManagementModal();
                cancelCarUpdateSelection();
            }
        );

    document
        .getElementById("modalUpdateCarForm")
        .addEventListener(
            "submit",
            event => handleUpdateCarModal(
                event,
                carId
            )
        );

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                closeManagementModal();
                cancelCarUpdateSelection();
            }
        }
    );
}

/* =========================================================
   HANDLE UPDATE CAR
========================================================= */

async function handleUpdateCarModal(
    event,
    id
) {
    event.preventDefault();

    const brand = document
        .getElementById("modalUpdateBrand")
        .value
        .trim();

    const model = document
        .getElementById("modalUpdateModel")
        .value
        .trim();

    const year = Number(
        document.getElementById(
            "modalUpdateYear"
        ).value
    );

    const message = document.getElementById(
        "modalUpdateMessage"
    );

    setMessage(
        message,
        "Updating car..."
    );

    const result = await apiRequest(
        `/cars/${encodeURIComponent(id)}`,
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

    setTimeout(() => {

        closeManagementModal();

        updateCarSelectionMode = false;

        const bar = document.getElementById(
            "carUpdateSelectionBar"
        );

        const list = document.getElementById(
            "ownerCarsList"
        );

        if (bar) {
            bar.classList.remove("active");
        }

        if (list) {
            list.classList.remove(
                "car-selection-active"
            );
        }

        getOwnerCars();

    }, 500);
}

/* =========================================================
   CLOSE MANAGEMENT MODAL
========================================================= */

function closeManagementModal() {
    const modal = document.getElementById(
        "managementModal"
    );

    if (modal) {
        modal.remove();
    }
}

/* =========================================================
   CUSTOMERS PAGE
========================================================= */

function showCustomersPage() {
    currentPage = "customers";

    addControlStyles();
    removeCarsMenuListener();

    app.innerHTML = `
        <div class="dashboard-page">

            <main class="content-page">

                <div class="content-page-back-row">

                    <button
                        id="backToDashboardFromCustomers"
                        class="back-button"
                    >
                        ${icons.back}
                        <span>Back to Dashboard</span>
                    </button>

                </div>

                ${createContentPageHeader(
                    "Customers",
                    "View and manage customer accounts."
                )}

                <section class="content-hero customer-hero">

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
                            View registered customers and remove accounts when necessary.
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
                            <span>Refresh</span>
                        </button>

                    </div>

                    <div
                        id="customersList"
                        class="customers-list"
                    ></div>

                </section>

            </main>

        </div>
    `;

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", logout);

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

    getCustomers();
}

/* =========================================================
   GET CUSTOMERS
========================================================= */

async function getCustomers() {
    const list = document.getElementById(
        "customersList"
    );

    if (!list) {
        return;
    }

    if (customersRequestInProgress) {
        return;
    }

    customersRequestInProgress = true;

    list.innerHTML = `
        <div class="loading-state">

            <div class="spinner"></div>

            <span>
                Loading customers...
            </span>

        </div>
    `;

    const result = await apiRequest("/users");

    customersRequestInProgress = false;

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
                    There are currently no customer accounts.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = customers
        .map(customer => {

            const username =
                safeValue(customer?.username);

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
                            ${escapeHTML(username)}
                        </h3>

                        <p>
                            Role:
                            <strong>
                                ${escapeHTML(role)}
                            </strong>
                        </p>

                    </div>

                    <div class="customer-status">
                        <span class="status-dot"></span>
                        Active
                    </div>

                    <button
                        class="card-action-delete customer-delete-button"
                        data-delete-customer="${escapeHTML(
                            username
                        )}"
                        title="Delete ${escapeHTML(
                            username
                        )}"
                    >
                        ${icons.trash}
                        <span>Delete</span>
                    </button>

                </article>
            `;
        })
        .join("");

    container.onclick = event => {

        const button =
            event.target.closest(
                "[data-delete-customer]"
            );

        if (!button) {
            return;
        }

        const username =
            button.dataset.deleteCustomer;

        deleteCustomerByUsername(username);
    };
}

/* =========================================================
   DELETE CUSTOMER
========================================================= */

async function deleteCustomerByUsername(
    username
) {
    const confirmed = window.confirm(
        `Are you sure you want to delete customer "${username}"?`
    );

    if (!confirmed) {
        return;
    }

    const result = await apiRequest(
        `/users/${encodeURIComponent(username)}`,
        {
            method: "DELETE"
        }
    );

    if (!result) {
        return;
    }

    if (!result.ok) {
        window.alert(
            safeValue(
                result.data?.message,
                "Failed to delete customer."
            )
        );

        return;
    }

    getCustomers();
}

/* =========================================================
   CUSTOMER CARS PAGE
========================================================= */

function showCustomerCarsPage() {
    currentPage = "customer-cars";

    addControlStyles();
    removeCarsMenuListener();

    app.innerHTML = `
        <div class="dashboard-page">

            <main class="content-page">

                <div class="content-page-back-row">

                    <button
                        id="backToDashboardFromCustomerCars"
                        class="back-button"
                    >
                        ${icons.back}
                        <span>Back to Dashboard</span>
                    </button>

                </div>

                ${createContentPageHeader(
                    "Available Cars",
                    "Browse vehicles currently available in the system."
                )}

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
                            <span>Refresh</span>
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
        ?.addEventListener("click", logout);

    document
        .getElementById(
            "backToDashboardFromCustomerCars"
        )
        .addEventListener(
            "click",
            showCustomerDashboard
        );

    document
        .getElementById("getCustomerCarsBtn")
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
    const list = document.getElementById(
        "customerCarsList"
    );

    if (!list) {
        return;
    }

    if (carsRequestInProgress) {
        return;
    }

    carsRequestInProgress = true;

    list.innerHTML = `
        <div class="loading-state">

            <div class="spinner"></div>

            <span>
                Loading cars...
            </span>

        </div>
    `;

    const result = await apiRequest("/cars");

    carsRequestInProgress = false;

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
        cars,
        false
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

    element.className = "form-message";

    if (type) {
        element.classList.add(type);
    }

    element.textContent =
        safeValue(text, "");
}

/* =========================================================
   START APPLICATION
========================================================= */

function startApp() {
    addControlStyles();

    const token = getToken();
    const role = getRole();

    if (!token) {
        showLoginPage();
        return;
    }

    if (role === "owner") {
        showOwnerDashboard();
        return;
    }

    if (role === "customer") {
        showCustomerDashboard();
        return;
    }

    logout();
}

/* =========================================================
   START
========================================================= */

startApp();