const { createClient } = require('redis');

let redisClient = null;
let redisOk     = false;
let redisOps    = 0;

const memCache = {};

async function initRedis() {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', () => {});
    await Promise.race([
      redisClient.connect(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
    ]);
    redisOk = true;
    console.log('[Redis] Connected ✅');
  } catch {
    console.log('[Redis] Not available — falling back to in-memory mode. Server works normally without Redis.');
    redisClient = null;
  }
}

async function rSet(key, value, ttl = 60) {
  const v = JSON.stringify(value);
  if (redisOk) {
    try { await redisClient.setEx(key, ttl, v); redisOps++; return; } catch { redisOk = false; }
  }
  memCache[key] = { v, exp: Date.now() + ttl * 1000 };
}

async function rGet(key) {
  if (redisOk) {
    try {
      const v = await redisClient.get(key); redisOps++;
      return v ? JSON.parse(v) : null;
    } catch { redisOk = false; }
  }
  const e = memCache[key];
  if (!e || Date.now() > e.exp) return null;
  return JSON.parse(e.v);
}

function getRedisStatus() {
  return { redisOk, redisOps };
}

module.exports = { initRedis, rSet, rGet, getRedisStatus };
