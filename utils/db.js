// import mysql from 'mysql';

// const config = {
//   host: "68.178.156.164",
//   user: "ATTENDANCE",
//   password: "KRISHtec@5747",
//   database: "employeems",
//   port: 3306,
// };

// // Function to handle connection and retries
// function handleConnection() {
//   const con = mysql.createConnection(config);

//   con.connect(function (err) {
//     if (err) {
//       console.error("Connection error:", err.message);
//       // Retry after 5 seconds if connection fails
//       setTimeout(handleConnection, 5000);
//     } else {
//       console.log("Connected");
//     }
//   });
//   // Handle connection errors
//   con.on('error', function (err) {
//     console.error("Database error:", err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
//       console.log("Reconnecting...");
//       handleConnection(); // Reconnect on connection loss
//     } else {
//       throw err; // Unexpected errors
//     }
//   });

//   return con;
// }

// const con = handleConnection();

// export default con;



import mysql from 'mysql';


const config = {
  host: "68.178.156.164",
  user: "ATTENDANCE",
  password: "KRISHtec@5747",
  database: "employeems",
  port: 3306,
  connectionLimit: 10, // Limit for connection con
  waitForConnections: true,
  queueLimit: 0, // No query queue limit
  connectTimeout: 10000, // 10 seconds timeout for initial connection
 acquireTimeout: 10000, // 10 seconds timeout for acquiring a connection
};
// const config = {
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "employeems",
 
// };
// // Create a connection con
const con = mysql.createPool(config);

// Function to handle queries with retries
function queryWithRetry(query, params, retries = 3) {
  return new Promise((resolve, reject) => {
    const executeQuery = (attemptsLeft) => {
      con.query(query, params, (err, results) => {
        if (err) {
          if (
            (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") &&
            attemptsLeft > 0
          ) {
            console.log(`Retrying query... Attempts left: ${attemptsLeft}`);
            setTimeout(() => executeQuery(attemptsLeft - 1), 1000); // Retry after 1 second
          } else {
            reject(err); // Fail after retries are exhausted or non-recoverable errors
          }
        } else {
          resolve(results);
        }
      });
    };
    executeQuery(retries);
  });
}




// Handle con errors
con.on('error', (err) => {
  console.error("con error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log("Reinitializing connection con...");
    // Optionally handle con recreation logic here if needed
  } else {
    throw err; // Unexpected errors
  }
});


export default con;
