#!/bin/bash
# Session startup context gatherer for Project Arcade
# Collects git state, deployment status, and project overview

echo "🎮 Project Arcade Session Start"
echo "================================"
echo ""

# Git branch and status
echo "📍 Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "🔗 Remote: $(git remote get-url origin 2>/dev/null || echo 'none')"
echo ""

# Recent commits
echo "📝 Recent Commits:"
git log --oneline -3 | sed 's/^/   /'
echo ""

# Uncommitted changes
CHANGES=$(git status --short)
if [ -z "$CHANGES" ]; then
  echo "✅ Working tree clean"
else
  echo "⚠️  Uncommitted changes:"
  echo "$CHANGES" | sed 's/^/   /'
fi
echo ""

# Deployment status
if ping -c 1 192.168.68.150 &> /dev/null; then
  echo "✅ Home server reachable (192.168.68.150)"
  echo "   Live game: http://192.168.68.150:8082"
else
  echo "⚠️  Home server not reachable"
fi
echo ""

# Project summary
echo "📊 Project Summary:"
echo "   Games: Space Invaders (✅ done) | Snake (🚧 planned) | Tetris (🚧 planned)"
echo "   Architecture: Single-file HTML5/Canvas, no dependencies"
echo "   Deploy: Auto-deploy on git push → GitHub Actions → home server"
echo ""

echo "Ready to code! 🚀"
