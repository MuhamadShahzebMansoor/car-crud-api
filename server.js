require("dotenv").config();

const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const PORT = 3000;

let cars = JSON.parse(fs.readFileSync("cars.json", "utf8"));
let users = JSON.parse(fs.readFileSync("users.json", "utf8"));

function saveCars() {
    fs.writeFileSync("cars.json", JSON.stringify(cars, null, 4));
}

function saveUsers() {
    fs.writeFileSync("users.json", JSON.stringify(users, null, 4));
}

// JWT Authentication Middleware
function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;

        next();
    });
}

// Owner Authorization Middleware
function requireOwner(req, res, next) {

    if (req.user.role !== "owner") {
        return res.status(403).json({
            message: "Access denied. Owner only."
        });
    }

    next();
}

// Home page
app.get("/", (req, res) => {
    res.send("Car CRUD API is running!");
});

// REGISTER CUSTOMER
app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    const errors = [];

    if (typeof username !== "string") {
        errors.push("Username must be text");
    }

    if (typeof password !== "string") {
        errors.push("Password must be text");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    const cleanUsername = username.trim();

    if (cleanUsername === "") {
        errors.push("Username cannot be empty");
    }

    if (password.trim() === "") {
        errors.push("Password cannot be empty");
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    const existingUser = users.find(
        user => user.username === cleanUsername
    );

    if (existingUser) {
        return res.status(400).json({
            message: "Username already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        username: cleanUsername,
        password: hashedPassword,
        role: "customer"
    };

    users.push(newUser);

    saveUsers();

    res.status(201).json({
        message: "User registered successfully",
        username: newUser.username,
        role: newUser.role
    });
});

// LOGIN
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = users.find(
        user => user.username === username
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const token = jwt.sign(
        {
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    res.json({
        message: "Login successful",
        role: user.role,
        token: token
    });
});

// CREATE - Add a new car
app.post("/cars", authenticateToken, requireOwner, (req, res) => {

    const errors = [];

    if (
        typeof req.body.brand !== "string" ||
        req.body.brand.trim() === ""
    ) {
        errors.push("Brand must be text and cannot be empty");
    }

    if (
        typeof req.body.model !== "string" ||
        req.body.model.trim() === ""
    ) {
        errors.push("Model must be text and cannot be empty");
    }

    if (req.body.year === undefined) {
        errors.push("Year is required");
    } else {

        const year = Number(req.body.year);

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > new Date().getFullYear()
        ) {
            errors.push("Year must be a valid car year");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    const year = Number(req.body.year);

    let newId;

    if (req.body.id !== undefined) {

        newId = Number(req.body.id);

        if (!Number.isInteger(newId) || newId <= 0) {
            return res.status(400).json({
                message: "ID must be a positive number"
            });
        }

        if (cars.some(car => car.id === newId)) {
            return res.status(400).json({
                message: "This ID is already in use"
            });
        }

    } else {

        newId = cars.length > 0
            ? Math.max(...cars.map(car => car.id)) + 1
            : 1;
    }

    const newCar = {
        id: newId,
        brand: req.body.brand.trim(),
        model: req.body.model.trim(),
        year: year
    };

    cars.push(newCar);

    saveCars();

    res.status(201).json(newCar);
});

// READ - Get all cars
app.get("/cars", authenticateToken, (req, res) => {

    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

    res.json(sortedCars);
});

// READ - Get one car
app.get("/cars/:id", authenticateToken, (req, res) => {

    const id = parseInt(req.params.id);

    const car = cars.find(car => car.id === id);

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    res.json(car);
});

// UPDATE - Update a car
app.put("/cars/:id", authenticateToken, requireOwner, (req, res) => {

    const id = Number(req.params.id);

    const car = cars.find(car => car.id === id);

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    const errors = [];

    if (
        typeof req.body.brand !== "string" ||
        req.body.brand.trim() === ""
    ) {
        errors.push("Brand must be text and cannot be empty");
    }

    if (
        typeof req.body.model !== "string" ||
        req.body.model.trim() === ""
    ) {
        errors.push("Model must be text and cannot be empty");
    }

    if (req.body.year === undefined) {
        errors.push("Year is required");
    } else {

        const year = Number(req.body.year);

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > new Date().getFullYear()
        ) {
            errors.push("Year must be a valid car year");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    const year = Number(req.body.year);

    car.brand = req.body.brand.trim();
    car.model = req.body.model.trim();
    car.year = year;

    saveCars();

    res.json(car);
});

// DELETE - Delete a car
app.delete("/cars/:id", authenticateToken, requireOwner, (req, res) => {

    const id = Number(req.params.id);

    const carIndex = cars.findIndex(car => car.id === id);

    if (carIndex === -1) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    cars.splice(carIndex, 1);

    saveCars();

    res.json({
        message: "Car deleted successfully"
    });
});

// GET - Get all users
app.get("/users", authenticateToken, requireOwner, (req, res) => {

    const userList = users.map(user => ({
        username: user.username,
        role: user.role
    }));

    res.json(userList);
});

// DELETE - Delete a customer
app.delete("/users/:username", authenticateToken, requireOwner, (req, res) => {

    const username = req.params.username;

    if (username === req.user.username) {
        return res.status(400).json({
            message: "Owner cannot delete their own account"
        });
    }

    const userIndex = users.findIndex(
        user => user.username === username
    );

    if (userIndex === -1) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (users[userIndex].role === "owner") {
        return res.status(403).json({
            message: "Owner accounts cannot be deleted"
        });
    }

    users.splice(userIndex, 1);

    saveUsers();

    res.json({
        message: "Customer deleted successfully"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});