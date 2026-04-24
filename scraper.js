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
    await page.goto('https://www.ticketmaster.co/event/bts-world-tour-2026', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for the main content to load
    await page.waitForTimeout(5000); // Give it extra time for dynamic elements

    const content = await page.content();
    
    // Check for "AGOTADO" text
    const isSoldOut = content.includes('AGOTADO') || content.includes('Agotado');
    
    // Check for "COMPRAR" or "Tickets" buttons which might indicate availability
    const hasBuyButton = content.includes('COMPRAR') || content.includes('Comprar') || content.includes('TICKETS');

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
