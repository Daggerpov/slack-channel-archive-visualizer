import React from 'react';
import { SlackMessage as SlackMessageType, SlackUser } from '../types/slack';
import { SlackParser } from '../utils/slackParser';
import './SlackMessage.css';

interface SlackMessageProps {
  message: SlackMessageType & { thread_replies?: SlackMessageType[] };
  users: SlackUser[];
  showAvatar?: boolean;
}

const SlackMessage: React.FC<SlackMessageProps> = ({ 
  message, 
  users, 
  showAvatar = true 
}) => {
  const user = message.user ? SlackParser.getUserById(users, message.user) : null;
  const time = SlackParser.formatTime(message.ts);
  const messageElements = SlackParser.parseMessageTextToElements(message, users);

  // Handle system messages
  if (message.subtype) {
    return (
      <div className="slack-message system-message">
        <div className="system-message-content">
          <span className="system-message-text">{message.text}</span>
          <span className="message-time">{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="slack-message">
      <div className="message-content">
        {showAvatar && (
          <div className="message-avatar">
            {user?.profile?.image_48 ? (
              <img 
                src={user.profile.image_48} 
                alt={user.real_name}
                className="avatar-image"
              />
            ) : (
              <div 
                className={`avatar-placeholder ${user?.color ? 'colored' : ''}`}
                style={user?.color ? { backgroundColor: `#${user.color}` } : {}}
              >
                {user?.real_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
        <div className="message-body">
          <div className="message-header">
            <span className="message-author">
              {user?.real_name || user?.name || 'Unknown User'}
            </span>
            <span className="message-time">{time}</span>
            {message.edited && (
              <span className="message-edited">(edited)</span>
            )}
          </div>
          <div className="message-text">
            {messageElements.map((element, elementIndex) => {
              if (typeof element === 'string') {
                return element.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={`${elementIndex}-${lineIndex}`}>
                    {line}
                    {lineIndex < element.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ));
              } else if (element.type === 'link') {
                return (
                  <a 
                    key={elementIndex} 
                    href={element.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="message-link"
                  >
                    {element.text}
                  </a>
                );
              }
              return null;
            })}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className="message-reactions">
              {message.reactions.map((reaction, index) => (
                <span key={index} className="reaction">
                  {SlackParser.getEmojiFromName(reaction.name)} {reaction.count}
                </span>
              ))}
            </div>
          )}
          
          {/* Thread replies */}
          {message.thread_replies && message.thread_replies.length > 0 && (
            <div className="thread-replies">
              <div className="thread-header">
                <span className="thread-count">
                  {message.thread_replies.length} {message.thread_replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
              <div className="thread-messages">
                {message.thread_replies.map((reply, index) => {
                  const replyUser = reply.user ? SlackParser.getUserById(users, reply.user) : null;
                  const replyTime = SlackParser.formatTime(reply.ts);
                  const replyElements = SlackParser.parseMessageTextToElements(reply, users);
                  
                  return (
                    <div key={reply.ts} className="thread-reply">
                      <div className="thread-reply-avatar">
                        {replyUser?.profile?.image_48 ? (
                          <img 
                            src={replyUser.profile.image_48} 
                            alt={replyUser.real_name}
                            className="thread-avatar-image"
                          />
                        ) : (
                          <div 
                            className={`thread-avatar-placeholder ${replyUser?.color ? 'colored' : ''}`}
                            style={replyUser?.color ? { backgroundColor: `#${replyUser.color}` } : {}}
                          >
                            {replyUser?.real_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="thread-reply-content">
                        <div className="thread-reply-header">
                          <span className="thread-reply-author">
                            {replyUser?.real_name || replyUser?.name || 'Unknown User'}
                          </span>
                          <span className="thread-reply-time">{replyTime}</span>
                          {reply.edited && (
                            <span className="thread-reply-edited">(edited)</span>
                          )}
                        </div>
                        <div className="thread-reply-text">
                          {replyElements.map((element, elementIndex) => {
                            if (typeof element === 'string') {
                              return element.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={`${elementIndex}-${lineIndex}`}>
                                  {line}
                                  {lineIndex < element.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ));
                            } else if (element.type === 'link') {
                              return (
                                <a 
                                  key={elementIndex} 
                                  href={element.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="message-link"
                                >
                                  {element.text}
                                </a>
                              );
                            }
                            return null;
                          })}
                        </div>
                        {reply.reactions && reply.reactions.length > 0 && (
                          <div className="thread-reply-reactions">
                            {reply.reactions.map((reaction, reactionIndex) => (
                              <span key={reactionIndex} className="reaction">
                                {SlackParser.getEmojiFromName(reaction.name)} {reaction.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlackMessage;
