const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const appPassword = process.env.APP_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!appPassword) {
  console.error('FEHLER: Bitte APP_PASSWORD als Umgebungsvariable setzen.');
  process.exit(1);
}
if (!databaseUrl) {
  console.error('FEHLER: Bitte DATABASE_URL als Umgebungsvariable setzen.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS studyflow_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`INSERT INTO studyflow_state (id, state) VALUES (1, $1::jsonb)
    ON CONFLICT (id) DO NOTHING`, [JSON.stringify({theme:'dark',language:'de',goal:3,tasks:[],completedDates:[],streak:0,notes:''})]);
  console.log('PostgreSQL-Datenbank bereit.');
}

function requirePassword(req, res, next) {
  const provided = Buffer.from(req.get('x-studyflow-key') || '');
  const expected = Buffer.from(appPassword);
  if (provided.length !== expected.length || !require('crypto').timingSafeEqual(provided, expected)) {
    return res.status(401).json({ error: 'Ungültiger Zugangscode' });
  }
  next();
}

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});

app.get('/api/state', requirePassword, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT state, updated_at FROM studyflow_state WHERE id = 1');
    res.json({ state: result.rows[0].state, updatedAt: result.rows[0].updated_at });
  } catch (err) { next(err); }
});

app.put('/api/state', requirePassword, async (req, res, next) => {
  try {
    const state = req.body;
    if (!state || typeof state !== 'object' || !Array.isArray(state.tasks)) {
      return res.status(400).json({ error: 'Ungültige StudyFlow-Daten' });
    }
    if (JSON.stringify(state).length > 900000) return res.status(413).json({ error: 'Daten sind zu gross' });
    const result = await pool.query(
      'UPDATE studyflow_state SET state = $1::jsonb, updated_at = NOW() WHERE id = 1 RETURNING updated_at',
      [JSON.stringify(state)]
    );
    res.json({ ok: true, updatedAt: result.rows[0].updated_at });
  } catch (err) { next(err); }
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use((err, req, res, next) => {
  console.error('Serverfehler:', err.message);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

initDb().then(() => app.listen(port, '0.0.0.0', () => console.log(`StudyFlow läuft auf Port ${port}`)))
  .catch(err => { console.error('Datenbank konnte nicht gestartet werden:', err.message); process.exit(1); });

process.on('SIGTERM', async () => { await pool.end(); process.exit(0); });
