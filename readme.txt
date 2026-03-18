database setup : 
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



user : 
/api/users/register
/api/users/login


transaction:
/api/transactions/send
/api/transaction/history

