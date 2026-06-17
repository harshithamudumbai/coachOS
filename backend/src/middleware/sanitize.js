/**
 * Recursive input sanitizer middleware.
 * Strips HTML tags and potential XSS vectors from all string values
 * in req.body, req.query, and req.params.
 *
 * Applied globally after body parsing and before route handlers.
 */

function stripTags(str) {
  if (typeof str !== 'string') return str;
  // Remove HTML tags
  let clean = str.replace(/<[^>]*>/g, '');
  // Remove javascript: and data: protocol handlers
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/data\s*:[^,]*,/gi, '');
  // Remove on* event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\bon\w+\s*=/gi, '');
  return clean;
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return stripTags(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = { sanitizeInput, stripTags };
