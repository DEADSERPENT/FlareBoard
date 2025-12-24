#!/bin/bash

# FlareBoard CI Verification Script
# Run this before pushing to verify all CI checks will pass

echo "🔍 FlareBoard CI Verification"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run a command and track status
run_check() {
  local name=$1
  local command=$2

  echo -e "${YELLOW}▶ Running: $name${NC}"
  if eval "$command"; then
    echo -e "${GREEN}✓ $name passed${NC}"
    echo ""
  else
    echo -e "${RED}✗ $name failed${NC}"
    echo ""
    FAILED=1
  fi
}

# Run all CI checks
run_check "Lint" "npm run lint"
run_check "Format Check" "npm run format -- --check"
run_check "Type Check" "npm run type-check"
run_check "Tests" "npm run test:run"

# Final result
echo "=============================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All CI checks passed!${NC}"
  echo "You're ready to push your changes."
  exit 0
else
  echo -e "${RED}✗ Some CI checks failed${NC}"
  echo "Please fix the issues before pushing."
  exit 1
fi
