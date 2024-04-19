const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require('bcrypt');


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

//submit form data in the database

app.post('/submit', async (request, response) => {
    const { name, email, password, confirmPassword, number, role } = request.body;

    // Check if required fields are empty
    if (!name || !password || !confirmPassword || !number || !role) {
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
            'INSERT INTO user (name, email, password, number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, number, role]
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
    //console.log('request body: ',request.body);
    const { email, password } = request.body;

    //console.log('Received email:', email);
    //console.log('Received password:', password);

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Execute the SQL query to check if the user exists with the given email and password(make it case sensitive)
        
        const [rows, fields] = await connection.execute(
            'SELECT * FROM user WHERE BINARY email = ?',
            [email]
        );

        connection.release();

        if (rows.length > 0) {

            const isPasswordMatch = await bcrypt.compare(password, rows[0].password);

            if (isPasswordMatch) {
                // Passwords match, login successful
                response.status(200).json({ success: true, role: rows[0].role, message: 'Login successful' });
            }
            // User with the given email and password exists in the database
            //.status(200).json({ success: true, role: rows[0].role, message: 'Login successful' });
            else{
              //  alert('Invalid email or password');
                response.status(401).json({ success: false, message: 'Invalid email or password' });

            }
        }
        
        else {
            // User with the given email and password does not exist in the database
           // alert('Invalid email or password')
            response.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        
    } catch (error) {
        console.error('Error querying database: ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

