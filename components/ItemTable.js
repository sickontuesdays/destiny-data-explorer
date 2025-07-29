import { useState } from 'react';
import { 
  getClassTypeName, 
  getTierTypeName, 
  getEquipmentSlotName,
  getDamageTypeName,
  getItemTypeName 
} from '../lib/bungie-api';

const ItemTable = ({ items, title, showCategories = true, showBungieData = true }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.displayProperties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemTypeDisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.displayProperties?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue, bValue;
    
    switch(sortBy) {
      case 'name':
        aValue = a.displayProperties?.name || '';
        bValue = b.displayProperties?.name || '';
        break;
      case 'type':
        aValue = a.itemTypeDisplayName || '';
        bValue = b.itemTypeDisplayName || '';
        break;
      case 'class':
        aValue = a.classType || 0;
        bValue = b.classType || 0;
        break;
      case 'tier':
        aValue = a.inventory?.tierType || 0;
        bValue = b.inventory?.tierType || 0;
        break;
      default:
        aValue = a.displayProperties?.name || '';
        bValue = b.displayProperties?.name || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const toggleExpanded = (hash) => {
    setExpandedItem(expandedItem === hash ? null : hash);
  };

  const getItemTypeInfo = (item) => {
    return {
      itemType: item.itemType,
      itemSubType: item.itemSubType,
      classType: item.classType,
      tierType: item.inventory?.tierType,
      bucketHash: item.inventory?.bucketTypeHash,
      damageType: item.defaultDamageType,
      itemCategoryHashes: item.itemCategoryHashes || []
    };
  };

  const getTierClassName = (tierType) => {
    switch(tierType) {
      case 2: return 'tier-common';
      case 3: return 'tier-rare';
      case 4: return 'tier-legendary';
      case 5: return 'tier-exotic';
      default: return 'tier-unknown';
    }
  };

  return (
    <div className="item-table">
      <div className="table-header">
        <h3>{title} ({sortedItems.length} items)</h3>
        <div className="table-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="class">Sort by Class</option>
              <option value="tier">Sort by Tier</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="no-items">
          {searchTerm ? 'No items match your search.' : 'No items found.'}
        </div>
      ) : (
        <div className="items-grid">
          {sortedItems.map((item) => {
            const isExpanded = expandedItem === item.hash;
            const typeInfo = getItemTypeInfo(item);
            const tierClass = getTierClassName(typeInfo.tierType);
            
            return (
              <div key={item.hash} className={`item-card ${isExpanded ? 'expanded' : ''} ${tierClass}`}>
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
                      {item.itemTypeDisplayName || getItemTypeName(item.itemType)}
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
                    {typeInfo.bucketHash && (
                      <div className="item-slot">
                        🎯 {getEquipmentSlotName(typeInfo.bucketHash)}
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

                    {showCategories && item.itemCategoryHashes && item.itemCategoryHashes.length > 0 && (
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
                            <span className="data-value">{typeInfo.itemType} ({getItemTypeName(typeInfo.itemType)})</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Item SubType:</span>
                            <span className="data-value">{typeInfo.itemSubType}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Class Type:</span>
                            <span className="data-value">{typeInfo.classType} ({getClassTypeName(typeInfo.classType)})</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Tier Type:</span>
                            <span className="data-value">{typeInfo.tierType} ({getTierTypeName(typeInfo.tierType)})</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Bucket Hash:</span>
                            <span className="data-value">{typeInfo.bucketHash} ({getEquipmentSlotName(typeInfo.bucketHash)})</span>
                          </div>
                          {typeInfo.damageType && (
                            <div className="data-item">
                              <span className="data-label">Damage Type:</span>
                              <span className="data-value">{typeInfo.damageType} ({getDamageTypeName(typeInfo.damageType)})</span>
                            </div>
                          )}
                          <div className="data-item">
                            <span className="data-label">Redacted:</span>
                            <span className="data-value">{item.redacted ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Blacklisted:</span>
                            <span className="data-value">{item.blacklisted ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Has Icon:</span>
                            <span className="data-value">{item.displayProperties?.hasIcon ? 'Yes' : 'No'}</span>
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

        .table-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
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

        .sort-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .sort-controls select {
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 6px;
        }

        .sort-order-btn {
          padding: 0.5rem 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-weight: bold;
        }

        .sort-order-btn:hover {
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

        .tier-common {
          border-left: 4px solid #95a5a6;
        }

        .tier-rare {
          border-left: 4px solid #3498db;
        }

        .tier-legendary {
          border-left: 4px solid #9b59b6;
        }

        .tier-exotic {
          border-left: 4px solid #f1c40f;
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

        .item-type, .item-class, .item-tier, .item-slot {
          color: #666;
          font-size: 0.9rem;
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

          .table-controls {
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