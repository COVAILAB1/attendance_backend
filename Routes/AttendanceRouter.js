// routes/attendance.js
import express from 'express';
import con from "../utils/db.js"; // Example path
const router = express.Router();

// router.post("/attendance", (req, res) => {
//     const { name, timeIn, timeOut } = req.body;
//     // Example SQL query to insert attendance record
//     const sql = "INSERT INTO attendance (name, timein, timeout) VALUES (?, ?, ?)";
//     con.query(sql, [name, timeIn, timeOut], (err, result) => {
//       if (err) {
//         console.error("Error marking attendance:", err);
//         return res.status(500).json({ error: "Error marking attendance" });
//       }
      
//       return res.status(200).json({ message: "Attendance marked successfully" });
//     });
// });

router.post("/attendance/login", (req, res) => {
  const { name, timeIn ,login_status,attendanceType} = req.body;
  const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const formattedDateIST = new Date(currentDateIST).toISOString().slice(0, 19).replace('T', ' ');
  // Insert or update the record with Time In
  const sql = `
      INSERT INTO attendance (name, timein,login_status,status,date) 
      VALUES (?, ?, ?,?,?)
      ON DUPLICATE KEY UPDATE timein = VALUES(timein), date = ?
  `;
  con.query(sql, [name, timeIn,login_status,attendanceType,formattedDateIST,formattedDateIST], (err, result) => {
      if (err) {
          console.error("Error logging Time In:", err);
          return res.status(500).json({ error: "Error logging Time In" });
      }
      return res.status(200).json({ message: "Time In logged successfully" });
  });
});

router.post("/attendance/leave-approval-entry", (req, res) => {
  const { name,date,attendanceType,login_status} = req.body;
  

  // Insert or update the record with Time In
  const sql = `
      INSERT INTO attendance (name,date,status,login_status) 
      VALUES (?, ?,?,?)
      
  `;
  con.query(sql, [name,date,attendanceType,login_status], (err, result) => {
      if (err) {
          console.error("Error logging Time In:", err);
          return res.status(500).json({ error: "Error logging Time In" });
      }
      return res.status(200).json({ message: "Time In logged successfully" });
  });
});


// Route to handle On Duty submission
router.post('/attendance/onduty', (req, res) => {
  const { name,attendanceType, remarks } = req.body;

  // Input validation
  if (!name || !attendanceType || !remarks) {
    return res.status(400).json({ message: 'All fields are required except date, which defaults to today.' });
  }

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Insert query
  const query = `
    INSERT INTO attendance (name, date, status, remarks,login_status)
    VALUES (?, ?, ?, ?,?)
  `;
  const values = [name, currentDate, attendanceType, remarks,"true"];

  con.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting On Duty entry:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    res.status(200).json({ message: 'On Duty entry submitted successfully.' });
  });
});


router.get('/attendance/leave-approval-check', (req, res) => {
  const { employeeName, date } = req.query;

  // Validate input
  if (!employeeName || !date) {
    return res.status(400).json({ error: 'Employee name and date are required' });
  }

  // SQL query to check if the date is within the range of start_date and end_date
  const sql = `
    SELECT status
    FROM leaves
    WHERE employee_name = ? 
      AND ? BETWEEN start_date AND end_date 
      AND status = "Approved"
    LIMIT 1;
  `;

  // Execute query using con.query (MySQL)
  con.query(sql, [employeeName, date], (err, result) => {
    if (err) {
      console.error('Error checking leave status:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length > 0) {
      // Leave record found, send approval status
      res.json({ approved: true });
    } else {
      // No leave record found
      res.json({ approved: false, message: 'No leave record found for today' });
    }
  });
});

  

  router.post('/attendance/comp-approval-entry', (req, res) => {
    const { name, date, attendanceType,login_status,remarks} = req.body;

  
    if (!name || !date || !attendanceType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    // Insert into attendancew table
    const insertAttendanceQuery = `
      INSERT INTO attendance (name,date,status,login_status,remarks)
      VALUES (?, ?,?,?,?)
    `;
  
    con.query(insertAttendanceQuery, [name, date,attendanceType,login_status,remarks], (err, attendanceResult) => {
      if (err) {
        console.error('Error inserting into attendancew table:', err);
        return res.status(500).json({ error: 'Failed to insert into attendancew table' });
      }
  
      // Determine adjustment values based on attendanceType
      let adjustment;
      if (attendanceType === 'COMP(0.5)') {
        adjustment = 0.5;
      } else if (attendanceType === 'COMP(1)') {
        adjustment = 1;
      } else {
        return res.status(400).json({ error: 'Invalid attendanceType' });
      }
  
      // Update leave_status and compensate_leaves tables
      const updateLeaveStatusQuery = `
        UPDATE leave_status
        SET available_leaves = available_leaves + ?
        WHERE employee_name = ?
      `;
      const updateCompensateLeavesQuery = `
        UPDATE leave_status
        SET compensate_leaves = compensate_leaves + ?
        WHERE employee_name = ?
      `;
  
      con.query(updateLeaveStatusQuery, [adjustment, name], (err, leaveResult) => {
        if (err) {
          console.error('Error updating leave_status:', err);
          return res.status(500).json({ error: 'Failed to update leave status' });
        }
  
        con.query(updateCompensateLeavesQuery, [adjustment, name], (err, compResult) => {
          if (err) {
            console.error('Error updating compensate_leaves:', err);
            return res.status(500).json({ error: 'Failed to update compensate leaves' });
          }
  
          res.status(200).json({ message: 'Attendance and leave records updated successfully' });
        });
      });
    });
  });
  
  
  router.post("/attendance/logout", (req, res) => {
    const { name, timeOut, logout_status, workDone } = req.body;
  
    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
  
    const sql = `
        UPDATE attendance 
        SET timeout = ?, logout_status = ?, work_done = ?
        WHERE name = ? AND DATE= ?
    `;
  
    // Execute the query with placeholders for safety
    con.query(sql, [timeOut, logout_status, workDone, name, currentDate], (err, result) => {
        if (err) {
            console.error('Error updating Time Out and Logout Status:', err);
            return res.status(500).json({ error: 'Error updating Time Out and Logout Status' });
        }
  
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No matching record found for the current date' });
        }
  
        res.status(200).json({ message: 'Time Out and Logout Status updated successfully' });
    });
  });
  

export { router as AttendanceRouter };
