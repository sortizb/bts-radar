# BTS World Tour 2026 - Ticket Monitor (Colombia)

This bot automatically monitors the TicketMaster Colombia website for any ticket re-releases for the BTS World Tour in Bogotá. It runs every 5 minutes using GitHub Actions and sends notifications to Discord and Telegram.

## Features
- **Stealth Monitoring**: Uses Playwright Stealth to avoid being blocked by TicketMaster.
- **Smart Alerts**: Only notifies you when the status changes (e.g., from Sold Out to Available).
- **Free Hosting**: Runs entirely on GitHub Actions.

## Setup Instructions

### 1. Create a Discord Webhook
1. Open your Discord server and go to **Server Settings** > **Integrations**.
2. Click **Webhooks** > **New Webhook**.
3. Copy the **Webhook URL**.

### 2. Create a Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram and type `/newbot`.
2. Follow the instructions to get your **Bot Token**.
3. To get your **Chat ID**, message [@userinfobot](https://t.me/userinfobot).

### 3. Configure GitHub Secrets
1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Add the following **Repository secrets**:
   - `DISCORD_WEBHOOK_URL`: Your Discord Webhook URL.
   - `TELEGRAM_BOT_TOKEN`: Your Telegram Bot Token.
   - `TELEGRAM_CHAT_ID`: Your Telegram Chat ID.

### 4. Enable GitHub Actions
1. Go to the **Actions** tab in your repository.
2. If prompted, click **I understand my workflows, go ahead and enable them**.
3. You can manually trigger the monitor by selecting the **BTS Ticket Monitor** workflow and clicking **Run workflow**.

## How it works
The bot checks for the keyword `AGOTADO` on the event page. If it's missing or a `COMPRAR` button is found, it triggers an alert. The state is saved in `data/state.json` to prevent duplicate notifications.

## Tech Stack
- **Language**: Node.js
- **Automation**: Playwright + Playwright Stealth
- **Notifications**: Axios
- **CI/CD**: GitHub Actions
