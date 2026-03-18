const express = require('express') ;
const router = express.Router() ; 
const {protect} = require("../middleware/authMiddleware");
const {getBalance , sendMoney , getTransactionHistory} = require('../controller/transactions') ;

//GET: get balance 
router.get('/balance' , protect , getBalance) ;

//POST : send money 
router.post('/send' , protect , sendMoney) ;

//GET: transaction history
router.get('/history' ,protect ,  getTransactionHistory )

module.exports = router ; 