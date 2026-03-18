UPI backend syatem (The Fast way Assignment)

This project is a backend system simulating a UPI-based money transfer system.

-This project allows users to 
1.Register and Login 
2.Check account balance
3.send money and recieve money 

-The system is built using:
Node.js + Express
PostgreSQL
JWT Authentication


a.Setup and Execution Instructions
1️.Clone the repository
git clone https://github.com/adityakauthkar/upiBackend.git
cd upiBackend
2.Install dependencies
npm install
3. Setup Environment Variables
Create a .env file in the root directory:
PORT=4000
JWT_SECRET=secret_key
PSQL_URI='url'


-Database setup : 
//Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

//bank acc
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  balance NUMERIC DEFAULT 0,
  upi_id TEXT UNIQUE
);


//transactions 
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


Run the server
node index.js



b.API DOCUMENTATION 

Register User
POST /api/user/register
Body:
{
  "name": "Aditya",
  "email": "test@gmail.com",
  "password": "123456"
}


Login User
POST /api/user/login
Body:
{
  "email": "test@gmail.com",
  "password": "123456"
}


Get balance
GET /api/transactions/balance 
Authorization: Bearer <token>

Send Money
POST /api/transactions/send
Headers:
Authorization: Bearer <token>
Body:
{
  "receiverId": 2,
  "amount": 500
}



Author 
Aditya Kauthkar