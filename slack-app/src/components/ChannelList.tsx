import React from 'react';
import { SlackChannel } from '../types/slack';
import './ChannelList.css';

interface ChannelListProps {
  channels: SlackChannel[];
  selectedChannel: string | null;
  onChannelSelect: (channelName: string) => void;
  availableChannels: string[];
}

const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  selectedChannel, 
  onChannelSelect,
  availableChannels
}) => {
  return (
    <div className="channel-list">
      <div className="channel-list-header">
        <h3>Channels</h3>
      </div>
      <div className="channel-list-content">
        {channels
          .filter(channel => availableChannels.includes(channel.name))
          .map(channel => (
            <div
              key={channel.id}
              className={`channel-item ${selectedChannel === channel.name ? 'selected' : ''}`}
              onClick={() => onChannelSelect(channel.name)}
            >
              <span className="channel-hash">#</span>
              <span className="channel-name">{channel.name}</span>
              {channel.is_general && (
                <span className="general-badge">General</span>
              )}
            </div>
          ))}
        
        {availableChannels.length === 0 && (
          <div className="empty-channels">
            <p>No channels available. Upload a Slack export to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
