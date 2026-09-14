const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/bookings — list bookings, optional ?date=YYYY-MM-DD filter
router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, r.number AS room_number, g.full_name AS guest_name
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN guests g ON b.guest_id = g.id
    ORDER BY b.check_in DESC
  `);
  res.json(result.rows);
});

// POST /api/bookings — create booking (with conflict check)
router.post('/', async (req, res) => {
  const { room_id, guest, check_in, check_out } = req.body;
  // guest = { full_name, email, phone } — created inline for simplicity

  if (!room_id || !guest?.full_name || !check_in || !check_out) {
    return res.status(400).json({ error: 'room_id, guest.full_name, check_in and check_out are required' });
  }
  if (new Date(check_out) <= new Date(check_in)) {
    return res.status(400).json({ error: 'check_out must be after check_in' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Conflict check: any existing booking for this room that overlaps the requested range
    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE room_id = $1
         AND status != 'cancelled'
         AND check_in < $3
         AND check_out > $2`,
      [room_id, check_in, check_out]
    );
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Room is already booked for part of this date range' });
    }

    const guestResult = await client.query(
      `INSERT INTO guests (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
      [guest.full_name, guest.email || null, guest.phone || null]
    );

    const bookingResult = await client.query(
      `INSERT INTO bookings (room_id, guest_id, check_in, check_out, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [room_id, guestResult.rows[0].id, check_in, check_out, req.staff.id]
    );

    await client.query('COMMIT');
    res.status(201).json(bookingResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/bookings/:id/status — check-in / check-out / cancel
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const result = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Booking not found' });

  // Keep room status in sync
  const roomStatus = status === 'checked_in' ? 'occupied' : status === 'checked_out' ? 'available' : null;
  if (roomStatus) {
    await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', [roomStatus, result.rows[0].room_id]);
  }

  res.json(result.rows[0]);
});

// GET /api/bookings/dashboard/today — arrivals, departures, occupancy rate
router.get('/dashboard/today', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [arrivals, departures, occupancy] = await Promise.all([
    pool.query(`SELECT b.*, r.number AS room_number, g.full_name AS guest_name
                FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN guests g ON b.guest_id = g.id
                WHERE b.check_in = $1 AND b.status != 'cancelled'`, [today]),
    pool.query(`SELECT b.*, r.number AS room_number, g.full_name AS guest_name
                FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN guests g ON b.guest_id = g.id
                WHERE b.check_out = $1 AND b.status != 'cancelled'`, [today]),
    pool.query(`SELECT
                  COUNT(*) FILTER (WHERE status = 'occupied') AS occupied,
                  COUNT(*) AS total
                FROM rooms`)
  ]);

  const { occupied, total } = occupancy.rows[0];
  res.json({
    date: today,
    arrivals: arrivals.rows,
    departures: departures.rows,
    occupancy_rate: total > 0 ? Number(occupied) / Number(total) : 0
  });
});

module.exports = router;
