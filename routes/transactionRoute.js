const express = require('express') ;
const router = express.Router() ; 
const {protect} = require("../middleware/authMiddleware");
const {getBalance , sendMoney} = require('../controller/transactions') ;
const { route } = require('./userRoute');

//GET: get balance 
router.get('/balance' , protect , getBalance) ;

//POST : send money 
router.post('/send' , protect , sendMoney) ;


module.exports = router ; 