const axios = require('axios');

async function sendDiscord(message) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.log('Discord Webhook URL not set. Skipping.');
    return;
  }
  try {
    await axios.post(url, { content: message });
    console.log('Discord notification sent.');
  } catch (error) {
    console.error('Error sending Discord notification:', error.message);
  }
}

async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log('Telegram credentials (TOKEN or CHAT_ID) not set. Skipping.');
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('Telegram notification sent successfully.');
  } catch (error) {
    if (error.response) {
      console.error(`Telegram API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Error sending Telegram notification:', error.message);
    }
  }
}

module.exports = { sendDiscord, sendTelegram };
