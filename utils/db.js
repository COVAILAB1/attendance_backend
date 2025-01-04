// import mysql from 'mysql'

// const con = mysql.createConnection({
//     host: "68.178.145.49",
//     user: "ATTENDANCE",
//     password: "KRISHtec@5747",
//     database: "employeems",
//     port:3306
// })

// con.connect(function(err) {
//     if(err) {
//         console.log("connection error",err.message)
//     } else {
//         console.log("Connected")
//     }
// })

// export default con;

import mysql from 'mysql';

const con = mysql.createConnection({
    host: "68.178.156.164",
    user: "ATTENDANCE",
    password: "KRISHtec@5747",
    database: "employeems",
    port: 3306,
    connectTimeout: 10000 // Set a 10-second timeout for the connection
});

// Handle connection
function handleConnection() {
    con.connect((err) => {
        if (err) {
            console.error("Connection error:", err.message);
            // Retry connection after a delay in case of failure
            setTimeout(handleConnection, 1000);
        } else {
            console.log("Connected to the database");
        }
    });
    
    // Handle connection errors
    con.on('error', (err) => {
        console.error("Database error:", err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code ==='ECONNRESET') {
            console.log("Reconnecting...");
            handleConnection(); // Reconnect on connection loss
        } else {
            throw err; // For other errors, let the application crash
        }
    });
}

handleConnection();

export default con;
