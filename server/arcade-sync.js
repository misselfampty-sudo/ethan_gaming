/**
 * Arcade Sync Manager
 * Handles offline-first sync with last-write-wins conflict resolution
 *
 * Usage in index.html:
 * - Initialize: arcadeSync.init()
 * - Before saving score: arcadeSync.updateScore(playerName, gameId, score, level)
 * - Sync now: arcadeSync.syncNow()
 * - Get synced data: arcadeSync.getSyncedProfiles()
 */

const arcadeSync = (() => {
  const API_BASE = '/api'; // Will proxy to http://localhost:3000 via Nginx
  const SYNC_INTERVAL = 30000; // Sync every 30 seconds
  const QUEUE_KEY = 'arcade_sync_queue';
  const PROFILES_KEY = 'arcade_profiles'; // Match the game's storage key

  let syncInProgress = false;
  let lastSyncTime = 0;
  let syncIntervalId = null;

  // Initialize sync manager
  function init() {
    console.log('🔄 Arcade Sync Manager initialized');

    // Start periodic sync
    startPeriodicSync();

    // Sync when coming online
    window.addEventListener('online', () => {
      console.log('📡 Online detected — syncing now');
      syncNow();
    });

    // Try initial sync
    syncNow();
  }

  // Add score update to offline queue
  function updateScore(profileName, gameId, score, level) {
    const timestamp = Date.now();

    // Update local storage immediately (offline-first)
    let profiles = getLocalProfiles();
    if (!profiles[profileName]) {
      profiles[profileName] = { name: profileName, highScores: {} };
    }

    const currentScore = profiles[profileName].highScores?.[gameId]?.score || 0;

    // Only update if new score is higher
    if (score > currentScore) {
      profiles[profileName].highScores[gameId] = {
        score,
        level,
        timestamp
      };
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      console.log(`✏️  Score queued for sync: ${profileName} - ${gameId} = ${score}`);
    }

    // Add to sync queue (for server persistence)
    const queue = getQueue();
    queue.push({
      type: 'score_update',
      profileName,
      gameId,
      score,
      level,
      timestamp,
      queuedAt: Date.now()
    });
    saveQueue(queue);

    // Try to sync if online
    if (navigator.onLine) {
      syncNow();
    }
  }

  // Perform full sync with server
  async function syncNow() {
    if (syncInProgress) {
      console.log('⏳ Sync already in progress...');
      return;
    }

    syncInProgress = true;

    try {
      // 1. Check if server is reachable
      const healthCheck = await fetch(`${API_BASE}/health`, { method: 'GET' });
      if (!healthCheck.ok) {
        throw new Error('Server not reachable');
      }

      // 2. Get current local profiles
      const profiles = getLocalProfiles();

      // 3. Send to server with client timestamp
      const response = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profiles,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();

      // 4. Merge server response with local data (server wins on conflicts)
      mergeServerData(result.profiles);

      // 5. Clear sync queue (all synced successfully)
      saveQueue([]);

      lastSyncTime = Date.now();
      console.log(`✅ Sync complete at ${new Date(lastSyncTime).toLocaleTimeString()}`);

      return result;

    } catch (err) {
      console.warn(`⚠️  Sync failed: ${err.message} — will retry later`);
    } finally {
      syncInProgress = false;
    }
  }

  // Merge server response with local data
  function mergeServerData(serverProfiles) {
    let local = getLocalProfiles();

    for (const profileName in serverProfiles) {
      const serverProfile = serverProfiles[profileName];

      if (!local[profileName]) {
        // New profile from server
        local[profileName] = {
          name: serverProfile.name,
          code: serverProfile.code,
          highScores: {}
        };
        console.log(`📥 New profile synced: ${profileName}`);
      } else if (serverProfile.code && !local[profileName].code) {
        // Server has code, local doesn't - use server's
        local[profileName].code = serverProfile.code;
      }

      // For each game score
      for (const gameId in serverProfile.highScores) {
        const serverScore = serverProfile.highScores[gameId];
        const localScore = local[profileName].highScores?.[gameId];

        // Server timestamp is newer: use server data
        if (!localScore || serverScore.timestamp > localScore.timestamp) {
          local[profileName].highScores[gameId] = serverScore;
          console.log(`🔄 Merged server score: ${profileName} - ${gameId} = ${serverScore.score}`);
        }
        // Local is newer: keep local (will be sent next sync)
        else if (serverScore.timestamp < localScore.timestamp) {
          console.log(`⚡ Kept newer local score: ${profileName} - ${gameId} = ${localScore.score}`);
        }
      }
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(local));
  }

  // Get local profiles from localStorage
  function getLocalProfiles() {
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Get current profiles (local + synced)
  function getSyncedProfiles() {
    return getLocalProfiles();
  }

  // Queue management
  function getQueue() {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  // Periodic sync
  function startPeriodicSync() {
    syncIntervalId = setInterval(() => {
      if (navigator.onLine) {
        syncNow();
      }
    }, SYNC_INTERVAL);
  }

  function stopPeriodicSync() {
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  }

  // Public API
  return {
    init,
    updateScore,
    syncNow,
    getSyncedProfiles,
    stop: stopPeriodicSync,
    getQueue,
    isOnline: () => navigator.onLine,
    lastSync: () => new Date(lastSyncTime).toLocaleTimeString()
  };
})();
