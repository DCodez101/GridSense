const express = require('express');
const router  = express.Router();

const { rGet, getRedisStatus }               = require('../db/redis');
const { isMongoOk, Anomaly, Alert, Forecast } = require('../db/mongo');
const { fetchIMDWeather }                    = require('../services/weather');
const { forecastAgent }                      = require('../ml/forecast');
const { anomalyAgent }                       = require('../ml/anomaly');
const { contextAgent }                       = require('../ml/context');
const { alertAgent }                         = require('../agents/alert');
const { getPipelineCount }                   = require('../pipeline/index');
const { REGIONS, SCENARIOS }                 = require('../config/constants');

// ── GRID STATUS ──────────────────────────────────────────────
router.get('/grid-status', async (req, res) => {
  if (isMongoOk()) {
    const data = await Anomaly.find().sort({ timestamp: -1 }).limit(50);
    return res.json(data);
  }
  const cached = [];
  for (const r of REGIONS) {
    const a = await rGet(`anomaly:latest:${r}`);
    if (a) cached.push(a);
  }
  res.json(cached);
});

// ── ALERTS ───────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  if (isMongoOk()) {
    const data = await Alert.find().sort({ timestamp: -1 }).limit(20);
    return res.json(data);
  }
  res.json([]);
});

// ── FORECAST ─────────────────────────────────────────────────
router.get('/forecast', async (req, res) => {
  const data = [];
  for (const r of REGIONS) {
    const f = await rGet(`forecast:${r}`);
    if (f) data.push(f);
  }
  res.json(data);
});

// ── WEATHER ──────────────────────────────────────────────────
router.get('/weather', async (req, res) => {
  const data = await Promise.all(REGIONS.map(r => fetchIMDWeather(r)));
  res.json(data);
});

router.get('/weather/:region', async (req, res) => {
  const w = await fetchIMDWeather(req.params.region);
  res.json(w);
});

// ── REDIS PROOF ───────────────────────────────────────────────
router.get('/redis-proof', async (req, res) => {
  const { redisOk, redisOps } = getRedisStatus();
  const keys = [];
  for (const r of REGIONS) {
    const a = await rGet(`anomaly:latest:${r}`);
    const w = await rGet(`weather:${r}`);
    if (a) keys.push({ key: `anomaly:latest:${r}`, value: `SEV ${a.severity}/10 @ ${a.frequency}Hz`, ttl: 60 });
    if (w) keys.push({ key: `weather:${r}`, value: `${w.temperature_c}°C ${w.precipitation_prob}% rain`, ttl: 300 });
  }
  res.json({ connected: redisOk, ops: redisOps, keys });
});

// ── HEALTH ────────────────────────────────────────────────────
router.get('/health', async (req, res) => {
  const { redisOk } = getRedisStatus();
  res.json({
    status:         'ok',
    redis:          redisOk ? 'connected' : 'in-memory fallback',
    mongodb:        isMongoOk() ? 'connected' : 'not connected',
    pipeline_count: getPipelineCount(),
    regions:        REGIONS,
    ml_algorithms: {
      anomaly_detection: "Z-Score Statistical Detection (rolling 30-point window, pre-warmed)",
      forecasting:       "Weighted Moving Average (5-point WMA with temperature correction factor)",
      weather_factor:    "IMD Open-Meteo API — temperature, precipitation, wind → severity boost",
    },
    agent_reasoning: "Dynamic data-driven — uses live frequency, load, deficit, hour, weather values. Never repeats.",
  });
});

// ── CRISIS SIMULATE ───────────────────────────────────────────
router.post('/simulate', async (req, res) => {
  // io is attached to req by server.js middleware
  const io = req.app.get('io');
  const { scenario = 'industrial_surge' } = req.body;
  const s = SCENARIOS[scenario];
  if (!s) return res.status(400).json({ error: 'Unknown scenario' });

  const gridPoint = { region: s.region, frequency: s.frequency, load_mw: s.load_mw, generation_mw: s.generation_mw, timestamp: new Date().toISOString() };
  const anomaly   = { ...gridPoint, severity: s.severity, reason: s.reason, zScore: "3.80", weatherBoost: 0, algorithm: "Crisis Simulation" };
  const enriched  = { ...anomaly, context: s.context };
  const alert     = { region: s.region, stakeholder: s.stakeholder, message: s.alert_msg, severity: s.severity };
  const forecast  = await forecastAgent(s.region);

  io.emit('crisis-start', { scenario: s.name, region: s.region, frequency: s.frequency });
  io.emit('grid-update',  [gridPoint]);
  setTimeout(() => io.emit('anomaly',  enriched),  400);
  setTimeout(() => io.emit('alert',    alert),      900);
  setTimeout(() => io.emit('forecast', forecast),  1400);
  setTimeout(() => io.emit('crisis-end', {}),      8000);

  if (isMongoOk()) {
    try {
      await new Anomaly({ ...enriched, context: enriched.context }).save();
      await new Alert(alert).save();
    } catch { /* non-fatal */ }
  }

  res.json({ ok: true, scenario: s.name, region: s.region, severity: s.severity });
});

module.exports = router;
