// telegram/sendTelegram.js

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('[ERROR] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID is not set.');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

/**
 * Send a Telegram notification.
 * 
 * @param {string} message - The message text (in Markdown format).
 * @param {object} options - Additional options (e.g., inline keyboard).
 */
const sendLogToChannel = async (message, options = {}) => {
  try {
    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown', ...options });
    console.log('[INFO] Telegram notification sent successfully.');
  } catch (error) {
    console.error('[ERROR] Telegram notification failed:', error);
  }
};

module.exports = sendLogToChannel;
