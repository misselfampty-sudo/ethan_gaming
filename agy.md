# Project Arcade: Local 2D Retro Games

## System Reference & Setup
* **Lenovo Home Server SSH Updates:** Direct updates allowed only when strictly necessary, must not affect other server projects.
* **Deployment Workflow:** Git commits -> CI/CD pipelines. (Currently working 100% locally with Git until remote link is established).
* **Local Dev Server:** Active in background on port `8080` (bound to `0.0.0.0`).
  * Local link: http://localhost:8080
  * Network link: http://192.168.68.104:8080

## Guidelines
* **Target Audience:** 10-year-old child developer learning to code. Keep explanations encouraging, straightforward, and educational.
* **Environment Constraints:** 100% ad-free, tracker-free, and playable offline.
* **Architecture:** Lightweight, single-file HTML5/CSS/JavaScript. Zero external assets (draw graphics programmatically using HTML Canvas/CSS).
* **Target Hosting:** Local Nginx in Docker sandbox.

---

## Shared Features
- [x] **Interactive Games Dashboard**: A home screen portal with selection cards for multiple games (Space Invaders, Snake, Tetris).
- [x] **State Management**: Switching between screens dynamically without page reloads, and stopping/starting game loops.

---

## Game 1: Space Invaders Mini

### Feature Specs
- [x] Single-file HTML5/JS (`index.html`).
- [x] Player ship at the bottom controlled by Left/Right Arrow keys.
- [ ] Shooting lasers upward using the Spacebar.
- [ ] A top grid of static 2D alien shapes.
- [ ] Collision detection (laser hitting alien destroys it, alien laser hitting player ends game).
- [ ] Score tracking displayed at the top corner.

### Local Save System
- [ ] Save high scores locally on the device using browser `localStorage`.
- [ ] Structure the save file payload with a robust `timestamp` and a `level_progress` key for future home-server sync compatibility.

---

## Progress Log

### Session 1 (2026-06-25) - Workspace Setup & Dashboard
* **Accomplishments:**
  * Initialized workspace rules in `.agents/AGENTS.md`.
  * Created the session tracker `agy.md`.
  * Initialized local Git repository.
  * Designed the retro arcade dashboard in `index.html` with card selection and state-toggling.
  * Added the delta-wing player ship with keyboard controls and canvas game loop.
  * Launched background python development server (port 8080).
* **Next Session Goal:** Implement player laser shooting and render the alien grid.
