const express = require('express') 
const app = express() ; 
// const pool = require('./config/db');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000 ; 


const userRoute = require('./routes/userRoute'); 
const transactionRoute = require('./routes/transactionRoute') ;

//middlewares
app.use(express.json()) ;




//routes
app.use('/api/user' , userRoute) ; 
app.use('/api/transactions', transactionRoute);
app.use(cookieParser());

app.get('/' , (req , res) => { 
   return res.json({
    success: true,
        message: "Your server is up and running ...",
   })
})


app.listen( PORT  , () => { 
    console.log(`Server is running on  ${PORT}`) ;
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
});