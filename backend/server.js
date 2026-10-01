require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;


// =========================
// Authentication Middleware
// =========================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid or expired token"
                });
            }

            req.user = user;

            next();
        }
    );
}


// =========================
// Owner Middleware
// =========================

function requireOwner(req, res, next) {

    if (req.user.role !== "owner") {

        return res.status(403).json({
            message: "Access denied. Owner only."
        });
    }

    next();
}


// =========================
// Home Route
// =========================

app.get("/", (req, res) => {

    res.send("Car CRUD API is running!");

});


// =========================
// Register Customer
// =========================

app.post("/register", async (req, res, next) => {

    try {

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

            errors.push(
                "Password must be at least 6 characters"
            );

        }


        if (errors.length > 0) {

            return res.status(400).json({
                message: "Validation failed",
                errors: errors
            });

        }


        const existingUser = await pool.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
            [cleanUsername]
        );


        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                message: "Username already exists"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        await pool.query(
            `INSERT INTO users
             (username, password, role)
             VALUES ($1, $2, $3)`,
            [
                cleanUsername,
                hashedPassword,
                "customer"
            ]
        );


        res.status(201).json({

            message: "User registered successfully",

            username: cleanUsername,

            role: "customer"

        });


    } catch (error) {

        next(error);

    }

});


// =========================
// Login
// =========================

app.post("/login", async (req, res, next) => {

    try {

        const { username, password } = req.body;


        const result = await pool.query(
            `SELECT username, password, role
             FROM users
             WHERE username = $1`,
            [username]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Invalid username or password"
            });

        }


        const user = result.rows[0];


        const passwordMatch =
            await bcrypt.compare(
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


    } catch (error) {

        next(error);

    }

});


// =========================
// Create Car
// =========================

app.post(
    "/cars",
    authenticateToken,
    requireOwner,
    async (req, res, next) => {

        try {

            const errors = [];


            if (
                typeof req.body.brand !== "string" ||
                req.body.brand.trim() === ""
            ) {

                errors.push(
                    "Brand must be text and cannot be empty"
                );

            }


            if (
                typeof req.body.model !== "string" ||
                req.body.model.trim() === ""
            ) {

                errors.push(
                    "Model must be text and cannot be empty"
                );

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

                    errors.push(
                        "Year must be a valid car year"
                    );

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


                if (
                    !Number.isInteger(newId) ||
                    newId <= 0
                ) {

                    return res.status(400).json({
                        message:
                            "ID must be a positive number"
                    });

                }


                const existingCar =
                    await pool.query(
                        `SELECT id
                         FROM cars
                         WHERE id = $1`,
                        [newId]
                    );


                if (existingCar.rows.length > 0) {

                    return res.status(400).json({
                        message:
                            "This ID is already in use"
                    });

                }

            } else {

                const result = await pool.query(
                    `SELECT
                     COALESCE(MAX(id), 0) + 1 AS next_id
                     FROM cars`
                );


                newId =
                    Number(result.rows[0].next_id);

            }


            const result = await pool.query(

                `INSERT INTO cars
                 (id, brand, model, year)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, brand, model, year`,

                [
                    newId,
                    req.body.brand.trim(),
                    req.body.model.trim(),
                    year
                ]

            );


            res.status(201).json(
                result.rows[0]
            );


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Get All Cars
// =========================

app.get(
    "/cars",
    authenticateToken,
    async (req, res, next) => {

        try {

            const result = await pool.query(

                `SELECT id, brand, model, year
                 FROM cars
                 ORDER BY id ASC`

            );


            res.json(result.rows);


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Get One Car
// =========================

app.get(
    "/cars/:id",
    authenticateToken,
    async (req, res, next) => {

        try {

            const id = Number(req.params.id);


            const result = await pool.query(

                `SELECT id, brand, model, year
                 FROM cars
                 WHERE id = $1`,

                [id]

            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    message: "Car not found"
                });

            }


            res.json(result.rows[0]);


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Update Car
// =========================

app.put(
    "/cars/:id",
    authenticateToken,
    requireOwner,
    async (req, res, next) => {

        try {

            const id = Number(req.params.id);


            const existingCar =
                await pool.query(
                    `SELECT id
                     FROM cars
                     WHERE id = $1`,
                    [id]
                );


            if (existingCar.rows.length === 0) {

                return res.status(404).json({
                    message: "Car not found"
                });

            }


            const errors = [];


            if (
                typeof req.body.brand !== "string" ||
                req.body.brand.trim() === ""
            ) {

                errors.push(
                    "Brand must be text and cannot be empty"
                );

            }


            if (
                typeof req.body.model !== "string" ||
                req.body.model.trim() === ""
            ) {

                errors.push(
                    "Model must be text and cannot be empty"
                );

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

                    errors.push(
                        "Year must be a valid car year"
                    );

                }

            }


            if (errors.length > 0) {

                return res.status(400).json({
                    message: "Validation failed",
                    errors: errors
                });

            }


            const year = Number(req.body.year);


            const result = await pool.query(

                `UPDATE cars
                 SET brand = $1,
                     model = $2,
                     year = $3
                 WHERE id = $4
                 RETURNING id, brand, model, year`,

                [
                    req.body.brand.trim(),
                    req.body.model.trim(),
                    year,
                    id
                ]

            );


            res.json(result.rows[0]);


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Delete Car
// =========================

app.delete(
    "/cars/:id",
    authenticateToken,
    requireOwner,
    async (req, res, next) => {

        try {

            const id = Number(req.params.id);


            const result = await pool.query(

                `DELETE FROM cars
                 WHERE id = $1
                 RETURNING id`,

                [id]

            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    message: "Car not found"
                });

            }


            res.json({
                message: "Car deleted successfully"
            });


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Get Customers
// =========================

app.get(
    "/users",
    authenticateToken,
    requireOwner,
    async (req, res, next) => {

        try {

            // IMPORTANT:
            // Only users with role = customer
            // will be returned.
            // Owners will NOT appear here.

            const result = await pool.query(

                `SELECT username, role
                 FROM users
                 WHERE role = 'customer'
                 ORDER BY username ASC`

            );


            res.json(result.rows);


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Delete Customer
// =========================

app.delete(
    "/users/:username",
    authenticateToken,
    requireOwner,
    async (req, res, next) => {

        try {

            const username = req.params.username;


            if (username === req.user.username) {

                return res.status(400).json({
                    message:
                        "Owner cannot delete their own account"
                });

            }


            const userResult = await pool.query(

                `SELECT username, role
                 FROM users
                 WHERE username = $1`,

                [username]

            );


            if (userResult.rows.length === 0) {

                return res.status(404).json({
                    message: "Customer not found"
                });

            }


            if (userResult.rows[0].role === "owner") {

                return res.status(403).json({
                    message:
                        "Owner accounts cannot be deleted"
                });

            }


            await pool.query(

                `DELETE FROM users
                 WHERE username = $1`,

                [username]

            );


            res.json({
                message:
                    "Customer deleted successfully"
            });


        } catch (error) {

            next(error);

        }

    }
);


// =========================
// Global Error Handler
// =========================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });

});


// =========================
// Start Server
// =========================

app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});

