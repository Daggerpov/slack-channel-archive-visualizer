# Slack Channel Archive Visualizer

A React application for viewing and exploring Slack channel exports in a familiar interface with authentication and role-based access control.

## Features

- **Authentication Gateway**: Secure access with passkey-based authentication
- **Role-Based Access Control**: Different access levels for guests, club members, and administrators
- **Automated Slack Exports**: Scheduled data fetching via Slack API with smart scheduling
- **Persistent Storage**: Uploaded archives are stored locally for future access
- **Familiar Interface**: Slack-like UI for easy navigation and message viewing
- **Responsive Design**: Works on desktop and mobile devices

## Authentication System

The application uses a three-tier authentication system:

### Access Levels

1. **Guest Access**: 
   - Upload and visualize your own Slack export locally
   - Data is temporary and not saved permanently
   - No passkey required

2. **Club Members**:
   - Full access to view archives
   - Cannot upload new archives
   - Requires club member passkey (see environment setup)

3. **Administrators**:
   - Full access to view archives
   - Can upload new Slack exports
   - Can replace existing archives
   - Can trigger manual automated exports
   - Requires admin passkey (see environment setup)

### Environment Configuration

🔒 **Security Update**: This application now uses secure server-side authentication via Vercel Serverless Functions.

See the `ENVIRONMENT_SETUP.md` and `SLACK_BOT_SETUP.md` files in the project root for detailed setup instructions including:
- Secure environment variable configuration
- Slack Bot setup for automated exports
- Vercel deployment setup
- Local development setup

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the slack-app directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables (see `ENVIRONMENT_SETUP.md` in project root)
5. Start the development server:
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000).

## Usage

### For Guests
1. Visit the application
2. Click "Continue as Guest"
3. Upload your own Slack export folder to visualize locally
4. Data is temporary and will be lost when you close the browser or logout

### For Club Members
1. Visit the application
2. Enter your club member passkey
3. Access full archive viewing capabilities

### For Administrators
1. Visit the application
2. Enter your admin passkey
3. Upload new Slack exports or view existing archives
4. Use "Upload New Export" to replace the current archive

**Note**: Contact your system administrator for the current passkeys.

### Slack Data Management

#### Automated Exports (Recommended)
1. Set up a Slack Bot following the `SLACK_BOT_SETUP.md` guide
2. Configure environment variables for automated fetching
3. The system will automatically:
   - Fetch data daily at 2:00 AM
   - Update the archive with new messages from the last 25 hours
   - Ensure complete message coverage with overlap

#### Manual Uploads
1. Export your Slack workspace data from Slack's admin settings
2. Extract the downloaded ZIP file
3. As an administrator, use the file upload interface
4. Select the entire extracted folder containing `channels.json`, `users.json`, and channel folders

## Data Storage

- Archives are stored in the browser's local storage
- Authentication sessions expire after 24 hours
- Data persists between browser sessions until manually cleared

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: This is a one-way operation!** Removes the single build dependency and copies all configuration files.

## Security Notes

- 🔒 **Enhanced Security**: Uses Vercel Serverless Functions for secure authentication
- Passkey hashes are stored server-side and never exposed to the browser
- Authentication sessions are temporary and stored locally
- Environment variables are properly secured and not committed to version control
- The `.env` file is excluded from git via `.gitignore`

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Slack Export Documentation](https://slack.com/help/articles/201658943-Export-your-workspace-data)
