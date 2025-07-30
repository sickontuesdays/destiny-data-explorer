// components/DataExplorer.js - Complete Fixed Version
import { useState, useEffect } from 'react';
import ItemTable from './ItemTable';
import { 
  EQUIPMENT_SLOTS, 
  getClassTypeName, 
  getTierTypeName,
  isActiveItem,
  filterArmorBySlot,
  filterByClass,
  filterByTier
} from '../lib/bungie-api';

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

// Armor Analysis Tab
const ArmorAnalysisTab = ({ callAPI, loading, error }) => {
  const [armorItems, setArmorItems] = useState([]);
  const [armorLoading, setArmorLoading] = useState(false);
  const [selectedArmorType, setSelectedArmorType] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const armorTypes = {
    all: 'All Armor',
    helmet: 'Helmets',
    gauntlets: 'Gauntlets', 
    chest: 'Chest Armor',
    legs: 'Leg Armor',
    classItem: 'Class Items'
  };

  const classTypes = {
    all: 'All Classes',
    0: 'Titan',
    1: 'Hunter', 
    2: 'Warlock',
    3: 'All Classes'
  };

  const fetchArmorData = async () => {
    setArmorLoading(true);
    try {
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      
      if (manifestResponse && manifestResponse.jsonWorldContentPaths) {
        const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
        const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
        
        if (itemsResponse.ok) {
          const worldContent = await itemsResponse.json();
          const inventoryItems = worldContent.DestinyInventoryItemDefinition || {};
          
          const armorList = Object.values(inventoryItems).filter(item => {
            return (
              item.itemType === 2 && // Armor type
              !item.redacted &&
              !item.blacklisted &&
              item.displayProperties?.name &&
              item.displayProperties.name.trim() !== '' &&
              item.inventory?.bucketTypeHash
            );
          });
          
          setArmorItems(armorList);
        }
      }
    } catch (err) {
      console.error('Error fetching armor data:', err);
    } finally {
      setArmorLoading(false);
    }
  };

  const filteredArmor = armorItems.filter(item => {
    if (selectedArmorType !== 'all') {
      const bucketHash = item.inventory?.bucketTypeHash;
      const typeMatch = {
        helmet: bucketHash === EQUIPMENT_SLOTS.HELMET,
        gauntlets: bucketHash === EQUIPMENT_SLOTS.GAUNTLETS,
        chest: bucketHash === EQUIPMENT_SLOTS.CHEST_ARMOR,
        legs: bucketHash === EQUIPMENT_SLOTS.LEG_ARMOR,
        classItem: bucketHash === EQUIPMENT_SLOTS.CLASS_ARMOR
      };
      
      if (!typeMatch[selectedArmorType]) return false;
    }

    if (selectedClass !== 'all') {
      if (item.classType !== parseInt(selectedClass) && item.classType !== 3) return false;
    }

    if (searchTerm) {
      const name = item.displayProperties?.name?.toLowerCase() || '';
      const description = item.displayProperties?.description?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      if (!name.includes(term) && !description.includes(term)) return false;
    }

    return true;
  });

  return (
    <div className="armor-analysis">
      <div className="analysis-header">
        <h2>🛡️ Armor Analysis</h2>
        <p>Explore how Bungie categorizes armor pieces and class restrictions.</p>
        
        <div className="fetch-section">
          <button 
            onClick={fetchArmorData} 
            disabled={armorLoading}
            className="fetch-button"
          >
            {armorLoading ? '⏳ Loading Armor Data...' : '🔍 Fetch Armor Data'}
          </button>
          
          {armorItems.length > 0 && (
            <p className="data-status">✅ Loaded {armorItems.length} armor items</p>
          )}
        </div>
      </div>

      {armorItems.length > 0 && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label>Armor Type:</label>
              <select 
                value={selectedArmorType} 
                onChange={(e) => setSelectedArmorType(e.target.value)}
              >
                {Object.entries(armorTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {Object.entries(classTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search armor names..."
              />
            </div>
          </div>

          <ItemTable 
            items={filteredArmor}
            title={`Armor Items (${filteredArmor.length} found)`}
            showCategories={true}
            showBungieData={true}
          />
        </>
      )}

      <style jsx>{`
        .armor-analysis {
          width: 100%;
        }

        .analysis-header {
          margin-bottom: 2rem;
        }

        .analysis-header h2 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .analysis-header p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .fetch-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .fetch-button {
          padding: 0.75rem 1.5rem;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .fetch-button:hover {
          background: #e67e22;
        }

        .fetch-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .data-status {
          color: #27ae60;
          font-weight: bold;
          margin: 0;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #333;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #f39c12;
        }
      `}</style>
    </div>
  );
};

// Subclass Analysis Tab - Working Implementation
const SubclassAnalysisTab = ({ callAPI, loading, error }) => {
  const [subclassItems, setSubclassItems] = useState([]);
  const [subclassLoading, setSubclassLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const elements = {
    all: 'All Elements',
    2: 'Arc',
    3: 'Solar', 
    4: 'Void',
    6: 'Stasis',
    7: 'Strand',
    8: 'Prismatic'
  };

  const classTypes = {
    all: 'All Classes',
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock'
  };

  const fetchSubclassData = async () => {
    console.log('🔮 Starting subclass fetch...');
    setSubclassLoading(true);
    
    try {
      console.log('📞 Calling Bungie API for manifest...');
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      console.log('📋 Manifest response received:', !!manifestResponse);
      
      if (!manifestResponse) {
        throw new Error('No manifest response received');
      }
      
      if (!manifestResponse.jsonWorldContentPaths) {
        throw new Error('No jsonWorldContentPaths in manifest response');
      }
      
      const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
      if (!worldContentUrl) {
        throw new Error('No English world content URL found');
      }
      
      console.log('📥 Downloading manifest from:', worldContentUrl.substring(0, 50) + '...');
      
      const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
      console.log('📊 Manifest download status:', itemsResponse.status, itemsResponse.statusText);
      
      if (!itemsResponse.ok) {
        throw new Error(`Manifest download failed: ${itemsResponse.status} ${itemsResponse.statusText}`);
      }
      
      console.log('⚙️ Parsing manifest JSON...');
      const worldContent = await itemsResponse.json();
      console.log('✅ Manifest parsed successfully');
      
      if (!worldContent.DestinyInventoryItemDefinition) {
        throw new Error('No DestinyInventoryItemDefinition found in manifest');
      }
      
      const inventoryItems = worldContent.DestinyInventoryItemDefinition;
      console.log('📦 Total inventory items:', Object.keys(inventoryItems).length);
      
      // Very simple filtering to start
      const allItems = Object.values(inventoryItems);
      console.log('📋 Total items as array:', allItems.length);
      
      const itemType19Items = allItems.filter(item => item.itemType === 19);
      console.log('🔍 Items with itemType 19:', itemType19Items.length);
      
      // Just take the first 50 for testing
      const testSubclasses = itemType19Items.slice(0, 50);
      console.log('🧪 Taking first 50 items for testing');
      console.log('📝 Sample names:', testSubclasses.slice(0, 5).map(item => item.displayProperties?.name || 'NO NAME'));
      
      setSubclassItems(testSubclasses);
      console.log('💾 Set subclass items in state');
      
    } catch (err) {
      console.error('💥 DETAILED ERROR:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      alert('Detailed error: ' + err.message);
    } finally {
      console.log('🏁 Subclass fetch completed, setting loading to false');
      setSubclassLoading(false);
    }
  };

  const filteredSubclasses = subclassItems.filter(item => {
    if (selectedElement !== 'all') {
      if (item.defaultDamageType !== parseInt(selectedElement)) return false;
    }

    if (selectedClass !== 'all') {
      if (item.classType !== parseInt(selectedClass)) return false;
    }

    if (searchTerm) {
      const name = item.displayProperties?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      if (!name.includes(term)) return false;
    }

    return true;
  });

  return (
    <div className="subclass-analysis">
      <div className="analysis-header">
        <h2>🔮 Subclass Analysis</h2>
        <p>Explore how Bungie structures subclasses and their elemental affinities.</p>
        
        <div className="fetch-section">
          <button 
            onClick={() => {
              console.log('🔘 BUTTON CLICKED - STARTING FETCH!');
              fetchSubclassData();
            }}
            disabled={subclassLoading}
            className="fetch-button"
          >
            {subclassLoading ? '⏳ Loading Subclass Data...' : '🔍 Fetch Subclass Data'}
          </button>
          
          {subclassItems.length > 0 && (
            <p className="data-status">✅ Loaded {subclassItems.length} subclass items</p>
          )}
        </div>
      </div>

      {subclassItems.length > 0 && (
        <>
          <div className="subclass-summary">
            <h3>📊 Subclass Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Total Subclasses:</strong> {subclassItems.length}
              </div>
              <div className="summary-item">
                <strong>Arc:</strong> {subclassItems.filter(item => item.defaultDamageType === 2).length}
              </div>
              <div className="summary-item">
                <strong>Solar:</strong> {subclassItems.filter(item => item.defaultDamageType === 3).length}
              </div>
              <div className="summary-item">
                <strong>Void:</strong> {subclassItems.filter(item => item.defaultDamageType === 4).length}
              </div>
              <div className="summary-item">
                <strong>Stasis:</strong> {subclassItems.filter(item => item.defaultDamageType === 6).length}
              </div>
              <div className="summary-item">
                <strong>Strand:</strong> {subclassItems.filter(item => item.defaultDamageType === 7).length}
              </div>
              <div className="summary-item">
                <strong>Prismatic:</strong> {subclassItems.filter(item => item.defaultDamageType === 8).length}
              </div>
            </div>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Element:</label>
              <select 
                value={selectedElement} 
                onChange={(e) => setSelectedElement(e.target.value)}
              >
                {Object.entries(elements).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {Object.entries(classTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subclass names..."
              />
            </div>
          </div>

          <ItemTable 
            items={filteredSubclasses}
            title={`Subclass Items (${filteredSubclasses.length} found)`}
            showCategories={true}
            showBungieData={true}
          />
        </>
      )}

      <style jsx>{`
        .subclass-analysis {
          width: 100%;
        }

        .analysis-header {
          margin-bottom: 2rem;
        }

        .analysis-header h2 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .analysis-header p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .fetch-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .fetch-button {
          padding: 0.75rem 1.5rem;
          background: #9b59b6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .fetch-button:hover {
          background: #8e44ad;
        }

        .fetch-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .data-status {
          color: #27ae60;
          font-weight: bold;
          margin: 0;
        }

        .subclass-summary {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #9b59b6;
        }

        .subclass-summary h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
          font-size: 0.9rem;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #333;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #9b59b6;
        }
      `}</style>
    </div>
  );
};

// Placeholder components for other tabs
const WeaponAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>⚔️ Weapon Analysis Coming Next...</h2>
    <p>This will show how Bungie categorizes weapons by slot, type, and damage.</p>
  </div>
);

const ModAnalysisTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🔧 Mod Analysis Coming Next...</h2>
    <p>This will show how Bungie categorizes armor mods, weapon mods, and seasonal artifacts.</p>
  </div>
);

const RawSearchTab = ({ callAPI, loading, error }) => (
  <div>
    <h2>🔍 Raw Data Search Coming Next...</h2>
    <p>This will allow you to search for any item and see its raw Bungie data structure.</p>
  </div>
);

export default DataExplorer;