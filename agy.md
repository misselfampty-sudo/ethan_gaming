# Project Arcade: Local 2D Retro Games

## System Reference & Setup
* **Lenovo Home Server SSH Updates:** Direct updates allowed only when strictly necessary, must not affect other server projects.
* **Deployment Workflow:** Git commits -> CI/CD pipelines. (Currently working 100% locally with Git until remote link is established).

## Guidelines
* **Target Audience:** 10-year-old child developer learning to code. Keep explanations encouraging, straightforward, and educational.
* **Environment Constraints:** 100% ad-free, tracker-free, and playable offline.
* **Architecture:** Lightweight, single-file HTML5/CSS/JavaScript. Zero external assets (draw graphics programmatically using HTML Canvas/CSS).
* **Target Hosting:** Local Nginx in Docker sandbox (bound to `0.0.0.0`).

---

## Shared Features
- [x] **Interactive Games Dashboard**: A home screen portal with selection cards for multiple games (Space Invaders, Snake, Tetris).
- [x] **State Management**: Switching between screens dynamically without page reloads, and stopping/starting game loops.

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

### Step 1: Workspace Initialization
- [x] Initialized workspace rules via `AGENTS.md`.
- [x] Generated foundational `index.html` structure with HTML5 canvas and basic player movement.
- [x] Built the Games Dashboard wrapper and screen-toggling logic.

### Step 2: Game Logic Development
- [ ] (Next Step) Implement player laser shooting mechanics (Spacebar) and render the top grid of static alien shapes.
- [ ] Implement collision detection and basic win/loss state.
- [ ] Implement local score tracking and localStorage saving.


