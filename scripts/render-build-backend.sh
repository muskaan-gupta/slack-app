#!/bin/bash
# Render Build Hook for Backend

echo "🚀 Starting Slack Connect Backend Build..."

# Set Node environment
export NODE_ENV=production

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --only=production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Backend build completed successfully"
echo "📁 Build output: $(ls -la dist/)"

# Clean up
echo "🧹 Cleaning up..."
rm -rf node_modules/.cache

echo "🎉 Backend ready for deployment!"
