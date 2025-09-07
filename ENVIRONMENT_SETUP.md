# Environment Variables Setup

This application uses secure server-side authentication via Vercel Serverless Functions. The passkey hashes are stored securely on the backend and never exposed to the browser.

## Required Environment Variables

### Authentication
- `CLUB_PASSKEY_HASH` - Hash of the club member passkey (server-side only)
- `ADMIN_PASSKEY_HASH` - Hash of the admin passkey (server-side only)

### Slack API Integration (for automated exports)
- `SLACK_BOT_TOKEN` - Slack Bot User OAuth Token (starts with `xoxb-`)
- `CRON_SECRET` - Secret key for authenticating cron job requests

## Security Architecture

🔒 **Enhanced Security**: The application now uses Vercel Serverless Functions to handle authentication:

- **Frontend**: Only sends the passkey to `/api/auth` endpoint
- **Backend**: Validates passkey against secure environment variables
- **Environment Variables**: No longer prefixed with `REACT_APP_` - they stay on the server

This prevents any exposure of authentication secrets in the browser bundle.

## Local Development Setup

Create a `.env` file in the **project root** (not in slack-app directory) with the appropriate passkey hashes. See the private documentation for specific values.

## Vercel Deployment Setup

In your Vercel dashboard → Project → Settings → Environment Variables, add the required variables:

### Authentication Variables
- `CLUB_PASSKEY_HASH` and `ADMIN_PASSKEY_HASH` - Refer to the private documentation for specific hash values

### Slack API Variables (for automated exports)
- `SLACK_BOT_TOKEN` - Your Slack Bot User OAuth Token
- `CRON_SECRET` - A secure random string for authenticating cron requests (generate with `openssl rand -hex 32`)

These variables will be available to your serverless functions but never exposed to the frontend.

## API Endpoints

### Authentication
- `POST /api/auth` - Validates passkey and returns user role
  - Request: `{ "passkey": "user_input" }`
  - Response: `{ "success": true, "role": "admin|club", "message": "..." }`

### Slack Export Automation
- `POST /api/slack-export` - Manual trigger for Slack data export (admin only)
  - Request: `{ "passkey": "admin_passkey" }`
  - Response: `{ "success": true, "data": {...}, "message": "..." }`

- `GET|POST /api/cron-export` - Automated cron endpoint for scheduled exports
  - Headers: `x-cron-secret: your_cron_secret` OR Query: `?secret=your_cron_secret`
  - Response: `{ "success": true, "data": {...}, "schedule": {...} }`
