const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO staff (name, email, password_hash, role)
       VALUES ($1, $2, $3, COALESCE($4, 'receptionist'))
       RETURNING id, name, email, role`,
      [name, email, hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    const staff = result.rows[0];
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, staff.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: staff.id, name: staff.name, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, staff: { id: staff.id, name: staff.name, role: staff.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
