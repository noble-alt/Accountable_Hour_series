const express = require('express');
const { Pool } = require('pg');
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
app.use(express.static(path.join(__dirname, '../public')));

// Admin Credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.warn('Warning: Admin credentials not found in environment variables. Using development fallbacks.');
}

// Database Connection
let db;
let isPostgres = false;

if (process.env.DATABASE_URL) {
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    isPostgres = true;
    console.log('Connected to PostgreSQL database.');
} else {
    const dbPath = path.join(__dirname, 'database.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('SQLite connection error:', err.message);
        else console.log('Connected to SQLite database.');
    });
}

// Database Abstraction Helper
const dbQuery = {
    run: async (sql, params = []) => {
        if (isPostgres) {
            const pgSql = sql.replace(/\?/g, (match, offset, string) => {
                let count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
                return `$${count}`;
            });
            const result = await db.query(pgSql, params);
            return { lastID: result.rows[0]?.id, changes: result.rowCount };
        } else {
            return new Promise((resolve, reject) => {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            });
        }
    },
    get: async (sql, params = []) => {
        if (isPostgres) {
            const pgSql = sql.replace(/\?/g, (match, offset, string) => {
                let count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
                return `$${count}`;
            });
            const result = await db.query(pgSql, params);
            return result.rows[0];
        } else {
            return new Promise((resolve, reject) => {
                db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },
    all: async (sql, params = []) => {
        if (isPostgres) {
            const pgSql = sql.replace(/\?/g, (match, offset, string) => {
                let count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
                return `$${count}`;
            });
            const result = await db.query(pgSql, params);
            return result.rows;
        } else {
            return new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }
    }
};

// Initialize Tables
const initDb = async () => {
    const createTableQuery = isPostgres
        ? `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            fullname TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`
        : `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`;

    try {
        if (isPostgres) await db.query(createTableQuery);
        else await dbQuery.run(createTableQuery);
        console.log('Users table ready.');
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

initDb();

const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running', database: isPostgres ? 'PostgreSQL' : 'SQLite' });
});

// Signup endpoint
apiRouter.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const querySql = isPostgres
            ? `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?) RETURNING id`
            : `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`;

        const result = await dbQuery.run(querySql, [fullname, email, hashedPassword]);
        const token = jwt.sign({ id: result.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User created successfully', token, user: { fullname } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('unique constraint')) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Database error: ' + err.message });
    }
});

// Login endpoint
apiRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await dbQuery.get(`SELECT * FROM users WHERE email = ?`, [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: 'Login successful', token, user: { fullname: user.fullname } });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

// Admin Login
apiRouter.post('/admin/login', (req, res) => {
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
apiRouter.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const rows = await dbQuery.all(`SELECT fullname, email FROM users`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

apiRouter.delete('/users/:email', authenticateAdmin, async (req, res) => {
    const { email } = req.params;
    try {
        await dbQuery.run(`DELETE FROM users WHERE email = ?`, [email]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

apiRouter.get('/posts', authenticateAdmin, (req, res) => {
    res.json([]);
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;
