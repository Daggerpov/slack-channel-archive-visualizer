# Environment Variables Setup

This application uses secure server-side authentication via Vercel Serverless Functions. The passkey hashes are stored securely on the backend and never exposed to the browser.

## Required Environment Variables

- `CLUB_PASSKEY_HASH` - Hash of the club member passkey (server-side only)
- `ADMIN_PASSKEY_HASH` - Hash of the admin passkey (server-side only)

## Security Architecture

🔒 **Enhanced Security**: The application now uses Vercel Serverless Functions to handle authentication:

- **Frontend**: Only sends the passkey to `/api/auth` endpoint
- **Backend**: Validates passkey against secure environment variables
- **Environment Variables**: No longer prefixed with `REACT_APP_` - they stay on the server

This prevents any exposure of authentication secrets in the browser bundle.

## Local Development Setup

Create a `.env` file in the **project root** (not in slack-app directory) with the appropriate passkey hashes. See the private documentation for specific values.

## Vercel Deployment Setup

In your Vercel dashboard → Project → Settings → Environment Variables, add the required `CLUB_PASSKEY_HASH` and `ADMIN_PASSKEY_HASH` values. Refer to the private documentation for the specific hash values.

These variables will be available to your serverless functions but never exposed to the frontend.

## API Endpoints

- `POST /api/auth` - Validates passkey and returns user role
  - Request: `{ "passkey": "user_input" }`
  - Response: `{ "success": true, "role": "admin|club", "message": "..." }`
