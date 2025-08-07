@echo off
REM Production Readiness Test Script for Windows
echo 🧪 Testing Slack Connect Production Readiness...

set TESTS_PASSED=0
set TESTS_FAILED=0

echo 🔍 Running pre-deployment tests...

REM Test 1: Check Node.js version
echo Testing Node.js version...
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Node.js not found
    set /a TESTS_FAILED+=1
)

REM Test 2: Check npm version
echo Testing npm version...
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm is installed
    set /a TESTS_PASSED+=1
) else (
    echo ❌ npm not found
    set /a TESTS_FAILED+=1
)

REM Test 3: Backend dependencies
echo Testing backend dependencies...
cd backend
npm list --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend dependencies OK
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Backend dependencies issues
    set /a TESTS_FAILED+=1
)
cd ..

REM Test 4: Frontend dependencies
echo Testing frontend dependencies...
cd frontend
npm list --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend dependencies OK
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Frontend dependencies issues
    set /a TESTS_FAILED+=1
)
cd ..

REM Test 5: Backend build
echo Testing backend build...
cd backend
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend builds successfully
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Backend build failed
    set /a TESTS_FAILED+=1
)
cd ..

REM Test 6: Frontend build
echo Testing frontend build...
cd frontend
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend builds successfully
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Frontend build failed
    set /a TESTS_FAILED+=1
)
cd ..

REM Test 7: Check files
echo Testing configuration files...
if exist "render.yaml" (
    echo ✅ Render config exists
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Render config missing
    set /a TESTS_FAILED+=1
)

if exist "README.md" (
    echo ✅ README exists
    set /a TESTS_PASSED+=1
) else (
    echo ❌ README missing
    set /a TESTS_FAILED+=1
)

if exist "DEPLOYMENT.md" (
    echo ✅ Deployment guide exists
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Deployment guide missing
    set /a TESTS_FAILED+=1
)

echo.
echo 📊 Test Results:
echo ✅ Passed: %TESTS_PASSED%
echo ❌ Failed: %TESTS_FAILED%

if %TESTS_FAILED% equ 0 (
    echo.
    echo 🎉 All tests passed! Your application is ready for production deployment.
    echo.
    echo Next steps:
    echo 1. Commit and push your changes to GitHub
    echo 2. Follow the DEPLOYMENT.md guide
    echo 3. Deploy to Render
) else (
    echo.
    echo ❌ Some tests failed. Please fix the issues before deploying.
    echo.
    echo Common fixes:
    echo - Run 'npm install' in backend and frontend directories
    echo - Check Node.js and npm versions
    echo - Verify all environment files exist
)

pause
