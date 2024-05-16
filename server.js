const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const session = require('express-session');
const multer=require("multer")
const fs=require("fs")
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');



//const bodyParser = require('body-parser');
//const { emit } = require('process');

const app = express();
const server = http.createServer(app); // Create HTTP server using Express app
const io = socketIo(server); // Attach Socket.IO to the HTTP server
const port = process.env.PORT || 3000;

//app.use('/uploads', express.static(path.join(__dirname,'src','uploads')))
app.use(cors());
app.use(express.static('src'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(bodyParser.json());

app.use(session({
    secret: 'Vhanarini064', // Secret key for session encryption (replace with your own secret)
    resave: false,
    saveUninitialized: false
}));

const upload = multer({ dest: 'uploads/' });

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

// const createConnectionPool = async () => {
//     try {
//         const pool = await mysql.createPool({
//             host: 'localhost',
//             user: 'zwavhudi',
//             password: 'Vhanarini064',
//             database: 'sdproject'
//         });
//         console.log('MySQL connection pool created successfully');
//         return pool;
//     } catch (error) {
//         console.error('Error creating MySQL connection pool: ', error);
//         throw error;
//     }
// };



const config = {
    user: 'zwavhudi',
    password: 'Vhanarini064',
    host: 'mysqlserverforsdproject.mysql.database.azure.com',
    database: 'sdproject',
    ssl: {

        rejectUnauthorized: false
        // Enable SSL if required by your MySQL server
        // For Azure, SSL is usually required
        //ca:path.join(__dirname,'C:\Users\Khodani\OneDrive\Documents\SD-Project-repo-1')
    }
};

const createConnectionPool = async () => {
    try {
        const pool = mysql.createPool(config);
        console.log('Connected to Azure MySQL database');
        return pool;
    } catch (error) {
        console.error('Error creating MySQL connection pool: ', error);
        throw error;
    }
};




//submit form data in the database

app.post('/submit', async (request, response) => {
  const { name, email, password, confirmPassword } = request.body;

  // Check if required fields are empty
  if (!name || !password || !confirmPassword || !email ) {
      return response.status(400).json({ error: 'All fields are required' });
  }

    //check if passwords match
    if (password !== confirmPassword) {
        return response.status(400).json({ error: 'Passwords do not match' });
    }
    if(password.length<8){
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



//staff member is responsible for adding tenants
app.post('/submitTenant', async (request, response) => {
    const { name, email, password, confirmPassword} = request.body;
    console.log(request.body);
  
    // Check if required fields are empty
    if (!name || !password || !confirmPassword || !email) {
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
            `INSERT INTO Tenant (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );
  
        connection.release();
        response.status(201).json({ message: 'User created successfully' });
  
    } catch (error) {
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
              'SELECT * FROM Staff_Administrator WHERE BINARY email = ?',
              [email]
          );

          if (staffRows.length > 0) {
              user = staffRows[0];
              role = 'administrator'; // Assuming the role is stored in the Staff table
          }
      }

      if (!user) {
        let [staffRows, staffFields] = await connection.execute(
            'SELECT * FROM Staff_maintanance WHERE BINARY email = ?',
            [email]
        );

        if (staffRows.length > 0) {
            user = staffRows[0];
            role = 'maintanance'; // Assuming the role is stored in the Staff table
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

               // Replace 'the_tenant_id_here' with the actual tenant ID
    
              const tenantId = tenantRows[0].id;
              request.session.tenantId = tenantId; // Assuming 'id' is the column name for the tenant's ID
              console.log('Tenant ID:', tenantId);
              
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
      const [rows] = await connection.execute('SELECT id,issue FROM issue_reports');

      const ids = rows.map(row => row.id);
      const issues = rows.map(row => row.issue);

      connection.release();

      
   

      // Send the list of reported issues to the client
      res.status(200).json({issues,ids });
      
  } catch (error) {
      console.error('Error fetching reported issues:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//get tenants
app.get('/get-users', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        // Retrieve all reported issues from the database
        const [rows] = await connection.execute('SELECT name,email,id FROM Tenant');
  
        const ids = rows.map(row => row.id);
        const names = rows.map(row => row.name);
        const emails = rows.map(row => row.email);
  
        connection.release();
  
        
     
  
        // Send the list of reported issues to the client
        res.status(200).json({names,emails,ids });
        
    } 
    catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//get feedback from maintanance
app.get('/get-maintanace-feedback', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        // Retrieve all reported issues from the database
        const [rows] = await connection.execute('SELECT id,issueAssigned ,feedback FROM MaintenanceIssues WHERE feedback IS NOT NULL');
  
        const ids = rows.map(row => row.id);
        const issueAssigneds= rows.map(row => row.issueAssigned);
        const feedbacks = rows.map(row => row.feedback);
  
        connection.release();
  
        
     
  
        // Send the list of reported issues to the client
        res.status(200).json({issueAssigneds,feedbacks,ids });
        
    } 
    catch (error) {
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
app.post('/assign-to-maintanace', async (req, res) => {
    const { issue } = req.body;
    

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        const sql = 'INSERT INTO MaintenanceIssues (issueAssigned) VALUES (?) ';
        await connection.execute(sql, [issue]);

        connection.release();

        console.log('Issue submitted successfully');
        res.status(201).json({ message: 'Issue assigned successfully' });
    } catch (error) {
        console.error('Error assigning issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// add feedback to the issues that might be complete Denzel

app.post('/update-feedback/:id', async (req, res) => {
    const { feedback } = req.body;
    const issueId = req.params.id;

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        const sql = 'UPDATE MaintenanceIssues SET feedback = ? WHERE id = ?';
        await connection.execute(sql, [feedback, issueId]);

        connection.release();
        console.log('Feedback given successfully');
        res.status(201).json({ message: 'Feedback given successfully' });
    } catch (error) {
        console.error('Error giving feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get total issues for maintanace guy Denzel
app.get('/total-issues', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        // Retrieve all reported issues from the database
        const [rows] = await connection.execute('SELECT id,issueAssigned FROM MaintenanceIssues');
        
        // Extract ids and issues from the rows
        const ids = rows.map(row => row.id);
        const issues = rows.map(row => row.issueAssigned); // Use 'issueAssigned' instead of 'issue'
        
        connection.release();
        
        console.log("Rows", rows);
        
        // Send the list of reported issues to the client
        res.status(200).json({issues,ids });
    } catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});








//delete issues after completing them
app.delete('/delete-issue/:id', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        const issueId = req.params.id;
        console.log("Deleting issue with ID:", issueId);
  
        // Query to delete the issue from the database
        const sql = 'DELETE FROM issue_reports WHERE id = ?';
  
        // Execute the SQL query to delete the issue
        const [result] = await connection.execute(sql, [issueId]);
  
        connection.release();
  
        console.log('Issue deleted successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'Error deleting issue' });
    }
  });
  
//delete tenants as a staff member
app.delete('/delete-user/:id', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        const Id = req.params.id;
        console.log("Deleting user with ID:", Id);
  
        // Query to delete the issue from the database
        const sql = 'DELETE FROM Tenant WHERE id = ?';
  
        // Execute the SQL query to delete the issue
        const [result] = await connection.execute(sql, [Id]);
  
        connection.release();
  
        console.log('Issue deleted successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'Error deleting issue' });
    }
  });
  

// Socket.IO Server-Side Code
io.on('connection', async (socket) => {
  
  // Send total count of reported issues to the client
  const totalCount = await getTotalIssuesCount();
  socket.emit('total-issues-count', totalCount);
});


//administrator adds staff members
app.post('/add-staff', async (request, response) => {
    const { name, email, password, confirmPassword, role } = request.body;
    console.log(request.body);

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

    

    try {
        
        if(role=="maintanance"){

            const pool = await createConnectionPool();
            const connection = await pool.getConnection();

        

            await connection.execute(
                `INSERT INTO staff_maintanance (name, email, password) VALUES (?, ?, ?)`,
                [name, email, hashedPassword]
            );

            connection.release();
            response.status(201).json({ message: `Staff member added successfully` });


        }
        else if(role=="administrator"){

            const pool = await createConnectionPool();
            const connection = await pool.getConnection();

        

            await connection.execute(
                `INSERT INTO staff_administrator (name, email, password) VALUES (?, ?, ?)`,
                [name, email, hashedPassword]
            );

            connection.release();
            response.status(201).json({ message: `Staff member added successfully` });

        }
        else{
            response.status(400).json({ error: 'unknown role' });
        }
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


//delete staf members as an admin
app.delete('/staff/:id', async(req, res) => {
    try {
        const staffId = req.params.id;
        
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Determine the role based on the table being deleted from
        let tableName = '';

        // Check if the staff member is in the Administrators table
        const [adminRows] = await connection.execute(`SELECT id FROM Staff_Administrator WHERE id = ?`, [staffId]);
        if (adminRows.length > 0) {
            tableName = 'Staff_Administrator';
        } else {
            // Check if the staff member is in the Maintenance table
            const [maintenanceRows] = await connection.execute(`SELECT id FROM staff_maintanance WHERE id = ?`, [staffId]);
            if (maintenanceRows.length > 0) {
                tableName = 'Staff_Maintanance';
            } else {
                // If the staff member is not found in any table, return an error
                return res.status(404).json({ error: 'Staff member not found' });
            }
        }

        // Delete the staff member from the determined table
        await connection.execute(`DELETE FROM ${tableName} WHERE id = ?`, [staffId]);
        connection.release();
        res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff member:', error);
        res.status(500).json({ error: 'An error occurred while deleting the staff member' });
    }
});

app.get('/all-staff', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Query both Administrator and Maintenance tables to get all staff members
        const [adminResults] = await connection.execute('SELECT id, name, email FROM Staff_Administrator');
        const [maintenanceResults] = await connection.execute('SELECT id, name, email FROM Staff_Maintanance');

        connection.release();

        // Combine results from both tables
        const allStaffMembers = [...adminResults, ...maintenanceResults];

        res.json(allStaffMembers);
    } catch (error) {
        console.error('Error fetching all staff members:', error);
        res.status(500).json({ error: 'An error occurred while fetching all staff members' });
    }
});



//sprint 3

//get all tenants so that when u issue a fine u can select who the fine is being issued to 
app.get('/recipients', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
  
        // Retrieve name and id of recipients from the database
        const [rows] = await connection.execute('SELECT id, name FROM Tenant');
        
        // Extract name and id from the rows
        const recipients = rows.map(row => ({
            id: row.id,
            name: row.name
        }));
        
        connection.release();
        
        // Send the list of recipients to the client
        res.status(200).json(recipients);
    } catch (error) {
        console.error('Error fetching recipients from database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//send the form to the database

app.post('/submit-form', async (request, response) => {
    const { title, description, amount, selectedRecipientId, action,month } = request.body;
    console.log(request.body);
    try {
        

        // Assuming you have already established a MySQL connection pool named 'pool'

        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
        
        await connection.execute(
            'INSERT INTO fines (title, description, amount, action, tenantID, month) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, amount, action, selectedRecipientId, month]
        );
        connection.release();
        response.status(201).json({ message: 'User created successfully' });


        
    } 
    catch (error) {
        console.error('Error inserting form data into database:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// //get all fines from the database
app.get('/get-fines', async (req, res) => {
    try {
        const pool = await createConnectionPool(); // Assuming you have a function to create a connection pool
        const connection = await pool.getConnection();

        // Retrieve fines with tenant names from the database
        const [rows] = await connection.execute('SELECT fines.id, fines.title, fines.description, fines.amount, fines.action,fines.paidAmount, tenant.name FROM fines INNER JOIN tenant ON fines.tenantID = tenant.id');

        connection.release();

        // Extract data from rows
        const finesData = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            amount: row.amount,
            action: row.action,
            tenantName: row.name,
            paidAmount:row.paidAmount // Assuming 'name' is the column name for tenant names
            
        }));

        // Send fines data to the client
        res.status(200).json(finesData);

    } catch (error) {
        console.error('Error fetching fines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//get all fines as a tenant
app.get('/get-fines-tenant', async (req, res) => {
    try {
        // Retrieve the tenant's ID from the session
        const tenantId = req.session.tenantId;

        // Assuming you have a function to create a connection pool
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Retrieve fines with tenant names from the database, filtered by tenant ID
        const [rows] = await connection.execute('SELECT fines.id, fines.title, fines.description, fines.amount, fines.action, fines.paidAmount FROM fines  WHERE fines.tenantID = ?', [tenantId]);

        connection.release();

        // Extract data from rows
        const finesData = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            amount: row.amount,
            action: row.action,
           
            paidAmount: row.paidAmount // Assuming 'name' is the column name for tenant names
        }));

        // Send fines data to the client
        res.status(200).json(finesData);

    } catch (error) {
        console.error('Error fetching fines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//update the paid amount
app.post('/send-payment', async (request, response) => {
    const { paidAmount, fineId } = request.body;
  
    try {
      const pool = await createConnectionPool();
      const connection = await pool.getConnection();
      
      await connection.execute(
          `UPDATE fines SET paidAmount = paidAmount + ? WHERE id = ?`,
          [paidAmount, fineId]
      );
      connection.release();
      response.status(201).json({ message: 'Payment successful' });
    
   } catch (error) {
        console.error('Error updating paid amount:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});


//send notification
app.post('/send-notification', upload.single('image'), async (request, response) => {
    const message = request.body.message;
    let image = '';

    // Check if an image file was uploaded
    if (request.file) {
        // Get the uploaded image filename
        const filename = request.file.filename;
        
        // Define the relative path to the uploaded image
        image = '/uploads/' + filename;

        try {
            // Move the uploaded image to the 'uploads' directory
            fs.renameSync(request.file.path, path.join(__dirname,'src', 'uploads', filename));
        } catch (error) {
            console.error('Error moving uploaded image:', error);
            return response.status(500).json({ error: 'Failed to store image' });
        }
    }

    try {
        const pool = await createConnectionPool(); // Assuming you have a function to create a connection pool
        const connection = await pool.getConnection();

        // Insert the new notification into the database
        await connection.execute(
            `INSERT INTO notifications (message, image_url) VALUES (?, ?)`,
            [message, image]
        );

        connection.release();

        response.status(201).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

//fetch notification
app.get('/notifications', async (req, res) => {
    try {
        // Establish a connection to the database
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Query to fetch notifications from the database
        const [rows, fields] = await connection.execute('SELECT * FROM notifications');

        // Release the connection
        connection.release();

        // Send the notifications data as JSON response
        res.json(rows);
    } 
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//fetch notification details
app.get('/notification', async (req, res) => {
    try {
        // Establish a connection to the database
        const pool = await createConnectionPool(); // Assuming createConnectionPool() is a function that creates a connection pool
        const connection = await pool.getConnection();

        // Extract notification ID from the query parameters
        const notificationId = req.query.id;

        // Query to fetch notification details from the database based on the ID
        const [rows, fields] = await connection.execute('SELECT * FROM notifications WHERE id = ?', [notificationId]);

        // Release the connection
        connection.release();

        // Check if notification with the given ID exists
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Extracting relevant fields for the notification
        const notification = {
            id: rows[0].id,
            message: rows[0].message,
            image: rows[0].image_url
            // Add other fields as needed
        };

        // Send the notification data as JSON response
        res.json(notification);
    } 
    catch (error) {
        console.error('Error fetching notification details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Chart.js setup
// const width = 800; // px
// const height = 400; // px
// const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// function getMonthName(monthNumber) {
//     const months = [
//         "January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"
//     ];
//     return months[monthNumber];
// }

// // Function to generate a complete set of months
// function generateFullMonthSet() {
//     const fullMonthSet = [];
//     for (let i = 0; i < 12; i++) {
//         fullMonthSet.push({ month: getMonthName(i), num_fines: 0 });
//     }
//     return fullMonthSet;
// }

// //histogram
// app.get('/chart', async (req, res) => {
//     try {
//         const pool = await createConnectionPool();
//         const connection = await pool.getConnection();

//         // Retrieve fines data from the database
//         const [rows] = await connection.execute('SELECT month, COUNT(*) AS num_fines FROM fines GROUP BY month');
//         connection.release(); // Release the connection back to the pool

//         console.log(rows);
//         // Generate a complete set of months
//         const fullMonthSet = generateFullMonthSet();

//         // Populate fines data for existing months
//         rows.forEach(({ month, num_fines }) => {
//             const index = fullMonthSet.findIndex(item => item.month === month);
//             if (index !== -1) {
//                 fullMonthSet[index].num_fines = num_fines;
//             }
//         });

//         // Sort months in chronological order
//         const sortedRows = fullMonthSet.sort((a, b) => {
//             const monthOrder = {
//                 "January": 1,
//                 "February": 2,
//                 "March": 3,
//                 "April": 4,
//                 "May": 5,
//                 "June": 6,
//                 "July": 7,
//                 "August": 8,
//                 "September": 9,
//                 "October": 10,
//                 "November": 11,
//                 "December": 12
//             };
//             return monthOrder[a.month] - monthOrder[b.month];
//         });

//         // Format data for Chart.js
//         const data = {
//             labels: [],
//             data: []
//         };

//         sortedRows.forEach(({ month, num_fines }) => {
//             data.labels.push(month); // Populate labels with month names
//             data.data.push(num_fines);
//         });

//         // Generate histogram chart using Chart.js
//         const configuration = {
//             type: 'bar',
//             data: {
//                 labels: data.labels,
//                 datasets: [{
//                     label: 'Number of Fines',
//                     data: data.data,
//                     backgroundColor: 'rgba(54, 162, 235, 0.5)',
//                     borderColor: 'rgba(54, 162, 235, 1)',
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 scales: {
//                     y: {
//                         beginAtZero: true
//                     }
//                 }
//             }
//         };

//         // Render the chart to a buffer
//         const image = await chartJSNodeCanvas.renderToBuffer(configuration);

//         // Set the content type to image/png and send the image
//         res.set('Content-Type', 'image/png');
//         res.send(image);
//     } catch (error) {
//         console.error('Error fetching fines data:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// Chart.js setup
const width = 800; // px
const height = 400; // px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

function getMonthName(monthNumber) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber];
}

// Function to generate a full set of months
function generateFullMonthSet() {
    const fullMonthSet = [];
    for (let i = 0; i < 12; i++) {
        fullMonthSet.push({ month: getMonthName(i), num_fines: 0 });
    }
    return fullMonthSet;
}

//histogram
app.get('/chart', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Retrieve fines data from the database
        const [rows] = await connection.execute('SELECT month, COUNT(*) AS num_fines FROM fines GROUP BY month');
        connection.release(); // Release the connection back to the pool

        // Generate a full set of months
        const fullMonthSet = generateFullMonthSet();

        // Populate fines data for existing months
        rows.forEach(({ month, num_fines }) => {
            const index = fullMonthSet.findIndex(item => item.month.toLowerCase() === month.toLowerCase());
            if (index !== -1) {
                fullMonthSet[index].num_fines = num_fines;
            }
        });

        // Sort months in order
        fullMonthSet.sort((a, b) => {
            return new Date('2000 ' + a.month) - new Date('2000 ' + b.month);
        });

        // Format data for Chart.js
        const data = {
            labels: fullMonthSet.map(item => item.month),
            data: fullMonthSet.map(item => item.num_fines)
        };

        // Generate histogram chart using Chart.js
        const configuration = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Number of Fines',
                    data: data.data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        // Render the chart to a buffer
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);

        // Set the content type to image/png and send the image
        res.set('Content-Type', 'image/png');
        res.send(image);
    } catch (error) {
        console.error('Error fetching fines data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




//line graph



app.get('/line-chart', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Retrieve fines data from the database
        const [rows] = await connection.execute('SELECT month, COUNT(*) AS num_fines FROM fines GROUP BY month');
        connection.release(); // Release the connection back to the pool

        // Generate a full set of months
        const fullMonthSet = generateFullMonthSet();

        // Populate fines data for existing months
        rows.forEach(({ month, num_fines }) => {
            const index = fullMonthSet.findIndex(item => item.month.toLowerCase() === month.toLowerCase());
            if (index !== -1) {
                fullMonthSet[index].num_fines = num_fines;
            }
        });

        // Sort months in order
        fullMonthSet.sort((a, b) => {
            return new Date('2000 ' + a.month) - new Date('2000 ' + b.month);
        });

        // Format data for Chart.js
        const data = {
            labels: fullMonthSet.map(item => item.month),
            datasets: [{
                label: 'Number of Fines',
                data: fullMonthSet.map(item => item.num_fines),
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        // Generate line chart using Chart.js
        const configuration = {
            type: 'line',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        // Render the chart to a buffer
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);

        // Set the content type to image/png and send the image
        res.set('Content-Type', 'image/png');
        res.send(image);
    } catch (error) {
        console.error('Error fetching fines data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
