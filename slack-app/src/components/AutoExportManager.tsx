import React, { useState } from 'react';
import { SlackExport } from '../types/slack';
import { StorageManager } from '../utils/storage';
import './AutoExportManager.css';

interface AutoExportManagerProps {
  onDataUpdated: (data: SlackExport) => void;
  userRole: 'admin' | 'club' | 'guest';
}

interface ExportStatus {
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  scheduleType?: 'hourly' | 'daily';
  totalMessages?: number;
  error?: string;
}

const AutoExportManager: React.FC<AutoExportManagerProps> = ({ onDataUpdated, userRole }) => {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ isRunning: false });
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);

  const triggerManualExport = async () => {
    if (userRole !== 'admin') {
      setExportStatus(prev => ({ ...prev, error: 'Admin access required for manual exports' }));
      return;
    }

    if (!passkey.trim()) {
      setExportStatus(prev => ({ ...prev, error: 'Admin passkey required' }));
      return;
    }

    setExportStatus({ isRunning: true, error: undefined });

    try {
      const response = await fetch('/api/slack-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passkey }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Store the new data
        StorageManager.saveSlackData(result.data);
        
        // Notify parent component
        onDataUpdated(result.data);

        setExportStatus({
          isRunning: false,
          lastRun: new Date().toISOString(),
          totalMessages: result.data.totalMessages,
          error: undefined
        });
      } else {
        setExportStatus({
          isRunning: false,
          error: result.error || 'Export failed'
        });
      }
    } catch (error) {
      console.error('Manual export error:', error);
      setExportStatus({
        isRunning: false,
        error: 'Failed to connect to export service'
      });
    }
  };

  const checkExportStatus = async () => {
    try {
      // This would typically check a status endpoint or database
      // For now, we'll show a simple status based on the current date
      const now = new Date();
      const cutoffDate = new Date('2025-09-15T00:00:00Z');
      const scheduleType = now < cutoffDate ? 'hourly' : 'daily';
      
      let nextRun: Date;
      if (scheduleType === 'hourly') {
        nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
      } else {
        nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 2, 0, 0);
      }

      setExportStatus(prev => ({
        ...prev,
        scheduleType,
        nextRun: nextRun.toISOString()
      }));
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  React.useEffect(() => {
    checkExportStatus();
    // Check status every 5 minutes
    const interval = setInterval(checkExportStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getScheduleDescription = () => {
    const now = new Date();
    const cutoffDate = new Date('2025-09-15T00:00:00Z');
    
    if (now < cutoffDate) {
      const daysUntilChange = Math.ceil((cutoffDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Currently running hourly exports. Will switch to daily exports in ${daysUntilChange} days (Sep 15, 2025).`;
    } else {
      return 'Currently running daily exports at 2:00 AM.';
    }
  };

  if (userRole === 'guest') {
    return (
      <div className="auto-export-manager guest-view">
        <h3>Automated Exports</h3>
        <p>Automated Slack exports are available for club members and administrators.</p>
        <p>As a guest, you can upload your own Slack export files manually.</p>
      </div>
    );
  }

  return (
    <div className="auto-export-manager">
      <h3>Automated Slack Exports</h3>
      
      <div className="export-schedule">
        <h4>Export Schedule</h4>
        <p>{getScheduleDescription()}</p>
        {exportStatus.nextRun && (
          <p><strong>Next scheduled export:</strong> {formatDateTime(exportStatus.nextRun)}</p>
        )}
      </div>

      {exportStatus.lastRun && (
        <div className="last-export">
          <h4>Last Export</h4>
          <p><strong>Time:</strong> {formatDateTime(exportStatus.lastRun)}</p>
          {exportStatus.totalMessages && (
            <p><strong>Messages:</strong> {exportStatus.totalMessages.toLocaleString()}</p>
          )}
        </div>
      )}

      {userRole === 'admin' && (
        <div className="manual-export">
          <h4>Manual Export</h4>
          <p>Trigger an immediate export of recent Slack data:</p>
          
          <div className="passkey-input">
            <input
              type={showPasskey ? 'text' : 'password'}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter admin passkey"
              disabled={exportStatus.isRunning}
            />
            <button
              type="button"
              onClick={() => setShowPasskey(!showPasskey)}
              className="toggle-passkey"
              disabled={exportStatus.isRunning}
            >
              {showPasskey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button
            onClick={triggerManualExport}
            disabled={exportStatus.isRunning || !passkey.trim()}
            className="export-button"
          >
            {exportStatus.isRunning ? 'Exporting...' : 'Run Export Now'}
          </button>
        </div>
      )}

      {exportStatus.error && (
        <div className="export-error">
          <strong>Error:</strong> {exportStatus.error}
        </div>
      )}

      <div className="export-info">
        <h4>How It Works</h4>
        <ul>
          <li>Automated exports fetch recent messages from all accessible channels</li>
          <li>Data is processed and stored securely</li>
          <li>The schedule automatically adjusts based on the date</li>
          <li>Manual exports can be triggered by administrators</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoExportManager;
