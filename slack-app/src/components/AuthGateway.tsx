import React, { useState } from 'react';
import './AuthGateway.css';

export type UserRole = 'guest' | 'club' | 'admin';

interface AuthGatewayProps {
  onAuthenticated: (role: UserRole) => void;
}

const AuthGateway: React.FC<AuthGatewayProps> = ({ onAuthenticated }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the secure API endpoint instead of handling authentication client-side
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passkey }),
      });

      const data = await response.json();

      if (data.success) {
        onAuthenticated(data.role as UserRole);
      } else {
        setError(data.error || 'Invalid passkey. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onAuthenticated('guest');
  };

  return (
    <div className="auth-gateway">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Slack Channel Archive Visualizer - MMHC</h1>
          <p>Access your club's Slack channel archives</p>
        </div>

        <div className="auth-content">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="passkey">Enter Passkey</label>
              <div className="password-input-container">
                <input
                  id="passkey"
                  type={showPassword ? "text" : "password"}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter your access passkey"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading || !passkey.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Access Archive'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            onClick={handleGuestAccess}
            className="auth-button secondary"
            disabled={isLoading}
          >
            Continue as Guest
          </button>

          <div className="auth-info">
            <p><strong>Club Members:</strong> Use your club passkey to access persistent archives</p>
            <p><strong>Guests:</strong> Upload and visualize your own Slack export locally (temporary session only)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
