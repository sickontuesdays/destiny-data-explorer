import { useState } from 'react';

const ItemTable = ({ items, title, showCategories = true, showBungieData = true }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.displayProperties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemTypeDisplayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (hash) => {
    setExpandedItem(expandedItem === hash ? null : hash);
  };

  const getItemTypeInfo = (item) => {
    return {
      itemType: item.itemType,
      itemSubType: item.itemSubType,
      classType: item.classType,
      tierType: item.inventory?.tierType,
      bucketHash: item.inventory?.bucketTypeHash
    };
  };

  const getClassTypeName = (classType) => {
    switch(classType) {
      case 0: return 'Titan';
      case 1: return 'Hunter'; 
      case 2: return 'Warlock';
      case 3: return 'All Classes';
      default: return 'Unknown';
    }
  };

  const getTierTypeName = (tierType) => {
    switch(tierType) {
      case 2: return 'Common';
      case 3: return 'Rare';
      case 4: return 'Legendary';
      case 5: return 'Exotic';
      default: return 'Unknown';
    }
  };

  return (
    <div className="item-table">
      <div className="table-header">
        <h3>{title} ({filteredItems.length} items)</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="no-items">
          {searchTerm ? 'No items match your search.' : 'No items found.'}
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const isExpanded = expandedItem === item.hash;
            const typeInfo = getItemTypeInfo(item);
            
            return (
              <div key={item.hash} className={`item-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="item-basic" onClick={() => toggleExpanded(item.hash)}>
                  <div className="item-icon">
                    {item.displayProperties?.hasIcon ? (
                      <img 
                        src={`https://www.bungie.net${item.displayProperties.icon}`}
                        alt={item.displayProperties?.name || 'Item'}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="no-icon">📦</div>
                    )}
                  </div>
                  
                  <div className="item-info">
                    <div className="item-name">
                      {item.displayProperties?.name || 'Unnamed Item'}
                    </div>
                    <div className="item-type">
                      {item.itemTypeDisplayName || `Type ${item.itemType}`}
                    </div>
                    {typeInfo.classType !== 3 && typeInfo.classType !== undefined && (
                      <div className="item-class">
                        👤 {getClassTypeName(typeInfo.classType)}
                      </div>
                    )}
                    {typeInfo.tierType && (
                      <div className="item-tier">
                        ⭐ {getTierTypeName(typeInfo.tierType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="expand-button">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>

                {isExpanded && (
                  <div className="item-details">
                    {item.displayProperties?.description && (
                      <div className="item-description">
                        <strong>Description:</strong>
                        <p>{item.displayProperties.description}</p>
                      </div>
                    )}

                    {showCategories && item.itemCategoryHashes && (
                      <div className="item-categories">
                        <strong>Category Hashes:</strong>
                        <div className="category-list">
                          {item.itemCategoryHashes.map(hash => (
                            <span key={hash} className="category-hash">{hash}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {showBungieData && (
                      <div className="bungie-data">
                        <strong>🔍 Bungie Classification:</strong>
                        <div className="data-grid">
                          <div className="data-item">
                            <span className="data-label">Hash:</span>
                            <span className="data-value">{item.hash}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Item Type:</span>
                            <span className="data-value">{typeInfo.itemType}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Item SubType:</span>
                            <span className="data-value">{typeInfo.itemSubType}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Class Type:</span>
                            <span className="data-value">{typeInfo.classType}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Tier Type:</span>
                            <span className="data-value">{typeInfo.tierType}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Bucket Hash:</span>
                            <span className="data-value">{typeInfo.bucketHash}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Redacted:</span>
                            <span className="data-value">{item.redacted ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Blacklisted:</span>
                            <span className="data-value">{item.blacklisted ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .item-table {
          width: 100%;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .table-header h3 {
          margin: 0;
          color: #333;
        }

        .search-input {
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          min-width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: #f39c12;
        }

        .no-items {
          text-align: center;
          padding: 2rem;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .items-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }

        .item-card {
          background: white;
          border: 2px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .item-card:hover {
          border-color: #f39c12;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .item-card.expanded {
          border-color: #f39c12;
        }

        .item-basic {
          display: flex;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          gap: 1rem;
        }

        .item-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .item-icon img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }

        .no-icon {
          font-size: 24px;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-weight: bold;
          color: #333;
          font-size: 1.1rem;
        }

        .item-type {
          color: #666;
          font-size: 0.9rem;
        }

        .item-class, .item-tier {
          color: #888;
          font-size: 0.8rem;
        }

        .expand-button {
          color: #f39c12;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .item-details {
          border-top: 1px solid #eee;
          padding: 1rem;
          background: #fafafa;
        }

        .item-description {
          margin-bottom: 1rem;
        }

        .item-description p {
          margin: 0.5rem 0 0 0;
          color: #555;
          font-style: italic;
        }

        .item-categories {
          margin-bottom: 1rem;
        }

        .category-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .category-hash {
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: monospace;
        }

        .bungie-data {
          border-top: 1px solid #ddd;
          padding-top: 1rem;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px solid #eee;
        }

        .data-label {
          font-weight: 500;
          color: #555;
        }

        .data-value {
          font-family: monospace;
          color: #333;
          background: #e9ecef;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: unset;
            width: 100%;
          }

          .item-basic {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .item-info {
            align-items: center;
          }

          .data-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemTable;