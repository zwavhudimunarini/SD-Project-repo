const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
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

// Submit endpoint for Admin
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


// Add staff endpoint
app.post('/add-staff', async (request, response) => {
    const { name, email, password, confirmPassword,role } = request.body;

    // Check if required fields are empty
    if (!name || !password || !confirmPassword || !email || !role) {
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
            `INSERT INTO staff_administrator (name, email, password) VALUES (@name, @email, @password)`
        );

        pool.close();
        response.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error inserting admin data (MSSQL): ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});



// app.post('/add-staff', async (request, response) => {
//     const { name, email, password, confirmPassword,role} = request.body;
//     console.log(request.body);

//     // Check if required fields are empty
//     if (!name || !email || !password || !confirmPassword) {
//         return response.status(400).json({ error: 'All fields are required' });
//     }

//     if (password !== confirmPassword) {
//         return response.status(400).json({ error: 'Passwords do not match' });
//     }

//     if (password.length < 8) {
//         return response.status(400).json({ error: 'Password too short' });
//     }

//     // Hash the password

//     try {
        
        
//         const pool = await createConnectionPool();
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const request = pool.request();

//         request.input('name', sql.NVarChar, name);
//         request.input('email', sql.NVarChar, email);
//         request.input('password', sql.NVarChar, hashedPassword);
//         await request.query(
//             `INSERT INTO staff_administrator (name, email, password) VALUES (@name, @email, @hashedPassword)`,
            
//         );
//         pool.close();

//         response.status(201).json({ message: `Staff member added successfully` });


//         // if(role=="administrator"){
//         //     await request.query(
//         //         `INSERT INTO staff_administrator (name, email, password) VALUES (@name, @email, @hashedPassword)`,
                
//         //     );
//         //     pool.close();
    
//         //     response.status(201).json({ message: `Staff member added successfully` });
    

//         // }
//         // else if(role=="maintanance"){
//         //     await request.query(
//         //         `INSERT INTO staff_maintanance (name, email, password) VALUES (@name, @email, @hashedPassword)`,
                
//         //     );
//         //     pool.close();
    
//         //     response.status(201).json({ message: `Staff member added successfully` });
    
//         // }
//         // else{
//         //     response.status(400).json({ error: 'no such role' });

//         // }

        
//     } catch (error) {
//         console.error(`Error adding staff: `, error);
//         response.status(500).json({ error: 'Internal server error' });
//     }
// });


// add for Tenant as an administrator
app.post('/submitTenant', async (request, response) => {
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
            `INSERT INTO Tenant (name, email, password) VALUES (@name, @email, @password)`
        );

        pool.close();
        response.status(201).json({ message: 'Tenant created successfully' });

    } catch (error) {
        console.error('Error inserting tenant data (MSSQL): ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});





//checking if user is in the database

app.post('/login', async (request, response) => {
    console.log('request body: ', request.body);
    const { email, password } = request.body;

    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();

        const request = await pool.request();
        request.input('email', sql.NVarChar, email);
        let role=null ;
        let user=null ;

     
        // Check if the user exists in the Admin table
        const result = await request.query(
            'SELECT * FROM Admin WHERE email = @email'
            
        );

        if (result.recordset.length > 0) {
            user = result.recordset[0];
            role = 'Admin';
        }

        // If the user is not found in the Admin table, check the staff_administrator table
        if (!user) {
            const result = await request.query(
                'SELECT * FROM staff_administrator WHERE email = @email'
                
            );

            if (result.recordset.length > 0) {
                user = result.recordset[0];
                role = 'administrator'; // Assuming the role is stored in the Staff table
            }
        }

        // If the user is still not found, check the staff_maintanance table
        if (!user) {
            const result = await request.query(
                'SELECT * FROM staff_maintanance WHERE email = @email'
               
            );

            if (result.recordset.length > 0) {
                user = result.recordset[0];
                role = 'maintenance'; // Assuming the role is stored in the Staff table
            }
        }

        // If the user is still not found, check the Tenant table
        if (!user) {
            const result = await request.query(
                'SELECT * FROM Tenant WHERE email = @email'
                
            );

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
        response.status(500).json({ error: 'Internal server error' });
    }
});


// Handle issue reporting endpoint
app.post('/report-issue', async (request, response) => {
    const { issue } = request.body;
    console.log("the request body: ",request.body);

    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Insert the new issue into the database
        await request.query(
            'INSERT INTO issue_reports (issue) VALUES (@issue)',
            { issue }
        );

        // Emit a new-issue event to notify staff members (if using Socket.IO)
        // io.emit('new-issue', issue);

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
        const request = pool.request();

        // Retrieve all reported issues from the database
        const result = await request.query('SELECT id, issue FROM issue_reports');

        const issues = result.recordset.map(row => row.issue);
        const ids = result.recordset.map(row => row.id);

        res.status(200).json({ issues, ids });
    } catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get users endpoint
app.get('/get-users', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Retrieve all users from the Tenant table
        const result = await request.query('SELECT name, email, id FROM Tenant');

        const names = result.recordset.map(row => row.name);
        const emails = result.recordset.map(row => row.email);
        const ids = result.recordset.map(row => row.id);

        res.status(200).json({ names, emails, ids });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get maintenance feedback endpoint
app.get('/get-maintenance-feedback', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Retrieve maintenance feedback from the MaintenanceIssues table
        const result = await request.query('SELECT id, issueAssigned, feedback FROM maintenanceissues WHERE feedback IS NOT NULL');

        const issueAssigneds = result.recordset.map(row => row.issueAssigned);
        const feedbacks = result.recordset.map(row => row.feedback);
        const ids = result.recordset.map(row => row.id);

        res.status(200).json({ issueAssigneds, feedbacks, ids });
    } catch (error) {
        console.error('Error fetching maintenance feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
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

// Assign issue to maintenance endpoint
app.post('/assign-to-maintenance', async (req, res) => {
    const { issue } = req.body;

    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Insert the issue into the MaintenanceIssues table
        await request.query('INSERT INTO maintenanceissues (issueAssigned) VALUES (@issue)', { issue });

        res.status(201).json({ message: 'Issue assigned successfully' });
    } catch (error) {
        console.error('Error assigning issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update feedback endpoint
app.post('/update-feedback/:id', async (req, res) => {
    const { feedback } = req.body;
    const issueId = req.params.id;

    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Update the feedback for the specified issue ID
        await request.query('UPDATE maintenanceissues SET feedback = @feedback WHERE id = @issueId', { feedback, issueId });

        res.status(201).json({ message: 'Feedback given successfully' });
    } catch (error) {
        console.error('Error giving feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get total issues for maintenance guy
app.get('/total-issues', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Retrieve all reported issues from the MaintenanceIssues table
        const result = await request.query('SELECT id, issueAssigned FROM maintenanceissues');

        const ids = result.recordset.map(row => row.id);
        const issues = result.recordset.map(row => row.issueAssigned);

        res.status(200).json({ issues, ids });
    } catch (error) {
        console.error('Error fetching reported issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







//delete issues after completing them
app.delete('/delete-issue/:id', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        const issueId = req.params.id;
        console.log("Deleting issue with ID:", issueId);

        // Query to delete the issue from the database
        const sql = 'DELETE FROM issue_reports WHERE id = @issueId';

        // Execute the SQL query to delete the issue
        await request.query(sql, { issueId });

        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'Error deleting issue' });
    }
});

// Delete user endpoint
app.delete('/delete-user/:id', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        const userId = req.params.id;
        console.log("Deleting user with ID:", userId);

        // Query to delete the user from the database
        const sql = 'DELETE FROM Tenant WHERE id = @userId';

        // Execute the SQL query to delete the user
        await request.query(sql, { userId });

        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Socket.IO Server-Side Code
io.on('connection', async (socket) => {
    console.log('Client connected');
    
    // Send total count of reported issues to the client
    const totalCount = await getTotalIssuesCount();
    socket.emit('total-issues-count', totalCount);
});



// Search staff endpoint
app.get('/search/staff', async(req, res) => {
    try {
        const searchQuery = req.query.query;
        const pool = await createConnectionPool();
        const request = pool.request();

        const adminResults = await request.query(
            'SELECT id, name, email FROM staff_administrator WHERE name LIKE @searchQuery OR email LIKE @searchQuery',
            { searchQuery: `%${searchQuery}%` }
        );

        const maintenanceResults = await request.query(
            'SELECT id, name, email FROM Staff_Maintenance WHERE name LIKE @searchQuery OR email LIKE @searchQuery',
            { searchQuery: `%${searchQuery}%` }
        );

        const results = [...adminResults.recordset, ...maintenanceResults.recordset];
        res.json(results);

    } catch (error) {
        console.error('Error searching for staff members:', error);
        res.status(500).json({ error: 'An error occurred while searching staff members' });
    }
});

// Delete staff member endpoint
app.delete('/staff/:id', async(req, res) => {
    try {
        const staffId = req.params.id;
        
        const pool = await createConnectionPool();
        const request = pool.request();

        // Determine the role based on the table being deleted from
        let tableName = '';

        // Check if the staff member is in the Administrators table
        const adminResult = await request.query(`SELECT id FROM staff_administrator WHERE id = @staffId`, { staffId });
        if (adminResult.recordset.length > 0) {
            tableName = 'staff_administrator';
        } else {
            // Check if the staff member is in the Maintenance table
            const maintenanceResult = await request.query(`SELECT id FROM Staff_Maintenance WHERE id = @staffId`, { staffId });
            if (maintenanceResult.recordset.length > 0) {
                tableName = 'Staff_Maintenance';
            } else {
                // If the staff member is not found in any table, return an error
                return res.status(404).json({ error: 'Staff member not found' });
            }
        }

        // Delete the staff member from the determined table
        await request.query(`DELETE FROM ${tableName} WHERE id = @staffId`, { staffId });
        res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff member:', error);
        res.status(500).json({ error: 'An error occurred while deleting the staff member' });
    }
});

// Get all staff members endpoint
app.get('/all-staff', async (req, res) => {
    try {
        const pool = await createConnectionPool();
        const request = pool.request();

        // Query both Administrator and Maintenance tables to get all staff members
        const adminResults = await request.query('SELECT id, name, email FROM staff_administrator');
        const maintenanceResults = await request.query('SELECT id, name, email FROM Staff_Maintenance');

        const allStaffMembers = [...adminResults.recordset, ...maintenanceResults.recordset];

        res.json(allStaffMembers);
    } catch (error) {
        console.error('Error fetching all staff members:', error);
        res.status(500).json({ error: 'An error occurred while fetching all staff members' });
    }
});


server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
