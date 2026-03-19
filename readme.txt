#  UPI Backend System (The Fast Way Assignment)

##  Overview

This project is a backend system UPI-based money transfer system*

## 🚀 Features

* User Authentication (JWT-based)
*  Check Account Balance
*  Send Money via UPI ID
*  Transaction History 
*  Transaction Status Handling
  * `PENDING`
  * `SUCCESS`
  * `FAILED`
*  Database Transactions (BEGIN/COMMIT/ROLLBACK)
*  Row-level locking using `FOR UPDATE` to prevent race conditions

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* Bcrypt (Password Hashing)

---

## ⚙️Setup & Execution

### 1. Clone Repository

```bash
git clone https://github.com/adityakauthkar/upiBackend.git
cd upiBackend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```env
PORT=4000
JWT_SECRET=your_secret_key
PSQL_URI=your_postgresql_connection_url
```

### 4. Run Server

```bash
node index.js
```

---

## 🗄 Database Schema

### Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

### Bank Accounts

```sql
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  balance NUMERIC DEFAULT 0,
  upi_id TEXT UNIQUE
);
```

### Transactions

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 API Documentation

### 1. Register User

**POST** `/api/user/register`

Request:

```json
{
  "name": "Aditya",
  "email": "test@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### 2. Login User

**POST** `/api/user/login`

Request:

```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token_here"
}
```

---

### 3. Get Balance

**GET** `/api/transactions/balance`

Headers:

```
Authorization: Bearer <token>
```

---

### 4. Send Money

**POST** `/api/transactions/send`

Headers:

```
Authorization: Bearer <token>
```

Request:

```json
{
  "receiverUpiId": "2@upi",
  "amount": 500
}
```

Response:

```json
{
  "success": true,
  "message": "Transaction successful"
}
```

---

### 5. Transaction History

**GET** `/api/transactions/history`

Query Params:

* `status=SUCCESS`
* `startDate=2026-03-01`
* `endDate=2026-03-10`

Example:

```
/api/transactions/history?status=SUCCESS 
```

---

## 🔐 Security Measures

* Passwords hashed using **bcrypt**
* JWT-based authentication
* Protected routes using middleware
* SQL Injection prevention using parameterized queries
* Row-level locking (`FOR UPDATE`) to avoid race conditions

---

## 📈 Assumptions

* Each user has one bank account
* UPI ID is auto-generated (`userId@upi`)
* Each user will have 1000 rupees after registration  
* No external payment gateway integration 

---


## 👨‍💻 Author

**Aditya Kauthkar**


