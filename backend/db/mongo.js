const mongoose = require('mongoose');

const anomalySchema  = new mongoose.Schema({ region:String, frequency:Number, severity:Number, reason:String, context:String, zScore:String, weatherBoost:Number, timestamp:{ type:Date, default:Date.now } });
const alertSchema    = new mongoose.Schema({ region:String, stakeholder:String, message:String, severity:Number, timestamp:{ type:Date, default:Date.now } });
const forecastSchema = new mongoose.Schema({ region:String, data:Array, timestamp:{ type:Date, default:Date.now } });

const Anomaly  = mongoose.model('Anomaly',  anomalySchema);
const Alert    = mongoose.model('Alert',    alertSchema);
const Forecast = mongoose.model('Forecast', forecastSchema);

let mongoOk = false;

async function initMongo() {
  if (!process.env.MONGO_URI) { console.log('[MongoDB] No URI — skipping'); return; }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    mongoOk = true;
    console.log('[MongoDB] Connected ✅');
  } catch (e) {
    console.log('[MongoDB] Failed:', e.message);
  }
}

function isMongoOk() {
  return mongoOk;
}

module.exports = { initMongo, isMongoOk, Anomaly, Alert, Forecast };
