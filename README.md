# Car CRUD API

A RESTful Car CRUD API built with Node.js and Express.js.

The API uses PostgreSQL through Supabase for data storage, JWT for authentication, bcrypt for password hashing, and Postman for API testing.

## Technologies

* Node.js
* Express.js
* PostgreSQL
* Supabase
* JWT (JSON Web Token)
* bcrypt
* dotenv
* pg (node-postgres)
* Postman

## Features

* User registration
* User login
* Password hashing with bcrypt
* JWT authentication
* Owner and customer roles
* Role-based authorization
* Create cars
* Read cars
* Update cars
* Delete cars
* Input validation
* PostgreSQL database
* Global error handling

## Database

The project uses PostgreSQL hosted on Supabase.

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

The API uses JWT authentication.

After logging in, the server returns a JWT token.

Protected requests use the token in the Authorization header:

```text
Authorization: Bearer YOUR_TOKEN
```

## User Roles

### Owner

The owner can:

* View cars
* Create cars
* Update cars
* Delete cars
* View users
* Delete customer accounts

### Customer

Customers can:

* View cars
* View individual cars

Customers cannot:

* Create cars
* Update cars
* Delete cars
* Manage users

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

The response contains a JWT token.

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

## Users

### Get Users

```text
GET /users
```

Owner only.

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

The API includes a global error handler for unexpected server errors.

Common status codes include:

* `200` — Successful request
* `201` — Resource created
* `400` — Validation error
* `401` — Authentication required
* `403` — Access denied or invalid token
* `404` — Resource not found
* `500` — Internal server error

## Environment Variables

Create a `.env` file containing:

```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-postgresql-connection-string
```

Never upload `.env` to GitHub.

## Running the Project

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

## Testing

Postman can be used to test all API endpoints.

For protected endpoints, select:

```text
Authorization
→ Bearer Token
→ Paste JWT token
```

## Project Structure

```text
car-crud-api/
│
├── db.js
├── server.js
├── migrate-users.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── .env
```

The PostgreSQL database is hosted on Supabase.

## Security

* Passwords are hashed using bcrypt.
* JWT tokens are used for authentication.
* Role-
