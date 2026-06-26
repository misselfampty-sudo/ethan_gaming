#!/bin/bash
# Start local HTTP server for development on port 8080
# Usage: source .claude/skills/start-dev-server.sh

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🎮 Starting Arcade dev server..."
echo "📍 Project: $PROJECT_DIR"
echo ""

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "⚠️  http-server not found. Installing globally..."
    npm install -g http-server
fi

echo "🚀 Server starting on:"
echo "   Local:   http://localhost:8080"
echo "   Network: http://192.168.68.104:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$PROJECT_DIR"
http-server -p 8080 -c-1
