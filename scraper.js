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
  
  try {
    console.log('Navigating to Ticketmaster...');
    try {
      await page.goto('https://www.ticketmaster.co/event/bts-world-tour-2026', {
        waitUntil: 'domcontentloaded', // Much more reliable than networkidle
        timeout: 60000
      });
    } catch (gotoError) {
      console.warn('Initial navigation timeout/error, attempting to proceed anyway...', gotoError.message);
    }

    // Wait for the dynamic content to actually render
    console.log('Waiting for content to render...');
    await page.waitForTimeout(10000); // 10 seconds is safer for Ticketmaster's JS

    const content = await page.content();
    
    // Check for "AGOTADO" text
    const isSoldOut = content.includes('AGOTADO') || content.includes('Agotado');
    
    // Check for "COMPRAR" or "Tickets" buttons which might indicate availability
    const hasBuyButton = content.includes('COMPRAR') || content.includes('Comprar') || content.includes('TICKETS') || content.includes('ickets');

    console.log(`Scrape result: Sold Out = ${isSoldOut}, Has Buy Button = ${hasBuyButton}`);

    await browser.close();

    if (!isSoldOut || hasBuyButton) {
      return 'AVAILABLE';
    } else {
      return 'SOLD_OUT';
    }
  } catch (error) {
    console.error('Error during scraping:', error.message);
    await browser.close();
    throw error;
  }
}

module.exports = { checkTickets };
