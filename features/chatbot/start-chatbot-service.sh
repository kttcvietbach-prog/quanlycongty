#!/bin/bash

# =========================================
# VIETBACHCORP ERP - Chatbot Service Launcher
# =========================================

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🤖 VIETBACHCORP ERP - Chatbot Service Launcher    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found:"
node --version
echo ""

# Check if we're in the correct directory
if [ ! -f "chatbot-service.js" ]; then
    echo "❌ ERROR: chatbot-service.js not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Chatbot service file found"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found"
    echo "Copy .env.example to .env and configure it"
    echo "Example config:"
    echo "  CHATBOT_PORT=3001"
    echo "  ANTHROPIC_API_KEY=sk-ant-..."
    echo ""
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting Chatbot Service..."
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Service will start on http://localhost:3001       ║"
echo "║  Press Ctrl+C to stop the service                   ║"
echo "║  Check browser console for client connection        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Start the service
node chatbot-service.js

# If service exits with error
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Service failed to start"
    echo "Check the error messages above"
    exit 1
fi
