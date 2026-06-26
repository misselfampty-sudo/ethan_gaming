#!/bin/bash
# One-command deployment for Project Arcade backend

set -e

echo "🚀 Deploying Project Arcade Backend"
echo "===================================="
echo ""

# Check if running as arcade user
if [ "$(whoami)" != "arcade" ]; then
  echo "❌ Must run as arcade user"
  echo "   ssh arcade@192.168.68.150"
  exit 1
fi

cd /home/arcade/app

# 1. Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Copy server files
echo "📋 Setting up server files..."
cp -r server /home/arcade/app/
cp docker-compose.prod.yml /home/arcade/app/
cp nginx.prod.conf /home/arcade/app/

# 3. Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.prod.yml down || true

# 4. Start new containers
echo "🚀 Starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Wait for services
echo "⏳ Waiting for services to start..."
sleep 5

# 6. Check API health
echo "🔍 Checking API health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ API is running"
else
  echo "❌ API failed to start"
  docker-compose -f docker-compose.prod.yml logs api
  exit 1
fi

# 7. Check database
echo "🔍 Checking database..."
if curl -f http://localhost:3000/api/leaderboard > /dev/null 2>&1; then
  echo "✅ Database is accessible"
else
  echo "❌ Database check failed"
  docker-compose -f docker-compose.prod.yml logs postgres
  exit 1
fi

# 8. Update Nginx config
echo "🔄 Updating Nginx configuration..."
sudo cp nginx.prod.conf /etc/nginx/conf.d/default.conf
sudo systemctl reload nginx

# 9. Verify Nginx
echo "🔍 Verifying Nginx proxy..."
if curl -f http://localhost:8082/api/health > /dev/null 2>&1; then
  echo "✅ Nginx is proxying correctly"
else
  echo "❌ Nginx proxy check failed"
  sudo systemctl status nginx
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎮 Live at: http://192.168.68.150:8082"
echo "📊 API: http://192.168.68.150:8082/api/health"
echo "🏆 Leaderboard: http://192.168.68.150:8082/api/leaderboard"
echo ""
echo "📋 Check logs:"
echo "   docker-compose logs -f"
echo "   docker-compose logs -f api"
echo "   docker-compose logs -f postgres"
