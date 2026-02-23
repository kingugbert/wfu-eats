const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// Register ---------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, classYear, major } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'email, password, and displayName are required' });
    }
    if (!email.endsWith('@wfu.edu') && !email.endsWith('@wake.edu')) {
      return res.status(400).json({ error: 'Must use a Wake Forest email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await pool.query('SELECT id FROM students WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO students (email, password_hash, display_name, class_year, major)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, display_name, class_year, major, created_at`,
      [email.toLowerCase(), hash, displayName, classYear || null, major || null]
    );

    const student = result.rows[0];
    const token = jwt.sign(
      { sub: student.id, email: student.email, displayName: student.display_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, student });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login ------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, display_name, class_year, major FROM students WHERE email = $1',
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const student = result.rows[0];
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: student.id, email: student.email, displayName: student.display_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete student.password_hash;
    res.json({ token, student });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user -------------------------------------------------------
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, class_year, major, avatar_url, created_at FROM students WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
