const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret_key';

if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not found in environment variables. Using development fallback.');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Hardcoded Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ready.');
            }
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`;

        db.run(query, [fullname, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Database error: ' + err.message });
            }

            const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({ message: 'User created successfully', token, user: { fullname } });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: 'Login successful', token, user: { fullname: user.fullname } });
    });
});

// Admin Login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({ token });
    }
    res.status(401).json({ message: 'Invalid admin credentials' });
});

// Admin Middleware
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || user.role !== 'admin') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Admin Endpoints
app.get('/users', authenticateAdmin, (req, res) => {
    db.all(`SELECT fullname, email FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

app.delete('/users/:email', authenticateAdmin, (req, res) => {
    const { email } = req.params;
    db.run(`DELETE FROM users WHERE email = ?`, [email], function(err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'User deleted' });
    });
});

app.get('/posts', authenticateAdmin, (req, res) => {
    // Return empty array as posts are not implemented yet
    res.json([]);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
