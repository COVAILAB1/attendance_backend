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

// Function to create a MySQL connection
function createConnection() {
    const con = mysql.createConnection({
        host: "68.178.145.49",
        user: "ATTENDANCE",
        password: "KRISHtec@5747",
        database: "employeems",
        port: 3306,
    });

    // Connect to the database
    con.connect((err) => {
        if (err) {
            console.error("Connection error:", err.message);
            setTimeout(createConnection, 5000); // Retry connection after 5 seconds
        } else {
            console.log("Connected to the database");
        }
    });

    // Handle connection errors
    con.on('error', (err) => {
        console.error("Database error:", err.message);

        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            console.log("Attempting to reconnect...");
            setTimeout(createConnection, 5000); // Retry connection after 5 seconds
        } else {
            throw err; // For other errors, re-throw to investigate further
        }
    });

    return con;
}

// Initialize the connection
const con = createConnection();

export default con;
