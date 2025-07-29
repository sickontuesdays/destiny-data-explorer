import { useState } from 'react';
import Head from 'next/head';
import DataExplorer from '../components/DataExplorer';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isValidKey, setIsValidKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your Bungie API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bungie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endpoint: 'Destiny2/Manifest/',
          apiKey: apiKey 
        })
      });

      if (response.ok) {
        setIsValidKey(true);
      } else {
        alert('Invalid API key or API error. Please check your key.');
      }
    } catch (error) {
      alert('Error validating API key: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApiKey = () => {
    setApiKey('');
    setIsValidKey(false);
  };

  return (
    <>
      <Head>
        <title>Destiny 2 Data Explorer</title>
        <meta name="description" content="Explore Bungie's Destiny 2 API data structure" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>🎯 Destiny 2 Data Explorer</h1>
          <p>Explore Bungie&apos;s API data structure to understand item categorization</p>
        </header>

        {!isValidKey ? (
          <div className="api-key-section">
            <div className="card">
              <h2>🔑 Enter Your Bungie API Key</h2>
              <p>
                Get your API key from{' '}
                <a href="https://www.bungie.net/en/Application" target="_blank" rel="noopener noreferrer">
                  Bungie.net Application Portal
                </a>
              </p>
              
              <div className="input-group">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Bungie API key..."
                  className="api-input"
                  onKeyPress={(e) => e.key === 'Enter' && validateApiKey()}
                />
                <button 
                  onClick={validateApiKey}
                  disabled={isLoading}
                  className="validate-btn"
                >
                  {isLoading ? '⏳ Validating...' : '✅ Validate Key'}
                </button>
              </div>

              <div className="info-box">
                <h3>ℹ️ What This Tool Does:</h3>
                <ul>
                  <li>📊 Explores Bungie&apos;s item categorization system</li>
                  <li>🛡️ Shows how armor is classified by type and class</li>
                  <li>⚔️ Analyzes weapon categories and damage types</li>
                  <li>🔮 Examines subclass and ability structures</li>
                  <li>🔧 Identifies mod types and seasonal artifacts</li>
                  <li>📋 Helps you understand data for your apps</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="explorer-section">
            <div className="key-status">
              <span className="status-indicator">🟢 API Key Valid</span>
              <button onClick={resetApiKey} className="reset-btn">
                🔄 Change Key
              </button>
            </div>
            
            <DataExplorer apiKey={apiKey} />
          </div>
        )}

        <footer className="footer">
          <p>
            Built for analyzing Destiny 2 data • Not affiliated with Bungie
          </p>
        </footer>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #f39c12, #e74c3c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header p {
          font-size: 1.2rem;
          color: #666;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .card h2 {
          margin-bottom: 1rem;
          color: #333;
        }

        .input-group {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          flex-wrap: wrap;
        }

        .api-input {
          flex: 1;
          min-width: 300px;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .api-input:focus {
          outline: none;
          border-color: #f39c12;
        }

        .validate-btn {
          padding: 0.75rem 1.5rem;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .validate-btn:hover {
          background: #e67e22;
        }

        .validate-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .info-box {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .info-box h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .info-box ul {
          list-style: none;
          padding: 0;
        }

        .info-box li {
          padding: 0.25rem 0;
          color: #555;
        }

        .key-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .status-indicator {
          font-weight: bold;
          color: #155724;
        }

        .reset-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .reset-btn:hover {
          background: #5a6268;
        }

        .footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
          color: #666;
        }

        a {
          color: #f39c12;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .header h1 {
            font-size: 2rem;
          }

          .input-group {
            flex-direction: column;
          }

          .api-input {
            min-width: unset;
          }

          .key-status {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}