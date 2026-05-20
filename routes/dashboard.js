// ============================================
// routes/dashboard.js — Dashboard Analytics API
// ============================================
// 📚 LEARNING NOTES:
//
// What are AGGREGATE functions?
// → Functions that calculate a value from a SET of rows
// → COUNT(*) = count all rows
// → SUM(amount) = add up all amounts
// → AVG(score) = average of all scores
// → MAX(date) = most recent date
//
// What is GROUP BY?
// → Groups rows that have the same value in a column
// → Used WITH aggregate functions
// → Example: COUNT(*) GROUP BY status → count per status
//
// What is a JOIN?
// → Combines rows from 2+ tables based on a related column
// → INNER JOIN = only matching rows from both tables
// → LEFT JOIN = all rows from left table + matching from right
// → Think of it as "gluing" tables together
//
// What is UNION ALL?
// → Combines results from multiple SELECT queries into one list
// → UNION = removes duplicates
// → UNION ALL = keeps duplicates (faster!)
// → All SELECTs must have the same number of columns
// ============================================

const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 🔒 All dashboard routes require authentication
router.use(authenticate);

// ============================================
// GET /api/dashboard/stats — Comprehensive dashboard statistics
// ============================================
// Returns: client counts by status, weekly/monthly additions,
//          recent progress, and overview metrics
router.get('/stats', async (req, res) => {
  try {
    const coachId = req.coach.id;

    // 📚 Multiple queries in parallel with Promise.all
    // → Instead of running one after another (slow),
    //   we run them all at once (fast!)
    const [
      [clientCounts],
      [weeklyClients],
      [monthlyClients],
      [recentProgress],
      [recentNotes]
    ] = await Promise.all([

      // 1. Client counts by status
      // 📚 CASE WHEN = SQL's version of if/else
      // → For each row, check status and add to the right counter
      db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
        FROM clients 
        WHERE coach_id = ?
      `, [coachId]),

      // 2. Clients added this week
      // 📚 DATE_SUB = subtract time from a date
      // → CURDATE() = today's date
      // → INTERVAL 7 DAY = last 7 days
      db.query(`
        SELECT COUNT(*) as count 
        FROM clients 
        WHERE coach_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `, [coachId]),

      // 3. Clients added this month
      db.query(`
        SELECT COUNT(*) as count 
        FROM clients 
        WHERE coach_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `, [coachId]),

      // 4. Recent progress entries across ALL clients
      // 📚 JOIN = combine clients + progress_entries tables
      // → We need client name alongside their progress data
      // → c.full_name comes from clients table
      // → p.* comes from progress_entries table
      db.query(`
        SELECT p.*, c.full_name as client_name
        FROM progress_entries p
        INNER JOIN clients c ON p.client_id = c.id
        WHERE c.coach_id = ?
        ORDER BY p.created_at DESC
        LIMIT 5
      `, [coachId]),

      // 5. Recent notes
      db.query(`
        SELECT cn.*, c.full_name as client_name
        FROM coach_notes cn
        INNER JOIN clients c ON cn.client_id = c.id
        WHERE cn.coach_id = ?
        ORDER BY cn.created_at DESC
        LIMIT 5
      `, [coachId])
    ]);

    res.json({
      clients: {
        total: clientCounts[0].total || 0,
        active: clientCounts[0].active || 0,
        inactive: clientCounts[0].inactive || 0,
        paused: clientCounts[0].paused || 0
      },
      trends: {
        clientsThisWeek: weeklyClients[0].count || 0,
        clientsThisMonth: monthlyClients[0].count || 0
      },
      recentProgress,
      recentNotes
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ============================================
// GET /api/dashboard/activity — Activity feed
// ============================================
// Returns a unified timeline of recent actions:
// - New clients added
// - Progress entries logged
// - Notes written
//
// 📚 UNION ALL combines 3 different queries into one sorted list
router.get('/activity', async (req, res) => {
  try {
    const coachId = req.coach.id;
    const limit = parseInt(req.query.limit) || 15;

    // 📚 UNION ALL explained:
    // → Query 1: Get recent client additions
    // → Query 2: Get recent progress entries  
    // → Query 3: Get recent notes
    // → UNION ALL: Merge them into one list
    // → ORDER BY: Sort the merged list by date
    // → Each query must output SAME columns (id, type, description, client_name, created_at)
    const [activities] = await db.query(`
      (
        SELECT 
          c.id,
          'client_added' as type,
          CONCAT('New client: ', c.full_name) as description,
          c.full_name as client_name,
          c.id as client_id,
          c.created_at
        FROM clients c
        WHERE c.coach_id = ?
        ORDER BY c.created_at DESC
        LIMIT ?
      )
      UNION ALL
      (
        SELECT 
          p.id,
          'progress_logged' as type,
          CONCAT('Progress entry for ', c.full_name) as description,
          c.full_name as client_name,
          c.id as client_id,
          p.created_at
        FROM progress_entries p
        INNER JOIN clients c ON p.client_id = c.id
        WHERE c.coach_id = ?
        ORDER BY p.created_at DESC
        LIMIT ?
      )
      UNION ALL
      (
        SELECT 
          cn.id,
          'note_added' as type,
          CONCAT('Note on ', c.full_name, ': ', LEFT(cn.note, 60)) as description,
          c.full_name as client_name,
          c.id as client_id,
          cn.created_at
        FROM coach_notes cn
        INNER JOIN clients c ON cn.client_id = c.id
        WHERE cn.coach_id = ?
        ORDER BY cn.created_at DESC
        LIMIT ?
      )
      ORDER BY created_at DESC
      LIMIT ?
    `, [coachId, limit, coachId, limit, coachId, limit, limit]);

    res.json({ activities });

  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

module.exports = router;
