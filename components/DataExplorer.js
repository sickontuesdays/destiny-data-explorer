// components/DataExplorer.js - Complete Subclass Analysis Tab (Full)
// Replace the SubclassAnalysisTab placeholder with this implementation

// Subclass Analysis Tab - Real Implementation
const SubclassAnalysisTab = ({ callAPI, loading, error }) => {
  const [subclassItems, setSubclassItems] = useState([]);
  const [subclassLoading, setSubclassLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubclassType, setSelectedSubclassType] = useState('all');
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

  const subclassTypes = {
    all: 'All Subclass Types',
    light: 'Light Subclasses (Arc/Solar/Void)',
    darkness: 'Darkness Subclasses (Stasis/Strand)',
    prismatic: 'Prismatic'
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
              item.classType !== 3 // Exclude "All Classes" subclasses (these are usually invalid)
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

  const categorizeSubclassType = (item) => {
    const damageType = item.defaultDamageType;
    const name = item.displayProperties?.name?.toLowerCase() || '';
    
    if (damageType === 8 || name.includes('prismatic')) return 'prismatic';
    if (damageType === 6 || damageType === 7) return 'darkness'; // Stasis or Strand
    if (damageType === 2 || damageType === 3 || damageType === 4) return 'light'; // Arc, Solar, Void
    
    return 'unknown';
  };

  const filteredSubclasses = subclassItems.filter(item => {
    if (selectedElement !== 'all') {
      if (item.defaultDamageType !== parseInt(selectedElement)) return false;
    }

    if (selectedClass !== 'all') {
      if (item.classType !== parseInt(selectedClass)) return false;
    }

    if (selectedSubclassType !== 'all') {
      const subclassCategory = categorizeSubclassType(item);
      if (subclassCategory !== selectedSubclassType) return false;
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
        <p>Explore how Bungie structures subclasses, their elemental affinities, and class restrictions.</p>
        
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
          <div className="subclass-summary">
            <h3>📊 Subclass Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Total Subclasses:</strong> {subclassItems.length}
              </div>
              <div className="summary-item">
                <strong>Light Subclasses:</strong> {subclassItems.filter(item => categorizeSubclassType(item) === 'light').length}
              </div>
              <div className="summary-item">
                <strong>Darkness Subclasses:</strong> {subclassItems.filter(item => categorizeSubclassType(item) === 'darkness').length}
              </div>
              <div className="summary-item">
                <strong>Prismatic:</strong> {subclassItems.filter(item => categorizeSubclassType(item) === 'prismatic').length}
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
              <label>Subclass Type:</label>
              <select 
                value={selectedSubclassType} 
                onChange={(e) => setSelectedSubclassType(e.target.value)}
              >
                {Object.entries(subclassTypes).map(([key, label]) => (
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

          <div className="subclass-insights">
            <h3>🔍 Key Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Element Distribution</h4>
                <ul>
                  <li>Arc: {subclassItems.filter(item => item.defaultDamageType === 2).length}</li>
                  <li>Solar: {subclassItems.filter(item => item.defaultDamageType === 3).length}</li>
                  <li>Void: {subclassItems.filter(item => item.defaultDamageType === 4).length}</li>
                  <li>Stasis: {subclassItems.filter(item => item.defaultDamageType === 6).length}</li>
                  <li>Strand: {subclassItems.filter(item => item.defaultDamageType === 7).length}</li>
                  <li>Prismatic: {subclassItems.filter(item => item.defaultDamageType === 8).length}</li>
                </ul>
              </div>
              <div className="insight-card">
                <h4>Class Distribution</h4>
                <ul>
                  <li>Titan: {subclassItems.filter(item => item.classType === 0).length}</li>
                  <li>Hunter: {subclassItems.filter(item => item.classType === 1).length}</li>
                  <li>Warlock: {subclassItems.filter(item => item.classType === 2).length}</li>
                </ul>
              </div>
              <div className="insight-card">
                <h4>Data Structure Notes</h4>
                <ul>
                  <li>itemType: 19 (Subclass)</li>
                  <li>defaultDamageType: Element ID</li>
                  <li>classType: Class restriction</li>
                  <li>talentGrid: Ability data</li>
                  <li>Prismatic: Testing as damageType 8</li>
                </ul>
              </div>
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
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

        .subclass-insights {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #3498db;
        }

        .subclass-insights h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .insight-card {
          background: white;
          padding: 1rem;
          border-radius: 6px;
        }

        .insight-card h4 {
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 1rem;
        }

        .insight-card ul {
          margin: 0;
          padding-left: 1rem;
          color: #666;
        }

        .insight-card li {
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};