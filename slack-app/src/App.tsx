import React, { useState, useEffect } from 'react';
import { SlackExport, ChannelData } from './types/slack';
import { SlackParser } from './utils/slackParser';
import { StorageManager } from './utils/storage';
import ChannelList from './components/ChannelList';
import ChannelView from './components/ChannelView';
import FileUpload from './components/FileUpload';
import AuthGateway, { UserRole } from './components/AuthGateway';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [slackData, setSlackData] = useState<SlackExport | null>(null);
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
        // Auto-select the first available channel
        const availableChannels = Object.keys(storedData.messages);
        if (availableChannels.length > 0) {
          setSelectedChannel(availableChannels[0]);
        }
        return;
      }
      
      // If no stored data, try to load sample data
      const data = await SlackParser.loadSampleData();
      setSlackData(data);
      
      // Auto-select the first available channel
      const availableChannels = Object.keys(data.messages);
      if (availableChannels.length > 0) {
        setSelectedChannel(availableChannels[0]);
      }
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
      setSlackData(data);
      
      // Save to persistent storage
      try {
        StorageManager.saveSlackData(data);
      } catch (storageError) {
        console.warn('Could not save data to storage:', storageError);
        // Continue anyway - the data is still loaded in memory
      }
      
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

  const handleAuthenticated = (role: UserRole) => {
    setUserRole(role);
    StorageManager.saveAuth(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setSlackData(null);
    setSelectedChannel(null);
    setChannelData(null);
    StorageManager.clearAuth();
  };

  // Update channel data when selection changes
  useEffect(() => {
    if (slackData && selectedChannel) {
      const data = SlackParser.processChannelData(
        selectedChannel,
        slackData.channels,
        slackData.users,
        slackData.messages
      );
      setChannelData(data);
    } else {
      setChannelData(null);
    }
  }, [slackData, selectedChannel]);

  // Show authentication gateway if user is not authenticated
  if (!userRole) {
    return <AuthGateway onAuthenticated={handleAuthenticated} />;
  }

  // Show upload interface if no data is available and user has admin privileges
  if (!slackData) {
    return (
      <div className="App">
        <div className="app-header">
          <div className="header-content">
            <h1>Slack Channel Archive Visualizer</h1>
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
        
        {userRole === 'admin' ? (
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

  const availableChannels = Object.keys(slackData.messages);

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-content">
          <h1>Slack Channel Archive Visualizer</h1>
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
          channels={slackData.channels}
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
      </div>
    </div>
  );
}

export default App;
