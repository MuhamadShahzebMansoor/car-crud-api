import "./style.css";

const API_URL = "http://localhost:3000";

const app = document.querySelector("#app");


// =========================
// Login Page
// =========================

function showLoginPage() {
    app.innerHTML = `
        <div class="auth-box">
            <h1>Car Management System</h1>
            <h2>Login</h2>

            <form id="loginForm">
                <input
                    type="text"
                    id="loginUsername"
                    placeholder="Username"
                    required
                >

                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Password"
                    required
                >

                <button type="submit">Login</button>
            </form>

            <p id="loginMessage"></p>

            <p>
                Don't have an account?
                <button class="link-button" id="showRegisterBtn">
                    Register
                </button>
            </p>
        </div>
    `;

    document
        .querySelector("#loginForm")
        .addEventListener("submit", login);

    document
        .querySelector("#showRegisterBtn")
        .addEventListener("click", showRegisterPage);
}


// =========================
// Register Page
// =========================

function showRegisterPage() {
    app.innerHTML = `
        <div class="auth-box">
            <h1>Car Management System</h1>
            <h2>Register</h2>

            <form id="registerForm">
                <input
                    type="text"
                    id="registerUsername"
                    placeholder="Username"
                    required
                >

                <input
                    type="password"
                    id="registerPassword"
                    placeholder="Password"
                    required
                >

                <button type="submit">Register</button>
            </form>

            <p id="registerMessage"></p>

            <p>
                Already have an account?
                <button class="link-button" id="showLoginBtn">
                    Login
                </button>
            </p>
        </div>
    `;

    document
        .querySelector("#registerForm")
        .addEventListener("submit", register);

    document
        .querySelector("#showLoginBtn")
        .addEventListener("click", showLoginPage);
}


// =========================
// Register
// =========================

async function register(event) {
    event.preventDefault();

    const username = document
        .querySelector("#registerUsername")
        .value;

    const password = document
        .querySelector("#registerPassword")
        .value;

    const message = document.querySelector("#registerMessage");

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Registration failed.";
            return;
        }

        message.textContent = "Registration successful!";

        setTimeout(() => {
            showLoginPage();
        }, 1000);

    } catch (error) {
        message.textContent = "Unable to connect to server.";
    }
}


// =========================
// Login
// =========================

async function login(event) {
    event.preventDefault();

    const username = document
        .querySelector("#loginUsername")
        .value;

    const password = document
        .querySelector("#loginPassword")
        .value;

    const message = document.querySelector("#loginMessage");

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            return;
        }

        // Save login information
        localStorage.setItem("token", data.token);

        // Save the username entered during login
        localStorage.setItem("username", username);

        localStorage.setItem("role", data.role);

        if (data.role === "owner") {
            showOwnerDashboard();
        } else {
            showCustomerPage();
        }

    } catch (error) {
        message.textContent = "Unable to connect to server.";
    }
}


// =========================
// Owner Dashboard
// =========================

function showOwnerDashboard() {
    app.innerHTML = `
        <div class="page">

            <h1>Owner Dashboard</h1>

            <p>
                Welcome,
                <strong>${localStorage.getItem("username")}</strong>!
                You are logged in as <strong>Owner</strong>.
            </p>

            <button class="logout-button" id="logoutBtn">
                Logout
            </button>

            <div class="dashboard-options">

                <button
                    class="dashboard-button"
                    id="showCarsBtn"
                >
                    🚗<br>
                    Cars
                </button>

                <button
                    class="dashboard-button"
                    id="showCustomersBtn"
                >
                    👤<br>
                    Customers
                </button>

            </div>


            <!-- Cars Page -->

            <div id="carsPage" class="hidden">

                <button id="backToDashboardFromCars">
                    ← Back to Dashboard
                </button>

                <h2>Cars</h2>

                <div class="section">

                    <h2>All Cars</h2>

                    <button id="getCarsBtn">
                        Get Cars
                    </button>

                    <div id="ownerCarsList"></div>

                </div>


                <div class="section">

                    <h2>Add Car</h2>

                    <form id="addCarForm">

                        <input
                            type="text"
                            id="addBrand"
                            placeholder="Brand"
                            required
                        >

                        <input
                            type="text"
                            id="addModel"
                            placeholder="Model"
                            required
                        >

                        <input
                            type="number"
                            id="addYear"
                            placeholder="Year"
                            required
                        >

                        <button type="submit">
                            Add Car
                        </button>

                    </form>

                    <p id="addCarMessage"></p>

                </div>


                <div class="section">

                    <h2>Update Car</h2>

                    <form id="updateCarForm">

                        <input
                            type="number"
                            id="updateId"
                            placeholder="Car ID"
                            required
                        >

                        <input
                            type="text"
                            id="updateBrand"
                            placeholder="New Brand"
                            required
                        >

                        <input
                            type="text"
                            id="updateModel"
                            placeholder="New Model"
                            required
                        >

                        <input
                            type="number"
                            id="updateYear"
                            placeholder="New Year"
                            required
                        >

                        <button type="submit">
                            Update Car
                        </button>

                    </form>

                    <p id="updateCarMessage"></p>

                </div>


                <div class="section">

                    <h2>Delete Car</h2>

                    <form id="deleteCarForm">

                        <input
                            type="number"
                            id="deleteId"
                            placeholder="Car ID"
                            required
                        >

                        <button type="submit">
                            Delete Car
                        </button>

                    </form>

                    <p id="deleteCarMessage"></p>

                </div>

            </div>


            <!-- Customers Page -->

            <div id="customersPage" class="hidden">

                <button id="backToDashboardFromCustomers">
                    ← Back to Dashboard
                </button>

                <h2>Customers</h2>

                <div class="section">

                    <h2>All Customers</h2>

                    <button id="getCustomersBtn">
                        Get Customers
                    </button>

                    <div id="customersList"></div>

                </div>


                <div class="section">

                    <h2>Delete Customer</h2>

                    <form id="deleteCustomerForm">

                        <input
                            type="text"
                            id="deleteCustomerUsername"
                            placeholder="Customer Username"
                            required
                        >

                        <button type="submit">
                            Delete Customer
                        </button>

                    </form>

                    <p id="deleteCustomerMessage"></p>

                </div>

            </div>

        </div>
    `;


    // =========================
    // Dashboard Buttons
    // =========================

    document
        .querySelector("#showCarsBtn")
        .addEventListener("click", showCarsPage);

    document
        .querySelector("#showCustomersBtn")
        .addEventListener("click", showCustomersPage);


    // =========================
    // Back Buttons
    // =========================

    document
        .querySelector("#backToDashboardFromCars")
        .addEventListener("click", showOwnerDashboard);

    document
        .querySelector("#backToDashboardFromCustomers")
        .addEventListener("click", showOwnerDashboard);


    // =========================
    // Logout
    // =========================

    document
        .querySelector("#logoutBtn")
        .addEventListener("click", logout);
}


// =========================
// Cars Page
// =========================

function showCarsPage() {

    document
        .querySelector("#carsPage")
        .classList.remove("hidden");

    document
        .querySelector("#customersPage")
        .classList.add("hidden");

    document
        .querySelector(".dashboard-options")
        .classList.add("hidden");

    setupCarsEvents();
}


// =========================
// Customers Page
// =========================

function showCustomersPage() {

    document
        .querySelector("#customersPage")
        .classList.remove("hidden");

    document
        .querySelector("#carsPage")
        .classList.add("hidden");

    document
        .querySelector(".dashboard-options")
        .classList.add("hidden");

    setupCustomersEvents();
}


// =========================
// Cars Events
// =========================

function setupCarsEvents() {

    const getCarsBtn = document.querySelector("#getCarsBtn");

    if (getCarsBtn.dataset.ready) {
        return;
    }

    getCarsBtn.dataset.ready = "true";

    getCarsBtn.addEventListener("click", getCars);

    document
        .querySelector("#addCarForm")
        .addEventListener("submit", addCar);

    document
        .querySelector("#updateCarForm")
        .addEventListener("submit", updateCar);

    document
        .querySelector("#deleteCarForm")
        .addEventListener("submit", deleteCar);
}


// =========================
// Customers Events
// =========================

function setupCustomersEvents() {

    const getCustomersBtn = document.querySelector("#getCustomersBtn");

    if (getCustomersBtn.dataset.ready) {
        return;
    }

    getCustomersBtn.dataset.ready = "true";

    getCustomersBtn.addEventListener("click", getCustomers);

    document
        .querySelector("#deleteCustomerForm")
        .addEventListener("submit", deleteCustomer);
}


// =========================
// Get Cars
// =========================

async function getCars() {

    const token = localStorage.getItem("token");

    const list = document.querySelector("#ownerCarsList");

    try {

        const response = await fetch(`${API_URL}/cars`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            list.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        list.innerHTML = "";

        data.forEach(car => {

            const carDiv = document.createElement("div");

            carDiv.className = "car";

            carDiv.innerHTML = `
                <h3>${car.brand} ${car.model}</h3>
                <p><strong>ID:</strong> ${car.id}</p>
                <p><strong>Year:</strong> ${car.year}</p>
            `;

            list.appendChild(carDiv);
        });

    } catch (error) {

        list.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// =========================
// Add Car
// =========================

async function addCar(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    const brand = document.querySelector("#addBrand").value;
    const model = document.querySelector("#addModel").value;
    const year = document.querySelector("#addYear").value;

    const message = document.querySelector("#addCarMessage");

    try {

        const response = await fetch(`${API_URL}/cars`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                brand,
                model,
                year: Number(year)
            })
        });

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message || "Failed to add car.";

            return;
        }

        message.textContent =
            "Car added successfully!";

        document
            .querySelector("#addCarForm")
            .reset();

    } catch (error) {

        message.textContent =
            "Unable to connect to server.";
    }
}


// =========================
// Update Car
// =========================

async function updateCar(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    const id = document.querySelector("#updateId").value;
    const brand = document.querySelector("#updateBrand").value;
    const model = document.querySelector("#updateModel").value;
    const year = document.querySelector("#updateYear").value;

    const message =
        document.querySelector("#updateCarMessage");

    try {

        const response = await fetch(
            `${API_URL}/cars/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    brand,
                    model,
                    year: Number(year)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message || "Failed to update car.";

            return;
        }

        message.textContent =
            "Car updated successfully!";

        document
            .querySelector("#updateCarForm")
            .reset();

    } catch (error) {

        message.textContent =
            "Unable to connect to server.";
    }
}


// =========================
// Delete Car
// =========================

async function deleteCar(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    const id = document.querySelector("#deleteId").value;

    const message =
        document.querySelector("#deleteCarMessage");

    const confirmDelete =
        confirm(`Are you sure you want to delete car ID ${id}?`);

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/cars/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message || "Failed to delete car.";

            return;
        }

        message.textContent =
            "Car deleted successfully!";

        document
            .querySelector("#deleteCarForm")
            .reset();

    } catch (error) {

        message.textContent =
            "Unable to connect to server.";
    }
}


// =========================
// Get Customers
// =========================

async function getCustomers() {

    const token = localStorage.getItem("token");

    const list =
        document.querySelector("#customersList");

    try {

        const response = await fetch(
            `${API_URL}/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            list.innerHTML =
                `<p>${data.message}</p>`;

            return;
        }

        list.innerHTML = "";

        data.forEach(customer => {

            const customerDiv =
                document.createElement("div");

            customerDiv.className = "customer";

            customerDiv.innerHTML = `
                <h3>${customer.username}</h3>
                <p><strong>Role:</strong> ${customer.role}</p>
            `;

            list.appendChild(customerDiv);
        });

    } catch (error) {

        list.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// =========================
// Delete Customer
// =========================

async function deleteCustomer(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    const username =
        document.querySelector("#deleteCustomerUsername").value;

    const message =
        document.querySelector("#deleteCustomerMessage");

    const confirmDelete =
        confirm(
            `Are you sure you want to delete customer "${username}"?`
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/users/${username}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message || "Failed to delete customer.";

            return;
        }

        message.textContent =
            "Customer deleted successfully!";

        document
            .querySelector("#deleteCustomerForm")
            .reset();

    } catch (error) {

        message.textContent =
            "Unable to connect to server.";
    }
}


// =========================
// Customer Page
// =========================

function showCustomerPage() {

    app.innerHTML = `
        <div class="page">

            <h1>Customer Page</h1>

            <p>
                Welcome,
                <strong>${localStorage.getItem("username")}</strong>!
            </p>

            <button class="logout-button" id="logoutBtn">
                Logout
            </button>

            <div class="section">

                <h2>Available Cars</h2>

                <button id="getCustomerCarsBtn">
                    Get Cars
                </button>

                <div id="customerCarsList"></div>

            </div>

        </div>
    `;

    document
        .querySelector("#logoutBtn")
        .addEventListener("click", logout);

    document
        .querySelector("#getCustomerCarsBtn")
        .addEventListener("click", getCustomerCars);
}


// =========================
// Customer Get Cars
// =========================

async function getCustomerCars() {

    const token = localStorage.getItem("token");

    const list =
        document.querySelector("#customerCarsList");

    try {

        const response = await fetch(
            `${API_URL}/cars`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            list.innerHTML =
                `<p>${data.message}</p>`;

            return;
        }

        list.innerHTML = "";

        data.forEach(car => {

            const carDiv =
                document.createElement("div");

            carDiv.className = "car";

            carDiv.innerHTML = `
                <h3>${car.brand} ${car.model}</h3>
                <p><strong>ID:</strong> ${car.id}</p>
                <p><strong>Year:</strong> ${car.year}</p>
            `;

            list.appendChild(carDiv);
        });

    } catch (error) {

        list.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// =========================
// Logout
// =========================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    showLoginPage();
}


// =========================
// Start Application
// =========================

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (token && role === "owner") {

    showOwnerDashboard();

} else if (token && role === "customer") {

    showCustomerPage();

} else {

    showLoginPage();
}

