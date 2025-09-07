import React from 'react';
import { ChannelData } from '../types/slack';
import { SlackParser } from '../utils/slackParser';
import SlackMessage from './SlackMessage';
import DateMarker from './DateMarker';
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
          messages.reduce((acc: React.ReactElement[], message, index) => {
            // Check if we need to add a date marker
            if (index === 0 || !SlackParser.isSameDay(messages[index - 1].ts, message.ts)) {
              acc.push(
                <DateMarker
                  key={`date-${message.ts}`}
                  dateText={SlackParser.formatDateMarker(message.ts)}
                />
              );
            }

            // Check if we should show avatar (first message or different user from previous)
            const showAvatar = index === 0 || 
              messages[index - 1].user !== message.user ||
              message.subtype !== undefined;
            
            acc.push(
              <SlackMessage
                key={`${message.ts}-${index}`}
                message={message}
                users={users}
                showAvatar={showAvatar}
              />
            );

            return acc;
          }, [])
        )}
      </div>
    </div>
  );
};

export default ChannelView;
