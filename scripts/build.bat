@echo off
REM Build and Deploy Script for Render (Windows)
echo 🚀 Starting production build...

REM Set environment
set NODE_ENV=production

REM Build backend
echo 📦 Building backend...
cd backend
call npm ci --only=production
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    exit /b 1
)

echo ✅ Backend build completed

REM Build frontend  
echo 📦 Building frontend...
cd ..\frontend
call npm ci
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend build completed
echo 🎉 Production build successful!

echo 📋 Build Summary:
echo - Backend: dist/ directory created
echo - Frontend: dist/ directory created
echo - Ready for deployment to Render
