// ============================================
// middleware/auth.js — JWT Authentication Middleware
// ============================================
// 📚 LEARNING NOTES:
//
// What is MIDDLEWARE?
// → A function that runs BETWEEN the request arriving and your route handler.
// → Think of it as a security guard at a club entrance.
//    Request → [Middleware: Check JWT] → Route Handler → Response
//
// What is JWT (JSON Web Token)?
// → A signed token that proves "this user is logged in"
// → It contains: { id: 5, email: "coach@example.com" }
// → It's signed with a SECRET key, so nobody can fake it
// → Flow:
//    1. User logs in → server creates JWT → sends to client
//    2. Client stores JWT in localStorage
//    3. Client sends JWT in every request header
//    4. Server verifies JWT → allows/denies access
//
// Token format in header: "Bearer eyJhbGciOiJIUzI1NiIs..."
// ============================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coachos-dev-secret-change-in-production';

// This middleware function checks if the user is authenticated
const authenticate = (req, res, next) => {
  // Step 1: Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      hint: 'Send token in header: Authorization: Bearer <your-token>'
    });
  }

  // Step 2: Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // Step 3: Verify the token using our secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Step 4: Attach the coach's info to the request object
    // Now every route handler can access req.coach
    req.coach = decoded;
    
    // Step 5: Call next() to proceed to the actual route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({ 
      error: 'Invalid or expired token. Please login again.' 
    });
  }
};

module.exports = { authenticate, JWT_SECRET };
