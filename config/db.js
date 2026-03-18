const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.PSQL_URI, 
 
  ssl: {
    rejectUnauthorized: false,
  },
});

// (async () => {
//   const res = await pool.query("SELECT *FROM transactions" );
//   console.log(res.rows);
// })();

module.exports = pool;  
