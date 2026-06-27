const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arcade',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const PORT = process.env.PORT || 3000;

// ==========================================
// SYNC ENDPOINT - Bidirectional sync with conflict resolution
// ==========================================

app.post('/api/sync', async (req, res) => {
  try {
    const { profiles: clientProfiles, timestamp: clientTimestamp } = req.body;

    if (!clientProfiles || !clientTimestamp) {
      return res.status(400).json({ error: 'Missing profiles or timestamp' });
    }

    console.log('Sync request received from client');

    // 1. Get all server profiles
    let profilesResult;
    try {
      profilesResult = await pool.query('SELECT * FROM profiles');
    } catch (dbErr) {
      console.error('Database query error:', dbErr.message);
      return res.status(500).json({ error: 'Database connection failed', details: dbErr.message });
    }
    const serverProfiles = {};
    profilesResult.rows.forEach(p => {
      serverProfiles[p.name] = { id: p.id, version: p.version };
    });

    // 2. Get all server high scores
    let scoresResult;
    try {
      scoresResult = await pool.query(`
        SELECT p.name, h.game_id, h.score, h.level, h.score_timestamp, h.version
        FROM high_scores h
        JOIN profiles p ON h.profile_id = p.id
      `);
    } catch (dbErr) {
      console.error('Database query error:', dbErr.message);
      return res.status(500).json({ error: 'Database query failed', details: dbErr.message });
    }

    const serverScores = {};
    scoresResult.rows.forEach(row => {
      if (!serverScores[row.name]) serverScores[row.name] = {};
      serverScores[row.name][row.game_id] = {
        score: row.score,
        level: row.level,
        timestamp: row.score_timestamp,
        version: row.version
      };
    });

    // 3. Sync profiles: create missing ones
    const newProfiles = [];
    for (const name in clientProfiles) {
      if (!serverProfiles[name]) {
        const result = await pool.query(
          'INSERT INTO profiles (name, version) VALUES ($1, 1) RETURNING id',
          [name]
        );
        newProfiles.push({ name, id: result.rows[0].id });
      }
    }

    // 4. Sync high scores: Last-Write-Wins (based on score_timestamp)
    for (const name in clientProfiles) {
      const clientHighScores = clientProfiles[name].highScores || {};
      const profileId = serverProfiles[name]?.id || newProfiles.find(p => p.name === name)?.id;

      if (!profileId) continue;

      for (const gameId in clientHighScores) {
        const clientScore = clientHighScores[gameId];
        const serverScore = serverScores[name]?.[gameId];

        // Client score is newer: write to server
        if (!serverScore || clientScore.timestamp > serverScore.timestamp) {
          await pool.query(`
            INSERT INTO high_scores (profile_id, game_id, score, level, score_timestamp, version)
            VALUES ($1, $2, $3, $4, $5, 1)
            ON CONFLICT (profile_id, game_id)
            DO UPDATE SET
              score = $3,
              level = $4,
              score_timestamp = $5,
              version = high_scores.version + 1
          `, [profileId, gameId, clientScore.score, clientScore.level, clientScore.timestamp]);

          // Log the sync
          await pool.query(
            'INSERT INTO sync_log (profile_id, action, client_timestamp, details) VALUES ($1, $2, $3, $4)',
            [profileId, 'score_update', clientScore.timestamp, JSON.stringify({
              gameId,
              score: clientScore.score,
              reason: 'client_newer'
            })]
          );
        }
        // Server score is newer: keep server, return to client
        else if (serverScore && clientScore.timestamp < serverScore.timestamp) {
          await pool.query(
            'INSERT INTO sync_log (profile_id, action, client_timestamp, details) VALUES ($1, $2, $3, $4)',
            [profileId, 'score_conflict', clientScore.timestamp, JSON.stringify({
              gameId,
              clientScore: clientScore.score,
              serverScore: serverScore.score,
              reason: 'server_newer'
            })]
          );
        }
      }
    }

    // 5. Return current server state to client
    const updatedScoresResult = await pool.query(`
      SELECT p.name, h.game_id, h.score, h.level, h.score_timestamp
      FROM high_scores h
      JOIN profiles p ON h.profile_id = p.id
    `);

    const syncedScores = {};
    updatedScoresResult.rows.forEach(row => {
      if (!syncedScores[row.name]) syncedScores[row.name] = {};
      syncedScores[row.name][row.game_id] = {
        score: row.score,
        level: row.level,
        timestamp: row.score_timestamp
      };
    });

    res.json({
      success: true,
      synced_at: Date.now(),
      profiles: syncedScores
    });

  } catch (err) {
    console.error('Sync error:', err.message, err.stack);
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// ==========================================
// LEADERBOARD ENDPOINT
// ==========================================

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name, h.game_id, h.score, h.level, h.score_timestamp
      FROM profiles p
      LEFT JOIN high_scores h ON p.id = h.profile_id AND h.game_id = 'space-invaders'
      ORDER BY COALESCE(h.score, 0) DESC
    `);

    const leaderboard = result.rows.map(row => ({
      name: row.name,
      score: row.score || 0,
      level: row.level || 1,
      timestamp: row.score_timestamp || null
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, async () => {
  console.log(`🎮 Arcade API running on port ${PORT}`);
  console.log(`   Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'arcade'}`);
  console.log(`   Sync endpoint: POST /api/sync`);
  console.log(`   Leaderboard: GET /api/leaderboard`);
  console.log(`   Health: GET /api/health`);

  // Test database connection
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});
