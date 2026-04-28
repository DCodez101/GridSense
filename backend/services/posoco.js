const axios  = require('axios');
const { REGIONS, REGION_BASELINE } = require('../config/constants');

const lastFrequency = {};

function generateMockGridData() {
  return REGIONS.map(region => {
    const b = REGION_BASELINE[region];
    if (!lastFrequency[region]) lastFrequency[region] = b.base;

    const drift       = (Math.random() - 0.5) * 0.04;
    const stressEvent = Math.random() > 0.92;
    let newFreq       = lastFrequency[region] + drift;
    if (stressEvent) newFreq -= 0.1 + Math.random() * 0.2;
    newFreq = Math.max(49.0, Math.min(51.0, newFreq));
    newFreq = newFreq + (50.0 - newFreq) * 0.1;
    lastFrequency[region] = parseFloat(newFreq.toFixed(3));

    return {
      region,
      frequency:     lastFrequency[region],
      load_mw:       Math.floor(b.load + (Math.random() - 0.5) * 500),
      generation_mw: Math.floor(b.gen  + (Math.random() - 0.5) * 500),
      timestamp:     new Date().toISOString(),
      source:        'mock-posoco',
    };
  });
}

async function fetchPOSOCOData() {
  if (!process.env.POSOCO_API_URL) return generateMockGridData();
  try {
    const res = await axios.get(process.env.POSOCO_API_URL, { timeout: 3000 });
    return res.data;
  } catch {
    return generateMockGridData();
  }
}

module.exports = { fetchPOSOCOData, generateMockGridData };
