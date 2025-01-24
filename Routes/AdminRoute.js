import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token)
      return res.json({ loginStatus: true });
    } else {
        return res.json({ loginStatus: false, Error:"wrong email or password" });
    }
  });
});

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})



router.post('/add_task', (req, res) => {
    const { employeeName, taskName, startDate, endDate,taskDescription } = req.body;
    
    // Validate inputs
    if (!employeeName || !taskName || !startDate || !endDate) {
        return res.json({ Status: false, Error: 'All fields are required!' });
    }

    const sql = 
        `INSERT INTO tasks (employee_name, task_name,start_date,end_date,description) 
        VALUES (?, ?, ?, ?, ?)
        `;

    const values = [
        employeeName,
        taskName,
         // Use null if taskDescription is empty
        startDate,
        endDate,
        taskDescription || null,
    ];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.json({ Status: false, Error: 'An error occurred while adding the task.' });
        }

        if (result.affectedRows > 0) {
            return res.json({ Status: true, Message: 'Task successfully added!' });
        } else {
            return res.json({ Status: false, Error: 'Failed to add task. Please try again.' });
        }
    });
});

// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
// end imag eupload 

router.post('/add_employee', upload.single('image'), (req, res) => {

  
    const sqlInsertEmployee = `INSERT INTO employee 
        (name, email, password, address, salary, image, position,gender,start_date,work_schedule,work_location,shift,dob,phone,employee_type,department) 
        VALUES (?)`;

    const values = [
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.address,
      req.body.salary,
      req.file.filename,
      req.body.position,
      req.body.gender,
      req.body.start_date,
      req.body.work_policy,
      req.body.work_location,
      req.body.shift,
      req.body.dob,
      req.body.phone,
      req.body.type,
      req.body.dept,  
     

    ];

    con.query(sqlInsertEmployee, [values], (err, result) => {
        if (err) {
            console.error('Error inserting into employee table:', err);
            return res.json({ Status: false, Error: err });
        }

 

        // Second query: Insert employee name into another table (e.g., `employee_names`)
        const sqlInsertEmployeeName = `INSERT INTO leave_status (employee_name) VALUES (?)`;
        con.query(sqlInsertEmployeeName, [req.body.name], (err, result) => {
            if (err) {
                console.error('Error inserting into employee_names table:', err);
                return res.json({ Status: false, Error: err });
            }

            return res.json({ Status: true, Message: 'Employee added successfully' });
        });
    });
});



router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})



router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', upload.single('image'),(req, res) => {
    const id = req.params.id;

    const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?,image=?,position = ? ,gender = ?,start_date = ?,work_schedule = ?,work_location = ?,shift= ?,dob= ?,phone= ?,employee_type= ?,department= ?
        Where id = ?`
    const values = [
      req.body.name,
      req.body.email,
      req.body.salary,
      req.body.address,
      req.file.filename,
      req.body.position,
      req.body.gender,
      req.body.start_date,
      req.body.work_policy,
      req.body.work_location,
      req.body.shift,
      req.body.dob,
      req.body.phone,
      req.body.type,
      req.body.dept,  
     
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})
router.post("/data_update", async (req, res) => {
  const { field1, field2, field3, field4, field5, date } = req.body; // Destructure the data from the request

  // Helper function to convert time in "HH.MM" format (e.g., "10.04") to MySQL's "HH:MM:00" format
  const convertTo24HourFormat = (timeString) => {
    const [hours, minutes] = timeString.split('.').map(num => parseInt(num, 10));

    // Convert hours based on AM/PM (assuming input is based on 24-hour clock)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  try {
    // Convert field3 (timeIn) and field4 (timeOut) from "HH.MM" format to "HH:MM:00"
    const timeIn = convertTo24HourFormat(field3);
    const timeOut = convertTo24HourFormat(field4);
    const login = "true";


    // Insert into the attendance table
    const insertQuery = `
      INSERT INTO attendance (name, status, timeIn, timeOut, work_done, date,login_status) 
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;
    const attendanceValues = [field1, field2, timeIn, timeOut, field5, date,login];
    
    con.query(insertQuery, attendanceValues, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error inserting attendance data." });
      }

      // If status is LEAVE, update the leave status table
      if (field2 === "LEAVE") {
        const updateLeaveQuery = `
          UPDATE leave_status 
          SET available_leaves = available_leaves - 1, taken_leaves = taken_leaves + 1
          WHERE employee_name = ?
        `;
        con.query(updateLeaveQuery, [field1], (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Error updating leave status." });
          }
          res.status(200).json({ message: "Attendance and leave status updated successfully." });
        });
      } else {
        res.status(200).json({ message: "Attendance updated successfully." });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete('/delete_employee/:id', (req, res) => {
  const name = req.body.name; // Use `name` from the request body

  // Delete from the `leave_status` table using the employee's name
  const sqlDeleteLeaveStatus = "DELETE FROM leave_status WHERE employee_name = ?";
  con.query(sqlDeleteLeaveStatus, [name], (err, result) => {
    if (err) {
      return res.json({ Status: false, Error: "Error deleting from leave_status table: " + err });
    }

    // Delete from the `attendance` table using the employee's name
    const sqlDeleteAttendance = "DELETE FROM attendance WHERE name = ?";
    con.query(sqlDeleteAttendance, [name], (err, result) => {
      if (err) {
        return res.json({ Status: false, Error: "Error deleting from attendance table: " + err });
      }

      // Delete from the `leaves` table using the employee's name
      const sqlDeleteLeaves = "DELETE FROM leaves WHERE employee_name = ?";
      con.query(sqlDeleteLeaves, [name], (err, result) => {
        if (err) {
          return res.json({ Status: false, Error: "Error deleting from leaves table: " + err });
        }

        // Delete from the `employee` table using the employee's name
        const sqlDeleteEmployee = "DELETE FROM employee WHERE name = ?";
        con.query(sqlDeleteEmployee, [name], (err, result) => {
          if (err) {
            return res.json({ Status: false, Error: "Error deleting from employee table: " + err });
          }

          // All deletions completed successfully
          return res.json({ Status: true, Message: 'Employee and all related records deleted successfully' });
        });
      });
    });
  });
});




// Route to update expense status
router.put("/update-expense-status/:expenseId", (req, res) => {
  const { expenseId } = req.params;
  const { status } = req.body;

  // Validate input
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  // Update query
  const query = "UPDATE expenses SET status = ?,settled_on = NOW() WHERE id = ?";

  con.query(query, [status, expenseId], (err, result) => {
    if (err) {
      console.error("Failed to update expense:", err);
      return res.status(500).json({ error: "Failed to update expense." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.json({ message: "Expense status updated successfully." });
  });
});


router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/leave-status', (req, res) => {
    const { employeeName } = req.query;

    if (!employeeName) {
        return res.status(400).json({
            Status: false,
            Error: 'Employee name is required.',
        });
    }

    const query = 'SELECT total_leaves, available_leaves,leave_per_month,compensate_leaves FROM leave_status WHERE employee_name = ?';

    con.query(query, [employeeName], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({
                Status: false,
                Error: 'An error occurred while fetching leave status.',
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                Status: false,
                Error: `Leave status not found for employee: ${employeeName}`,
            });
        }
       
        res.status(200).json({
            Status: true,
            Result: results[0], // Assuming only one record per employee
        });
    });
});
router.post('/update-admin-leave-status', (req, res) => {
  const { employeeName, leaves, leavePerMonth } = req.body;

  if (!employeeName || leaves === undefined || leaves === null) {
      return res.status(400).json({ message: 'Employee name and leave count are required' });
  }

  const leaveCount = parseFloat(leaves); // Ensure the leave count is treated as a float
  if (isNaN(leaveCount) || leaveCount <= 0) {
      return res.status(400).json({ message: 'Invalid leave count' });
  }



  // Check if the employee already has leave assigned
  const checkQuery = `
      SELECT total_leaves, leave_per_month, available_leaves FROM leave_status WHERE employee_name = ?
  `;

  con.query(checkQuery, [employeeName], (error, results) => {
      if (error) {
          console.error('Error checking leave status:', error);
          return res.status(500).json({ message: 'Failed to check leave status' });
      }


      if (results.length > 0) {
          const currentRecord = results[0];
          const currentTotalLeaves = currentRecord.total_leaves;
          const currentLeavePerMonth = currentRecord.leave_per_month;
          const currentAvailableLeaves = currentRecord.available_leaves;

          if (currentTotalLeaves === 0 && currentLeavePerMonth === 0) {
              // If employee doesn't have any leave record, assign total leaves
              const updateQuery = `
                  UPDATE leave_status
                  SET total_leaves = ?, available_leaves = ?, leave_per_month = ?
                  WHERE employee_name = ?
              `;

              con.query(updateQuery, [leaveCount, leaveCount, leavePerMonth, employeeName], (error, results) => {
                  if (error) {
                      console.error('Error inserting leave status:', error);
                      return res.status(500).json({ message: 'Failed to assign leave status' });
                  }

                  return res.status(200).json({ success: true, message: 'Leave status assigned successfully' });
              });
          } else {
              // If the employee already has a leave record, update the total leaves and leave per month
              // Consider updating available_leaves as well if needed
              const updatedAvailableLeaves = currentAvailableLeaves + (leaveCount - currentTotalLeaves);

              const updateQuery = `
                  UPDATE leave_status
                  SET total_leaves = ?, leave_per_month = ?
                  WHERE employee_name = ?
              `;

              con.query(updateQuery, [leaveCount, leavePerMonth, employeeName], (error, results) => {
                  if (error) {
                      console.error('Error updating leave status:', error);
                      return res.status(500).json({ message: 'Failed to update leave status' });
                  }

                  return res.status(200).json({ success: true, message: 'Leave status updated successfully' });
              });
          }
      } else {
          // If no record exists for the employee, insert a new record
          const insertQuery = `
              INSERT INTO leave_status (employee_name, total_leaves, available_leaves, leave_per_month)
              VALUES (?, ?, ?, ?)
          `;

          con.query(insertQuery, [employeeName, leaveCount, leaveCount, leavePerMonth], (error, results) => {
              if (error) {
                  console.error('Error inserting new leave status:', error);
                  return res.status(500).json({ message: 'Failed to insert leave status' });
              }

              return res.status(200).json({ success: true, message: 'Leave status assigned successfully' });
          });
      }
  });
});

router.get('/attendance_report/:name', (req, res) => {
    const { name } = req.params;
    const { startDate, endDate } = req.query;
 
  
    // Ensure both startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.json({ Status: false, Error: 'Start date and end date are required.' });
    }
  
    const query = `
      SELECT date, timeIn, timeOut, status,work_done,remarks
      FROM attendance
      WHERE name = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC
    `;
  
    con.query(query, [name, startDate, endDate], (err, result) => {
      if (err) {
        res.json({ Status: false, Error: err.message });
      } else {
        res.json({ Status: true, Result: result });
      }
    });
  });
  router.post('/leave-report', (req, res) => {
    const { LeavestartDate, LeaveendDate, employeeName } = req.body;
   

    // SQL query to get leave records based on provided filters
    let query = `
        SELECT leave_type,start_date, end_date,reason,status,no_of_days from leaves
        WHERE start_date >= ? AND end_date <= ? AND employee_name=?
    `;

  
    // Execute the query
    con.query(query, [LeavestartDate, LeaveendDate,employeeName || ''], (err, results) => {
        if (err) {
            console.error('Error fetching leave data:', err);
            return res.status(500).json({ error: 'Error fetching leave data' });
        }

        // Send the result as the response
        return res.status(200).json({
            Result:results
        });
    });
});

router.get('/request-leave-status', (req, res) => {
   
  
    // SQL query to fetch pending leave requests
    const query = `
      SELECT 
      leave_id AS id,
        employee_name as name, 
        DATEDIFF(end_date, start_date) + 1 AS noOfDays, 
        start_date AS startDate, 
        end_date AS endDate, 
        reason AS leaveReason, 
        status
      FROM leaves
      WHERE status = 'Pending'
      ORDER BY created_at DESC;
    `;
  
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching leave status:', err);
        return res.status(500).json({ error: 'Failed to fetch leave status.' });
      }
      res.json(results);
    });
  });
  router.post('/admin-leave', (req, res) => {
    const { id, action, name, noOfDays } = req.body;
  
    // Validate input
    if (!id || !action || (action !== "approve" && action !== "reject") || !name || !noOfDays) {
      return res.status(400).json({ error: "Invalid request data." });
    }
  
    // Determine the status based on the action
    const status = action === "approve" ? "approved" : "rejected";
  
    // Query to update the leave status
    const updateLeaveStatusQuery = `
      UPDATE leaves 
      SET status = ?, updated_at = NOW() 
      WHERE leave_id = ?;
    `;
  
    // Execute the leave status update query
    con.query(updateLeaveStatusQuery, [status, id], (err, result) => {
      if (err) {
        console.error("Error updating leave status:", err);
        return res.status(500).json({ error: "Failed to update leave status." });
      }
  
      // If no rows were affected, the leave request ID may not exist
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Leave request not found." });
      }
  
      // Only adjust leave balance if the leave is approved
      if (action === "approve") {
        const updateLeaveBalanceQuery = `
          UPDATE leave_status
          SET available_leaves = available_leaves - ?, 
              taken_leaves = taken_leaves + ?
          WHERE employee_name = ?;
        `;
  
        con.query(updateLeaveBalanceQuery, [noOfDays, noOfDays, name], (error) => {
          if (error) {
            console.error("Error updating leave balance:", error);
            return res.status(500).json({ error: "Error updating leave balance." });
          }
  
          return res.status(200).json({ success: true, message: "Leave request approved and leave balance updated successfully." });
        });
      } else {
        // If the action is "reject", return a response without adjusting leave balance
        return res.status(200).json({ success: true, message: "Leave request rejected successfully." });
      }
    });
  });
  

  router.get('/task_report', async (req, res) => {
    const { employee, status } = req.query;
  
    try {
      // Base SQL query
      let query = `
        SELECT 
          t.task_name AS taskName,
          t.start_date AS startDate,
          t.end_date AS endDate,
          t.status,
          t.description,
          t.employee_name AS employeeName
        FROM tasks t
        WHERE 1=1
      `;
  
      const params = [];
  
      // Add filters for employee
      if (employee) {
        query += ' AND t.employee_name = ?';
        params.push(employee);
      }
  
      // Add filter for status only if it's provided
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }
  
      // Order results by start date
      query += ' ORDER BY t.start_date DESC';
  
      // Execute the query
      con.query(query, params, (err, results) => {
        if (err) {
          console.error('Error fetching task report:', err);
          return res.status(500).json({ Status: false, Error: 'Query execution error' });
        }
        
        return res.status(200).json({ Status: true, Result: results });
      });
    } catch (error) {
      console.error('Error in task report endpoint:', error);
      return res.status(500).json({ Status: false, Error: 'An unexpected error occurred' });
    }
  });
  
  
  
router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter };
