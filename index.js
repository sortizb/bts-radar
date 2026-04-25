require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { checkTickets } = require('./scraper');
const { sendDiscord, sendTelegram } = require('./notify');

const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

async function run() {
  console.log('--- Starting BTS Ticket Monitor ---');
  
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  
  // 1. Load previous state
  let prevState = { status: 'UNKNOWN' };
  if (fs.existsSync(STATE_FILE)) {
    prevState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  
  try {
    // 2. Scrape the site
    const currentStatus = await checkTickets();
    console.log(`Current Status: ${currentStatus} (Previous: ${prevState.status})`);
    
    // 3. Compare and Notify
    const isInitialRun = prevState.status === 'UNKNOWN';
    const statusChanged = currentStatus !== prevState.status;

    if (statusChanged || isInitialRun) {
      let message = '';
      if (currentStatus === 'AVAILABLE') {
        message = '🚨 **BTS TICKETS MIGHT BE AVAILABLE!** 🚨\n\nGo check now: https://www.ticketmaster.co/event/bts-world-tour-2026';
      } else if (currentStatus === 'SOLD_OUT' && !isInitialRun) {
        message = 'ℹ️ BTS tickets are sold out again.';
      } else if (isInitialRun) {
        message = `🤖 **Monitor Started Successfully!**\n\nInitial status: **${currentStatus}**\nInterval: ~5-10 minutes (GitHub Schedule)`;
      }
      
      if (message) {
        await Promise.all([
          sendDiscord(message),
          sendTelegram(message)
        ]);
      }
    } else {
      console.log('No status change detected.');
    }
    
    // 4. Always update state (Heartbeat)
    console.log('Updating heartbeat in state.json...');
    fs.writeFileSync(STATE_FILE, JSON.stringify({ 
      status: currentStatus, 
      lastUpdate: new Date().toISOString(),
      lastCheckSuccessful: true
    }, null, 2));
    
  } catch (error) {
    console.error('Fatal error in run loop:', error);
    // Optional: notify on repeated errors
  }
}

run();
