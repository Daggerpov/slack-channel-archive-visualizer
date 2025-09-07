import { WebClient } from '@slack/web-api';

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const { passkey } = req.body;
    if (!passkey) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Secure hash function using Node.js built-in crypto (same as used in auth.js)
    const crypto = require('crypto');
    const secureHash = (str) => {
      return crypto.createHash('sha256').update(str).digest('hex');
    };

    const inputHash = secureHash(passkey);
    const adminPasskeyHash = process.env.ADMIN_PASSKEY_HASH;

    if (inputHash !== adminPasskeyHash) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    // Check if Slack token is configured
    if (!process.env.SLACK_BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'Slack bot token not configured. Please set SLACK_BOT_TOKEN environment variable.' 
      });
    }

    console.log('Starting automated Slack export...');

    // Fetch workspace info
    const authTest = await slack.auth.test();
    console.log(`Connected to workspace: ${authTest.team}`);

    // Fetch all channels
    const channelsResponse = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 1000
    });

    const channels = channelsResponse.channels || [];
    console.log(`Found ${channels.length} channels`);

    // Fetch users
    const usersResponse = await slack.users.list({
      limit: 1000
    });

    const users = usersResponse.members || [];
    console.log(`Found ${users.length} users`);

    // Create users lookup
    const usersById = {};
    users.forEach(user => {
      usersById[user.id] = user;
    });

    // Fetch messages for each channel
    const channelMessages = {};
    const channelData = {};

    for (const channel of channels) {
      try {
        console.log(`Fetching messages for channel: ${channel.name}`);
        
        // Get channel history (last 30 days by default)
        const thirtyDaysAgo = Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000);
        
        const historyResponse = await slack.conversations.history({
          channel: channel.id,
          oldest: thirtyDaysAgo.toString(),
          limit: 1000
        });

        const messages = historyResponse.messages || [];
        console.log(`Found ${messages.length} messages in ${channel.name}`);

        // Transform messages to match the expected format
        const transformedMessages = messages.map(message => ({
          ...message,
          user_profile: usersById[message.user] ? {
            display_name: usersById[message.user].profile?.display_name || usersById[message.user].real_name || usersById[message.user].name,
            real_name: usersById[message.user].real_name || usersById[message.user].name,
            image_72: usersById[message.user].profile?.image_72
          } : null
        }));

        channelMessages[channel.name] = transformedMessages;
        channelData[channel.name] = {
          id: channel.id,
          name: channel.name,
          created: channel.created,
          creator: channel.creator,
          is_archived: channel.is_archived,
          is_general: channel.is_general,
          members: channel.num_members || 0,
          purpose: channel.purpose?.value || '',
          topic: channel.topic?.value || ''
        };

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (channelError) {
        console.error(`Error fetching messages for channel ${channel.name}:`, channelError);
        // Continue with other channels even if one fails
        channelMessages[channel.name] = [];
        channelData[channel.name] = {
          id: channel.id,
          name: channel.name,
          created: channel.created,
          creator: channel.creator,
          is_archived: channel.is_archived,
          is_general: channel.is_general,
          members: channel.num_members || 0,
          purpose: channel.purpose?.value || '',
          topic: channel.topic?.value || ''
        };
      }
    }

    // Create the export data structure
    const exportData = {
      channels: channelData,
      messages: channelMessages,
      users: usersById,
      exportDate: new Date().toISOString(),
      totalChannels: channels.length,
      totalUsers: users.length,
      totalMessages: Object.values(channelMessages).reduce((sum, msgs) => sum + msgs.length, 0)
    };

    console.log(`Export completed: ${exportData.totalChannels} channels, ${exportData.totalUsers} users, ${exportData.totalMessages} messages`);

    return res.status(200).json({
      success: true,
      data: exportData,
      message: `Successfully exported ${exportData.totalChannels} channels with ${exportData.totalMessages} messages`
    });

  } catch (error) {
    console.error('Slack export error:', error);
    
    // Handle specific Slack API errors
    if (error.code === 'not_authed') {
      return res.status(401).json({ 
        error: 'Slack authentication failed. Please check your bot token.' 
      });
    } else if (error.code === 'missing_scope') {
      return res.status(403).json({ 
        error: 'Insufficient Slack permissions. Bot needs channels:read, channels:history, users:read scopes.' 
      });
    } else if (error.code === 'rate_limited') {
      return res.status(429).json({ 
        error: 'Rate limited by Slack API. Please try again later.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to export Slack data',
      details: error.message 
    });
  }
}
