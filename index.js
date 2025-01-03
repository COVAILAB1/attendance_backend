// import express from "express";
// import cors from 'cors';
// import { adminRouter } from "./Routes/AdminRoute.js";
// import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
// import Jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import { AttendanceRouter } from './Routes/AttendanceRouter.js';
// import { taskRouter } from "./Routes/taskRoutes.js";

// const app = express();

// // CORS options with dynamic origin and credentials
// const corsOptions = {
//     origin: (origin, callback) => {
//         // Allow specific origins only
//         if (origin === 'http://localhost:5173' || origin === 'https://attendance.krishtec.co.in') {
//             callback(null, origin);  // Allow these origins
//         } else {
//             callback(new Error('Not allowed by CORS'), false);  // Reject other origins
//         }
//     },
//     credentials: true,  // Allow sending cookies and authorization headers
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));  // Handle preflight requests

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

// app.get('/verify', verifyUser, (req, res) => {
//     return res.json({ Status: true, role: req.role, id: req.id });
// });

// app.listen(port, () => {
//     console.log("Server is running");
// });


import express from "express";
import cors from 'cors';
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import { AttendanceRouter } from './Routes/AttendanceRouter.js';
import { taskRouter } from "./Routes/taskRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

// CORS options with dynamic origin and credentials
const corsOptions = {
    origin: (origin, callback) => {
        // Allow specific origins only
        if (origin === 'http://localhost:5173' || origin === 'https://attendance.krishtec.co.in') {
            callback(null, origin);  // Allow these origins
        } else {
            callback(new Error('Not allowed by CORS'), false);  // Reject other origins
        }
    },
    credentials: true,  // Allow sending cookies and authorization headers
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle preflight requests

app.use(express.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/employee', EmployeeRouter);
app.use('/employee', AttendanceRouter);
app.use('/employee', taskRouter);
app.use(express.static('Public'));

const port = process.env.PORT || 3000;

// Removed authentication check; this route is now open
app.get('/verify', (req, res) => {
    return res.json({ Status: true });
});

app.listen(port, () => {
    console.log("Server is running");
});
