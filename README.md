# Car CRUD API

A simple REST API for managing car records using Node.js, Express, JavaScript, and JSON file storage.

## Features

* Create a new car
* Get all cars
* Get a single car by ID
* Update a car
* Delete a car
* JSON file storage
* Input validation
* Custom ID selection for available IDs

## Technologies Used

* Node.js
* Express.js
* JavaScript
* JSON
* Postman

## API Endpoints

| Method | Endpoint    | Description   |
| ------ | ----------- | ------------- |
| GET    | `/cars`     | Get all cars  |
| GET    | `/cars/:id` | Get one car   |
| POST   | `/cars`     | Add a new car |
| PUT    | `/cars/:id` | Update a car  |
| DELETE | `/cars/:id` | Delete a car  |

## How to Run

Install the dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

The server will run at:

```text
http://localhost:3000
```

## Example Car

```json
{
    "id": 1,
    "brand": "Honda",
    "model": "Civic",
    "year": 2024
}
```

## Testing

The API can be tested using Postman.

The `cars.json` file is used to permanently store the car data.
