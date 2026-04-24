# Implementation Plan: BTS Ticket Scraper

## Phase 1: Project Initialization
- [ ] Initialize `npm init -y`.
- [ ] Install dependencies:
    - `playwright`: Core browser automation.
    - `playwright-extra`: To enable plugins.
    - `puppeteer-extra-plugin-stealth`: To bypass TicketMaster detection.
    - `axios`: For sending webhook notifications.
    - `dotenv`: For local testing (handling secrets).

## Phase 2: Core Scraper Implementation
- [ ] Create `scraper.js`:
    - Setup Playwright with Stealth plugin.
    - Logic to navigate to the URL.
    - Logic to wait for the availability indicators (`AGOTADO`).
    - Logic to return a simple status: `"SOLD_OUT"` or `"AVAILABLE"`.

## Phase 3: State & Notification Logic
- [ ] Create `index.js`:
    - Read `state.json` (last known status).
    - Call `scraper.js`.
    - If status changed, call notification functions.
    - Update `state.json`.
- [ ] Implement `notify.js`:
    - `sendDiscord(message)`: POST to Discord Webhook.
    - `sendTelegram(message)`: POST to Telegram API.

## Phase 4: GitHub Action Integration
- [ ] Create `.github/workflows/scrape.yml`:
    - Configure schedule (cron: `*/5 * * * *`).
    - Configure `actions/setup-node`.
    - Configure `actions/cache` for `state.json`.
    - Map GitHub Secrets (`DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) to environment variables.

## Phase 5: Verification & Setup Guide
- [ ] Run a manual test in headless mode.
- [ ] Provide the user with a step-by-step guide to:
    1. Create a Discord Webhook.
    2. Create a Telegram Bot.
    3. Add Secrets to the GitHub Repository.
