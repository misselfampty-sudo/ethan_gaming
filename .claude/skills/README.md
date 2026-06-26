# Project Arcade Skills

Reusable scripts and utilities for managing the arcade games project.

## Scripts

### `start-dev-server.sh`
Start a local HTTP server on port 8080 for development.

```bash
source .claude/skills/start-dev-server.sh
```

### `check-deploy.sh`
Verify the latest version is deployed to the home server.

```bash
source .claude/skills/check-deploy.sh
```

### `export-scores.js`
Extract and display player scores from localStorage (run in browser console).

## Adding New Skills

1. Create a new file in this directory
2. Add documentation at the top
3. Update this README with usage instructions
4. Test thoroughly before committing

## Notes

- All skills should be self-contained and not require external dependencies
- Keep scripts simple and educational (Ethan is learning!)
- Comments should explain the WHY, not just the WHAT
