// components/DataExplorer.js - Raw Search Tab Implementation
// Replace the RawSearchTab placeholder with this implementation

// Raw Search Tab - Real Implementation
const RawSearchTab = ({ callAPI, loading, error }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [bucketFilter, setBucketFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [allItems, setAllItems] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const itemTypeFilters = {
    all: 'All Item Types',
    2: 'Armor',
    3: 'Weapons',
    19: 'Subclasses',
    14: 'Emblems',
    24: 'Ghosts',
    39: 'Vehicles/Sparrows',
    41: 'Ships',
    21: 'Materials',
    9: 'Consumables',
    42: 'Bounties',
    15: 'Quests',
    44: 'Seasonal Artifacts',
    45: 'Finishers'
  };

  const classFilters = {
    all: 'All Classes',
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock',
    3: 'Universal'
  };

  const tierFilters = {
    all: 'All Tiers',
    1: 'Currency',
    2: 'Common',
    3: 'Rare',
    4: 'Legendary',
    5: 'Exotic'
  };

  const bucketFilters = {
    all: 'All Equipment Slots',
    1498876634: 'Kinetic Weapons',
    2465295065: 'Energy Weapons',
    953998645: 'Power Weapons',
    3448274439: 'Helmet',
    3551918588: 'Gauntlets',
    14239492: 'Chest Armor',
    20886954: 'Leg Armor',
    1585787867: 'Class Item',
    4023194814: 'Ghost',
    2025709351: 'Vehicle',
    284967655: 'Ship',
    2973005342: 'Shader',
    4274335291: 'Emblem'
  };

  const categoryFilters = {
    all: 'All Categories',
    weapons: 'Weapons Only',
    armor: 'Armor Only',
    cosmetics: 'Cosmetics (Shaders/Emblems)',
    consumables: 'Consumables/Materials',
    collectibles: 'Collectibles',
    mods: 'Mods/Plugs'
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
          setSearchResults(itemList.slice(0, 100)); // Show first 100 by default
          setSearchPerformed(true);
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

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.displayProperties?.name?.toLowerCase() || '';
        const description = item.displayProperties?.description?.toLowerCase() || '';
        const typeName = item.itemTypeDisplayName?.toLowerCase() || '';
        const flavorText = item.displayProperties?.description?.toLowerCase() || '';
        
        return name.includes(term) || 
               description.includes(term) || 
               typeName.includes(term) ||
               flavorText.includes(term) ||
               item.hash.toString().includes(term);
      });
    }

    // Item type filter
    if (itemTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.itemType === parseInt(itemTypeFilter));
    }

    // Class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.classType === parseInt(classFilter) || 
        (parseInt(classFilter) === 3 && item.classType === 3)
      );
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.inventory?.tierType === parseInt(tierFilter)
      );
    }

    // Bucket filter
    if (bucketFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.inventory?.bucketTypeHash === parseInt(bucketFilter)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch(categoryFilter) {
          case 'weapons':
            return item.itemType === 3;
          case 'armor':
            return item.itemType === 2;
          case 'cosmetics':
            return item.itemType === 14 || item.itemType === 41 || 
                   (item.inventory?.bucketTypeHash === 2973005342); // Shaders
          case 'consumables':
            return item.itemType === 9 || item.itemType === 21;
          case 'collectibles':
            return item.collectibleHash !== undefined;
          case 'mods':
            return item.plug !== undefined;
          default:
            return true;
        }
      });
    }

    setSearchResults(filtered.slice(0, 200)); // Limit to 200 results for performance
    setSearchPerformed(true);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setItemTypeFilter('all');
    setClassFilter('all');
    setTierFilter('all');
    setBucketFilter('all');
    setCategoryFilter('all');
    setSearchResults(allItems.slice(0, 100));
  };

  const getSearchStats = () => {
    if (!allItems.length) return null;
    
    return {
      total: allItems.length,
      weapons: allItems.filter(item => item.itemType === 3).length,
      armor: allItems.filter(item => item.itemType === 2).length,
      subclasses: allItems.filter(item => item.itemType === 19).length,
      mods: allItems.filter(item => item.plug !== undefined).length,
      exotic: allItems.filter(item => item.inventory?.tierType === 5).length,
      legendary: allItems.filter(item => item.inventory?.tierType === 4).length
    };
  };

  const stats = getSearchStats();

  return (
    <div className="raw-search">
      <div className="analysis-header">
        <h2>🔍 Raw Data Search</h2>
        <p>Search through all Destiny 2 items and examine their raw Bungie categorization data.</p>
        
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

      {stats && (
        <div className="database-stats">
          <h3>📊 Database Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Total Items:</strong> {stats.total.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Weapons:</strong> {stats.weapons.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Armor:</strong> {stats.armor.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Subclasses:</strong> {stats.subclasses.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Mods/Plugs:</strong> {stats.mods.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Exotic Items:</strong> {stats.exotic.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Legendary Items:</strong> {stats.legendary.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {allItems.length > 0 && (
        <>
          <div className="search-controls">
            <div className="search-header">
              <h3>🔎 Advanced Search</h3>
              <button onClick={clearSearch} className="clear-button">
                🗑️ Clear All Filters
              </button>
            </div>
            
            <div className="main-search-row">
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, description, hash, or type..."
                  className="main-search-input"
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
                <button onClick={performSearch} className="search-button">
                  🔍 Search ({searchResults.length} results)
                </button>
              </div>
            </div>
            
            <div className="filters-grid">
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

              <div className="filter-group">
                <label>Tier:</label>
                <select 
                  value={tierFilter} 
                  onChange={(e) => setTierFilter(e.target.value)}
                >
                  {Object.entries(tierFilters).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Equipment Slot:</label>
                <select 
                  value={bucketFilter} 
                  onChange={(e) => setBucketFilter(e.target.value)}
                >
                  {Object.entries(bucketFilters).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Category:</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {Object.entries(categoryFilters).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="search-tips">
            <h3>💡 Search Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>Text Search</h4>
                <ul>
                  <li>Search item names, descriptions, or hashes</li>
                  <li>Use partial matches (e.g., "ace" finds "Ace of Spades")</li>
                  <li>Search by hash number for exact items</li>
                </ul>
              </div>
              <div className="tip-card">
                <h4>Advanced Filtering</h4>
                <ul>
                  <li>Combine multiple filters for precise results</li>
                  <li>Use Equipment Slot to find specific gear types</li>
                  <li>Filter by Tier to find Exotic/Legendary items</li>
                </ul>
              </div>
              <div className="tip-card">
                <h4>Data Analysis</h4>
                <ul>
                  <li>Click items to see raw Bungie data structure</li>
                  <li>Check Category Hashes for classification</li>
                  <li>Compare similar items to understand patterns</li>
                </ul>
              </div>
            </div>
          </div>

          <ItemTable 
            items={searchResults}
            title={searchPerformed ? 
              `Search Results (${searchResults.length} items${searchResults.length === 200 ? ' - showing first 200' : ''})` :
              `Recent Items (${searchResults.length} items)`
            }
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

        .database-stats {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #34495e;
        }

        .database-stats h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
          font-size: 0.9rem;
        }

        .search-controls {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .search-header h3 {
          margin: 0;
          color: #333;
        }

        .clear-button {
          padding: 0.5rem 1rem;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .clear-button:hover {
          background: #c0392b;
        }

        .main-search-row {
          margin-bottom: 1.5rem;
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

        .filters-grid {
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
          font-size: 0.9rem;
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

        .search-tips {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #f39c12;
        }

        .search-tips h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .tip-card {
          background: white;
          padding: 1rem;
          border-radius: 6px;
        }

        .tip-card h4 {
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 1rem;
        }

        .tip-card ul {
          margin: 0;
          padding-left: 1rem;
          color: #666;
        }

        .tip-card li {
          margin-bottom: 0.25rem;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .search-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .search-input-group {
            flex-direction: column;
            align-items: stretch;
          }

          .main-search-input {
            min-width: unset;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};