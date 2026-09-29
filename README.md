# Car CRUD API

A REST API for managing car records using Node.js, Express, JavaScript, and JSON file storage.

The API also includes JWT authentication, role-based authorization, customer registration, login, password hashing, and input validation.

## Features

* Create a new car
* Get all cars
* Get a single car by ID
* Update a car
* Delete a car
* JSON file storage
* Input validation
* Custom ID selection for available IDs
* Customer registration
* User login
* JWT authentication
* Bearer token authentication
* Owner and customer roles
* Role-based authorization
* Password hashing using bcrypt
* Owner-only user management
* Environment variables using `.env`

## Technologies Used

* Node.js
* Express.js
* JavaScript
* JSON
* JWT
* bcrypt
* dotenv
* Postman

## Project Files

* `server.js` — Main API server
* `cars.json` — Stores car data
* `users.json` — Stores user data
* `.env` — Stores the JWT secret
* `.gitignore` — Prevents `.env` and other private files from being uploaded to GitHub

## API Endpoints

### Authentication

| Method | Endpoint    | Description                   |
| ------ | ----------- | ----------------------------- |
| POST   | `/register` | Register a new customer       |
| POST   | `/login`    | Login and receive a JWT token |

### Cars

| Method | Endpoint    | Description   |
| ------ | ----------- | ------------- |
| GET    | `/cars`     | Get all cars  |
| GET    | `/cars/:id` | Get one car   |
| POST   | `/cars`     | Add a new car |
| PUT    | `/cars/:id` | Update a car  |
| DELETE | `/cars/:id` | Delete a car  |

### Users

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| GET    | `/users`           | Get all users     |
| DELETE | `/users/:username` | Delete a customer |

## Authentication

The API uses **JWT (JSON Web Token)** for authentication.

After a successful login, the API returns a token.

Example:

```json
{
    "message": "Login successful",
    "role": "owner",
    "token": "your-jwt-token"
}
```

For protected endpoints, send the token using the HTTP `Authorization` header:

```text
Authorization: Bearer your-jwt-token
```

In Postman, this can be set using:

**Authorization → Type: Bearer Token → Token**

## User Roles

### Owner

The owner can:

* View cars
* Add cars
* Update cars
* Delete cars
* View users
* Delete customer accounts

### Customer

Customers can:

* View cars

Customers cannot:

* Add cars
* Update cars
* Delete cars
* View all users
* Delete users

## Registration

Customers can register using:

```http
POST /register
```

Example request:

```json
{
    "username": "ali",
    "password": "ali12345"
}
```

The password is securely hashed using bcrypt before being stored.

## Login

Users can log in using:

```http
POST /login
```

Example request:

```json
{
    "username": "ali",
    "password": "ali12345"
}
```

A successful login returns a JWT token.

## Validation

The API validates user and car data.

Examples:

* Username cannot be empty
* Password must be at least 6 characters
* Brand cannot be empty
* Model cannot be empty
* Year must be a valid car year
* Duplicate car IDs are rejected
* Invalid IDs are rejected

Multiple validation errors can be returned together.

Example:

```json
{
    "message": "Validation failed",
    "errors": [
        "Username cannot be empty",
        "Password must be at least 6 characters"
    ]
}
```

## How to Run

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project folder:

```env
JWT_SECRET=my-secret-key
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

For protected endpoints, first log in and copy the JWT token. Then use the token as a **Bearer Token** in Postman.

The `cars.json` file is used to permanently store car data.

The `users.json` file is used to permanently store user data.

## Security

The JWT secret is stored in the `.env` file instead of directly in the source code.

The `.env` file is included in `.gitignore` so the secret is not uploaded to GitHub.

User passwords are stored as bcrypt hashes instead of plain-text passwords.
