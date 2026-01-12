# Slack Channel Archive Visualizer

A modern web application that transforms Slack export archives into an interactive, familiar chat interface with automated export capabilities and role-based access control.

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe component development
- **React Router DOM** for client-side routing and navigation
- **CSS3** with custom styling for Slack-like UI components
- **FileReader API** for client-side file processing

### Backend & Infrastructure
- **Vercel Serverless Functions** for scalable API endpoints
- **Node.js** runtime with ES modules
- **Slack Web API SDK** (`@slack/web-api`) for real-time data fetching
- **Cron Jobs** via Vercel for automated daily exports

### Authentication & Storage
- **SHA-256 hashing** for secure passkey authentication
- **LocalStorage API** for client-side data persistence
- **Environment variables** for secure credential management

## 🏗️ Architecture Overview

### Core Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│  Vercel Edge     │◄──►│  Slack API      │
│                 │    │  Functions       │    │                 │
│ • File Upload   │    │ • Authentication │    │ • Conversations │
│ • Chat UI       │    │ • Export API     │    │ • Users         │
│ • Role System   │    │ • Cron Jobs      │    │ • History       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow Architecture
1. **Manual Upload**: Users upload Slack export ZIP files → Client-side JSON parsing → In-memory processing
2. **Automated Export**: Cron job triggers → Slack API calls → Real-time data transformation → Client delivery
3. **Authentication**: Passkey input → SHA-256 hashing → Role-based access (Admin/Member/Guest)

## 🔧 Technical Implementation

### Slack Data Processing
- **TypeScript interfaces** define strict data contracts for Slack entities (Users, Channels, Messages)
- **Custom parser** handles Slack's complex message formatting including:
  - Rich text blocks and elements
  - User/channel mentions with ID resolution
  - Emoji mapping (300+ common Slack emojis)
  - Thread organization and reply nesting
  - Markdown formatting (bold, italic, code blocks)

### Real-time Export System
```javascript
// Automated daily export at 2 AM UTC
const exportData = {
  channels: await slack.conversations.list(),
  messages: await Promise.all(channels.map(fetchHistory)),
  users: await slack.users.list(),
  exportDate: new Date().toISOString()
};
```

### Message Threading Algorithm
- **Two-pass processing**: Separates main messages from thread replies
- **Timestamp-based sorting** maintains chronological order
- **Thread reconstruction** links replies to parent messages via `thread_ts`

### Security Features
- **Hash-based authentication** prevents plaintext password storage
- **Role-based access control** (Admin/Member/Guest permissions)
- **Environment variable isolation** for API keys and secrets
- **Client-side data sandboxing** for guest uploads

## 🎨 UI/UX Features

### Slack-Authentic Interface
- **Message bubbles** with user avatars and timestamps
- **Date markers** for chronological navigation
- **Thread indicators** showing reply counts
- **Channel sidebar** with member counts and descriptions
- **Responsive design** adapting to desktop and mobile

### Advanced Message Rendering
- **Hyperlink detection** with automatic URL parsing
- **User mention highlighting** with real name resolution
- **Channel cross-references** with clickable navigation
- **Code syntax highlighting** for inline and block code
- **Emoji rendering** with fallback text support

## 🚀 Deployment & Scaling

### Vercel Integration
- **Zero-config deployment** with automatic builds
- **Edge function distribution** for global low-latency
- **Automatic HTTPS** and custom domain support
- **Environment variable management** through Vercel dashboard

### Performance Optimizations
- **Client-side parsing** reduces server load
- **Lazy loading** for large message histories
- **Memory-efficient** data structures for large exports
- **Caching strategies** for repeated API calls

## 📊 Data Management

### Storage Strategy
- **Persistent storage** for admin-uploaded archives (LocalStorage)
- **Session storage** for guest uploads (memory-only)
- **Incremental updates** for automated exports
- **Data validation** with TypeScript interfaces

### Export Formats
- **JSON structure** matching Slack's native export format
- **Compressed file support** for large archives
- **Metadata preservation** including timestamps, reactions, files
- **User profile enrichment** with display names and avatars

## 🔄 Automated Workflows

### Cron-based Export Pipeline
```javascript
// Daily at 2 AM UTC via Vercel Cron
export default async function cronExport(req, res) {
  const channels = await fetchAllChannels();
  const messages = await fetchRecentMessages(30); // Last 30 days
  const users = await fetchUserProfiles();
  
  return transformAndDeliver({ channels, messages, users });
}
```

This architecture enables seamless Slack archive visualization with enterprise-grade security, real-time data synchronization, and an intuitive user experience that mirrors Slack's native interface.
