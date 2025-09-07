import React, { useState } from 'react';
import { SlackExport, ChannelData } from '../types/slack';
import { SlackParser } from '../utils/slackParser';
import ChannelList from './ChannelList';
import ChannelView from './ChannelView';
import FileUpload from './FileUpload';
import './GuestHome.css';

const GuestHome: React.FC = () => {
  const [guestData, setGuestData] = useState<SlackExport | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await SlackParser.parseSlackExport(files);
      setGuestData(data);
      
      // Auto-select the first available channel
      const availableChannels = Object.keys(data.messages);
      if (availableChannels.length > 0) {
        setSelectedChannel(availableChannels[0]);
      }
    } catch (error) {
      console.error('Error parsing Slack export:', error);
      setError('Failed to parse Slack export. Please make sure you selected the correct files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = (channelName: string) => {
    setSelectedChannel(channelName);
  };

  // Update channel data when selection changes
  React.useEffect(() => {
    if (guestData && selectedChannel) {
      const data = SlackParser.processChannelData(
        selectedChannel,
        guestData.channels,
        guestData.users,
        guestData.messages
      );
      setChannelData(data);
    } else {
      setChannelData(null);
    }
  }, [guestData, selectedChannel]);

  // Show upload interface if no data is available
  if (!guestData) {
    return (
      <div className="guest-home">
        <div className="guest-header">
          <div className="header-content">
            <h1>Slack Channel Archive Visualizer</h1>
            <p>Upload and explore your Slack channel exports in a familiar interface</p>
          </div>
          <div className="header-actions">
            <a href="/mmhc" className="club-access-link">
              Club Member Access
            </a>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="guest-upload-section">
          <div className="guest-info">
            <h2>Upload Your Slack Export</h2>
            <p>
              Upload your own Slack channel export to visualize and explore your messages. 
              Your data is processed locally in your browser and is not saved permanently.
            </p>
            <div className="features">
              <div className="feature">
                <h3>🔒 Private & Secure</h3>
                <p>Your data never leaves your browser</p>
              </div>
              <div className="feature">
                <h3>📊 Rich Visualization</h3>
                <p>Explore messages in a familiar Slack-like interface</p>
              </div>
              <div className="feature">
                <h3>🔍 Easy Navigation</h3>
                <p>Browse channels and search through your archive</p>
              </div>
            </div>
          </div>
          <FileUpload 
            onFilesSelected={handleFilesSelected}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  const availableChannels = Object.keys(guestData.messages);

  return (
    <div className="guest-home">
      <div className="guest-header">
        <div className="header-content">
          <h1>Slack Channel Archive Visualizer</h1>
          <p>Viewing your temporary upload - data will not be saved</p>
        </div>
        <div className="header-actions">
          <a href="/mmhc" className="club-access-link">
            Club Member Access
          </a>
          <button 
            onClick={() => {
              setGuestData(null);
              setSelectedChannel(null);
              setChannelData(null);
            }}
            className="upload-new-button"
          >
            Upload Different Export
          </button>
        </div>
      </div>
      
      <div className="app-layout">
        <ChannelList
          channels={guestData.channels}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
          availableChannels={availableChannels}
        />
        
        <div className="main-content">
          {channelData ? (
            <ChannelView channelData={channelData} />
          ) : (
            <div className="no-channel-selected">
              <h2>Select a channel to view messages</h2>
              <p>Choose a channel from the sidebar to start exploring your Slack archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestHome;
