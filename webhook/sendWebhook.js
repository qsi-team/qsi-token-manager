// webhook/sendWebhook.js

const axios = require('axios');
require('dotenv').config();

/**
 * Send a webhook notification with the given payload.
 * 
 * @param {Object} payload - The JSON payload to send.
 */
const sendWebhook = async (payload) => {
  try {
    const response = await axios.post(process.env.MAKE_WEBHOOK_URL, payload);
    console.log(`[INFO] Webhook sent. Status: ${response.status}`);
  } catch (error) {
    console.error('[ERROR] Webhook sending failed:', error);
  }
};

module.exports = sendWebhook;
