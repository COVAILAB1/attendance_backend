import express from "express";
import cors from 'cors';
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { AttendanceRouter } from './Routes/AttendanceRouter.js';
import { taskRouter } from "./Routes/taskRoutes.js";

const app = express();
app.use(cors({
    origin: '*', // Accept requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
  
  // Log the headers to check if CORS is applied properly
  app.use((req, res, next) => {
    // console.log(req.headers.origin);  // Log the origin header
    next();
  });
  

app.use(express.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/employee', EmployeeRouter);
app.use('/employee', AttendanceRouter);
app.use('/employee', taskRouter);
app.use(express.static('Public'));

const port = process.env.PORT || 3000;

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
            if (err) return res.json({ Status: false, Error: "Wrong Token" });
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        });
    } else {
        return res.json({ Status: false, Error: "Not authenticated" });
    }
};

app.get('/verify', verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id });
});

app.listen(port, () => {
    console.log("Server is running");
});


// import express from "express";
// import cors from 'cors';
// import { adminRouter } from "./Routes/AdminRoute.js";
// import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
// import { AttendanceRouter } from './Routes/AttendanceRouter.js';
// import { taskRouter } from "./Routes/taskRoutes.js";
// import cookieParser from "cookie-parser";

// const app = express();



// app.use(cors());
// // Handle preflight requests

// app.use(express.json());
// app.use(cookieParser());
// app.use('/auth', adminRouter);
// app.use('/employee', EmployeeRouter);
// app.use('/employee', AttendanceRouter);
// app.use('/employee', taskRouter);
// app.use(express.static('Public'));

// const port = process.env.PORT || 3000;


// const verifyUser = (req, res, next) => {
//     const token = req.cookies.token;
//     if (token) {
//         Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
//             if (err) return res.json({ Status: false, Error: "Wrong Token" });
//             req.id = decoded.id;
//             req.role = decoded.role;
//             next();
//         });
//     } else {
//         return res.json({ Status: false, Error: "Not authenticated" });
//     }
// };

// // Removed authentication check; this route is now open
// app.get('/verify', (req, res) => {
//     return res.json({ Status: true });
// });

// app.listen(port, () => {
//     console.log("Server is running");
// });
