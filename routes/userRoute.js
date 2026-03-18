const express = require('express') ;
const router = express.Router() ; 
const {register, login} = require('../controller/user') ;



//POST: register user 
router.post("/register" , register) ;


//POST : login user
router.post("/login" , login) ;


module.exports = router ; 
