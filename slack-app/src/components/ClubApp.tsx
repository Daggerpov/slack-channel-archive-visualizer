import React, { useState, useEffect } from 'react';
import { SlackExport, ChannelData } from '../types/slack';
import { SlackParser } from '../utils/slackParser';
import { StorageManager } from '../utils/storage';
import ChannelList from './ChannelList';
import ChannelView from './ChannelView';
import FileUpload from './FileUpload';
import AuthGateway, { UserRole } from './AuthGateway';
import AutoExportManager from './AutoExportManager';
import '../App.css';

const ClubApp: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [slackData, setSlackData] = useState<SlackExport | null>(null);
  const [guestData, setGuestData] = useState<SlackExport | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on component mount
  useEffect(() => {
    const storedAuth = StorageManager.getAuth();
    if (storedAuth) {
      setUserRole(storedAuth.role);
    }
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (userRole) {
      loadData();
    }
  }, [userRole]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try to load from persistent storage
      const storedData = StorageManager.getSlackData();
      if (storedData) {
        setSlackData(storedData);
        // Auto-select #general-club-ideas for MMHC executives, or first available channel as fallback
        const availableChannels = Object.keys(storedData.messages);
        const preferredChannel = 'general-club-ideas';
        if (availableChannels.includes(preferredChannel)) {
          setSelectedChannel(preferredChannel);
        } else if (availableChannels.length > 0) {
          setSelectedChannel(availableChannels[0]);
        }
        return;
      }
      
      // No stored data available - user needs to upload their own data
    } catch (error) {
      console.warn('Could not load data:', error);
      // This is expected if no data exists yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = async (files: FileList) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await SlackParser.parseSlackExport(files);
      
      if (userRole === 'guest') {
        // For guests, store data temporarily in memory only
        setGuestData(data);
      } else {
        // For authenticated users, store in persistent storage
        setSlackData(data);
        
        // Save to persistent storage for admin users
        if (userRole === 'admin') {
          try {
            StorageManager.saveSlackData(data);
          } catch (storageError) {
            console.warn('Could not save data to storage:', storageError);
            // Continue anyway - the data is still loaded in memory
          }
        }
      }
      
      // Auto-select #general-club-ideas for MMHC executives, or first available channel as fallback
      const availableChannels = Object.keys(data.messages);
      const preferredChannel = 'general-club-ideas';
      if (availableChannels.includes(preferredChannel)) {
        setSelectedChannel(preferredChannel);
      } else if (availableChannels.length > 0) {
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

  const handleAutoExportDataUpdate = (newData: SlackExport) => {
    setSlackData(newData);
    // Auto-select #general-club-ideas for MMHC executives if none is selected, or first available channel as fallback
    if (!selectedChannel) {
      const availableChannels = Object.keys(newData.messages);
      const preferredChannel = 'general-club-ideas';
      if (availableChannels.includes(preferredChannel)) {
        setSelectedChannel(preferredChannel);
      } else if (availableChannels.length > 0) {
        setSelectedChannel(availableChannels[0]);
      }
    }
  };

  const handleAuthenticated = (role: UserRole) => {
    setUserRole(role);
    StorageManager.saveAuth(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setSlackData(null);
    setGuestData(null);
    setSelectedChannel(null);
    setChannelData(null);
    StorageManager.clearAuth();
  };

  // Update channel data when selection changes
  useEffect(() => {
    const currentData = userRole === 'guest' ? guestData : slackData;
    if (currentData && selectedChannel) {
      const data = SlackParser.processChannelData(
        selectedChannel,
        currentData.channels,
        currentData.users,
        currentData.messages
      );
      setChannelData(data);
    } else {
      setChannelData(null);
    }
  }, [slackData, guestData, selectedChannel, userRole]);

  // Show authentication gateway if user is not authenticated
  if (!userRole) {
    return (
      <div className="club-app">
        <div className="club-header">
          <a href="/" className="home-link">← Back to Home</a>
          <h1>Club Member Access</h1>
        </div>
        <AuthGateway onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  // Show upload interface if no data is available
  const currentData = userRole === 'guest' ? guestData : slackData;
  if (!currentData) {
    return (
      <div className="App">
        <div className="app-header">
          <div className="header-content">
            <a href="/" className="home-link">← Back to Home</a>
            <h1>Slack Channel Archive Visualizer - MMHC</h1>
            <p>View and explore your Slack channel exports in a familiar interface</p>
          </div>
          <div className="header-actions">
            <span className="user-role">Logged in as: {userRole}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {userRole === 'guest' ? (
          <div className="guest-upload-section">
            <div className="guest-info">
              <h2>Upload Your Slack Export</h2>
              <p>As a guest, you can upload and visualize your own Slack channel export locally. Your data will not be saved permanently and is only visible to you during this session.</p>
            </div>
            <FileUpload 
              onFilesSelected={handleFilesSelected}
              isLoading={isLoading}
            />
          </div>
        ) : userRole === 'admin' ? (
          <FileUpload 
            onFilesSelected={handleFilesSelected}
            isLoading={isLoading}
          />
        ) : (
          <div className="no-data-message">
            <h2>No Archive Available</h2>
            <p>No Slack archive has been uploaded yet. Please contact an administrator to upload the latest archive.</p>
          </div>
        )}
      </div>
    );
  }

  const availableChannels = Object.keys(currentData.messages);

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-content">
          <a href="/" className="home-link">← Back to Home</a>
          <h1>Slack Channel Archive Visualizer - MMHC</h1>
          {userRole === 'guest' && (
            <p>Viewing your temporary upload - data will not be saved</p>
          )}
        </div>
        <div className="header-actions">
          <span className="user-role">Logged in as: {userRole}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="app-layout">
        <ChannelList
          channels={currentData.channels}
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
              
              {/* Show AutoExportManager when no channel is selected */}
              <AutoExportManager 
                onDataUpdated={handleAutoExportDataUpdate}
                userRole={userRole}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="app-footer">
        {userRole === 'admin' && (
          <button 
            onClick={() => {
              setSlackData(null);
              setSelectedChannel(null);
              setChannelData(null);
              StorageManager.clearSlackData();
            }}
            className="upload-new-button"
          >
            Upload New Export
          </button>
        )}
        {userRole === 'guest' && (
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
        )}
      </div>
    </div>
  );
};

export default ClubApp;
