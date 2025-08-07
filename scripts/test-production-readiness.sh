#!/bin/bash

# Production Readiness Test Script
echo "🧪 Testing Slack Connect Production Readiness..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "🔍 Running pre-deployment tests..."

# Test 1: Check Node.js version
run_test "Node.js version (>=18)" "node -v | grep -E 'v1[8-9]|v[2-9][0-9]'"

# Test 2: Check npm version  
run_test "npm version (>=8)" "npm -v | grep -E '^[8-9]|^[1-9][0-9]'"

# Test 3: Backend dependencies
run_test "Backend dependencies" "cd backend && npm list --depth=0"

# Test 4: Frontend dependencies
run_test "Frontend dependencies" "cd frontend && npm list --depth=0"

# Test 5: TypeScript compilation (backend)
run_test "Backend TypeScript build" "cd backend && npm run build"

# Test 6: Frontend build
run_test "Frontend build" "cd frontend && npm run build"

# Test 7: Check environment files
run_test "Backend .env.example exists" "[ -f backend/.env.example ]"
run_test "Frontend .env.example exists" "[ -f frontend/.env.example ]"

# Test 8: Check production config files
run_test "Render config exists" "[ -f render.yaml ]"
run_test "Docker config exists" "[ -f docker-compose.yml ]"

# Test 9: Check documentation
run_test "README.md exists" "[ -f README.md ]"
run_test "DEPLOYMENT.md exists" "[ -f DEPLOYMENT.md ]"

# Test 10: Verify build outputs
run_test "Backend dist folder exists" "[ -d backend/dist ]"
run_test "Frontend dist folder exists" "[ -d frontend/dist ]"

# Test 11: Check package.json scripts
run_test "Backend has start script" "cd backend && npm run start --dry-run"
run_test "Frontend has build script" "cd frontend && npm run build --dry-run"

# Test 12: Security dependencies
run_test "Helmet security package" "cd backend && npm list helmet"
run_test "Rate limiting package" "cd backend && npm list express-rate-limit"

echo ""
echo "📊 Test Results:"
echo -e "✅ Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your application is ready for production deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes to GitHub"
    echo "2. Follow the DEPLOYMENT.md guide"
    echo "3. Deploy to Render"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deploying.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Run 'npm install' in backend and frontend directories"
    echo "- Check Node.js and npm versions"
    echo "- Verify all environment files exist"
    exit 1
fi
