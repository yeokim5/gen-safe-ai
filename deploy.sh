#!/bin/bash

# Gen-SAFE Deployment Helper Script
# This script helps prepare your project for deployment

echo "🚀 Gen-SAFE Deployment Helper"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the Gen-SAFE project root directory"
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🔧 Building frontend for production..."
cd frontend
npm run build
cd ..

echo "✅ Project prepared for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway using the provided railway.json configuration"
echo "2. Deploy frontend to Vercel using the provided vercel.json configuration"
echo "3. Configure environment variables as described in DEPLOYMENT.md"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
