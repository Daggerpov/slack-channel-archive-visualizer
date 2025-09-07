import { SlackChannel, SlackUser, SlackMessage, SlackExport, ChannelData } from '../types/slack';

// Common Slack emoji mappings
const EMOJI_MAP: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  'heart': '❤️',
  'joy': '😂',
  'ok_hand': '👌',
  'bangbang': '‼️',
  '100': '💯',
  'face_with_cowboy_hat': '🤠',
  'fire': '🔥',
  'eyes': '👀',
  'clap': '👏',
  'raised_hands': '🙌',
  'pray': '🙏',
  'thinking_face': '🤔',
  'smile': '😄',
  'grin': '😁',
  'laughing': '😆',
  'wink': '😉',
  'blush': '😊',
  'yum': '😋',
  'relieved': '😌',
  'heart_eyes': '😍',
  'sunglasses': '😎',
  'smirk': '😏',
  'neutral_face': '😐',
  'expressionless': '😑',
  'unamused': '😒',
  'sweat_smile': '😅',
  'sweat': '😓',
  'disappointed_relieved': '😥',
  'weary': '😩',
  'pensive': '😔',
  'confused': '😕',
  'confounded': '😖',
  'kissing_heart': '😘',
  'kissing_closed_eyes': '😚',
  'stuck_out_tongue_winking_eye': '😜',
  'stuck_out_tongue_closed_eyes': '😝',
  'disappointed': '😞',
  'worried': '😟',
  'angry': '😠',
  'rage': '😡',
  'cry': '😢',
  'persevere': '😣',
  'triumph': '😤',
  'frowning': '😦',
  'anguished': '😧',
  'fearful': '😨',
  'cold_sweat': '😰',
  'hushed': '😯',
  'flushed': '😳',
  'dizzy_face': '😵',
  'mask': '😷',
  'sleeping': '😴',
  'zzz': '💤',
  'hankey': '💩',
  'poop': '💩',
  'shit': '💩',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'punch': '👊',
  'fist': '✊',
  'v': '✌️',
  'wave': '👋',
  'hand': '✋',
  'open_hands': '👐',
  'point_up': '☝️',
  'point_down': '👇',
  'point_left': '👈',
  'point_right': '👉',
  'muscle': '💪',
  'metal': '🤘',
  'fu': '🖕',
  'runner': '🏃',
  'couple': '👫',
  'family': '👪',
  'two_men_holding_hands': '👬',
  'two_women_holding_hands': '👭',
  'dancer': '💃',
  'dancers': '👯',
  'ok_woman': '🙆',
  'no_good': '🙅',
  'information_desk_person': '💁',
  'raising_hand': '🙋',
  'bride_with_veil': '👰',
  'person_with_pouting_face': '🙎',
  'person_frowning': '🙍',
  'bow': '🙇',
  'couplekiss': '💏',
  'couple_with_heart': '💑',
  'massage': '💆',
  'haircut': '💇',
  'nail_care': '💅',
  'boy': '👦',
  'girl': '👧',
  'woman': '👩',
  'man': '👨',
  'baby': '👶',
  'older_woman': '👵',
  'older_man': '👴',
  'man_with_gua_pi_mao': '👲',
  'man_with_turban': '👳',
  'construction_worker': '👷',
  'cop': '👮',
  'angel': '👼',
  'princess': '👸',
  'smiley_cat': '😺',
  'smile_cat': '😸',
  'heart_eyes_cat': '😻',
  'kissing_cat': '😽',
  'smirk_cat': '😼',
  'scream_cat': '🙀',
  'crying_cat_face': '😿',
  'joy_cat': '😹',
  'pouting_cat': '😾',
  'japanese_ogre': '👹',
  'japanese_goblin': '👺',
  'see_no_evil': '🙈',
  'hear_no_evil': '🙉',
  'speak_no_evil': '🙊',
  'skull': '💀',
  'alien': '👽',
  'sparkles': '✨',
  'star': '⭐',
  'star2': '🌟',
  'dizzy': '💫',
  'boom': '💥',
  'collision': '💥',
  'anger': '💢',
  'sweat_drops': '💦',
  'droplet': '💧',
  'dash': '💨',
  'ocean': '🌊',
  'cat': '🐱',
  'dog': '🐶',
  'mouse': '🐭',
  'hamster': '🐹',
  'rabbit': '🐰',
  'wolf': '🐺',
  'frog': '🐸',
  'tiger': '🐯',
  'koala': '🐨',
  'bear': '🐻',
  'pig': '🐷',
  'pig_nose': '🐽',
  'cow': '🐮',
  'boar': '🐗',
  'monkey_face': '🐵',
  'monkey': '🐒',
  'horse': '🐴',
  'racehorse': '🐎',
  'camel': '🐫',
  'sheep': '🐑',
  'elephant': '🐘',
  'panda_face': '🐼',
  'snake': '🐍',
  'bird': '🐦',
  'baby_chick': '🐤',
  'hatched_chick': '🐥',
  'hatching_chick': '🐣',
  'chicken': '🐔',
  'penguin': '🐧',
  'turtle': '🐢',
  'bug': '🐛',
  'honeybee': '🐝',
  'ant': '🐜',
  'beetle': '🐞',
  'snail': '🐌',
  'octopus': '🐙',
  'tropical_fish': '🐠',
  'fish': '🐟',
  'whale': '🐳',
  'whale2': '🐋',
  'dolphin': '🐬',
  'cow2': '🐄',
  'ram': '🐏',
  'rat': '🐀',
  'water_buffalo': '🐃',
  'tiger2': '🐅',
  'rabbit2': '🐇',
  'dragon': '🐉',
  'goat': '🐐',
  'rooster': '🐓',
  'dog2': '🐕',
  'pig2': '🐖',
  'mouse2': '🐁',
  'ox': '🐂',
  'dragon_face': '🐲',
  'blowfish': '🐡',
  'crocodile': '🐊',
  'dromedary_camel': '🐪',
  'leopard': '🐆',
  'cat2': '🐈',
  'poodle': '🐩',
  'paw_prints': '🐾',
  'bouquet': '💐',
  'cherry_blossom': '🌸',
  'tulip': '🌷',
  'four_leaf_clover': '🍀',
  'rose': '🌹',
  'sunflower': '🌻',
  'hibiscus': '🌺',
  'maple_leaf': '🍁',
  'leaves': '🍃',
  'fallen_leaf': '🍂',
  'herb': '🌿',
  'mushroom': '🍄',
  'cactus': '🌵',
  'palm_tree': '🌴',
  'evergreen_tree': '🌲',
  'deciduous_tree': '🌳',
  'chestnut': '🌰',
  'seedling': '🌱',
  'blossom': '🌼',
  'ear_of_rice': '🌾',
  'shell': '🐚',
  'globe_with_meridians': '🌐',
  'sun_with_face': '🌞',
  'full_moon_with_face': '🌝',
  'new_moon_with_face': '🌚',
  'new_moon': '🌑',
  'waxing_crescent_moon': '🌒',
  'first_quarter_moon': '🌓',
  'waxing_gibbous_moon': '🌔',
  'full_moon': '🌕',
  'waning_gibbous_moon': '🌖',
  'last_quarter_moon': '🌗',
  'waning_crescent_moon': '🌘',
  'last_quarter_moon_with_face': '🌜',
  'first_quarter_moon_with_face': '🌛',
  'moon': '🌔',
  'earth_africa': '🌍',
  'earth_americas': '🌎',
  'earth_asia': '🌏',
  'volcano': '🌋',
  'milky_way': '🌌',
  'partly_sunny': '⛅',
  'octocat': '🐙', // GitHub's octocat, using octopus as fallback
  'squirrel': '🐿️',
  // Add more as needed
};

export class SlackParser {
  static getEmojiFromName(name: string): string {
    return EMOJI_MAP[name] || `:${name}:`;
  }

  static async parseSlackExport(files: FileList): Promise<SlackExport> {
    const channels: SlackChannel[] = [];
    const users: SlackUser[] = [];
    const messages: Record<string, SlackMessage[]> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await this.readFileAsText(file);
      
      try {
        const data = JSON.parse(content);
        
        if (file.name === 'channels.json') {
          channels.push(...data);
        } else if (file.name === 'users.json') {
          users.push(...data);
        } else if (file.name.endsWith('.json') && file.name.includes('-')) {
          // This is likely a message file (e.g., 2025-06-07.json)
          const pathParts = file.webkitRelativePath?.split('/') || [];
          const channelName = pathParts[pathParts.length - 2] || 'unknown';
          
          if (!messages[channelName]) {
            messages[channelName] = [];
          }
          messages[channelName].push(...data);
        }
      } catch (error) {
        console.warn(`Failed to parse file ${file.name}:`, error);
      }
    }

    return { channels, users, messages };
  }

  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static formatTimestamp(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleString();
  }

  static formatTime(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  static formatDateTime(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // For other dates, show the full date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString([], options);
  }

  static formatDateMarker(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For other dates, show the full date
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    };
    
    return date.toLocaleDateString([], options);
  }

  static isSameDay(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(parseFloat(timestamp1) * 1000);
    const date2 = new Date(parseFloat(timestamp2) * 1000);
    return date1.toDateString() === date2.toDateString();
  }

  static getUserById(users: SlackUser[], userId: string): SlackUser | undefined {
    return users.find(user => user.id === userId);
  }

  static getChannelById(channels: SlackChannel[], channelId: string): SlackChannel | undefined {
    return channels.find(channel => channel.id === channelId);
  }

  static sortMessagesByTimestamp(messages: SlackMessage[]): SlackMessage[] {
    return messages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
  }

  static organizeMessagesWithThreads(messages: SlackMessage[]): SlackMessage[] {
    const sortedMessages = this.sortMessagesByTimestamp(messages);
    const threadMap = new Map<string, SlackMessage[]>();
    const mainMessages: SlackMessage[] = [];

    // First pass: separate thread replies from main messages
    sortedMessages.forEach(message => {
      if (message.thread_ts && message.thread_ts !== message.ts) {
        // This is a reply in a thread
        if (!threadMap.has(message.thread_ts)) {
          threadMap.set(message.thread_ts, []);
        }
        threadMap.get(message.thread_ts)!.push(message);
      } else {
        // This is a main message (could be start of a thread)
        mainMessages.push(message);
      }
    });

    // Second pass: attach replies to their parent messages
    mainMessages.forEach(message => {
      if (threadMap.has(message.ts)) {
        // This message has replies
        const replies = threadMap.get(message.ts)!;
        message.replies = replies.map(reply => ({
          user: reply.user || '',
          ts: reply.ts
        }));
        message.reply_count = replies.length;
        // Add the actual reply messages as a custom property
        (message as any).thread_replies = replies;
      }
    });

    return mainMessages;
  }

  static processChannelData(
    channelName: string,
    channels: SlackChannel[],
    users: SlackUser[],
    messages: Record<string, SlackMessage[]>
  ): ChannelData | null {
    const channel = channels.find(c => c.name === channelName);
    if (!channel) return null;

    const channelMessages = messages[channelName] || [];
    const organizedMessages = this.organizeMessagesWithThreads(channelMessages);

    return {
      channel,
      messages: organizedMessages,
      users
    };
  }

  static renderMessageText(message: SlackMessage, users: SlackUser[]): string {
    let text = message.text;

    // Replace user mentions
    text = text.replace(/<@([UW][A-Z0-9]+)>/g, (match, userId) => {
      const user = this.getUserById(users, userId);
      return user ? `${user.real_name || user.name}` : match;
    });

    // Replace channel mentions
    text = text.replace(/<#([C][A-Z0-9]+)\|([^>]+)>/g, (match, channelId, channelName) => {
      return `#${channelName}`;
    });

    // Replace special mentions
    text = text.replace(/<!everyone>/g, '@everyone');
    text = text.replace(/<!channel>/g, '@channel');
    text = text.replace(/<!here>/g, '@here');

    return text;
  }

  static parseMessageTextToElements(message: SlackMessage, users: SlackUser[]): (string | { type: 'link' | 'user_mention' | 'channel_mention' | 'special_mention'; url?: string; text: string; userId?: string })[] {
    let text = message.text;
    const elements: (string | { type: 'link' | 'user_mention' | 'channel_mention' | 'special_mention'; url?: string; text: string; userId?: string })[] = [];
    
    // Combined regex for all special elements
    const combinedRegex = /<(https?:\/\/[^|>]+)(\|([^>]+))?|<@([UW][A-Z0-9]+)>|<#([C][A-Z0-9]+)\|([^>]+)>|<!everyone>|<!channel>|<!here>/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // URL match
        const url = match[1];
        const linkText = match[3] || url;
        elements.push({ type: 'link', url, text: linkText });
      } else if (match[4]) {
        // User mention match
        const userId = match[4];
        const user = this.getUserById(users, userId);
        const displayName = user ? `@${user.real_name || user.name}` : match[0];
        elements.push({ type: 'user_mention', text: displayName, userId });
      } else if (match[5] && match[6]) {
        // Channel mention match
        const channelName = match[6];
        elements.push({ type: 'channel_mention', text: `#${channelName}` });
      } else if (match[0] === '<!everyone>') {
        elements.push({ type: 'special_mention', text: '@everyone' });
      } else if (match[0] === '<!channel>') {
        elements.push({ type: 'special_mention', text: '@channel' });
      } else if (match[0] === '<!here>') {
        elements.push({ type: 'special_mention', text: '@here' });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    // If no special elements were found, return the text as a single element
    if (elements.length === 0) {
      elements.push(text);
    }

    return elements;
  }
}
