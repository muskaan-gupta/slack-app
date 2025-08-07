#!/bin/bash
# Render Build Hook for Frontend

echo "🚀 Starting Slack Connect Frontend Build..."

# Set Node environment
export NODE_ENV=production

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build application
echo "🔨 Building frontend..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend build completed successfully"
echo "📁 Build output: $(ls -la dist/)"

# Clean up
echo "🧹 Cleaning up..."
rm -rf node_modules/.cache

echo "🎉 Frontend ready for deployment!"
