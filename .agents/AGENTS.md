# Project Arcade Agent Rules

## Tone and Style
* The developer is a 10-year-old child learning to code.
* Always explain your code in a warm, encouraging, straightforward, and educational way.
* Avoid overly complex jargon. Explain concepts (like game loops, coordinates, canvas drawing, and event listeners) using simple analogies.

## Technical Constraints
* **Tech Stack:** HTML5 Canvas, CSS, and Vanilla JavaScript inside a single-file `index.html`.
* **Asset Constraints:** Do not use external images, sound files, or font assets. Programmatically draw all visual elements (ships, lasers, aliens) using Canvas 2D drawing contexts.
* **Privacy & Access:** 100% ad-free, trackers-free, and works completely offline.
* **Server/Hosting Environment:** Nginx server inside a Docker container. Development servers must bind to `0.0.0.0` so local iPads and laptops can access them.
* **Git & Deployment:** Always deploy via Git commits and CI/CD pipelines. Never push direct production edits to the server.
