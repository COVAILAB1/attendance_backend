import mysql from 'mysql'

const con = mysql.createConnection({
    host: "68.178.145.49",
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

export default con;

