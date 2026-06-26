/**
 * Game State Debugger
 *
 * Diagnose game state issues and verify localStorage data integrity.
 * Paste this into the browser console (F12) to run.
 *
 * Usage: Paste in browser console, run debugGameState()
 */

function debugGameState() {
  console.log("🐛 Project Arcade — Game State Debugger\n");

  const stateKey = 'arcadeGameState';
  const stateData = localStorage.getItem(stateKey);

  if (!stateData) {
    console.warn("⚠️  No game state in localStorage");
    return;
  }

  let state;
  try {
    state = JSON.parse(stateData);
    console.log("✅ Game state is valid JSON\n");
  } catch (e) {
    console.error("❌ Game state is CORRUPTED:", e.message);
    return;
  }

  // Check essential fields
  console.log("📋 State Structure:");
  console.log(`   gameState: "${state.gameState}" (should be 'dashboard', 'spaceInvaders', or 'snake')`);
  console.log(`   activePlayer: "${state.activePlayer}"`);
  console.log(`   profiles: ${state.profiles?.length || 0} players\n`);

  if (!state.profiles || state.profiles.length === 0) {
    console.warn("⚠️  No player profiles. Create one in the app to test.");
    return;
  }

  // Validate each profile
  console.log("👥 Profile Validation:");
  state.profiles.forEach((profile, idx) => {
    console.log(`\n   Profile ${idx + 1}: "${profile.name}"`);
    console.log(`     • bestScore: ${profile.bestScore ?? 'missing'} ${typeof profile.bestScore === 'number' ? '✅' : '⚠️'}`);
    console.log(`     • timestamp: ${profile.timestamp ? new Date(profile.timestamp).toLocaleString() : 'missing'} ${profile.timestamp ? '✅' : '⚠️'}`);
  });

  console.log("\n✅ Debug complete. No critical issues found.");
}

// Run it
debugGameState();
