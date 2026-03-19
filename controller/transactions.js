const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");

//1.Get user balance
const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT balance from bank_accounts WHERE user_id=$1 ",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success:true,
      balance: result.rows[0].balance,
    });

  } catch (error) {
    console.log("Error" , error);
    res.status(500).json({ 
      success:false,
      message: "Error fetching balance"
     });
  }
};

//Send money to user using UPI id
const sendMoney = async (req, res) => {
  let transactionId;
  try {
    const senderId = req.user.id; //sender userId
    const { receiverUpiId, amount } = req.body;
    const parsedAmt = Number(amount) ;

    //validation
    if (!receiverUpiId || !parsedAmt) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!parsedAmt || parsedAmt <= 0) {
      return res.status(400).json({
        success:false,
        message: "Amount must be greater than 0",
      });
    }

    //BEGIN
    await pool.query("BEGIN");

    //Sender Account :
    const result = await pool.query(
      "SELECT * FROM bank_accounts WHERE user_id = $1 FOR UPDATE",
      [senderId],
    );

    //check sender account :
    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "sender account not found",
      });
    }

    const sender = result.rows[0];

    //Reciever account :
    const receiverResult = await pool.query(
      "SELECT * FROM bank_accounts WHERE upi_id = $1 FOR UPDATE",
      [receiverUpiId],
    );

    //reciever not found
    if (receiverResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const receiver = receiverResult.rows[0];

    //error if balance is less than sending amt 
    if (sender.balance < parsedAmt) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Insufficient bank balance",
      });
    }

    //error if sender and reciever is same
    if (senderId === receiver.user_id) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Sender and Reciever should be different",
      });
    }

    //Insert pending at start pending transaction
    const pendingTransaction = await pool.query(
      `INSERT INTO transactions (sender_id  , receiver_id , amount , status) 
      values($1 , $2 , $3 , $4) RETURNING id`,
      [senderId, receiver.user_id, parsedAmt, "PENDING"],
    );

    transactionId = pendingTransaction.rows[0].id;

    //sender balance : newBalance = balance - amount
    await pool.query(
      "UPDATE bank_accounts SET balance = balance - $1 WHERE user_id = $2",
      [parsedAmt, senderId], //senderId
    );

    //reciever balance : newBalance = balance + amount
    await pool.query(
      "UPDATE bank_accounts SET balance = balance + $1 WHERE user_id = $2",
      [parsedAmt, receiver.user_id], //recieverId 
    );

    //update transaction table :
    await pool.query("UPDATE transactions SET status=$1 WHERE id= $2 ", [
      "SUCCESS",
      transactionId,
    ]);

    await pool.query("COMMIT"); 

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
    });
  } catch (error) {
    await pool.query("ROLLBACK");

    if (transactionId) {
      await pool.query("UPDATE transactions SET status=$1 WHERE id=$2", [
        "FAILED",
        transactionId,
      ]);
    }

    console.log("Error in sending money:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Transaction failed",
    });
  }
};

// GET Transaction History :
const getTransactionHistory = async (req, res) => {
  try {
    // const {status  } = req.query; 
    const userId = req.user.id;

    // let query = `SELECT * FROM transactions WHERE (sender_id = $1 OR receiver_id = $1)` ; 
    // let values = [userId];


    const result = await pool.query(
      "SELECT * FROM transactions WHERE sender_id = $1  OR receiver_id = $1 ",
      [userId],
    );
    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully. ",
      transactions: result.rows,
    });
  } catch (error) {
    console.log("Error while retriving transations ", error);

    return res.status(400).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getBalance, sendMoney, getTransactionHistory };
