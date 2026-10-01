# Car CRUD API

A full-stack Car Management System built with **Node.js, Express.js, PostgreSQL, and JavaScript**.

The backend provides a RESTful API for managing cars and users. PostgreSQL is hosted on Supabase and connected using `pg`. JWT is used for authentication, bcrypt is used for password hashing, and the frontend provides a simple web interface for owners and customers.

## Technologies

* Node.js
* Express.js
* JavaScript
* PostgreSQL
* Supabase
* JWT (JSON Web Token)
* bcryptjs
* dotenv
* pg (node-postgres)
* Vite
* HTML
* CSS
* Postman

## Features

* User registration
* User login
* Password hashing with bcrypt
* JWT authentication
* Bearer token authentication
* Owner and customer roles
* Role-based authorization
* Create cars
* Read cars
* Update cars
* Delete cars
* View individual cars
* Owner customer management
* Input validation
* PostgreSQL database
* Global error handling
* Frontend web interface

## User Roles

### Owner

The owner can:

* View all cars
* View an individual car
* Create cars
* Update cars
* Delete cars
* View customers
* Delete customer accounts

### Customer

Customers can:

* View available cars
* View individual cars

Customers cannot:

* Create cars
* Update cars
* Delete cars
* Manage customers

## Database

The project uses **PostgreSQL hosted on Supabase**.

### Cars Table

The `cars` table contains:

* `id`
* `brand`
* `model`
* `year`

### Users Table

The `users` table contains:

* `username`
* `password`
* `role`

Passwords are stored as bcrypt hashes.

## Authentication

The API uses **JWT authentication**.

After successful login, the server returns a JWT token.

Protected requests send the token using the `Authorization` header:

```text
Authorization: Bearer YOUR_TOKEN
```

The backend verifies the token before allowing access to protected routes.

## API Endpoints

### Authentication

#### Register

```text
POST /register
```

Example:

```json
{
    "username": "testcustomer",
    "password": "test123456"
}
```

Newly registered users are created as customers.

#### Login

```text
POST /login
```

Example:

```json
{
    "username": "shahzeb",
    "password": "your-password"
}
```

A successful login returns a JWT token and the user's role.

---

## Cars

### Get All Cars

```text
GET /cars
```

Authentication required.

### Get One Car

```text
GET /cars/:id
```

Authentication required.

### Create Car

```text
POST /cars
```

Owner only.

Example:

```json
{
    "brand": "BMW",
    "model": "M5",
    "year": 2025
}
```

### Update Car

```text
PUT /cars/:id
```

Owner only.

Example:

```json
{
    "brand": "BMW",
    "model": "M5 Competition",
    "year": 2025
}
```

### Delete Car

```text
DELETE /cars/:id
```

Owner only.

---

## Users

### Get Customers

```text
GET /users
```

Owner only.

This endpoint returns only users with the `customer` role.

### Delete Customer

```text
DELETE /users/:username
```

Owner only.

Owners cannot delete their own account or another owner account.

## Validation

The API validates:

* Username
* Password
* Brand
* Model
* Car year
* Car ID

Invalid requests return appropriate HTTP status codes and error messages.

## Error Handling

The API includes global error handling for unexpected server errors.

Common status codes include:

* `200` — Successful request
* `201` — Resource created
* `400` — Validation error
* `401` — Authentication required
* `403` — Access denied or invalid token
* `404` — Resource not found
* `500` — Internal server error

## Environment Variables

The backend uses environment variables for sensitive configuration.

Create a `.env` file inside the `backend` folder:

```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-postgresql-connection-string
```

Never upload `.env` to GitHub.

## Running the Backend

Open a terminal in the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

The API runs at:

```text
http://localhost:3000
```

## Running the Frontend

Open another terminal in the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

## Testing

Postman can be used to test the backend API.

For protected endpoints:

```text
Authorization
    ↓
Bearer Token
    ↓
Paste JWT token
```

The frontend can also be used to test the main functionality of the system.

## Project Structure

```text
car-crud-api/
│
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── db.js
│   ├── cars.json
│   └── users.json
│
├── frontend/
│   ├── node_modules/
│   ├── src/
│   │   ├── main.js
│   │   └── style.css
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
```

## Security

* Passwords are hashed using bcrypt.
* JWT tokens are used for authentication.
* Protected routes require authentication.
* Owner-only routes use role-based authorization.
* Database credentials are stored in environment variables.
* `.env` is excluded from GitHub using `.gitignore`.

## Database Hosting

The PostgreSQL database is hosted on **Supabase**.

The backend connects to PostgreSQL using the `pg` package.
