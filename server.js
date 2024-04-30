const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require("cors");
const bcrypt = require('bcryptjs');
//const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('src'));
app.use(express.json());


const config = {
    user: 'zwavhudi',
    password: 'Vhanarini064',
    server: 'sddatabaseserver.database.windows.net',
    database: 'sdproject',
    options: {
        encrypt: true, 
        trustServerCertificate: false 
    }
};

const createConnectionPool = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to MSSQL database');
        return pool;
    } catch (error) {
        console.error('Error creating MSSQL connection pool: ', error);
        throw error;
    }
};

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

// Admin sign up
app.post('/submit', async (request, response) => {
    const { name, email, password, confirmPassword } = request.body;

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
        const hashedPassword = await bcrypt.hash(password, 10);

        const request = pool.request();
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('password', sql.NVarChar, hashedPassword);

        await request.query(
            `INSERT INTO Admin (name, email, password) VALUES (@name, @email, @password)`
        );

        pool.close();
        response.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error inserting admin data (MSSQL): ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});




//Admin adds staff members
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
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const request = pool.request();
            request.input('name', sql.NVarChar, name);
            request.input('email', sql.NVarChar, email);
            request.input('password', sql.NVarChar, hashedPassword);
    
            await request.query(
                `INSERT INTO staff_maintanance (name, email, password) VALUES (@name, @email, @password)`
            );
    
            pool.close();
            response.status(201).json({ message: 'User created successfully' });
        }
        else if(role=="administrator"){

            const pool = await createConnectionPool();
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const request = pool.request();
            request.input('name', sql.NVarChar, name);
            request.input('email', sql.NVarChar, email);
            request.input('password', sql.NVarChar, hashedPassword);
    
            await request.query(
                `INSERT INTO staff_administrator (name, email, password) VALUES (@name, @email, @password)`
            );
    
            pool.close();
            response.status(201).json({ message: 'User created successfully' });

        }
        else{
            response.status(400).json({ error: 'unknown role' });
        }
    } catch (error) {
        console.error(`Error adding staff: `, error);
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
        const hashedPassword = await bcrypt.hash(password, 10);

        const request = pool.request();
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('password', sql.NVarChar, hashedPassword);

        await request.query(
            `INSERT INTO Tenant (name, email, password) VALUES (@name, @email, @password)`
        );

        pool.close();
        response.status(201).json({ message: 'User created successfully' });


        
    } 
    catch (error) {
        console.error('Error inserting data: ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
  });
  


  app.post('/login', async (request, response) => {
    console.log('request body: ', request.body);
    const { email, password } = request.body;

    try {
        const pool = await createConnectionPool();
        const requestPool = pool.request();
        
        let role = null;
        let user = null;

        // Check if the user exists in the Admin table
        let result = await requestPool.query(
            'SELECT * FROM Admin WHERE email = @email',
        );
        requestPool.input('email', sql.NVarChar, email);

        if (result.recordset.length > 0) {
            user = result.recordset[0];
            role = 'Admin';
        }

        // If the user is not found in the Admin table, check the staff_administrator table
        if (!user) {
            result = await requestPool.query(
                'SELECT * FROM staff_administrator WHERE email = @email',
            );
            requestPool.input('email', sql.NVarChar, email);

            if (result.recordset.length > 0) {
                user = result.recordset[0];
                role = 'Administrator'; // Assuming the role is stored in the Staff table
            }
        }

        // If the user is still not found, check the staff_maintanance table
        if (!user) {
            result = await requestPool.query(
                'SELECT * FROM staff_maintanance WHERE email = @email',
            );
            requestPool.input('email', sql.NVarChar, email);

            if (result.recordset.length > 0) {
                user = result.recordset[0];
                role = 'Maintanance'; // Assuming the role is stored in the Staff table
            }
        }

        // If the user is still not found, check the Tenant table
        if (!user) {
            result = await requestPool.query(
                'SELECT * FROM Tenant WHERE email = @email',
            );
            requestPool.input('email', sql.NVarChar, email);

            if (result.recordset.length > 0) {
                user = result.recordset[0];
                role = 'Tenant';
            }
        }

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



//checking if user is in the database

// app.post('/login', async (request, response) => {
//     console.log('request body: ', request.body);
//     const { email, password } = request.body;

//     try {
//         const pool = await createConnectionPool(); // Connect to the database
//         const request = pool.request(); // Create a request object

//         let role = null;
//         let user = null;

//         // Check if the user exists in the Admin table
//         const adminResult = await request.input('email', sql.NVarChar, email)
//                                           .query('SELECT * FROM Admin WHERE email = @email');

//         if (adminResult.recordset.length > 0) {
//             user = adminResult.recordset[0];
//             role = 'Admin';
//         }

//         // If the user is not found in the Admin table, check the Staff_Administrator table
//         if (!user) {
//             const staffResult = await request.input('email', sql.NVarChar, email)
//                                               .query('SELECT * FROM staff_administrator WHERE email = @email');

//             if (staffResult.recordset.length > 0) {
//                 user = staffResult.recordset[0];
//                 role = 'administrator'; // Assuming the role is stored in the Staff table
//             }
//         }

//         // If the user is still not found, check the Staff_maintanance table
//         if (!user) {
//             const maintenanceResult = await request.input('email', sql.NVarChar, email)
//                                                     .query('SELECT * FROM staff_maintanance WHERE email = @email');

//             if (maintenanceResult.recordset.length > 0) {
//                 user = maintenanceResult.recordset[0];
//                 role = 'maintanance'; // Assuming the role is stored in the Staff table
//             }
//         }

//         // If the user is still not found, check the Tenant table
//         if (!user) {
//             const tenantResult = await request.input('email', sql.NVarChar, email)
//                                               .query('SELECT * FROM Tenant WHERE email = @email');

//             if (tenantResult.recordset.length > 0) {
//                 user = tenantResult.recordset[0];
//                 role = 'Tenant';
//             }
//         }

//         if (user) {
//             // Compare the hashed password with the provided password
//             const isPasswordMatch = password === user.password; // Assuming password is stored in plaintext

//             if (isPasswordMatch) {
//                 response.status(200).json({ success: true, name: user.name, role: role, message: 'Login successful' });
//             } else {
//                 response.status(401).json({ success: false, message: 'Invalid email or password' });
//             }
//         } else {
//             response.status(401).json({ success: false, message: 'Invalid email or password' });
//         }
        
//         await pool.close(); // Close the connection pool
//     } catch (error) {
//         console.error('Error querying database: ', error);
//         // response.status(500).json({ error: 'Internal server error' });
//     }
// });






//Tenants report an issue
app.post('/report-issue', async (request, response) => {
    const { issue } = request.body;
    console.log("the request body: ", request.body);
  
    try {
      const pool = await sql.connect(config); // Assuming `config` is defined elsewhere
      const request = pool.request();
  
      // Insert the new issue into the database
      await request.query`INSERT INTO issue_reports (issue) VALUES (${issue})`;
  
      // Close the connection pool
      await pool.close();
  
     
  
      response.status(201).json({ message: 'Issue reported successfully' });
    } catch (error) {
      console.error('Error reporting issue:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });




  
// Administrator fetches reported issues
app.get('/reported-issues', async (req, res) => {
    try {
      const pool = await sql.connect(config); // Assuming `config` is defined elsewhere
      const request = pool.request();
  
      // Retrieve all reported issues from the database
      const result = await request.query('SELECT id, issue FROM issue_reports');
  
      const issues = result.recordset.map(row => row.issue);
      const ids = result.recordset.map(row => row.id);
  
      // Close the connection pool
      await pool.close();
  
      // Send the list of reported issues to the client
      res.status(200).json({ issues, ids });
    } catch (error) {
      console.error('Error fetching reported issues:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  //assign maintanance to fix the issue
  app.post('/assign-to-maintenance', async (req, res) => {
    const { issue } = req.body;

    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        const sqlQuery = 'INSERT INTO maintenanceissues (issueAssigned) VALUES (@issue)'; // Using parameterized query

        // Execute the SQL query to insert the issue into MaintenanceIssues table
        await request.input('issue', sql.NVarChar, issue).query(sqlQuery);

        console.log('Issue submitted successfully');
        res.status(201).json({ message: 'Issue assigned successfully' });

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error assigning issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//maintanance fetches all issues assigned to them
app.get('/total-issues', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object
  
        // Retrieve all issues from the MaintenanceIssues table
        const result = await request.query('SELECT id, issueAssigned FROM maintenanceissues');
  
        // Extract ids and issues from the result
        const ids = result.recordset.map(row => row.id);
        const issues = result.recordset.map(row => row.issueAssigned); // Use 'issueAssigned' instead of 'issue'
  
        res.status(200).json({ issues, ids }); // Send the list of reported issues to the client
  
        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//maintanance gives feedback to Administrator after fixing the issue
app.post('/update-feedback/:id', async (req, res) => {
    const { feedback } = req.body;
    const issueId = req.params.id;

    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        const sqlQuery = 'UPDATE maintenanceissues SET feedback = @feedback WHERE id = @issueId'; // Using parameterized query

        // Execute the SQL query to update feedback for the specified issue
        await request.input('feedback', sql.NVarChar, feedback)
                     .input('issueId', sql.Int, issueId)
                     .query(sqlQuery);

        console.log('Feedback given successfully');
        res.status(201).json({ message: 'Feedback given successfully' });

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error giving feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Administrator gets the feedback from maintanance
app.get('/get-maintenance-feedback', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        // Retrieve all issues with feedback from the MaintenanceIssues table
        const result = await request.query('SELECT id, issueAssigned, feedback FROM maintenanceissues WHERE feedback IS NOT NULL');

        // Extract ids, issueAssigneds, and feedbacks from the result
        const ids = result.recordset.map(row => row.id);
        const issueAssigneds = result.recordset.map(row => row.issueAssigned);
        const feedbacks = result.recordset.map(row => row.feedback);

        res.status(200).json({ issueAssigneds, feedbacks, ids }); // Send the list of reported issues to the client

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






//Administrator gets all tenants in the system
app.get('/get-users', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object
  
        // Retrieve all users from the database
        const result = await request.query('SELECT name, email, id FROM Tenant');
  
        const ids = result.recordset.map(row => row.id);
        const names = result.recordset.map(row => row.name);
        const emails = result.recordset.map(row => row.email);
  
        res.status(200).json({ names, emails, ids }); // Send the list of users to the client
  
        await pool.close(); // Close the connection pool
    } 
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Administrator deletes tenant from system

app.delete('/delete-user/:id', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object
  
        const Id = req.params.id;
        console.log("Deleting user with ID:", Id);
  
        // Query to delete the user from the database
        const sqlQuery = 'DELETE FROM Tenant WHERE id = @Id'; // Using parameterized query
  
        // Execute the SQL query to delete the user
        const result = await request.input('Id', sql.Int, Id).query(sqlQuery);
  
        console.log('User deleted successfully');
        res.sendStatus(200);
        
        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});






// Get total number of issues function
const getTotalIssuesCount = async () => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Retrieve the count of reported issues from the database
        const result = await request.query('SELECT COUNT(*) as totalCount FROM issue_reports');

        return result.recordset[0].totalCount;
    } catch (error) {
        console.error('Error fetching total issues count:', error);
        throw error;
    }
};


//delete issues after completing them

app.delete('/delete-issue/:id', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        const issueId = req.params.id;
        console.log("Deleting issue with ID:", issueId);

        // Query to delete the issue from the database
        const sqlQuery = 'DELETE FROM issue_reports WHERE id = @issueId'; // Using parameterized query

        // Execute the SQL query to delete the issue
        const result = await request.input('issueId', sql.Int, issueId).query(sqlQuery);

        console.log('Issue deleted successfully');
        res.sendStatus(200);

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'Error deleting issue' });
    }
});


// Admin gets all staff members
app.get('/all-staff', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        // Query Administrator table to get all staff members
        const adminResults = await request.query('SELECT id, name, email FROM staff_administrator');

        // Query Maintenance table to get all staff members
        const maintenanceResults = await request.query('SELECT id, name, email FROM staff_maintanance');

        // Combine results from both tables
        const allStaffMembers = adminResults.recordset.concat(maintenanceResults.recordset);

        res.json(allStaffMembers); // Send the list of all staff members to the client

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error fetching all staff members:', error);
        res.status(500).json({ error: 'An error occurred while fetching all staff members' });
    }
});


// Search dor staff members
app.get('/search/staff', async (req, res) => {
    try {
        const searchQuery = req.query.query;
        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        // Query Administrator table to search for staff members
        const adminResults = await request.input('searchQuery', sql.NVarChar, `%${searchQuery}%`)
                                          .query('SELECT id, name, email FROM staff_administrator WHERE name LIKE @searchQuery OR email LIKE @searchQuery');

        // Query Maintenance table to search for staff members
        const maintenanceResults = await request.input('searchQuery', sql.NVarChar, `%${searchQuery}%`)
                                                .query('SELECT id, name, email FROM staff_maintanance WHERE name LIKE @searchQuery OR email LIKE @searchQuery');

        // Combine results from both tables
        const results = adminResults.recordset.concat(maintenanceResults.recordset);

        res.json(results); // Send the search results to the client

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error searching for staff members:', error);
        res.status(500).json({ error: 'An error occurred while searching staff members' });
    }
});


//delete staff members as an admin
app.delete('/staff/:id', async (req, res) => {
    try {
        const staffId = req.params.id;

        const pool = await sql.connect(config); // Connect to the database
        const request = pool.request(); // Create a request object

        // Determine the role based on the table being deleted from
        let tableName = '';

        // Check if the staff member is in the Administrators table
        const adminResult = await request.input('staffId', sql.Int, staffId)
                                         .query('SELECT id FROM staff_administrator WHERE id = @staffId');
        if (adminResult.recordset.length > 0) {
            tableName = 'staff_administrator';
        } else {
            // Check if the staff member is in the Maintenance table
            const maintenanceResult = await request.input('staffId', sql.Int, staffId)
                                                  .query('SELECT id FROM staff_maintanance WHERE id = @staffId');
            if (maintenanceResult.recordset.length > 0) {
                tableName = 'staff_maintanance';
            } else {
                // If the staff member is not found in any table, return an error
                return res.status(404).json({ error: 'Staff member not found' });
            }
        }

        // Delete the staff member from the determined table
        await request.input('staffId', sql.Int, staffId)
                     .query(`DELETE FROM ${tableName} WHERE id = @staffId`);

        res.json({ message: 'Staff member deleted successfully' });

        await pool.close(); // Close the connection pool
    } catch (error) {
        console.error('Error deleting staff member:', error);
        res.status(500).json({ error: 'An error occurred while deleting the staff member' });
    }
});

// Socket.IO Server-Side Code
io.on('connection', async (socket) => {
    console.log('Client connected');
    
    // Send total count of reported issues to the client
    const totalCount = await getTotalIssuesCount();
    socket.emit('total-issues-count', totalCount);
});







server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
