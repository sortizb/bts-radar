const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

async function checkTickets() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  
  // Bridge the browser console to the terminal console
  page.on('console', msg => {
    console.log(`[BROWSER]: ${msg.text()}`);
  });

  const results = {
    'ARMY_02_10': 'SOLD_OUT',
    'GENERAL_02_10': 'SOLD_OUT',
    'ARMY_03_10': 'SOLD_OUT',
    'GENERAL_03_10': 'SOLD_OUT'
  };

  try {
    console.log('Navigating to Ticketmaster...');
    try {
      await page.goto('https://www.ticketmaster.co/event/bts-world-tour-2026', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
    } catch (gotoError) {
      console.warn('Initial navigation timeout, attempting to proceed...');
    }

    console.log('Waiting for content to render...');
    await page.waitForTimeout(10000);

    // Helper to check status within a specific text context
    const checkStatus = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.tm-ticket-item'));
      const data = {};

      console.log(`Found ${items.length} ticket items on page.`);

      items.forEach((item, index) => {
        const text = item.innerText;
        const linkEl = item.querySelector('a');
        const link = linkEl ? linkEl.href : 'NO_LINK';
        const isSoldOut = text.toUpperCase().includes('AGOTADO');

        // Identify which category this item belongs to
        let key = null;
        if (text.includes('02/10')) {
          if (text.toUpperCase().includes('ARMY')) key = 'ARMY_02_10';
          else if (text.toUpperCase().includes('VENTA GENERAL')) key = 'GENERAL_02_10';
        } else if (text.includes('03/10')) {
          if (text.toUpperCase().includes('ARMY')) key = 'ARMY_03_10';
          else if (text.toUpperCase().includes('VENTA GENERAL')) key = 'GENERAL_03_10';
        }

        if (key) {
          data[key] = {
            status: isSoldOut ? 'SOLD_OUT' : 'AVAILABLE',
            link: link,
            rawText: text.replace(/\n/g, ' ').substring(0, 100)
          };
          console.log(`[ITEM ${index}] Identified as ${key}: Status=${data[key].status}, Link=${link}`);
        } else {
          console.log(`[ITEM ${index}] Unidentified category. Text preview: ${text.substring(0, 50)}...`);
        }
      });

      return data;
    });

    // Merge results into our main object
    Object.keys(checkStatus).forEach(key => {
      results[key] = checkStatus[key].status;
      // We'll also return the links so index.js can use them
      results[`${key}_LINK`] = checkStatus[key].link;
    });

    console.log('Scrape final results:', results);
    console.log('Scrape results:', results);

    await browser.close();
    return results;
  } catch (error) {
    console.error('Error during scraping:', error.message);
    await browser.close();
    throw error;
  }
}

module.exports = { checkTickets };
