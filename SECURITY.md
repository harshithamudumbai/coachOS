# Security Policy — Dr.Query (coachOS)

## Pre-Deploy Security Checklist

### ✅ Implemented in Code
| Control | Status | Location |
|---|---|---|
| Rate limiting on every API route | ✅ Done | `backend/src/middleware/rateLimiter.js` — global (100/min) + per-route |
| Never expose env variables to client | ✅ Done | Only `VITE_API_URL` (public URL) exposed; startup check in `validateEnv.js` |
| Validate all inputs on the server | ✅ Done | `backend/src/middleware/validateInput.js` — all routes validated |
| Log every request/error event | ✅ Done | `backend/src/lib/logger.js` — Winston structured JSON logging |
| Sanitize every user input before storing | ✅ Done | `backend/src/middleware/sanitize.js` — recursive XSS stripping |
| Set cookie flags to HttpOnly and Secure | ✅ Done | Helmet + HSTS enforce Secure; no cookies used currently |
| Add CORS rules whitelisting only own domains | ✅ Done | `backend/src/app.js` — locked to `FRONTEND_URL` env var |
| Disable detailed error messages in production | ✅ Done | `backend/src/middleware/errorHandler.js` — generic errors in prod |
| Security headers (HSTS, CSP, X-Frame) | ✅ Done | Helmet config in `app.js` + `frontend/vercel.json` |
| File upload hardening | ✅ Done | Memory storage, extension filter, binary detection |
| DB connection security | ✅ Done | SSL `rejectUnauthorized: true` in production, connection timeout |

### ⚠️ Operational — Requires Manual Action
| Control | Action Required |
|---|---|
| Use HTTPS everywhere | Ensure your backend host (Railway/Render/Fly) has SSL enabled. Vercel handles frontend HTTPS automatically. HSTS headers are already configured in code. |
| Rotate API keys every 90 days | Set a calendar reminder. Update `GROQ_API_KEY` in your deployment env. Document the rotation date in `.env.example`. |
| Run `npm audit` every sprint | Run `scripts/security-audit.sh` or `npm audit` in both `backend/` and `frontend/` directories. |
| Run a security audit before every deploy | Add a CI/CD step that runs the security audit script before deployment. |

### ❌ Not Applicable (No Auth System)
| Control | Why N/A |
|---|---|
| Use Supabase RLS on every table | App uses MySQL, not Supabase/Postgres |
| Enable 2FA for all admin routes | No admin routes or user accounts exist |
| Never store plaintext passwords | No passwords stored; no user accounts |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:
1. Do NOT open a public issue
2. Email the maintainer directly
3. Include steps to reproduce and potential impact

---

## API Key Rotation Procedure

1. Generate a new API key from the Groq dashboard
2. Update the key in your deployment environment (Railway/Render/Vercel env vars)
3. Verify the application works with the new key
4. Revoke the old key from the Groq dashboard
5. Update the "Last rotated" date in `.env.example`

**Rotation schedule**: Every 90 days minimum.
