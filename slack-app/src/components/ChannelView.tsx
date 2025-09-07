import React, { useEffect, useRef } from 'react';
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
  const firstRealMessageRef = useRef<HTMLDivElement>(null);

  // Find the first non-system message for scrolling
  const findFirstRealMessage = (messages: any[]) => {
    return messages.findIndex(message => 
      !message.subtype || 
      !['channel_join', 'channel_leave', 'channel_name', 'channel_topic', 'channel_purpose'].includes(message.subtype)
    );
  };

  // Scroll to first real message when channel data changes
  useEffect(() => {
    if (messages.length > 0 && firstRealMessageRef.current) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        firstRealMessageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [channel.id, messages]);

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
            
            // Check if this is the first real (non-system) message
            const firstRealMessageIndex = findFirstRealMessage(messages);
            const isFirstRealMessage = index === firstRealMessageIndex;
            
            acc.push(
              <div 
                key={`${message.ts}-${index}`}
                ref={isFirstRealMessage ? firstRealMessageRef : null}
              >
                <SlackMessage
                  message={message}
                  users={users}
                  showAvatar={showAvatar}
                />
              </div>
            );

            return acc;
          }, [])
        )}
      </div>
    </div>
  );
};

export default ChannelView;
