@echo off
echo ========================================
echo    Alumni Platform - Setup Script
echo ========================================
echo.
echo This script will install all required dependencies
echo and prepare the Alumni Platform for use.
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installing Node.js, run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
echo This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Dependencies installed successfully!
echo.
echo To start the Alumni Platform:
echo 1. Make sure MongoDB is running
echo 2. Double-click 'start-alumni-platform.bat'
echo 3. Open http://localhost:5000 in your browser
echo.
echo Demo Accounts:
echo - Alumni: alumni@example.com / password123
echo - Admin: admin@example.com / admin123
echo.
pause
