# Project Arcade Backend API

Server-side persistence and sync engine for player profiles and high scores.

**Features:**
- ✅ Last-write-wins conflict resolution (newest score always wins)
- ✅ Offline-first: Play offline, sync when back online
- ✅ Timestamp-based sync (no data loss)
- ✅ Audit trail via sync_log table

## Architecture

```
Browser (index.html + arcade-sync.js)
    ↓ /api/* requests (local origin)
Nginx (port 8082)
    ↓ proxy_pass http://localhost:3000
Node.js/Express API (port 3000, internal)
    ↓
PostgreSQL (local database)
```

## Setup on Home Server (Lenovo 192.168.68.150)

### 1. Install Dependencies

```bash
# SSH into arcade user
ssh arcade@192.168.68.150

# Navigate to project
cd /home/arcade/app

# Install Node.js (if not already installed)
# For Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL (if not already installed)
sudo apt-get install -y postgresql postgresql-contrib
```

### 2. Set Up PostgreSQL Database

```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Create arcade database and user
sudo -u postgres psql <<EOF
CREATE USER arcade WITH PASSWORD 'arcade_password';
CREATE DATABASE arcade OWNER arcade;
GRANT ALL PRIVILEGES ON DATABASE arcade TO arcade;
EOF

# Run migrations from Node.js
npm install
npm run migrate
```

### 3. Install Server Dependencies

```bash
cd server
npm install
```

### 4. Update Nginx Configuration

Edit `/etc/nginx/conf.d/default.conf`:

```nginx
upstream arcade_api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name localhost;
    root /home/arcade/app;

    # Static files (index.html, CSS, JS)
    location / {
        try_files $uri /index.html;
        index index.html;
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://arcade_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

### 5. Start the API Server

**Option A: Manual (for testing)**
```bash
cd /home/arcade/app/server
npm start
```

**Option B: Systemd Service (production)**

Create `/etc/systemd/system/arcade-api.service`:

```ini
[Unit]
Description=Project Arcade API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=arcade
WorkingDirectory=/home/arcade/app/server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="NODE_ENV=production"
Environment="DB_USER=arcade"
Environment="DB_HOST=localhost"
Environment="DB_NAME=arcade"
Environment="DB_PASSWORD=arcade_password"
Environment="DB_PORT=5432"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable arcade-api
sudo systemctl start arcade-api
sudo systemctl status arcade-api
```

## API Endpoints

### POST /api/sync
**Bidirectional sync with conflict resolution**

Request:
```json
{
  "profiles": {
    "Ethan": {
      "highScores": {
        "space-invaders": {
          "score": 1250,
          "level": 5,
          "timestamp": 1687234567890
        }
      }
    }
  },
  "timestamp": 1687234567890
}
```

Response:
```json
{
  "success": true,
  "synced_at": 1687234567890,
  "profiles": {
    "Ethan": {
      "space-invaders": {
        "score": 1250,
        "level": 5,
        "timestamp": 1687234567890
      }
    }
  }
}
```

### GET /api/leaderboard
Returns current global leaderboard with all player scores.

### GET /api/health
Health check endpoint.

## Conflict Resolution Logic

**Last-Write-Wins (by timestamp):**

1. Client sends local scores with `timestamp` (client-side milliseconds)
2. Server compares: `if clientTimestamp > serverTimestamp → accept client score`
3. Server stores score with server timestamp for audit trail
4. On next sync, server returns authoritative scores to all clients
5. Client merges: newer timestamps replace older data locally

**Example:**
- Device A plays offline, scores 1000 at 2pm
- Device B plays offline, scores 500 at 3pm
- Device B syncs first: server has score=500
- Device A syncs: client timestamp (2pm) < server timestamp (3pm) → keeps server score (500)
- But Device A's 1000 > 500, so next sync will update it
- Final: server has score=1000 (Device A's score, newer timestamp)

## Debugging

Check sync logs:
```bash
sudo -u postgres psql arcade <<EOF
SELECT * FROM sync_log ORDER BY server_timestamp DESC LIMIT 20;
EOF
```

Check server logs:
```bash
sudo journalctl -u arcade-api -f
```

## Environment Variables

```bash
NODE_ENV=production          # production or development
PORT=3000                    # API server port
DB_USER=arcade               # PostgreSQL user
DB_HOST=localhost            # PostgreSQL host
DB_NAME=arcade               # PostgreSQL database
DB_PASSWORD=arcade_password  # PostgreSQL password
DB_PORT=5432                 # PostgreSQL port
```

## Troubleshooting

**API not responding:**
- Check if Node.js process is running: `ps aux | grep "node server.js"`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check API logs: `sudo journalctl -u arcade-api -f`

**Sync fails:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database connection: `sudo -u postgres psql -U arcade -d arcade -c "SELECT version();"`

**Nginx proxy issues:**
- Test proxy: `curl http://localhost:3000/api/health`
- Check Nginx syntax: `sudo nginx -t`

## Future Improvements

- [ ] User authentication (so different devices sync to same account)
- [ ] Real-time leaderboard updates (WebSocket)
- [ ] Score graphs/analytics
- [ ] Mobile app companion
- [ ] Backup/export player data
