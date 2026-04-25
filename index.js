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
    const currentResults = await checkTickets();
    
    // Check if we actually found what we were looking for
    const foundCategories = Object.keys(currentResults).filter(k => !k.endsWith('_LINK'));
    if (foundCategories.length === 0) {
      throw new Error('No ticket categories were found on the page. The site structure might have changed.');
    }

    // 3. Compare and Notify
    const isInitialRun = prevState.status === 'UNKNOWN';
    const categories = Object.keys(currentResults);
    const changes = [];
    const availableNow = [];

    categories.forEach(cat => {
      const current = currentResults[cat];
      const previous = isInitialRun ? 'UNKNOWN' : (prevState.results ? prevState.results[cat] : 'UNKNOWN');

      if (current !== previous) {
        changes.push({ category: cat, from: previous, to: current });
      }
      if (current === 'AVAILABLE') {
        availableNow.push(cat);
      }
    });

    if (changes.length > 0 || isInitialRun) {
      let message = '';
      const formatCat = (str) => str.replace(/_/g, '\\_');

      if (isInitialRun) {
        message = '🤖 **Monitor Started Successfully!**\n\n' +
                  categories.filter(c => !c.endsWith('_LINK')).map(cat => `• ${formatCat(cat)}: **${currentResults[cat]}**`).join('\n') +
                  '\n\nInterval: ~5-10 minutes (GitHub Schedule)';
      } else {
        const changeLogs = changes.filter(ch => !ch.category.endsWith('_LINK')).map(ch => `• ${formatCat(ch.category)}: **${ch.from}** → **${ch.to}**`).join('\n');

        if (availableNow.length > 0) {
          message = '🚨 **TICKET AVAILABILITY CHANGE!** 🚨\n\n' +
                    changeLogs +
                    '\n\n🔥 **AVAILABLE NOW:**\n' +
                    availableNow.map(a => {
                      const link = currentResults[`${a}_LINK`];
                      return `👉 **${formatCat(a)}**\n   [Click here to buy](${link})`;
                    }).join('\n') +
                    '\n\nMain page: https://www.ticketmaster.co/event/bts-world-tour-2026';
        } else {
          message = 'ℹ️ **Status Update:**\n\n' + changeLogs;
        }
      }
      
      if (message) {
        await Promise.all([
          sendDiscord(message),
          sendTelegram(message)
        ]);
      }
    } else {
      console.log('No status change detected for any category.');
    }
    
    // 4. Always update state (Heartbeat)
    console.log('Updating heartbeat in state.json...');
    fs.writeFileSync(STATE_FILE, JSON.stringify({ 
      status: 'MONITORING', // General status
      results: currentResults, // Detailed results
      lastUpdate: new Date().toISOString(),
      lastCheckSuccessful: true
    }, null, 2));
    
  } catch (error) {
    console.error('Fatal error in run loop:', error);
    const errorMessage = `⚠️ **BTS Monitor Error:**\n\n\`${error.message}\`\n\nCheck logs: https://github.com/${process.env.GITHUB_REPOSITORY}/actions`;

    // Only notify once per error state change to avoid spam
    if (prevState.status !== 'ERROR') {
      await Promise.all([
        sendDiscord(errorMessage),
        sendTelegram(errorMessage)
      ]);
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify({ 
      status: 'ERROR', 
      lastUpdate: new Date().toISOString(),
      lastCheckSuccessful: false,
      error: error.message
    }, null, 2));
  }
}

run();
