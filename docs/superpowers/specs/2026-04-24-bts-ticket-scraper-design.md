# Design Spec: BTS World Tour Ticket Scraper (Colombia 2026)

## Overview
A resilient, automated monitoring system designed to detect ticket re-releases for the BTS World Tour in Bogotá. The system leverages GitHub Actions for free, scheduled execution and Playwright Stealth to bypass TicketMaster's aggressive anti-bot protections.

## Architecture
- **Engine**: Node.js with Playwright.
- **Stealth**: `playwright-extra` + `puppeteer-extra-plugin-stealth` to mimic human behavior.
- **Scheduler**: GitHub Actions `schedule` (cron: `*/5 * * * *`).
- **State Management**: GitHub Actions Cache to store `state.json` (prevents duplicate alerts).
- **Notifications**: Discord Webhooks and Telegram Bot API.

## Data Flow
1. **Trigger**: GitHub Action runs every 5 minutes.
2. **Fetch State**: Restore `state.json` from GitHub Cache.
3. **Scrape**: 
   - Launch Headless Chromium.
   - Navigate to `https://www.ticketmaster.co/event/bts-world-tour-2026`.
   - Wait for the "Sale Section" to load.
   - Extract text content or check for the absence of the `AGOTADO` keyword.
4. **Compare**:
   - If `Current Status != Last Known Status`:
     - Send Discord Alert.
     - Send Telegram Alert.
   - If `Current Status == "Available"`:
     - (Optional) Send recurring alert if still available after X minutes.
5. **Persistence**: Save `Current Status` to `state.json` and update GitHub Cache.

## Security & Secrets
The following secrets MUST be configured in the GitHub Repository settings:
- `DISCORD_WEBHOOK_URL`: Full URL of the Discord webhook.
- `TELEGRAM_BOT_TOKEN`: Token from @BotFather.
- `TELEGRAM_CHAT_ID`: Your unique Telegram ID.

## Success Criteria
- [ ] Successfully bypasses Akamai/Cloudflare challenges on initial load.
- [ ] Correctness: Detects "AGOTADO" vs "COMPRAR" (or absence of AGOTADO).
- [ ] Reliability: Runs consistently every 5-10 minutes.
- [ ] Security: API keys never exposed in logs or code.
