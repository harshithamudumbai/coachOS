// ============================================
// routes/clients.js — Client CRUD Routes
// ============================================
// 📚 LEARNING NOTES:
//
// What is CRUD?
// → Create (POST), Read (GET), Update (PUT), Delete (DELETE)
// → These 4 operations cover everything you do with data
//
// What is req.params vs req.query vs req.body?
// → req.params  = URL parameters:  /api/clients/5     → req.params.id = 5
// → req.query   = URL query string: /api/clients?status=active → req.query.status = 'active'
// → req.body    = JSON data sent in POST/PUT request body
//
// Why is every route using req.coach.id?
// → Multi-tenancy! Each coach should ONLY see their own clients
// → The authenticate middleware puts coach info in req.coach
// → We filter every query with WHERE coach_id = req.coach.id
// → This prevents Coach A from seeing Coach B's clients
// ============================================

const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 🔒 All client routes require authentication
router.use(authenticate);

// ============================================
// GET /api/clients — List all clients for this coach
// ============================================
// Supports: ?status=active  ?search=john  ?page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const coachId = req.coach.id;
    const { status, search, page = 1, limit = 20 } = req.query;

    // 📚 Dynamic query building
    // We start with a base query and add conditions based on filters
    let query = 'SELECT * FROM clients WHERE coach_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM clients WHERE coach_id = ?';
    const params = [coachId];
    const countParams = [coachId];

    // Filter by status if provided
    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    // Search by name or email
    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`; // % = wildcard (match anything)
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Get total count for pagination
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    // 📚 PAGINATION with LIMIT and OFFSET
    // LIMIT 10 = return max 10 rows
    // OFFSET 20 = skip first 20 rows (page 3 with 10 per page)
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [clients] = await db.query(query, params);

    res.json({
      clients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// ============================================
// GET /api/clients/:id — Get single client details
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const [clients] = await db.query(
      'SELECT * FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.coach.id]
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Also get their latest progress entries
    const [progress] = await db.query(
      `SELECT * FROM progress_entries 
       WHERE client_id = ? 
       ORDER BY recorded_date DESC 
       LIMIT 10`,
      [req.params.id]
    );

    // Also get coach notes for this client
    const [notes] = await db.query(
      `SELECT * FROM coach_notes 
       WHERE client_id = ? AND coach_id = ?
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.params.id, req.coach.id]
    );

    res.json({
      client: clients[0],
      progress,
      notes
    });

  } catch (error) {
    console.error('Fetch client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// ============================================
// POST /api/clients — Add a new client
// ============================================
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, date_of_birth, gender, height_cm, goals, medical_notes } = req.body;

    // Validation
    if (!full_name || !email) {
      return res.status(400).json({ error: 'full_name and email are required' });
    }

    // Check if this coach already has a client with this email
    const [existing] = await db.query(
      'SELECT id FROM clients WHERE coach_id = ? AND email = ?',
      [req.coach.id, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'You already have a client with this email' });
    }

    const [result] = await db.query(
      `INSERT INTO clients (coach_id, full_name, email, phone, date_of_birth, gender, height_cm, goals, medical_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.coach.id, full_name, email, phone || null, date_of_birth || null, 
       gender || null, height_cm || null, goals || null, medical_notes || null]
    );

    res.status(201).json({
      message: 'Client added successfully! 🎉',
      client: {
        id: result.insertId,
        full_name,
        email,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Add client error:', error);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

// ============================================
// PUT /api/clients/:id — Update a client
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { full_name, email, phone, date_of_birth, gender, height_cm, goals, medical_notes, status } = req.body;

    // Verify client belongs to this coach
    const [existing] = await db.query(
      'SELECT id FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.coach.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // 📚 COALESCE = "use the new value if provided, otherwise keep the old value"
    await db.query(
      `UPDATE clients SET
        full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        height_cm = COALESCE(?, height_cm),
        goals = COALESCE(?, goals),
        medical_notes = COALESCE(?, medical_notes),
        status = COALESCE(?, status)
       WHERE id = ? AND coach_id = ?`,
      [full_name, email, phone, date_of_birth, gender, height_cm, 
       goals, medical_notes, status, req.params.id, req.coach.id]
    );

    res.json({ message: 'Client updated successfully! ✅' });

  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// ============================================
// DELETE /api/clients/:id — Remove a client
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.coach.id]
    );

    // 📚 affectedRows tells us if the DELETE actually removed something
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client removed successfully' });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// ============================================
// POST /api/clients/:id/progress — Add progress entry
// ============================================
router.post('/:id/progress', async (req, res) => {
  try {
    const { weight_kg, energy_level, skin_score, sleep_hours, water_litres, mood, notes, recorded_date } = req.body;

    // Verify client belongs to this coach
    const [existing] = await db.query(
      'SELECT id FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.coach.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const [result] = await db.query(
      `INSERT INTO progress_entries (client_id, weight_kg, energy_level, skin_score, sleep_hours, water_litres, mood, notes, recorded_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, weight_kg || null, energy_level || null, skin_score || null,
       sleep_hours || null, water_litres || null, mood || null, notes || null,
       recorded_date || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({
      message: 'Progress entry added! 📊',
      entryId: result.insertId
    });

  } catch (error) {
    console.error('Add progress error:', error);
    res.status(500).json({ error: 'Failed to add progress entry' });
  }
});

// ============================================
// POST /api/clients/:id/notes — Add coach note
// ============================================
router.post('/:id/notes', async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // Verify client belongs to this coach
    const [existing] = await db.query(
      'SELECT id FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.coach.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const [result] = await db.query(
      'INSERT INTO coach_notes (client_id, coach_id, note) VALUES (?, ?, ?)',
      [req.params.id, req.coach.id, note]
    );

    res.status(201).json({
      message: 'Note added! 📝',
      noteId: result.insertId
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

module.exports = router;
