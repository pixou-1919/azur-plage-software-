const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/rooms — list all rooms with current status
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM rooms ORDER BY number');
  res.json(result.rows);
});

// POST /api/rooms — admin only, add a new room
router.post('/', requireAdmin, async (req, res) => {
  const { number, type, price_per_night } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO rooms (number, type, price_per_night) VALUES ($1, $2, $3) RETURNING *`,
      [number, type, price_per_night]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Room number already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/rooms/:id/status — update room status (e.g. maintenance)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['available', 'occupied', 'maintenance'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const result = await pool.query(
    'UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Room not found' });
  res.json(result.rows[0]);
});

module.exports = router;
