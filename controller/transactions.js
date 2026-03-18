const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");

//Get  user balance
const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT balance from bank_accounts WHERE user_id=$1",
      [userId],
    );

    return res.status(200).json({
      balance: result.rows[0].balance,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching balance" });
  }
};

//Send money to user using UPI id
const sendMoney = async (req, res) => {
  try {
    const senderId = req.user.id; //sender userId
    const { receiverUpiId, amount } = req.body;

    //validation
    if (!receiverUpiId || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    await pool.query("BEGIN");

    //Sender Account :
    const result = await pool.query(
      "SELECT * FROM bank_accounts WHERE user_id = $1",
      [senderId],
    );

    //check sender account :
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "sender account not found",
      });
    }

    const sender = result.rows[0];

    //Reciever account :
    const receiverResult = await pool.query(
      "SELECT * FROM bank_accounts WHERE upi_id = $1",
      [receiverUpiId],
    );
``
    if (receiverResult.rows.length === 0) {
      return res.json({
        success: false,
        message: "Reciver not found",
      });
    }

    const receiver = receiverResult.rows[0];
   

    //error if balance is less than sending amt
    if (sender.balance < amount) {
      return res.json({
        message: "Insufficient balance",
      });
    }

    //error if sender and reciever is same 
    if(senderId === receiver.user_id){
      return res.status(404).json({
        success:false,
        message : 'sneder and reciever should be different',
      })
    }

    //sender balance : newBalance = balance - amount
    await pool.query(
      "UPDATE bank_accounts SET balance = balance - $1 WHERE user_id = $2",
      [amount, senderId], //senderid
    );

    //reciever balance : newBalance = balance + amount
    await pool.query(
      "UPDATE bank_accounts SET balance = balance + $1 WHERE user_id = $2",
      [amount, receiver.user_id], //senderid
    );

    //update transaction table :
    await pool.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, status) 
       VALUES ($1, $2, $3, $4)`,
      [senderId, receiver.user_id, amount, "SUCCESS"],
    );

    await pool.query("COMMIT");

    return res.status(200).json({
      message: "Transaction successful",
    });


  } catch (error) {
     await pool.query("ROLLBACK");

    console.log("Error in sending money:", error.message);

    return res.status(400).json({
      success : false,
      message: error.message || "Transaction failed",
    });
  }
};


// GET Transaction History : 
const getTransactionHistory = async(req , res)=>{
  try{ 

    const {status} = req.query;
    const userId = req.user.id ; 

    const result = await pool.query('SELECT * FROM transactions WHERE sender_id = $1  OR receiver_id = $1' ,
      [userId] 
    ) ; 
    return res.status(200).json({
      success:true , 
      message: 'Transaction fetched successfully. ',
       transactions : result.rows ,
    })

  }catch(error) { 
    console.log("Error while retriving transations " , error) ;

    return res.status(400).json({
      success: false , 
      message: 'Server error' ,
    })

  }
}


module.exports = { getBalance, sendMoney  , getTransactionHistory};
