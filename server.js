// Import Express framework
const express = require("express");

// Import File System module
const fs = require("fs");

// Create an Express application
const app = express();

// Allow Express to read JSON data sent by clients
app.use(express.json());

// Set the port number for our server
const PORT = 3000;

// Read car data from cars.json
let cars = JSON.parse(fs.readFileSync("cars.json", "utf8"));

// Save car data to cars.json
function saveCars() {
    fs.writeFileSync("cars.json", JSON.stringify(cars, null, 4));
}

// Handle GET request for the home page
app.get("/", (req, res) => {
    res.send("Car CRUD API is running!");
});

// CREATE - Add a new car
app.post("/cars", (req, res) => {

    if (!req.body.brand || !req.body.model || !req.body.year) {
        return res.status(400).json({
            message: "Brand, model, and year are required"
        });
    }

    let newId;

    // If user provides an ID
    if (req.body.id !== undefined) {

        newId = Number(req.body.id);

        // Check if ID is valid
        if (!Number.isInteger(newId) || newId <= 0) {
            return res.status(400).json({
                message: "ID must be a positive number"
            });
        }

        // Check if ID already exists
        if (cars.some(car => car.id === newId)) {
            return res.status(400).json({
                message: "This ID is already in use"
            });
        }

    } else {

        // Automatically generate the next ID
        newId = cars.length > 0
            ? Math.max(...cars.map(car => car.id)) + 1
            : 1;
    }

    const newCar = {
        id: newId,
        brand: req.body.brand,
        model: req.body.model,
        year: req.body.year
    };

    cars.push(newCar);

    saveCars();

    res.status(201).json(newCar);
});

// READ - Get all cars
app.get("/cars", (req, res) => {
    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

    res.json(sortedCars);
});

app.get('/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const car = cars.find(car => car.id === id);

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    res.json(car);
});

// UPDATE - Update an existing car
app.put("/cars/:id", (req, res) => {
    const id = Number(req.params.id);

    const car = cars.find((car) => car.id === id);

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    if (!req.body.brand || !req.body.model || !req.body.year) {
        return res.status(400).json({
            message: "Brand, model, and year are required"
        });
    }

    car.brand = req.body.brand;
    car.model = req.body.model;
    car.year = req.body.year;

    saveCars();

    res.json(car);
});

// DELETE - Delete an existing car
app.delete("/cars/:id", (req, res) => {
    const id = Number(req.params.id);

    const carIndex = cars.findIndex((car) => car.id === id);

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

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});