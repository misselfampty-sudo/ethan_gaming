# Project Arcade: Local 2D Retro Games

## System Reference & Setup
* **Lenovo Home Server SSH Updates:** Direct updates allowed only when strictly necessary, must not affect other server projects.
* **Deployment Workflow:** Git commits -> CI/CD pipelines. Never deploy directly to production outside of CI/CD.

## Guidelines
* **Target Audience:** 10-year-old child developer learning to code. Keep explanations encouraging, straightforward, and educational.
* **Environment Constraints:** 100% ad-free, tracker-free, and playable offline.
* **Architecture:** Lightweight, single-file HTML5/CSS/JavaScript. Zero external assets (draw graphics programmatically using HTML Canvas/CSS).
* **Target Hosting:** Local Nginx in Docker sandbox (bound to `0.0.0.0`).

---

## Game 1: Space Invaders Mini

### Feature Specs
- [ ] Single-file HTML5/JS (`index.html`).
- [ ] Player ship at the bottom controlled by Left/Right Arrow keys.
- [ ] Shooting lasers upward using the Spacebar.
- [ ] A top grid of static 2D alien shapes.
- [ ] Collision detection (laser hitting alien destroys it, alien laser hitting player ends game).
- [ ] Score tracking displayed at the top corner.

### Local Save System
- [ ] Save high scores locally on the device using browser `localStorage`.
- [ ] Structure the save file payload with a robust `timestamp` and a `level_progress` key for future home-server sync compatibility.

---

## Progress Log

### Current State
* Workspace initialized with `agy.md` and `.agents/AGENTS.md` rules.
* **Next Step:** Generate foundational `index.html` structure with an HTML5 canvas and basic player movement loop.
