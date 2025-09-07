import { WebClient } from '@slack/web-api';

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Function to determine time range based on the date
function getTimeRangeHours() {
  const now = new Date();
  const cutoffDate = new Date('2025-09-15T00:00:00Z');
  
  if (now < cutoffDate) {
    // Before Sep 15, 2025: Get last 25 hours to ensure we don't miss messages
    // (since we can only run daily, we need a longer window)
    return 25;
  } else {
    // After Sep 15, 2025: Get last 25 hours (standard daily window)
    return 25;
  }
}

export default async function handler(req, res) {
  // This endpoint can be called by external cron services or Vercel Cron
  // It can accept both GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the request is authorized (using a cron secret or Vercel cron header)
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret || req.body?.secret;
    const isVercelCron = req.headers['user-agent']?.includes('vercel-cron') || 
                        req.headers['x-vercel-cron'] === '1';
    
    // Allow Vercel's internal cron calls or requests with valid cron secret
    if (!isVercelCron && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    // Check if Slack token is configured
    if (!process.env.SLACK_BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'Slack bot token not configured. Please set SLACK_BOT_TOKEN environment variable.' 
      });
    }

    const scheduleType = 'daily';
    
    console.log(`Running automated Slack export (${scheduleType} schedule)...`);

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

    // Determine time range for messages
    const timeRangeHours = getTimeRangeHours();

    const timeRangeMs = timeRangeHours * 60 * 60 * 1000;
    const oldestTimestamp = Math.floor((Date.now() - timeRangeMs) / 1000);

    // Fetch messages for each channel
    const channelMessages = {};
    const channelData = {};
    let totalNewMessages = 0;

    for (const channel of channels) {
      try {
        console.log(`Fetching recent messages for channel: ${channel.name}`);
        
        const historyResponse = await slack.conversations.history({
          channel: channel.id,
          oldest: oldestTimestamp.toString(),
          limit: 1000
        });

        const messages = historyResponse.messages || [];
        totalNewMessages += messages.length;
        console.log(`Found ${messages.length} recent messages in ${channel.name}`);

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

    // Create the incremental export data structure
    const exportData = {
      channels: channelData,
      messages: channelMessages,
      users: usersById,
      exportDate: new Date().toISOString(),
      scheduleType: scheduleType,
      timeRangeHours: timeRangeHours,
      totalChannels: channels.length,
      totalUsers: users.length,
      totalNewMessages: totalNewMessages,
      isIncremental: true
    };

    console.log(`${scheduleType} export completed: ${exportData.totalChannels} channels, ${exportData.totalUsers} users, ${totalNewMessages} new messages`);

    // Here you could store the data in a database or file system
    // For now, we'll just return it as a response
    // In a production setup, you might want to:
    // 1. Store in a database
    // 2. Update the existing data instead of replacing it
    // 3. Send notifications about the update

    return res.status(200).json({
      success: true,
      data: exportData,
      message: `Successfully completed ${scheduleType} export: ${totalNewMessages} new messages from ${exportData.totalChannels} channels`,
      schedule: {
        type: scheduleType,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day at same time
        timeRangeHours: timeRangeHours
      }
    });

  } catch (error) {
    console.error('Automated Slack export error:', error);
    
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
      error: 'Failed to run automated Slack export',
      details: error.message 
    });
  }
}
