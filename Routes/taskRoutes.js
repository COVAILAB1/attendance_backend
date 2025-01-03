// taskRoutes.js
import express from 'express';
const router = express.Router();
import con from "../utils/db.js"; 

router.get('/tasks', (req, res) => {
  const { employeeName } = req.query; // Use req.query to access query parameters
 console.log(req.query)
  
  const sql = "SELECT * FROM tasks WHERE employee_name = ?";
  
  con.query(sql, [employeeName], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
   console.log(results)
    res.json(results);
  });
});

export { router as taskRouter };
