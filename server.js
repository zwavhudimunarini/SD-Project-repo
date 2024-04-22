const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('src'))

//chenge server to local host when you want to test locally

const config = {
  //host:'localhost',
  user: 'zwavhudi',
  password: 'Vhanarini064',
  
  server: 'sddatabaseserver.database.windows.net',
  database: 'sdproject',
  options: {
    encrypt: true, 
    trustServerCertificate: false 
  }
};

// SUBMIT FORM DATA (MSSQL)
app.post('/submit', async (request, response) => {
  const { name, email, password, confirmPassword, number, role } = request.body;

  // Check if required fields are empty
  if (!name || !password || !confirmPassword || !number || !role) {
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
    const pool = new sql.ConnectionPool(config); 
    await pool.connect();

    const hashedPassword = await bcrypt.hash(password, 10);

    const request = await pool.request(); 
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, hashedPassword);
    request.input('number', sql.NVarChar, number);
    request.input('role', sql.NVarChar, role);

    const result = await request.query(
        'INSERT INTO users (name, email, password, number, role) VALUES (@name, @email, @password, @number, @role)'

    )

    await pool.close();

    response.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('Error inserting data (MSSQL): ', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});



// LOGIN (MSSQL)
app.post('/login', async (request, response) => {
  const { email, password } = request.body;

  try {

    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    const request = await pool.request();
    request.input('email', sql.NVarChar, email);  

    const result = await request.query(
      //'SELECT * FROM users WHERE BINARY email = @email'  
      'SELECT * FROM users WHERE email = @email'

    );

    await pool.close();

    const user = result.recordset[0]; 

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {

        response.status(200).json({ success: true, role: user.role, message: 'Login successful' });
      }
      else {
        response.status(404).json({ success: false, message: 'Invalid email or password' });
      }
    }
    else {

      response.status(400).json({ success: false, message: 'Invalid user' });
    }

  }
  catch (error) {

    console.error('Error querying database (MSSQL): ', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log("Server started at http://localhost:${port}");
});