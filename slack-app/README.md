# Slack Channel Archive Visualizer

A React application for viewing and exploring Slack channel exports in a familiar interface with authentication and role-based access control.

## Features

- **Authentication Gateway**: Secure access with passkey-based authentication
- **Role-Based Access Control**: Different access levels for guests, club members, and administrators
- **Persistent Storage**: Uploaded archives are stored locally for future access
- **Familiar Interface**: Slack-like UI for easy navigation and message viewing
- **Responsive Design**: Works on desktop and mobile devices

## Authentication System

The application uses a three-tier authentication system:

### Access Levels

1. **Guest Access**: 
   - View the latest uploaded archive
   - No upload capabilities
   - No passkey required

2. **Club Members** (Passkey: `mmhcgrit`):
   - Full access to view archives
   - Cannot upload new archives

3. **Administrators** (Passkey: `mmhcgrit2025!`):
   - Full access to view archives
   - Can upload new Slack exports
   - Can replace existing archives

### Environment Configuration

The application uses environment variables for passkey configuration. Create a `.env` file in the project root:

```env
REACT_APP_CLUB_PASSKEY=mmhcgrit
REACT_APP_ADMIN_PASSKEY=mmhcgrit2025!
```

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
4. Create a `.env` file with the required passkeys (see above)
5. Start the development server:
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000).

## Usage

### For Guests
1. Visit the application
2. Click "Continue as Guest"
3. View the latest uploaded archive (if available)

### For Club Members
1. Visit the application
2. Enter the club passkey: `mmhcgrit`
3. Access full archive viewing capabilities

### For Administrators
1. Visit the application
2. Enter the admin passkey: `mmhcgrit2025!`
3. Upload new Slack exports or view existing archives
4. Use "Upload New Export" to replace the current archive

### Uploading Slack Exports

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

- Passkeys are stored in environment variables and not committed to version control
- Authentication sessions are temporary and stored locally
- The `.env` file is excluded from git via `.gitignore`

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Slack Export Documentation](https://slack.com/help/articles/201658943-Export-your-workspace-data)
