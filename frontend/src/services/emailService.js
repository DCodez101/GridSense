import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

let emailjsReady = false;

export function initEmailJS() {
  if (!PUBLIC_KEY) {
    console.warn('[EmailJS] Not configured — email sending disabled');
    return;
  }
  emailjs.init({ publicKey: PUBLIC_KEY });
  emailjsReady = true;
  console.log('[EmailJS] Initialized ✅');
}

export async function sendAlertEmail(payload) {
  if (!emailjsReady) {
    console.log('[EmailJS] Skipped — not configured');
    return { ok: false, reason: 'not configured' };
  }
  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, payload);
    console.log('[EmailJS] Email sent ✅', result.status);
    return { ok: true, status: result.status };
  } catch (err) {
    console.error('[EmailJS] Failed:', err);
    return { ok: false, reason: err.text || err.message };
  }
}

export function isEmailJSConfigured() {
  return !!PUBLIC_KEY;
}
