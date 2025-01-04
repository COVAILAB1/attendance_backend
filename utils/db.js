import mysql from 'mysql';

const config = {
  host: "68.178.156.164",
  user: "ATTENDANCE",
  password: "KRISHtec@5747",
  database: "employeems",
  port: 3306,
};

// Function to handle connection and retries
function handleConnection() {
  const con = mysql.createConnection(config);

  con.connect(function (err) {
    if (err) {
      console.error("Connection error:", err.message);
      // Retry after 5 seconds if connection fails
      setTimeout(handleConnection, 5000);
    } else {
      console.log("Connected");
    }
  });
  // Handle connection errors
  con.on('error', function (err) {
    console.error("Database error:", err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log("Reconnecting...");
      handleConnection(); // Reconnect on connection loss
    } else {
      throw err; // Unexpected errors
    }
  });

  return con;
}

const con = handleConnection();

export default con;

// import mysql from 'mysql';

// const pool = mysql.createPool({
//     host: "68.178.156.164",
//     user: "ATTENDANCE",
//     password: "KRISHtec@5747",
//     database: "employeems",
//     port: 3306,
//     connectionLimit: 10, // Limit the number of simultaneous connections
//     connectTimeout: 10000, // 10 seconds
//     acquireTimeout: 30000, // Timeout for acquiring a connection
// });

// // Function to query the database
// const con = {
//     query: (sql, params = []) => {
//         return new Promise((resolve, reject) => {
//             pool.getConnection((err, connection) => {
//                 if (err) {
//                     console.error("Error acquiring connection from pool:", err.message);
//                     reject(err);
//                     return;
//                 }

//                 // Execute the query
//                 connection.query(sql, params, (queryErr, results) => {
//                     connection.release(); // Release the connection back to the pool

//                     if (queryErr) {
//                         console.error("Query error:", queryErr.message);
//                         reject(queryErr);
//                     } else {
//                         resolve(results);
//                     }
//                 });
//             });
//         });
//     },
// };


// // Export the connection object for use in other files
// export default con;
