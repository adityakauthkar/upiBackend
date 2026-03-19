const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require('jsonwebtoken') ;

//REGISTER : 
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; 

    //validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // console.log(req.body);

    //Check if user exists in db
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //insert user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email",
      [name, email, hashedPassword],
    );

    //creating newUser
    await pool.query(
      "INSERT INTO bank_accounts (user_id, balance, upi_id) VALUES ($1, $2, $3)",
      [newUser.rows[0].id, 1000, `${newUser.rows[0].id}@upi`],
    );

    return res.status(202).json({
      success: true,
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

//LOGIN : 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userFound = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userFound.rows.length === 0) {
      return res.status(400).json({
        success:false,
        message: "User is not registered . Please Sign up first",
      });
    }

    const user = userFound.rows[0]; 

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success:false,
        message: "Incorrect password", 
      });
    }

    //generate token 
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success:true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error : ", error);
    res.status(500).json({
      success:false,
      message: "Server error",
    });
  }
};


module.exports = { register, login };
