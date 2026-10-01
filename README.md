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
* Role-based authorization

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

After successful login, the server returns a token.

The token is sent with protected requests using the HTTP `Authorization` header:

```text
Authorization: Bearer <token>
```

The backend verifies the token before allowing access to protected routes.

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

Logs a user in and returns a JWT token.

Example request:

```json
{
    "username": "ali",
    "password": "123456"
}
```

---

### Cars

#### Get All Cars

```http
GET /cars
```

Requires authentication.

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
* Invalid access token
* Insufficient permissions
* Database errors

---

## Environment Variables

The backend uses a `.env` file for sensitive configuration.

Example:

```env
JWT_SECRET=your-secret-key
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

---

## Security

The application uses:

* JWT authentication
* Bearer tokens
* Password hashing with bcryptjs
* Environment variables for sensitive configuration
* Role-based authorization
* Protected API routes

The PostgreSQL database is hosted using Supabase.

---

## GitHub

The project is stored in a GitHub repository:

**MuhamadShahzebMansoor/car-crud-api**

---

## Author

**Muhammad Shahzeb Mansoor**
