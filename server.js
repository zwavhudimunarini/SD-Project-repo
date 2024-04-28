const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app); // Create HTTP server using Express app
const io = socketIo(server); // Attach Socket.IO to the HTTP server
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('src'));
app.use(bodyParser.json());



// Socket.IO connection handling
io.on('connection', socket => {
    console.log('A user connected');

    // Handle new issue reported by tenant
    socket.on('reportIssue', issue => {
        console.log('New issue reported:', issue);
        // Emit the issue to all staff members
        io.emit('newIssue', issue);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const createConnectionPool = async () => {
    try {
        const pool = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 's2429356',
            database: 'software_design'
        });
        console.log('MySQL connection pool created successfully');
        return pool;
    } catch (error) {
        console.error('Error creating MySQL connection pool: ', error);
        throw error;
    }
};

//submit form data in the database

app.post('/submit', async (request, response) => {
  const { name, email, password, confirmPassword} = request.body;

  // Check if required fields are empty
  if (!name ||!email || !password || !confirmPassword) {
      return response.status(400).json({ error: 'All fields are required' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
      return response.status(400).json({ error: 'Passwords do not match' });
  }
  if (password.length < 8) {
      return response.status(400).json({ error: 'Password too short' });
  }

  try {
    const pool = await createConnectionPool();
    const connection = await pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
        `INSERT INTO Admin (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashedPassword]
      );

    connection.release();
    response.status(201).json({ message: 'User created successfully' });
  
 }catch (error) {
      console.error('Error inserting data: ', error);
      response.status(500).json({ error: 'Internal server error' });
  }
});

//chek if user is in the database when trying to login

app.post('/login', async (request, response) => {
  console.log('request body: ', request.body);
  const { email, password } = request.body;

  try {
      const pool = await createConnectionPool();
      const connection = await pool.getConnection();

      let role = null;
      let user = null;

      // Check if the user exists in the Admin table
      let [adminRows, adminFields] = await connection.execute(
          'SELECT * FROM Admin WHERE BINARY email = ?',
          [email]
      );

      if (adminRows.length > 0) {
          user = adminRows[0];
          role = 'Admin';
      }

      // If the user is not found in the Admin table, check the Staff table
      if (!user) {
          let [staffRows, staffFields] = await connection.execute(
              'SELECT * FROM Staff WHERE BINARY email = ?',
              [email]
          );

          if (staffRows.length > 0) {
              user = staffRows[0];
              role = 'Staff'; // Assuming the role is stored in the Staff table
          }
      }

      // If the user is still not found, check the Tenant table
      if (!user) {
          let [tenantRows, tenantFields] = await connection.execute(
              'SELECT * FROM Tenant WHERE BINARY email = ?',
              [email]
          );

          if (tenantRows.length > 0) {
              user = tenantRows[0];
              role = 'Tenant';
          }
      }

      connection.release();

      if (user) {
          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (isPasswordMatch) {
              response.status(200).json({ success: true, name: user.name, role: role, message: 'Login successful' });
          } else {
              response.status(401).json({ success: false, message: 'Invalid email or password' });
          }
      } else {
          response.status(401).json({ success: false, message: 'Invalid email or password' });
      }

  } catch (error) {
      console.error('Error querying database: ', error);
      //response.status(500).json({ error: 'Internal server error' });
  }
});

// Handle Issue Reporting Endpoint
app.post('/report-issue', async (request, response) => {
  const { issue } = request.body;
  console.log("the request body: ",request.body);

  try {
      const pool = await createConnectionPool(); // Assuming you have a function to create a connection pool
      const connection = await pool.getConnection();

      // Insert the new issue into the database
      await connection.execute(
          'INSERT INTO issue_reports (issue) VALUES (?)',
          [issue]
      );

      connection.release();

      // Emit a new-issue event to notify staff members
      io.emit('new-issue', issue);

      response.status(201).json({ message: 'Issue reported successfully' });
  } catch (error) {
      console.error('Error reporting issue:', error);
      response.status(500).json({ error: 'Internal server error' });
  }
});

// Handle GET request to fetch reported issues
app.get('/reported-issues', async (req, res) => {
  try {
      const pool = await createConnectionPool();
      const connection = await pool.getConnection();

      // Retrieve all reported issues from the database
      const [rows] = await connection.execute('SELECT issue FROM issue_reports');

      connection.release();

      // Send the list of reported issues to the client
      res.status(200).json({ issues: rows.map(row => row.issue) });
  } catch (error) {
      console.error('Error fetching reported issues:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//getting total number of issues
const getTotalIssuesCount = async () => {
  try {
      const pool = await createConnectionPool();
      const connection = await pool.getConnection();

      // Retrieve the count of reported issues from the database
      const [result] = await connection.execute('SELECT COUNT(*) as totalCount FROM issue_reports');

      connection.release();

      return result[0].totalCount;
  } catch (error) {
      console.error('Error fetching total issues count:', error);
      throw error;
  }
};

// Socket.IO Server-Side Code
io.on('connection', async (socket) => {
  console.log('Client connected');
  
  // Send total count of reported issues to the client
  const totalCount = await getTotalIssuesCount();
  socket.emit('total-issues-count', totalCount);
});

app.use(express.json());

app.post('/add-staff', async (request, response) => {
    const { name, email, password, confirmPassword, role } = request.body;

    // Check if required fields are empty
    if (!name || !email || !password || !confirmPassword || !role ) {
        return response.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return response.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
        return response.status(400).json({ error: 'Password too short' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role !== 'Administrator' && role !== 'Maintenance') {
        return response.status(400).json({ error: 'Invalid role' });
    }

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        const tableName = `Staff_${role}`;

        await connection.execute(
            `INSERT INTO ${tableName} (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );

        connection.release();
        response.status(201).json({ message: `Staff member added successfully` });

    } catch (error) {
        console.error(`Error adding staff: `, error);
        response.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/search/staff', async(req, res) => {
    try {
        const searchQuery = req.query.query;
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        const [adminResults] = await connection.execute(
            'SELECT id, name, email FROM Staff_Administrator WHERE name LIKE ? OR email LIKE ?',
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );

        const [maintenanceResults] = await connection.execute(
            'SELECT id, name, email FROM Staff_Maintenance WHERE name LIKE ? OR email LIKE ?',
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );

        connection.release();

        const results = [...adminResults, ...maintenanceResults];
        res.json(results);

    } catch (error) {
        console.error('Error searching for staff members:', error);
        res.status(500).json({ error: 'An error occurred while searching staff members' });
    }
});

/*app.delete('/staff/:id', async(req, res) => {
    try {
        const staffId = req.params.id;
        
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        const tableName = staff.role === 'Administrator' ? 'Staff_Administrator' : 'Staff_Maintenance';
        await connection.execute(`DELETE FROM ${tableName} WHERE id = ?`, [staffId]);
        connection.release();
        res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff member:', error);
        res.status(500).json({ error: 'An error occurred while deleting the staff member' });
    }
});*/

server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

