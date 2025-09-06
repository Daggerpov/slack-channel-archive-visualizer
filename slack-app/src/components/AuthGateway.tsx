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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const clubPasskey = process.env.REACT_APP_CLUB_PASSKEY;
    const adminPasskey = process.env.REACT_APP_ADMIN_PASSKEY;

    if (passkey === adminPasskey) {
      onAuthenticated('admin');
    } else if (passkey === clubPasskey) {
      onAuthenticated('club');
    } else {
      setError('Invalid passkey. Please try again.');
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
          <h1>Slack Channel Archive Visualizer</h1>
          <p>Access your club's Slack channel archives</p>
        </div>

        <div className="auth-content">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="passkey">Enter Passkey</label>
              <input
                id="passkey"
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter your access passkey"
                disabled={isLoading}
                autoFocus
              />
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
            <p><strong>Club Members:</strong> Use your club passkey to access full archives</p>
            <p><strong>Guests:</strong> View the latest uploaded archive without upload capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
