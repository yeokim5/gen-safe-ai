@echo off
REM Gen-SAFE Deployment Helper Script for Windows
REM This script helps prepare your project for deployment

echo 🚀 Gen-SAFE Deployment Helper
echo ==============================

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Error: Please run this script from the Gen-SAFE project root directory
    pause
    exit /b 1
)

if not exist frontend (
    echo ❌ Error: Frontend directory not found
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo 🔧 Building frontend for production...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo ✅ Project prepared for deployment!
echo.
echo Next steps:
echo 1. Deploy backend to Railway using the provided railway.json configuration
echo 2. Deploy frontend to Vercel using the provided vercel.json configuration
echo 3. Configure environment variables as described in DEPLOYMENT.md
echo.
echo 📖 Read DEPLOYMENT.md for detailed instructions
pause
