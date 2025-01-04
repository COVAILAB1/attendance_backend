import mysql from 'mysql'

const con = mysql.createConnection({
    host: "68.178.156.164",
    user: "ATTENDANCE",
    password: "KRISHtec@5747",
    database: "employeems",
    port:3306
})

con.connect(function(err) {
    if(err) {
        console.log("connection error",err.message)
    } else {
        console.log("Connected")
    }
})

// export default con;
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
