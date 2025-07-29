import { useState, useEffect } from 'react';
import ItemTable from './ItemTable';

const DataExplorer = ({ apiKey }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [manifestInfo, setManifestInfo] = useState(null);
  const [itemCategories, setItemCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch manifest info on component mount
  useEffect(() => {
    fetchManifestInfo();
  }, []);

  const fetchManifestInfo = async () => {
    setLoading(true);
    setError(null);
    
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
        const data = await response.json();
        setManifestInfo(data.Response);
      } else {
        throw new Error('Failed to fetch manifest info');
      }
    } catch (err) {
      setError('Error fetching manifest: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const callBungieAPI = async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bungie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint,
          apiKey: apiKey,
          params: params
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.Response;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
    } catch (err) {
      setError('API Error: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'armor', label: '🛡️ Armor Analysis', icon: '🛡️' },
    { id: 'weapons', label: '⚔️ Weapon Analysis', icon: '⚔️' },
    { id: 'subclasses', label: '🔮 Subclass Analysis', icon: '🔮' },
    { id: 'mods', label: '🔧 Mod Analysis', icon: '🔧' },
    { id: 'raw-search', label: '🔍 Raw Data Search', icon: '🔍' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab manifestInfo={manifestInfo} />;
      case 'armor':
        return <ArmorAnalysisTab callAPI={callBungieAPI} loading={loading} error={error} />;
      case 'weapons':
        return <WeaponAnalysisTab callAPI={callBungieAPI} loading={loading} error={error} />;
      case 'subclasses':
        return <SubclassAnalysisTab callAPI={callBungieAPI} loading={loading} error={error} />;
      case 'mods':
        return <ModAnalysisTab callAPI={callBungieAPI} loading={loading} error={error} />;
      case 'raw-search':
        return <RawSearchTab callAPI={callBungieAPI} loading={loading} error={error} />;
      default:
        return <div>Select a tab to explore data</div>;
    }
  };

  return (
    <div className="data-explorer">
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {error && (
          <div className="error-banner">
            ❌ {error}
          </div>
        )}
        
        {loading && (
          <div className="loading-banner">
            ⏳ Loading data from Bungie API...
          </div>
        )}

        {renderTabContent()}
      </div>

      <style jsx>{`
        .data-explorer {
          width: 100%;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 1rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .tab:hover {
          border-color: #f39c12;
          background: #fdf6e3;
        }

        .tab.active {
          border-color: #f39c12;
          background: #f39c12;
          color: white;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          font-weight: 500;
        }

        .tab-content {
          min-height: 400px;
        }

        .error-banner {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #721c24;
        }

        .loading-banner {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #155724;
          text-align: center;
        }

        @media (max-width: 768px) {
          .tabs {
            flex-direction: column;
          }

          .tab {
            justify-content: center;
          }

          .tab-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ manifestInfo }) => (
  <div className="overview-tab">
    <div className="card">
      <h2>🎯 Manifest Information</h2>
      {manifestInfo ? (
        <div className="manifest-info">
          <div className="info-item">
            <strong>Version:</strong> {manifestInfo.version}
          </div>
          <div className="info-item">
            <strong>Available Languages:</strong> {Object.keys(manifestInfo.mobileWorldContentPaths || {}).join(', ')}
          </div>
          <div className="info-item">
            <strong>Status:</strong> <span className="status-good">✅ Connected</span>
          </div>
        </div>
      ) : (
        <p>Loading manifest information...</p>
      )}
    </div>

    <div className="card">
      <h2>📋 What Each Tab Does</h2>
      <div className="tab-descriptions">
        <div className="tab-desc">
          <span className="desc-icon">🛡️</span>
          <div>
            <strong>Armor Analysis</strong>
            <p>Explore how Bungie categorizes armor pieces (helmets, gauntlets, chest, legs, class items) and class restrictions.</p>
          </div>
        </div>
        <div className="tab-desc">
          <span className="desc-icon">⚔️</span>
          <div>
            <strong>Weapon Analysis</strong>
            <p>Understand weapon categorization by slot (kinetic/energy/power), type (auto rifle, hand cannon, etc.), and damage types.</p>
          </div>
        </div>
        <div className="tab-desc">
          <span className="desc-icon">🔮</span>
          <div>
            <strong>Subclass Analysis</strong>
            <p>Examine how subclasses are structured, including their abilities, aspects, and fragments.</p>
          </div>
        </div>
        <div className="tab-desc">
          <span className="desc-icon">🔧</span>
          <div>
            <strong>Mod Analysis</strong>
            <p>Investigate armor mods, weapon mods, and seasonal artifact modifications.</p>
          </div>
        </div>
        <div className="tab-desc">
          <span className="desc-icon">🔍</span>
          <div>
            <strong>Raw Data Search</strong>
            <p>Search for specific items and see their raw Bungie categorization data.</p>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      .overview-tab .card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .overview-tab h2 {
        margin-bottom: 1.5rem;
        color: #333;
      }

      .manifest-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .info-item {
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #f39c12;
      }

      .status-good {
        color: #28a745;
        font-weight: bold;
      }

      .tab-descriptions {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tab-desc {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .desc-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .tab-desc strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
      }

      .tab-desc p {
        color: #666;
        margin: 0;
        line-height: 1.5;
      }
    `}</style>
  </div>
);

// Placeholder components for other tabs (we'll implement these next)
const ArmorAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🛡️ Armor Analysis Coming Next...</h2>
    <p>This will show how Bungie categorizes armor items by type and class.</p>
  </div>
);

const WeaponAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>⚔️ Weapon Analysis Coming Next...</h2>
    <p>This will show how Bungie categorizes weapons by slot and type.</p>
  </div>
);

const SubclassAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🔮 Subclass Analysis Coming Next...</h2>
    <p>This will show how subclasses and abilities are structured.</p>
  </div>
);

const ModAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🔧 Mod Analysis Coming Next...</h2>
    <p>This will show how mods are categorized and structured.</p>
  </div>
);

const RawSearchTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🔍 Raw Data Search Coming Next...</h2>
    <p>This will allow searching for specific items and viewing their raw data.</p>
  </div>
);

export default DataExplorer;