# Slack Bot Setup for Automated Exports

This guide will help you set up a Slack Bot to enable automated data exports from your Slack workspace.

## Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter an app name (e.g., "Archive Visualizer Bot")
5. Select your workspace
6. Click "Create App"

## Step 2: Configure Bot Permissions

1. In your app settings, go to "OAuth & Permissions" in the sidebar
2. Scroll down to "Scopes" → "Bot Token Scopes"
3. Add the following scopes:
   - `channels:read` - View basic information about public channels
   - `channels:history` - View messages and other content in public channels
   - `groups:read` - View basic information about private channels
   - `groups:history` - View messages and other content in private channels
   - `users:read` - View people in the workspace

## Step 3: Install the App to Your Workspace

1. Scroll up to "OAuth Tokens for Your Workspace"
2. Click "Install to Workspace"
3. Review the permissions and click "Allow"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
5. Store this token securely - you'll need it for the `SLACK_BOT_TOKEN` environment variable

## Step 4: Configure Environment Variables

Add the following to your environment variables (Vercel dashboard or `.env` file):

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
CRON_SECRET=your-secure-random-string-here
```

Generate a secure cron secret:
```bash
openssl rand -hex 32
```

## Step 5: Set Up Automated Scheduling

### Option A: Vercel Cron (Recommended)

Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron-export?secret=your-cron-secret",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Option B: External Cron Service

Use services like:
- **Cron-job.org**: Free web-based cron service
- **EasyCron**: Reliable cron service
- **GitHub Actions**: Using workflow schedules

Set up to call:
- **URL**: `https://your-domain.vercel.app/api/cron-export`
- **Method**: GET or POST
- **Headers**: `x-cron-secret: your-cron-secret`
- **Schedule**: 
  - Until Sep 15, 2025: Every hour (`0 * * * *`)
  - After Sep 15, 2025: Daily at 2 AM (`0 2 * * *`)

### Option C: Manual Trigger

You can also manually trigger exports by calling:
```bash
curl -X POST https://your-domain.vercel.app/api/slack-export \
  -H "Content-Type: application/json" \
  -d '{"passkey": "your-admin-passkey"}'
```

## Step 6: Test the Setup

1. Test the manual export endpoint first:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/slack-export \
     -H "Content-Type: application/json" \
     -d '{"passkey": "your-admin-passkey"}'
   ```

2. Test the cron endpoint:
   ```bash
   curl -X GET "https://your-domain.vercel.app/api/cron-export?secret=your-cron-secret"
   ```

## Schedule Details

The automated system follows this schedule:

- **Until September 15, 2025**: Exports run every hour
  - Fetches messages from the last 2 hours (with overlap for safety)
  - Ensures no messages are missed during high-activity periods

- **After September 15, 2025**: Exports run once daily at 2 AM
  - Fetches messages from the last 25 hours (with overlap for safety)
  - Reduces API usage while maintaining complete coverage

## Troubleshooting

### Common Issues

1. **"not_authed" error**: Check your `SLACK_BOT_TOKEN` is correct and starts with `xoxb-`

2. **"missing_scope" error**: Ensure all required scopes are added to your bot

3. **"rate_limited" error**: The bot includes delays to avoid rate limits, but heavy usage might still trigger this

4. **"channel_not_found" error**: The bot might not have access to private channels - ensure it's added to relevant channels

### Bot Permissions

Your bot needs to be added to private channels to access their history:
1. In Slack, go to the private channel
2. Type `/invite @your-bot-name`
3. The bot will now have access to that channel's history

### Monitoring

Check your Vercel function logs to monitor the automated exports:
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Functions" tab
4. Click on the cron-export function to view logs

## Security Notes

- Never commit your `SLACK_BOT_TOKEN` to version control
- Use environment variables for all sensitive data
- The `CRON_SECRET` prevents unauthorized access to your cron endpoint
- Bot tokens have limited permissions and can be revoked if needed
- All data is processed server-side and never exposed to the frontend

## Data Storage Integration

The current implementation returns the exported data as API responses. For production use, you may want to:

1. **Store in a database** (PostgreSQL, MongoDB, etc.)
2. **Save to cloud storage** (AWS S3, Google Cloud Storage, etc.)
3. **Update the existing browser storage** through WebSocket connections
4. **Send notifications** when new data is available

The exported data structure matches the existing `SlackExport` interface, so it's compatible with your current visualization system.
