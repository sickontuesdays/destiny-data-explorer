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

// Armor Analysis Tab - Real Implementation
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

// Weapon Analysis Tab - Real Implementation
const WeaponAnalysisTab = ({ callAPI, loading, error }) => {
  const [weaponItems, setWeaponItems] = useState([]);
  const [weaponLoading, setWeaponLoading] = useState(false);
  const [selectedWeaponSlot, setSelectedWeaponSlot] = useState('all');
  const [selectedDamageType, setSelectedDamageType] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const weaponSlots = {
    all: 'All Weapons',
    kinetic: 'Kinetic Weapons',
    energy: 'Energy Weapons',
    power: 'Power Weapons'
  };

  const damageTypes = {
    all: 'All Damage Types',
    1: 'Kinetic',
    2: 'Arc',
    3: 'Solar',
    4: 'Void',
    6: 'Stasis',
    7: 'Strand'
  };

  const tierTypes = {
    all: 'All Tiers',
    3: 'Rare',
    4: 'Legendary',
    5: 'Exotic'
  };

  const fetchWeaponData = async () => {
    setWeaponLoading(true);
    try {
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      
      if (manifestResponse && manifestResponse.jsonWorldContentPaths) {
        const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
        const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
        
        if (itemsResponse.ok) {
          const worldContent = await itemsResponse.json();
          const inventoryItems = worldContent.DestinyInventoryItemDefinition || {};
          
          const weaponList = Object.values(inventoryItems).filter(item => {
            return (
              item.itemType === 3 && // Weapon type
              !item.redacted &&
              !item.blacklisted &&
              item.displayProperties?.name &&
              item.displayProperties.name.trim() !== '' &&
              item.inventory?.bucketTypeHash &&
              (item.inventory.bucketTypeHash === EQUIPMENT_SLOTS.KINETIC_WEAPONS ||
               item.inventory.bucketTypeHash === EQUIPMENT_SLOTS.ENERGY_WEAPONS ||
               item.inventory.bucketTypeHash === EQUIPMENT_SLOTS.POWER_WEAPONS)
            );
          });
          
          setWeaponItems(weaponList);
        }
      }
    } catch (err) {
      console.error('Error fetching weapon data:', err);
    } finally {
      setWeaponLoading(false);
    }
  };

  const filteredWeapons = weaponItems.filter(item => {
    if (selectedWeaponSlot !== 'all') {
      const bucketHash = item.inventory?.bucketTypeHash;
      const slotMatch = {
        kinetic: bucketHash === EQUIPMENT_SLOTS.KINETIC_WEAPONS,
        energy: bucketHash === EQUIPMENT_SLOTS.ENERGY_WEAPONS,
        power: bucketHash === EQUIPMENT_SLOTS.POWER_WEAPONS
      };
      
      if (!slotMatch[selectedWeaponSlot]) return false;
    }

    if (selectedDamageType !== 'all') {
      if (item.defaultDamageType !== parseInt(selectedDamageType)) return false;
    }

    if (selectedTier !== 'all') {
      if (item.inventory?.tierType !== parseInt(selectedTier)) return false;
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
    <div className="weapon-analysis">
      <div className="analysis-header">
        <h2>⚔️ Weapon Analysis</h2>
        <p>Explore how Bungie categorizes weapons by slot, damage type, and tier.</p>
        
        <div className="fetch-section">
          <button 
            onClick={fetchWeaponData} 
            disabled={weaponLoading}
            className="fetch-button"
          >
            {weaponLoading ? '⏳ Loading Weapon Data...' : '🔍 Fetch Weapon Data'}
          </button>
          
          {weaponItems.length > 0 && (
            <p className="data-status">✅ Loaded {weaponItems.length} weapon items</p>
          )}
        </div>
      </div>

      {weaponItems.length > 0 && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label>Weapon Slot:</label>
              <select 
                value={selectedWeaponSlot} 
                onChange={(e) => setSelectedWeaponSlot(e.target.value)}
              >
                {Object.entries(weaponSlots).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Damage Type:</label>
              <select 
                value={selectedDamageType} 
                onChange={(e) => setSelectedDamageType(e.target.value)}
              >
                {Object.entries(damageTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tier:</label>
              <select 
                value={selectedTier} 
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                {Object.entries(tierTypes).map(([key, label]) => (
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
                placeholder="Search weapon names..."
              />
            </div>
          </div>

          <ItemTable 
            items={filteredWeapons}
            title={`Weapon Items (${filteredWeapons.length} found)`}
            showCategories={true}
            showBungieData={true}
          />
        </>
      )}

      <style jsx>{`
        .weapon-analysis {
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
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .fetch-button:hover {
          background: #c0392b;
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
          border-color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

// Subclass Analysis Tab - Real Implementation
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
    7: 'Strand'
  };

  const classTypes = {
    all: 'All Classes',
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock'
  };

  const fetchSubclassData = async () => {
    setSubclassLoading(true);
    try {
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      
      if (manifestResponse && manifestResponse.jsonWorldContentPaths) {
        const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
        const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
        
        if (itemsResponse.ok) {
          const worldContent = await itemsResponse.json();
          const inventoryItems = worldContent.DestinyInventoryItemDefinition || {};
          
          const subclassList = Object.values(inventoryItems).filter(item => {
            return (
              item.itemType === 19 && // Subclass type
              !item.redacted &&
              !item.blacklisted &&
              item.displayProperties?.name &&
              item.displayProperties.name.trim() !== '' &&
              item.classType !== undefined &&
              item.classType !== 3 // Exclude "All Classes" subclasses
            );
          });
          
          setSubclassItems(subclassList);
        }
      }
    } catch (err) {
      console.error('Error fetching subclass data:', err);
    } finally {
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
      const description = item.displayProperties?.description?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      if (!name.includes(term) && !description.includes(term)) return false;
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
            onClick={fetchSubclassData} 
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

// Mod Analysis Tab - Real Implementation
const ModAnalysisTab = ({ callAPI, loading, error }) => {
  const [modItems, setModItems] = useState([]);
  const [modLoading, setModLoading] = useState(false);
  const [selectedModType, setSelectedModType] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const modTypes = {
    all: 'All Mods',
    armor: 'Armor Mods',
    weapon: 'Weapon Mods',
    ghost: 'Ghost Mods',
    artifact: 'Artifact Mods'
  };

  const tierTypes = {
    all: 'All Tiers',
    3: 'Rare',
    4: 'Legendary',
    5: 'Exotic'
  };

  const fetchModData = async () => {
    setModLoading(true);
    try {
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      
      if (manifestResponse && manifestResponse.jsonWorldContentPaths) {
        const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
        const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
        
        if (itemsResponse.ok) {
          const worldContent = await itemsResponse.json();
          const inventoryItems = worldContent.DestinyInventoryItemDefinition || {};
          
          const modList = Object.values(inventoryItems).filter(item => {
            return (
              !item.redacted &&
              !item.blacklisted &&
              item.displayProperties?.name &&
              item.displayProperties.name.trim() !== '' &&
              item.plug && // Has plug data (mods are plugs)
              (
                (item.itemCategoryHashes && item.itemCategoryHashes.some(hash => 
                  hash === 59 || // Armor mods
                  hash === 610365472 || // Weapon mods
                  hash === 1404791674 || // Ghost mods
                  hash === 4104513227 || // Enhanced weapon mods
                  hash === 2487620612 || // Armor stat mods
                  hash === 1052191496 || // Combat mods
                  hash === 1404797438    // Seasonal artifact mods
                )) ||
                item.displayProperties.name.toLowerCase().includes('mod') ||
                item.itemTypeDisplayName?.toLowerCase().includes('mod')
              )
            );
          });
          
          setModItems(modList);
        }
      }
    } catch (err) {
      console.error('Error fetching mod data:', err);
    } finally {
      setModLoading(false);
    }
  };

  const categorizeModType = (item) => {
    if (!item.itemCategoryHashes) return 'unknown';
    
    const categories = item.itemCategoryHashes;
    
    if (categories.includes(59) || categories.includes(2487620612) || categories.includes(1052191496)) {
      return 'armor';
    }
    if (categories.includes(610365472) || categories.includes(4104513227)) {
      return 'weapon';
    }
    if (categories.includes(1404791674)) {
      return 'ghost';
    }
    if (categories.includes(1404797438)) {
      return 'artifact';
    }
    
    const name = item.displayProperties?.name?.toLowerCase() || '';
    if (name.includes('armor') || name.includes('combat') || name.includes('stat')) {
      return 'armor';
    }
    if (name.includes('weapon') || name.includes('targeting') || name.includes('loader')) {
      return 'weapon';
    }
    if (name.includes('ghost')) {
      return 'ghost';
    }
    if (name.includes('artifact') || name.includes('seasonal')) {
      return 'artifact';
    }
    
    return 'unknown';
  };

  const filteredMods = modItems.filter(item => {
    if (selectedModType !== 'all') {
      const modCategory = categorizeModType(item);
      if (modCategory !== selectedModType) return false;
    }

    if (selectedTier !== 'all') {
      if (item.inventory?.tierType !== parseInt(selectedTier)) return false;
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
    <div className="mod-analysis">
      <div className="analysis-header">
        <h2>🔧 Mod Analysis</h2>
        <p>Explore how Bungie categorizes armor mods, weapon mods, and seasonal artifacts.</p>
        
        <div className="fetch-section">
          <button 
            onClick={fetchModData} 
            disabled={modLoading}
            className="fetch-button"
          >
            {modLoading ? '⏳ Loading Mod Data...' : '🔍 Fetch Mod Data'}
          </button>
          
          {modItems.length > 0 && (
            <p className="data-status">✅ Loaded {modItems.length} mod items</p>
          )}
        </div>
      </div>

      {modItems.length > 0 && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label>Mod Type:</label>
              <select 
                value={selectedModType} 
                onChange={(e) => setSelectedModType(e.target.value)}
              >
                {Object.entries(modTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tier:</label>
              <select 
                value={selectedTier} 
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                {Object.entries(tierTypes).map(([key, label]) => (
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
                placeholder="Search mod names..."
              />
            </div>
          </div>

          <ItemTable 
            items={filteredMods}
            title={`Mod Items (${filteredMods.length} found)`}
            showCategories={true}
            showBungieData={true}
          />
        </>
      )}

      <style jsx>{`
        .mod-analysis {
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
          background: #16a085;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .fetch-button:hover {
          background: #138d75;
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
          border-color: #16a085;
        }
      `}</style>
    </div>
  );
};

// Raw Search Tab - Real Implementation
const RawSearchTab = ({ callAPI, loading, error }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [allItems, setAllItems] = useState([]);

  const itemTypeFilters = {
    all: 'All Item Types',
    2: 'Armor',
    3: 'Weapons',
    19: 'Subclasses',
    14: 'Emblems',
    24: 'Ghosts',
    39: 'Vehicles',
    41: 'Ships'
  };

  const classFilters = {
    all: 'All Classes',
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock',
    3: 'Universal'
  };

  const fetchAllItems = async () => {
    setSearchLoading(true);
    try {
      const manifestResponse = await callAPI('Destiny2/Manifest/');
      
      if (manifestResponse && manifestResponse.jsonWorldContentPaths) {
        const worldContentUrl = manifestResponse.jsonWorldContentPaths.en;
        const itemsResponse = await fetch(`https://www.bungie.net${worldContentUrl}`);
        
        if (itemsResponse.ok) {
          const worldContent = await itemsResponse.json();
          const inventoryItems = worldContent.DestinyInventoryItemDefinition || {};
          
          const itemList = Object.values(inventoryItems).filter(item => {
            return (
              !item.redacted &&
              !item.blacklisted &&
              item.displayProperties?.name &&
              item.displayProperties.name.trim() !== ''
            );
          });
          
          setAllItems(itemList);
          setSearchResults(itemList.slice(0, 50)); // Show first 50 by default
        }
      }
    } catch (err) {
      console.error('Error fetching item data:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const performSearch = () => {
    if (!allItems.length) return;

    let filtered = allItems;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.displayProperties?.name?.toLowerCase() || '';
        const description = item.displayProperties?.description?.toLowerCase() || '';
        const typeName = item.itemTypeDisplayName?.toLowerCase() || '';
        return name.includes(term) || description.includes(term) || typeName.includes(term);
      });
    }

    if (itemTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.itemType === parseInt(itemTypeFilter));
    }

    if (classFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.classType === parseInt(classFilter) || 
        (parseInt(classFilter) === 3 && item.classType === 3)
      );
    }

    setSearchResults(filtered.slice(0, 100));
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults(allItems.slice(0, 50));
    }
  };

  return (
    <div className="raw-search">
      <div className="analysis-header">
        <h2>🔍 Raw Data Search</h2>
        <p>Search for any item and examine its raw Bungie categorization data.</p>
        
        <div className="fetch-section">
          <button 
            onClick={fetchAllItems} 
            disabled={searchLoading}
            className="fetch-button"
          >
            {searchLoading ? '⏳ Loading All Items...' : '🔍 Load Item Database'}
          </button>
          
          {allItems.length > 0 && (
            <p className="data-status">✅ Loaded {allItems.length} total items</p>
          )}
        </div>
      </div>

      {allItems.length > 0 && (
        <>
          <div className="search-controls">
            <div className="search-row">
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by item name, description, or type..."
                  className="main-search-input"
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
                <button onClick={performSearch} className="search-button">
                  🔍 Search
                </button>
              </div>
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Item Type:</label>
                <select 
                  value={itemTypeFilter} 
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                >
                  {Object.entries(itemTypeFilters).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Class:</label>
                <select 
                  value={classFilter} 
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  {Object.entries(classFilters).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ItemTable 
            items={searchResults}
            title={`Search Results (${searchResults.length} items${searchResults.length === 100 ? ' - showing first 100' : ''})`}
            showCategories={true}
            showBungieData={true}
          />
        </>
      )}

      <style jsx>{`
        .raw-search {
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
          background: #34495e;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .fetch-button:hover {
          background: #2c3e50;
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

        .search-controls {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .search-row {
          margin-bottom: 1rem;
        }

        .search-input-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .main-search-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          min-width: 300px;
        }

        .main-search-input:focus {
          outline: none;
          border-color: #34495e;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          background: #34495e;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          white-space: nowrap;
        }

        .search-button:hover {
          background: #2c3e50;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
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

        .filter-group select {
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #34495e;
        }

        @media (max-width: 768px) {
          .search-input-group {
            flex-direction: column;
            align-items: stretch;
          }

          .main-search-input {
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
};

export default DataExplorer;