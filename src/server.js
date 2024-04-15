//require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
//const bodyParser=require("body-parser");

const app = express();
const port = 3004;

app.use(cors())
app.use(express.json());
//app.use(bodyParser.urlencoded({extended:false}))
//app.use(bodyParser.json())

//const db = require('./login');

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
        throw error; // Rethrow the error to handle it at a higher level
    }
};



app.post('/submit', async (request, response) => {

    
    let { name, email, password, confirmPassword, number, role } = request.body;
   // console.log(request.body);
    console.log(name);
    console.log( email);
    console.log(password);
    console.log(number);
    console.log(role);
    
    
    
    // Check if the name field is empty
    if (!name) {
        return response.status(400).json({ error: 'Name field is required' });
    }

    if (password !== confirmPassword) {
        return response.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();
        
        // Execute the SQL query with form values
        await connection.execute(
            'INSERT INTO user (name, email, password, number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, number, role]
        );

        connection.release();
        console.log('User created successfully');
        response.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error inserting data: ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

//check if user is in the database

app.post('/login', async (request, response) => {
    const { email, password } = request.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    try {
        const pool = await createConnectionPool();
        const connection = await pool.getConnection();

        // Execute the SQL query to check if the user exists with the given email and password
        const [rows, fields] = await connection.execute(
            'SELECT * FROM user WHERE email = ? AND password = ?',
            [email, password]
        );

        connection.release();

        if (rows.length > 0) {
            // User with the given email and password exists in the database
            response.status(200).json({ success: true, message: 'Login successful' });
        } else {
            // User with the given email and password does not exist in the database
            response.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error querying database: ', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(process.env.PORT || port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
