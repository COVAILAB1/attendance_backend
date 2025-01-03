import express from 'express'
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const router = express.Router()
router.post("/employee_login", (req, res) => {
  // Employee login route
  const sql = "SELECT * FROM employee WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });
      
      if (result.length > 0) {
          // Directly compare the plain text passwords
          if (req.body.password === result[0].password) {
              const email = result[0].email;
              return res.json({ loginStatus: true, id: result[0].id });
          } else {
              return res.json({ loginStatus: false, Error: "Wrong password" });
          }
      } else {
          return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }
  });
});
router.get('/attendance-status', async (req, res) => {
  const { employeeName } = req.query; // Use req.query to access query parameters
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

  const sql = "SELECT login_status,logout_status FROM attendance WHERE name = ? AND DATE(date) = ?";

  try {
    // Using Promises with con.query for async/await
    const results = await new Promise((resolve, reject) => {
      con.query(sql, [employeeName, currentDate], (err, results) => {
        if (err) {
          console.error('Error fetching attendance status:', err);
          return reject(err);
        }
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(200).json({ loginStatus: false, logoutStatus: false });
    }

    const attendanceRecord = results[0];
    const loginStatus = attendanceRecord.login_status== "true";
    const logoutStatus = attendanceRecord.logout_status== "true";

    res.status(200).json({ loginStatus, logoutStatus });
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).json({ message: 'Error fetching attendance status' });
  }
});


//count total,completed,inprogress counts
router.get('/task-counts', async (req, res) => {
  const { employeeName } = req.query;

  if (!employeeName) {
    return res.status(400).json({ error: 'Employee name is required' });
  }

  try {
    // Query for total tasks
    con.query(
      'SELECT COUNT(*) AS total FROM tasks WHERE employee_name = ?',
      [employeeName],
      (error, results) => {
        if (error) {
          console.error('Error fetching total tasks:', error);
          return res.status(500).json({ error: 'Failed to fetch total tasks' });
        }

        const totalTasks = results[0].total;

        // Query for completed tasks
        con.query(
          'SELECT COUNT(*) AS completed FROM tasks WHERE employee_name = ? AND status = "Completed"',
          [employeeName],
          (error, results) => {
            if (error) {
              console.error('Error fetching completed tasks:', error);
              return res.status(500).json({ error: 'Failed to fetch completed tasks' });
            }

            const completedTasks = results[0].completed;

            // Query for in-progress tasks
            con.query(
              'SELECT COUNT(*) AS in_progress FROM tasks WHERE employee_name = ? AND status = "In Progress"',
              [employeeName],
              (error, results) => {
                if (error) {
                  console.error('Error fetching in-progress tasks:', error);
                  return res.status(500).json({ error: 'Failed to fetch in-progress tasks' });
                }

                const inprogress = results[0].in_progress;

                // Query for delayed tasks
                con.query(
                  'SELECT COUNT(*) AS `delayed` FROM tasks WHERE employee_name = ? AND status = "Delayed"',
                  
                  [employeeName],
                  (error, results) => {
                    if (error) {
                      console.error('Error fetching delayed tasks:', error);
                      return res.status(500).json({ error: 'Failed to fetch delayed tasks' });
                    }

                    const delayedTasks = results[0].delayed;

                    // Query for "Need Support" tasks
                    con.query(
                      'SELECT COUNT(*) AS need_support FROM tasks WHERE employee_name = ? AND status = "Need Support"',
                      [employeeName],
                      (error, results) => {
                        if (error) {
                          console.error('Error fetching "Need Support" tasks:', error);
                          return res.status(500).json({ error: 'Failed to fetch "Need Support" tasks' });
                        }

                        const needSupportTasks = results[0].need_support;
           
                        // Send the response with task counts
                        res.json({
                          totalTasks,
                          completedTasks,
                          inprogress,
                          delayedTasks,
                          needSupportTasks, // Include "Need Support" tasks count
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching task counts:', error);
    res.status(500).json({ error: 'Failed to fetch task counts' });
  }
});

//task status update
router.put('/update-task-status', (req, res) => {
  const { taskName, employeeName, status } = req.body;

  if (!taskName || !employeeName || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const updateQuery = `
    UPDATE tasks 
    SET status = ? 
    WHERE task_name = ? AND employee_name = ?
  `;

  const queryParams = [status, taskName, employeeName];

  con.query(updateQuery, queryParams, (error, results) => {
    if (error) {
      console.error('Error updating task status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (status === 'Completed') {
      
      

        return res.status(200).json({ message: 'Task status updated  successfully' });
     
    } else {
      res.status(200).json({ message: 'Task status updated successfully' });
    }
  });
});

//apply leave with lop

// router.post('/apply-leave', (req, res) => {
//   const { leaveType, startDate, endDate, reason, name: employeeName, numOfDays } = req.body;
//   console.log(req.body);
  
//   if (!leaveType || !startDate || !endDate || !reason || !employeeName || !numOfDays) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   const getLeaveQuery = `
//     SELECT available_leaves, taken_leaves, leave_per_month 
//     FROM leave_status 
//     WHERE employee_name = ?
//   `;

//   con.query(getLeaveQuery, [employeeName], (error, results) => {
//     if (error) {
//       console.error('Error fetching available leaves:', error);
//       return res.status(500).json({ message: 'Error fetching available leaves' });
//     }

//     console.log('Query results:', results);
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Employee not found in leave_status' });
//     }

//     const { available_leaves: availableLeaves, taken_leaves: takenLeaves = 0, leave_per_month: leavePerMonth } = results[0];

//     if (numOfDays > leavePerMonth) {
//       console.log("Leave exceeds allowed leave per month");

//       // Splitting logic
//       let remainingDays = numOfDays;
//       const leaveChunks = [];
//       let currentStartDate = new Date(startDate);

//       while (remainingDays > 0) {
//         const currentLeaveDays = Math.min(leavePerMonth, remainingDays);
//         const currentEndDate = new Date(currentStartDate);
//         currentEndDate.setDate(currentStartDate.getDate() + currentLeaveDays - 1);

//         leaveChunks.push({
//           employeeName,
//           leaveType,
//           startDate: currentStartDate.toISOString().split('T')[0],
//           endDate: currentEndDate.toISOString().split('T')[0],
//           reason,
//         });

//         remainingDays -= currentLeaveDays;
//         currentStartDate.setDate(currentEndDate.getDate() + 1);
//       }

//       console.log("Leave chunks:", leaveChunks);

//       // Insert each chunk into the database
//       const insertLeaveChunks = leaveChunks.map(chunk => new Promise((resolve, reject) => {
//         const insertQuery = `
//           INSERT INTO leaves (employee_name, leave_type, start_date, end_date, reason)
//           VALUES (?, ?, ?, ?, ?)
//         `;

//         con.query(insertQuery, [chunk.employeeName, chunk.leaveType, chunk.startDate, chunk.endDate, chunk.reason], (error) => {
//           if (error) {
//             console.error('Error inserting leave chunk:', error);
//             return reject(error);
//           }
//           resolve();
//         });
//       }));

//       Promise.all(insertLeaveChunks)
//         .then(() => {
//           res.status(200).json({ success: true, message: 'Leave request submitted in chunks successfully.' });
//         })
//         .catch(error => {
//           console.error('Error inserting leave chunks:', error);
//           res.status(500).json({ message: 'Error inserting leave chunks.' });
//         });

//       return;
//     }

//     // Proceed as usual if numOfDays <= leavePerMonth
//     if (availableLeaves < numOfDays) {
//       console.log("No sufficient leave balance");
//       return res.status(400).json({ message: 'Insufficient leave balance' });
//     }

//     const insertQuery = `
//       INSERT INTO leaves (employee_name, leave_type, start_date, end_date, reason)
//       VALUES (?, ?, ?, ?, ?)
//     `;

//     con.query(insertQuery, [employeeName, leaveType, startDate, endDate, reason], (error) => {
//       if (error) {
//         console.error('Error applying leave:', error);
//         return res.status(500).json({ message: 'Error applying for leave' });
//       }

//       const updateLeaveQuery = `
//         UPDATE leave_status
//         SET available_leaves = available_leaves - ?, taken_leaves = taken_leaves + ?
//         WHERE employee_name = ?
//       `;
//       con.query(updateLeaveQuery, [numOfDays, numOfDays, employeeName], (error) => {
//         if (error) {
//           console.error('Error updating leave balance:', error);
//           return res.status(500).json({ message: 'Error updating leave balance' });
//         }

//         res.status(200).json({ success: true, message: 'Leave request submitted successfully.' });
//       });
//     });
//   });
// });

router.post('/apply-leave', (req, res) => {
  const { leaveType, startDate, endDate, reason, name: employeeName, numOfDays } = req.body;

  if (!leaveType || !startDate || !endDate || !reason || !employeeName || !numOfDays) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const getLeaveQuery = `
    SELECT available_leaves, taken_leaves
    FROM leave_status 
    WHERE employee_name = ?
  `;

  con.query(getLeaveQuery, [employeeName], (error, results) => {
    if (error) {
      console.error('Error fetching available leaves:', error);
      return res.status(500).json({ message: 'Error fetching available leaves' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Employee not found in leave_status' });
    }

    const { available_leaves: availableLeaves, taken_leaves: takenLeaves = 0 } = results[0];

    // Check if the employee has sufficient leave balance
    if (availableLeaves < numOfDays) {
      console.log("Insufficient leave balance");
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    // Insert leave request into `leaves` table
    const insertQuery = `
      INSERT INTO leaves (employee_name, leave_type, start_date, end_date, reason)
      VALUES (?, ?, ?, ?, ?)
    `;

    con.query(insertQuery, [employeeName, leaveType, startDate, endDate, reason], (error) => {
      if (error) {
        console.error('Error applying leave:', error);
        return res.status(500).json({ message: 'Error applying for leave' });
      }

      // Update leave balance
  

        res.status(200).json({ success: true, message: 'Leave request submitted successfully.' });
      });
    });
  });


router.get('/employee-leave-status', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Employee name is required.' });
  }

  const query = `
    SELECT 
      leave_type, status, 
      DATEDIFF(end_date, start_date) + 1 AS requestedLeaves, 
      start_date, end_date, 
      rejectionReason 
    FROM leaves 
    WHERE employee_name = ? 
    ORDER BY created_at DESC;
  `;

  con.query(query, [name], (err, results) => {
    if (err) {
      console.error('Error fetching leave status:', err);
      return res.status(500).json({ error: 'Failed to fetch leave status.' });
    }
    res.json(results);
  });
});


router.get('/attendance-percentage-status', (req, res) => {
  const { employeeName } = req.query;

  if (!employeeName) {
    return res.status(400).json({ message: 'Employee name is required.' });
  }

  const query = `
    SELECT 
        name,
        COUNT(*) AS days_attended,
        26 AS working_days,
        ROUND((COUNT(*) / 26.0) * 100, 2) AS attendance_percentage
    FROM 
        attendance
    WHERE 
        name = ?
        AND login_status = "true"
        AND MONTH(date) = MONTH(CURRENT_DATE())
        AND YEAR(date) = YEAR(CURRENT_DATE())
    GROUP BY 
        name;
  `;

  con.query(query, [employeeName], (error, results) => {
    if (error) {
      console.error('Error fetching present status:', error);
      return res.status(500).json({ message: 'Error fetching present status.' });
    }
  
    res.status(200).json(results);
  });
});


// Route to get leave percentage
router.get("/leave-percentage", async (req, res) => {
  const { employeeName } = req.query;

  if (!employeeName) {
    return res.status(400).json({ error: "Employee name is required" });
  }

  try {
    // Step 1: Query to calculate the total number of approved leave days for the current month
    const leaveDaysQuery = `
      SELECT 
        employee_name, 
        SUM(
          CASE 
            WHEN start_date <= LAST_DAY(CURRENT_DATE()) 
                 AND end_date >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') 
            THEN DATEDIFF(
                LEAST(end_date, LAST_DAY(CURRENT_DATE())), 
                GREATEST(start_date, DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
            ) + 1
            ELSE 0 
          END
        ) AS approved_leaves
      FROM 
        leaves
      WHERE 
        status = 'Approved'
        AND employee_name = ?
        AND (
          (YEAR(start_date) = YEAR(CURRENT_DATE()) AND MONTH(start_date) = MONTH(CURRENT_DATE()))
          OR (YEAR(end_date) = YEAR(CURRENT_DATE()) AND MONTH(end_date) = MONTH(CURRENT_DATE()))
        )
      GROUP BY 
        employee_name;
    `;

    con.query(leaveDaysQuery, [employeeName], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (results.length > 0) {
        console.log(results)
        const approvedLeaves = results[0].approved_leaves-1 || 0;

        // Step 2: Calculate leave percentage based on the approved leave days
        const totalWorkingDays = 26; // Assuming 26 working days in the month
        const leavePercentage = (approvedLeaves * 100.0) / totalWorkingDays;
        
       
        res.json({
          employee_name: employeeName,
          leave_percentage: parseFloat(leavePercentage).toFixed(2),
        });
      } else {
        res.json({ leave_percentage: 0 }); // No leaves approved for this month
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


  router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    
    })
  })

  router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
  })


  export {router as EmployeeRouter}