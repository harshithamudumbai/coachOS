// ============================================
// routes/auth.js — Signup & Login Routes
// ============================================
// 📚 LEARNING NOTES:
//
// What is bcrypt?
// → A library that HASHES passwords (one-way encryption)
// → "test123" → "$2b$10$abcdef..." (can't reverse this!)
// → Even if a hacker steals your database, they can't read passwords
// → bcrypt.hash(password, 10) → the "10" is salt rounds (more = slower but safer)
//
// What is express.Router()?
// → Lets you organize routes into separate files
// → Instead of putting everything in server.js, you split by feature
// → server.js just says: app.use('/api/auth', authRoutes)
//
// Signup flow:
//   1. Receive email + password from frontend
//   2. Check if email already exists in DB
//   3. Hash the password with bcrypt
//   4. Save to database
//   5. Create JWT token
//   6. Send token back to frontend
//
// Login flow:
//   1. Receive email + password
//   2. Find coach by email in DB
//   3. Compare password with stored hash using bcrypt.compare()
//   4. If match → create JWT → send to frontend
//   5. If no match → return error
// ============================================

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Token expiry time
const TOKEN_EXPIRY = '7d'; // Token valid for 7 days

// Helper: Create JWT token
const createToken = (coach) => {
  return jwt.sign(
    { id: coach.id, email: coach.email, full_name: coach.full_name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

// ============================================
// POST /api/auth/signup — Create new coach account
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password, business_name, specialization } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ 
        error: 'full_name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM coaches WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password (10 salt rounds)
    // 📚 Salt = random string added to password before hashing
    //    This means two users with same password get DIFFERENT hashes
    const salt_rounds = 10;
    const password_hash = await bcrypt.hash(password, salt_rounds);

    // Generate subdomain from business name or full name
    const subdomain = (business_name || full_name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 30);

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO coaches (full_name, email, password_hash, business_name, specialization, subdomain) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, business_name || null, specialization || null, subdomain]
    );

    // Create JWT token
    const token = createToken({ 
      id: result.insertId, 
      email, 
      full_name 
    });

    // Send response (never send password_hash back!)
    res.status(201).json({
      message: 'Account created successfully! 🎉',
      token,
      coach: {
        id: result.insertId,
        full_name,
        email,
        business_name,
        subdomain
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ============================================
// POST /api/auth/login — Login and get token
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find coach by email
    const [coaches] = await db.query('SELECT * FROM coaches WHERE email = ?', [email]);
    
    if (coaches.length === 0) {
      // 📚 Security: Don't say "email not found" — that tells hackers which emails exist
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const coach = coaches[0];

    // Compare password with stored hash
    // bcrypt.compare handles the salt automatically
    const isPasswordValid = await bcrypt.compare(password, coach.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = createToken(coach);

    // Send response (exclude password_hash!)
    res.json({
      message: 'Login successful! 🟢',
      token,
      coach: {
        id: coach.id,
        full_name: coach.full_name,
        email: coach.email,
        business_name: coach.business_name,
        subdomain: coach.subdomain,
        specialization: coach.specialization,
        phone: coach.phone,
        bio: coach.bio,
        logo_url: coach.logo_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ============================================
// GET /api/auth/me — Get current coach's profile
// ============================================
// 📚 This route uses the authenticate middleware
//    Only logged-in coaches can access it
router.get('/me', authenticate, async (req, res) => {
  try {
    const [coaches] = await db.query(
      `SELECT id, full_name, email, business_name, subdomain, logo_url, 
              phone, specialization, bio, created_at 
       FROM coaches WHERE id = ?`,
      [req.coach.id]
    );

    if (coaches.length === 0) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    // Also get client count for this coach
    const [clientCount] = await db.query(
      'SELECT COUNT(*) as total_clients FROM clients WHERE coach_id = ?',
      [req.coach.id]
    );

    res.json({
      ...coaches[0],
      total_clients: clientCount[0].total_clients
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================
// PUT /api/auth/profile — Update coach profile
// ============================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, business_name, phone, specialization, bio } = req.body;

    await db.query(
      `UPDATE coaches SET 
        full_name = COALESCE(?, full_name),
        business_name = COALESCE(?, business_name),
        phone = COALESCE(?, phone),
        specialization = COALESCE(?, specialization),
        bio = COALESCE(?, bio)
       WHERE id = ?`,
      [full_name, business_name, phone, specialization, bio, req.coach.id]
    );

    res.json({ message: 'Profile updated successfully! ✅' });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
