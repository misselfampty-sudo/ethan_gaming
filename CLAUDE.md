# Project Arcade — Claude Code Documentation

This is Ethan's retro games project built with single-file HTML5/Canvas. 100% offline-capable, ad-free, tracker-free, and deployed live on a home Lenovo server.

## Quick Start

**Local Dev:** `! npm install -g http-server && http-server -p 8080` (or use Docker)

**Deploy:** Just `git push origin main` — GitHub Actions auto-deploys to http://192.168.68.150:8082

**Edit:** Only `index.html` exists — all CSS and JS in one file. No build step, no dependencies.

---

## System Setup

### Home Server (Lenovo at 192.168.68.150)
- **Docker Container:** Nginx on port 8082, serves `/home/arcade/app/index.html`
- **GitHub Actions:** Self-hosted runner (user: `arcade`) auto-deploys on every push to main
- **Deployment:** Workflow copies `index.html` → `/home/arcade/app/index.html`

### Local Dev
- Single HTTP server on port 8080 (accessed at `http://localhost:8080` or `http://192.168.68.104:8080` over network)
- No build step. Edit `index.html` and refresh the browser.

---

## Project Rules

- **Single file only:** `index.html` contains all HTML, CSS, and JavaScript
- **No external dependencies:** Zero npm packages, no frameworks, no CDNs
- **No external assets:** All graphics drawn programmatically via Canvas
- **100% offline:** Game runs without any network connection (except localStorage for scores)
- **No ads or trackers**
- **Educational comments:** Keep code comments clear for a 10-year-old learning to code

---

## Architecture

### Frontend (Single-file HTML5)
- **Profiles:** Multi-user support stored locally + synced to server
- **Leaderboard:** Global high scores sorted by score (server-authoritative)
- **Games:** Dynamic state machine switches between dashboard, games, and pause screens without page reloads
- **Offline Support:** Plays offline, syncs when reconnected

### Canvas Loop
- Single `requestAnimationFrame` loop handles all rendering and game logic
- Collision detection, entity updates, and drawing all in one tick
- No external physics engine — simple math

### Backend (Node.js + PostgreSQL)
**Purpose:** Persistent profile and score storage with conflict resolution

**Schema:**
- `profiles` table: player names, creation timestamps, version numbers
- `high_scores` table: per-player scores with timestamps (last-write-wins)
- `sync_log` table: audit trail of all syncs and conflicts

**Sync Strategy (Last-Write-Wins):**
```
Client submits: { score: 1250, timestamp: 1687234567890 }
Server checks:  if clientTimestamp > serverTimestamp → accept client score
Server stores:  Both client and server timestamps for next sync
Conflict example:
  - Device A: score 1000 at 2pm
  - Device B: score 500 at 3pm (syncs first)
  - Device A syncs: 2pm < 3pm → keeps server's 500
  - But 1000 > 500, so next Device A sync updates it to 1000
  - Final: server has 1000 (newest data wins)
```

### Offline-First Sync
1. **Play offline:** Game saves to localStorage with timestamp
2. **Come online:** Browser detects `online` event
3. **Auto-sync:** `arcadeSync.syncNow()` sends queued updates to server
4. **Merge:** Server returns authoritative state, client updates if newer
5. **Queue cleared:** Offline queue erased after successful sync

### Data Flow
```
Player plays → saves score locally (localStorage)
     ↓
arcadeSync.updateScore(name, game, score, timestamp)
     ↓
Auto-sync every 30s (if online) or on reconnect
     ↓
Server receives POST /api/sync {profiles, timestamp}
     ↓
Server compares timestamps, applies last-write-wins
     ↓
Server returns current authoritative scores
     ↓
Client merges: newer scores replace older ones locally
     ↓
Offline queue cleared, ready for next offline session
```

---

## Games Implemented

### Game 1: Space Invaders
- **Controls:** Arrow keys to move, Spacebar to shoot
- **Mechanics:** Player ship, alien grid, laser collisions, scoring
- **Save:** High score per player stored in localStorage
- **Status:** ✅ Complete (profiles & leaderboard added)

### Game 2: Snake
- **Status:** 🚧 Planned

### Game 3: Tetris
- **Status:** 🚧 Planned

---

## How to Add a New Game

1. **Add game canvas state** in the main game loop
2. **Add game card** to the dashboard menu
3. **Implement game logic** (update, render, collision, scoring)
4. **Hook into state machine** so `gameState === "snake"` runs snake logic
5. **Save high scores** to localStorage per profile
6. **Test locally**, then `git push` to deploy

---

## Using Claude Code

### Verify Changes
Use `/verify` to start the dev server and test your changes in a browser before pushing.

```bash
/verify
```

Then open http://localhost:8080 in your browser and test the game.

### Code Review
Before pushing, get feedback on your code:

```bash
/code-review
```

### Commit & Push
When ready to deploy:

```bash
git add index.html
git commit -m "feat: add new game feature"
git push origin main
```

The GitHub Actions workflow will automatically deploy to the home server.

---

## Backend Deployment (Server-Side Sync)

**Status:** Ready to deploy to home server

**Architecture:**
```
Client (index.html + arcade-sync.js)
    ↓ /api/* requests
Nginx (port 8082) — proxies /api/ to backend
    ↓
Node.js API (port 3000, internal only)
    ↓
PostgreSQL (local database)
```

**Deploy on Home Server (192.168.68.150):**

See `server/README.md` for full setup instructions. TL;DR:

```bash
# SSH into arcade@192.168.68.150
ssh arcade@192.168.68.150
cd /home/arcade/app

# Option A: Docker Compose (easiest)
docker-compose -f docker-compose.prod.yml up -d

# Option B: Manual (requires Node.js + PostgreSQL)
cd server && npm install && npm run migrate
npm start

# Then update Nginx config to proxy /api/ → http://localhost:3000
sudo systemctl reload nginx
```

**Verify it's working:**
```bash
curl http://192.168.68.150:8082/api/health
# Should return: {"status":"ok","timestamp":...}
```

## Docker (Optional Local Testing)

Run the full stack locally (frontend + backend):

```bash
docker-compose -f docker-compose.prod.yml up
```

Then visit http://localhost:8082 (Nginx + API + PostgreSQL all in containers).

---

## Tips for Teaching Ethan

- **Keep comments short and friendly** — "// Create a 2D grid of aliens" not "// Instantiate alien entity matrix"
- **Comment the WHY, not the WHAT** — Code should be clear enough to read; comments explain non-obvious decisions
- **Show, don't tell** — Run `/verify` to see changes live in the browser
- **Celebrate wins** — Each new feature is a big deal! Test it immediately with `/verify`

---

## Progress Log

### Session 1 (2026-06-25) — Workspace Setup & Dashboard
- Initialized local Git repository
- Designed retro arcade dashboard with game selection cards
- Implemented player delta-wing ship with keyboard controls
- Set up Canvas game loop

### Session 2 (2026-06-25) — Space Invaders & Profiles
- Player laser shooting with cooldown
- Alien grid rendering (Crabs, Octopuses, Squids)
- Collision detection (lasers, aliens, player)
- Neon particle explosions
- Multi-user profiles and global leaderboard
- localStorage save system

### Session 3 (2026-06-26) — CI/CD & Deployment
- Created GitHub Actions workflow for auto-deployment
- Deployed to home server at http://192.168.68.150:8082
- Live updates on every `git push`

---

## Commands Reference

| Task | Command |
|------|---------|
| Run game locally | `! npm install -g http-server && http-server -p 8080` |
| Verify changes | `/verify` |
| Code review | `/code-review` |
| Deploy | `git push origin main` |
| View logs | `git log --oneline -10` |

---

**Questions?** This is Ethan's learning project. Keep it fun! 🎮
