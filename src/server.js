

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const createConnectionPool = async () => {
    try {
        const pool = await mysql.createPool({
            host: 'localhost',
            user: 'zwavhudi',
            password: 'Vhanarini064',
            database: 'sdproject'
        });
        console.log('MySQL connection pool created successfully');
        return pool;
    } catch (error) {
        console.error('Error creating MySQL connection pool: ', error);
        throw error;
    }
};

app.post('/submit', async (request, response) => {
    const { name, email, password, confirmPassword, number, role } = request.body;

    // Check if required fields are empty
    if (!name || !password || !confirmPassword || !number || !role) {
        return response.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return response.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
        
        await connection.execute(
            'INSERT INTO user (name, email, password, number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, number, role]
        );

        connection.release();
        
        response.status(201).json({ message: 'User created successfully' });
        
    } catch (error) {
        console.error('Error inserting data: ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (request, response) => {
    console.log('request body: ',request.body);
    const { email, password } = request.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Execute the SQL query to check if the user exists with the given email and password(make it case sensitive)
        
        const [rows, fields] = await connection.execute(
            'SELECT * FROM user WHERE BINARY email = ? AND BINARY password = ?',
            [email, password]
        );

        connection.release();

        if (rows.length > 0) {
            // User with the given email and password exists in the database
            response.status(200).json({ success: true, role: rows[0].role, message: 'Login successful' });
        }
        
        else {
            // User with the given email and password does not exist in the database
            response.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        
    } catch (error) {
        console.error('Error querying database: ', error);
       // response.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

