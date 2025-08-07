#!/bin/bash

# Build and Deploy Script for Render
echo "🚀 Starting production build..."

# Set environment
export NODE_ENV=production

# Build backend
echo "📦 Building backend..."
cd backend
npm ci --only=production
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Backend build completed"

# Build frontend  
echo "📦 Building frontend..."
cd ../frontend
npm ci
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build completed"
echo "🎉 Production build successful!"

# Optional: Run tests
# npm test

echo "📋 Build Summary:"
echo "- Backend: dist/ directory created"
echo "- Frontend: dist/ directory created"
echo "- Ready for deployment to Render"
