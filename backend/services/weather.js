const axios  = require('axios');
const { REGIONS, REGION_BASELINE } = require('../config/constants');
const { rSet, rGet } = require('../db/redis');

const weatherCache = {};

async function fetchIMDWeather(region) {
  const cached = weatherCache[region];
  if (cached && Date.now() - cached.ts < 300000) return cached.data;

  const b = REGION_BASELINE[region];
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${b.lat}&longitude=${b.lon}&current=temperature_2m,precipitation_probability,wind_speed_10m&forecast_days=1`;
    const res = await axios.get(url, { timeout: 4000 });
    const c   = res.data.current;
    const data = {
      region,
      temperature_c:      Math.round(c.temperature_2m),
      precipitation_prob: c.precipitation_probability || 0,
      wind_kmh:           Math.round(c.wind_speed_10m),
      source:             'open-meteo',
    };
    weatherCache[region] = { data, ts: Date.now() };
    await rSet(`weather:${region}`, data, 300);
    return data;
  } catch {
    const mock = {
      region,
      temperature_c:      Math.round(28 + Math.random() * 15),
      precipitation_prob: Math.round(Math.random() * 80),
      wind_kmh:           Math.round(10 + Math.random() * 45),
      source:             'mock-imd',
    };
    weatherCache[region] = { data: mock, ts: Date.now() };
    await rSet(`weather:${region}`, mock, 300);
    return mock;
  }
}

async function prewarmWeather() {
  await Promise.all(REGIONS.map(r => fetchIMDWeather(r)));
  console.log('[Weather] Pre-warmed cache for all regions');
}

module.exports = { fetchIMDWeather, prewarmWeather };
