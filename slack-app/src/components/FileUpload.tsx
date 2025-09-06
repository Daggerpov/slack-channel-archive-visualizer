import React, { useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          {...({ webkitdirectory: "" } as any)}
        />
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Processing Slack export...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h3>Upload Slack Export</h3>
            <p>
              Drag and drop your Slack export folder here, or click to browse.
              <br />
              <small>Select the entire exported folder containing channels.json, users.json, and channel folders.</small>
            </p>
            <button className="upload-button">
              Choose Folder
            </button>
          </div>
        )}
      </div>
      
      <div className="upload-instructions">
        <h4>How to export from Slack:</h4>
        <ol>
          <li>Go to your Slack workspace settings</li>
          <li>Navigate to "Import/Export Data"</li>
          <li>Choose "Export" and select your date range</li>
          <li>Download the ZIP file and extract it</li>
          <li>Upload the extracted folder here</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUpload;
