/**
 * Export Player Scores & Profiles
 *
 * Paste this into the browser console (F12) while playing Arcade Portal
 * to extract and display all saved player scores.
 *
 * Usage: Paste in browser console, run exportArcadeScores()
 */

function exportArcadeScores() {
  console.log("🎮 Project Arcade — Score Export\n");

  // Get game state from localStorage
  const gameState = localStorage.getItem('arcadeGameState');

  if (!gameState) {
    console.log("❌ No game data found in localStorage");
    return;
  }

  const state = JSON.parse(gameState);
  const profiles = state.profiles || [];

  if (profiles.length === 0) {
    console.log("No profiles created yet");
    return;
  }

  console.log(`📊 ${profiles.length} Player(s) Found:\n`);

  profiles.forEach((profile, idx) => {
    console.log(`${idx + 1}. ${profile.name}`);
    console.log(`   • High Score: ${profile.bestScore || 0}`);
    console.log(`   • Last Played: ${profile.timestamp ? new Date(profile.timestamp).toLocaleDateString() : 'Never'}`);
    console.log("");
  });

  // Export as JSON for easy copying
  console.log("📋 Full Data (copy this to save):");
  console.log(JSON.stringify(profiles, null, 2));
}

// Run it
exportArcadeScores();
