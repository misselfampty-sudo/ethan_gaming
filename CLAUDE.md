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

### Game State
- **Profiles:** Multi-user support via `localStorage` (player names, personal bests)
- **Leaderboard:** Global high scores sorted by score, persisted in localStorage
- **Games:** Dynamic state machine switches between dashboard, games, and pause screens without page reloads

### Canvas Loop
- Single `requestAnimationFrame` loop handles all rendering and game logic
- Collision detection, entity updates, and drawing all in one tick
- No external physics engine — simple math

### localStorage Structure
```javascript
// Player profile
{ name: "Ethan", bestScore: 1250, timestamp: "2026-06-25T..." }

// Game state
{ gameState: "dashboard", activePlayer: "Ethan", profiles: [...] }
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

## Docker (Optional Local Testing)

Run the Nginx container locally:

```bash
docker-compose up
```

Then visit http://localhost:8080 (the docker-compose.yml maps port 8080).

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
