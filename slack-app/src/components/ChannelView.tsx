import React from 'react';
import { ChannelData } from '../types/slack';
import SlackMessage from './SlackMessage';
import './ChannelView.css';

interface ChannelViewProps {
  channelData: ChannelData;
}

const ChannelView: React.FC<ChannelViewProps> = ({ channelData }) => {
  const { channel, messages, users } = channelData;

  return (
    <div className="channel-view">
      <div className="channel-header">
        <div className="channel-info">
          <h2 className="channel-name">#{channel.name}</h2>
          {channel.topic.value && (
            <p className="channel-topic">{channel.topic.value}</p>
          )}
          <div className="channel-meta">
            <span className="member-count">{channel.members.length} members</span>
            {channel.purpose.value && (
              <span className="channel-purpose"> • {channel.purpose.value}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages in this channel.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Check if we should show avatar (first message or different user from previous)
            const showAvatar = index === 0 || 
              messages[index - 1].user !== message.user ||
              message.subtype !== undefined;
            
            return (
              <SlackMessage
                key={`${message.ts}-${index}`}
                message={message}
                users={users}
                showAvatar={showAvatar}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChannelView;
