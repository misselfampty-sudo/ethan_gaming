#!/bin/bash
# Check if the latest version is deployed to the arcade home server
# Usage: source .claude/skills/check-deploy.sh

SERVER_URL="http://192.168.68.150:8082"
LOCAL_HASH=$(sha256sum index.html | awk '{print $1}')

echo "🎮 Checking deployment status..."
echo "📍 Server: $SERVER_URL"
echo ""

# Try to fetch a marker from the server to verify it's up
if curl -s "$SERVER_URL" > /dev/null 2>&1; then
    echo "✅ Server is reachable"
    echo "📝 Local index.html SHA256: ${LOCAL_HASH:0:16}..."
    echo ""
    echo "If you just pushed, the deployment is running now."
    echo "Check again in 30 seconds if it's not live yet."
else
    echo "❌ Server is not reachable at $SERVER_URL"
    echo "   Check: Is the Lenovo server running?"
    echo "   Check: Is the Nginx container active?"
fi
