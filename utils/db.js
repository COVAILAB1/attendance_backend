// // import mysql from 'mysql'

// // const con = mysql.createConnection({
// //     host: "68.178.145.49",
// //     user: "ATTENDANCE",
// //     password: "KRISHtec@5747",
// //     database: "employeems",
// //     port:3306
// // })

// // con.connect(function(err) {
// //     if(err) {
// //         console.log("connection error",err.message)
// //     } else {
// //         console.log("Connected")
// //     }
// // })

// // export default con;

// import mysql from 'mysql';

// const con = mysql.createConnection({
//     host: "68.178.145.49",
//     user: "ATTENDANCE",
//     password: "KRISHtec@5747",
//     database: "employeems",
//     port: 3306,
//     connectTimeout: 100000000 // Set a 10-second timeout for the connection
// });

// // Handle connection
// function handleConnection() {
//     con.connect((err) => {
//         if (err) {
//             console.error("Connection error:", err.message);
//             // Retry connection after a delay in case of failure
//             setTimeout(handleConnection, 5000);
//         } else {
//             console.log("Connected to the database");
//         }
//     });
    
//     // Handle connection errors
//     con.on('error', (err) => {
//         console.error("Database error:", err.code);
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.log("Reconnecting...");
//             handleConnection(); // Reconnect on connection loss
//         } else {
//             throw err; // For other errors, let the application crash
//         }
//     });
// }

// handleConnection();

// export default con;



import mysql from 'mysql';

const pool = mysql.createPool({
    host: "68.178.145.49",
    user: "ATTENDANCE",
    password: "KRISHtec@5747",
    database: "employeems",
    port: 3306,
    connectionLimit: 10,
    connectTimeout: 10000,
    acquireTimeout: 30000, // Timeout for acquiring a connection
    waitForConnections: true, // Queue requests when no connections are available
    keepAlive: true, // Enables TCP keep-alive
});


// Handle connection pool events
pool.on('acquire', () => {
    console.log("Connection acquired from the pool");
});

pool.on('release', () => {
    console.log("Connection released back to the pool");
});

pool.on('error', (err) => {
    console.error("Database pool error:", err.code);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log("Attempting to reconnect...");
        // Automatically handled by the pool
    } else {
        throw err; // Let the application crash for unhandled errors
    }
});

// Export the pool for use in other files
const con = {
    query: (query, params = []) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error("Error getting connection from pool:", err.message);
                    reject(err);
                    return;
                }

                connection.query(query, params, (queryErr, results) => {
                    connection.release(); // Release connection back to the pool

                    if (queryErr) {
                        console.error("Query error:", queryErr.message);
                        reject(queryErr);
                    } else {
                        resolve(results);
                    }
                });
            });
        });
    },
};

export default con;
