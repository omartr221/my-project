#!/bin/bash
set -e

echo "🚀 Building V POWER TUNING for Render..."

# Install all dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🏗️ Building frontend..."
NODE_ENV=production npm run build

# Copy necessary files
echo "📋 Copying server files..."
mkdir -p dist
cp -r server dist/
cp -r shared dist/
cp package-render.json dist/package.json
cp render-start.js dist/

echo "✅ Build completed successfully!"