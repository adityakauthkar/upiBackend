const jwt = require("jsonwebtoken");
// const pool = require("../config/db");
require("dotenv").config();

const protect = async (req, res , next) => {
  const authHeader = req.header("Authorization") || null;
  const token =authHeader && authHeader.startsWith("Bearer ")? authHeader.split(" ")[1]: null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is missing",
    });
  }

  //verify token
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode", decode);
    req.user = decode;
  } catch (error) {
      console.log(error);
        return res.status(401).json({
            success: false,
            message: "Token is invalid",
        })
  }
    next();
};



module.exports = {protect};