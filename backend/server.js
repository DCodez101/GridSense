const express   = require('express');
const http      = require('http');
const { Server }= require('socket.io');
const cors      = require('cors');
require('dotenv').config();

const { initRedis, rGet }          = require('./db/redis');
const { initMongo }                = require('./db/mongo');
const { prewarmZScore }            = require('./ml/anomaly');
const { prewarmWeather }           = require('./services/weather');
const { initPipeline, runPipeline }= require('./pipeline/index');
const { REGIONS }                  = require('./config/constants');
const apiRoutes = require('./routes/api');


const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Make io accessible inside routes
app.set('io', io);

// Mount all API routes
app.use('/api', apiRoutes);

// ── SOCKET ───────────────────────────────────────────────────
io.on('connection', async (socket) => {
  console.log('[Socket] Client connected:', socket.id);
  // Push cached state instantly to new clients
  for (const r of REGIONS) {
    const a = await rGet(`anomaly:latest:${r}`);
    const f = await rGet(`forecast:${r}`);
    if (a) socket.emit('anomaly',  a);
    if (f) socket.emit('forecast', f);
  }
});

// ── STARTUP ──────────────────────────────────────────────────
async function start() {
  await initRedis();
  await initMongo();
  prewarmZScore();
  await prewarmWeather();
  initPipeline(io);
  setInterval(runPipeline, 8000);
  runPipeline();
  server.listen(process.env.PORT || 3001, () =>
    console.log(`🔌 GridSense server running on port ${process.env.PORT || 3001}`)
  );
}

start();
