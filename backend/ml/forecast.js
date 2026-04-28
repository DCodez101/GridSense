const { REGION_BASELINE } = require('../config/constants');
const { rGet } = require('../db/redis');

const regionHistory = {};

function updateHistory(gridPoint) {
  if (!regionHistory[gridPoint.region]) regionHistory[gridPoint.region] = [];
  regionHistory[gridPoint.region].push(gridPoint);
  if (regionHistory[gridPoint.region].length > 20)
    regionHistory[gridPoint.region].shift();
}

async function forecastAgent(region) {
  const history = regionHistory[region] || [];
  const weather = await rGet(`weather:${region}`);
  const b       = REGION_BASELINE[region];

  const baseLoad = history.length >= 3
    ? history.slice(-5).reduce((sum, h, i) => sum + h.load_mw * (i + 1), 0) /
      history.slice(-5).reduce((sum, _, i) => sum + (i + 1), 0)
    : b.load;

  const tempFactor = weather && weather.temperature_c > 35
    ? 1 + (weather.temperature_c - 35) * 0.008
    : 1.0;

  const variance = history.length > 3
    ? history.slice(-10).reduce((sum, h) => sum + Math.pow(h.load_mw - baseLoad, 2), 0) / Math.min(history.length, 10)
    : 90000;
  const baseConf = Math.round(Math.sqrt(variance));

  const hours = Array.from({ length: 6 }, (_, i) => {
    const trend  = i * 180;
    const noise  = (Math.random() - 0.5) * 80;
    const demand = Math.round((baseLoad + trend + noise) * (i < 3 ? tempFactor : 1));
    const conf   = baseConf + Math.round(i * 70);
    return {
      hour:             i + 1,
      demand,
      confidence_low:   demand - conf,
      confidence_high:  demand + conf,
    };
  });

  return { region, data: hours, algorithm: "Weighted Moving Average" };
}

module.exports = { forecastAgent, updateHistory, regionHistory };
