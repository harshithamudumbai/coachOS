#!/bin/bash
# ============================================================
# Dr.Query — Dependency Security Audit Script
# Run this before every deploy and at least once per sprint.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo " Dr.Query Security Audit"
echo " $(date)"
echo "============================================"
echo ""

FAILED=0

# Backend audit
echo "--- Backend Dependencies ---"
cd "$PROJECT_ROOT/backend"
if npm audit --omit=dev 2>&1; then
  echo "✅ Backend: No vulnerabilities found"
else
  echo "⚠️  Backend: Vulnerabilities detected (see above)"
  FAILED=1
fi
echo ""

# Frontend audit
echo "--- Frontend Dependencies ---"
cd "$PROJECT_ROOT/frontend"
if npm audit --omit=dev 2>&1; then
  echo "✅ Frontend: No vulnerabilities found"
else
  echo "⚠️  Frontend: Vulnerabilities detected (see above)"
  FAILED=1
fi
echo ""

# Check for outdated packages
echo "--- Outdated Packages (Backend) ---"
cd "$PROJECT_ROOT/backend"
npm outdated || true
echo ""

echo "--- Outdated Packages (Frontend) ---"
cd "$PROJECT_ROOT/frontend"
npm outdated || true
echo ""

echo "============================================"
if [ $FAILED -eq 0 ]; then
  echo "✅ All audits passed"
else
  echo "⚠️  Some audits had findings — review above"
fi
echo "============================================"

exit $FAILED
