# Car CRUD API

A full-stack **Car Management System** built using **Node.js, Express, JavaScript, PostgreSQL (Supabase), JWT authentication, bcryptjs, and Vite**.

The system allows an owner to manage cars and customers, while customers can view available cars.

---

## Technologies Used

### Backend

* Node.js
* Express.js
* JavaScript
* PostgreSQL
* Supabase
* `pg`
* JWT (`jsonwebtoken`)
* `bcryptjs`
* `dotenv`
* CORS

### Frontend

* JavaScript
* HTML
* CSS
* Vite

### API Testing

* Postman

---

## Features

### Authentication

* User registration
* User login
* Password hashing using bcryptjs
* JWT-based authentication
* Bearer token authentication
* Access tokens
* Refresh tokens
* Automatic access-token refreshing
* Role-based authorization
* Automatic logout when the refresh token expires

### Owner

The owner can:

* View all cars
* View a specific car
* Add cars
* Update cars
* Delete cars
* View customers
* Delete customers

### Customer

Customers can:

* View all available cars
* View individual car information

Customers cannot:

* Add cars
* Update cars
* Delete cars
* View the customer list
* Delete customers

---

## Database

The application uses **PostgreSQL hosted on Supabase**.

### Cars Table

| Column | Type   | Description        |
| ------ | ------ | ------------------ |
| id     | bigint | Primary key        |
| brand  | text   | Car brand          |
| model  | text   | Car model          |
| year   | bigint | Manufacturing year |

### Users Table

| Column   | Type | Description     |
| -------- | ---- | --------------- |
| username | text | Primary key     |
| password | text | Hashed password |
| role     | text | User role       |

The available roles are:

* `owner`
* `customer`

---

## Authentication

The API uses **JWT (JSON Web Token)** for authentication.

After successful login, the server returns:

* An **access token**
* A **refresh token**

### Access Token

The access token is used to access protected API routes.

The token is sent using the HTTP `Authorization` header:

```text
Authorization: Bearer <access-token>
```

The backend verifies the access token before allowing access to protected routes.

### Refresh Token

The refresh token is used to obtain a new access token when the current access token expires.

The frontend automatically detects an expired access token and sends the refresh token to the `/refresh-token` endpoint.

The process works like this:

```text
Access token expires
        ↓
Frontend receives expired-token response
        ↓
Frontend sends refresh token
        ↓
POST /refresh-token
        ↓
Backend verifies refresh token
        ↓
New access token is generated
        ↓
Original request is retried
        ↓
User continues using the application
```

The user does not need to log in again when only the access token expires.

### Token Expiration

For the current demonstration setup:

* Access token: **1 minute**
* Refresh token: **5 minutes**

After the access token expires, the refresh token can be used to obtain a new access token.

After the refresh token expires, a new access token cannot be generated and the user is logged out. The user must log in again.

> **Note:** These short expiration times are configured for demonstration/testing purposes. In a production application, longer expiration times would normally be used.

---

## API Endpoints

### Authentication

#### Register

```http
POST /register
```

Creates a new customer account.

Example request:

```json
{
    "username": "ali",
    "password": "123456"
}
```

---

#### Login

```http
POST /login
```

Logs a user in and returns an access token and refresh token.

Example request:

```json
{
    "username": "ali",
    "password": "123456"
}
```

Example response:

```json
{
    "message": "Login successful",
    "username": "ali",
    "role": "customer",
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>"
}
```

---

#### Refresh Access Token

```http
POST /refresh-token
```

Generates a new access token using a valid refresh token.

Example request:

```json
{
    "refreshToken": "<refresh-token>"
}
```

The refresh token is verified by the backend before generating a new access token.

---

### Cars

#### Get All Cars

```http
GET /cars
```

Requires authentication.

Returns all available cars.

---

#### Get One Car

```http
GET /cars/:id
```

Requires authentication.

Example:

```http
GET /cars/1
```

---

#### Add Car

```http
POST /cars
```

Owner only.

Example request:

```json
{
    "brand": "BMW",
    "model": "M5",
    "year": 2025
}
```

---

#### Update Car

```http
PUT /cars/:id
```

Owner only.

Example:

```http
PUT /cars/1
```

Example request:

```json
{
    "brand": "Honda",
    "model": "Civic",
    "year": 2025
}
```

---

#### Delete Car

```http
DELETE /cars/:id
```

Owner only.

Example:

```http
DELETE /cars/1
```

---

### Customers

#### Get Customers

```http
GET /users
```

Owner only.

This endpoint returns customers and does not include the owner.

---

#### Delete Customer

```http
DELETE /users/:username
```

Owner only.

Example:

```http
DELETE /users/ali
```

The owner cannot delete their own account or another owner account.

---

## Validation and Error Handling

The backend includes validation and error handling for situations such as:

* Missing username
* Missing password
* Missing car brand
* Missing car model
* Missing car year
* Invalid car ID
* Car not found
* Customer not found
* Duplicate username
* Invalid login credentials
* Missing access token
* Invalid or expired access token
* Invalid or expired refresh token
* Insufficient permissions
* Database errors

---

## Environment Variables

The backend uses a `.env` file for sensitive configuration.

Example:

```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
DATABASE_URL=your-postgresql-connection-string
```

The `.env` file should **not** be uploaded to GitHub.

It is excluded using `.gitignore`.

---

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
│   └── db.js
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
└── README.md
```

> `node_modules/` and `.env` are local files and are ignored by Git. They are shown above only to explain the local project structure.

---

## How to Run the Backend

Open a terminal and navigate to the backend folder:

```powershell
cd backend
```

Install dependencies:

```powershell
npm install
```

Start the server:

```powershell
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

---

## How to Run the Frontend

Open another terminal and navigate to the frontend folder:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Vite will provide a local URL, normally similar to:

```text
http://localhost:5173/
```

Open that URL in your browser.

---

## Using the Application

1. Start the backend server.
2. Start the frontend development server.
3. Open the frontend URL in your browser.
4. Register a customer account or log in.
5. Owners can access the Owner Dashboard.
6. Customers can access the Customer Page.
7. Owners can manage cars and customers.
8. Customers can view available cars.
9. When an access token expires, the frontend automatically refreshes it using the refresh token.
10. When the refresh token expires, the user is logged out and must log in again.

---

## Security

The application uses:

* JWT authentication
* Access and refresh tokens
* Bearer token authentication
* Password hashing with bcryptjs
* Environment variables for sensitive configuration
* Role-based authorization
* Protected API routes
* Automatic access-token renewal

The PostgreSQL database is hosted using Supabase.

---

## GitHub

The project is stored in a GitHub repository:

**MuhamadShahzebMansoor/car-crud-api**

---

## Author

**Muhammad Shahzeb Mansoor**
