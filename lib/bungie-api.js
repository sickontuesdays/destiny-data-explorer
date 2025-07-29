// Bungie API helper functions and constants

// Bungie API constants
export const BUNGIE_API_BASE = 'https://www.bungie.net/Platform';

// Item type constants
export const ITEM_TYPES = {
  NONE: 0,
  CURRENCY: 1,
  ARMOR: 2,
  WEAPON: 3,
  MESSAGE: 7,
  ENGRAM: 8,
  CONSUMABLE: 9,
  EXCHANGE_MATERIAL: 10,
  MISSION_REWARD: 11,
  QUEST_STEP: 12,
  QUEST_STEP_COMPLETE: 13,
  EMBLEM: 14,
  QUEST: 15,
  SUBCLASS: 19,
  CLASS_ITEM: 20,
  MATERIAL: 21,
  GHOST: 24,
  VEHICLE: 39,
  SHIP: 41,
  BOUNTY: 42,
  WRAPPER: 43,
  SEASONAL_ARTIFACT: 44,
  FINISHER: 45
};

// Class type constants  
export const CLASS_TYPES = {
  TITAN: 0,
  HUNTER: 1,
  WARLOCK: 2,
  ALL: 3
};

// Damage type constants
export const DAMAGE_TYPES = {
  NONE: 0,
  KINETIC: 1,
  ARC: 2,
  SOLAR: 3,
  VOID: 4,
  RAID: 5,
  STASIS: 6,
  STRAND: 7
};

// Tier type constants
export const TIER_TYPES = {
  UNKNOWN: 0,
  CURRENCY: 1,
  COMMON: 2,
  RARE: 3,
  LEGENDARY: 4,
  EXOTIC: 5
};

// Equipment slot constants (bucket hashes)
export const EQUIPMENT_SLOTS = {
  KINETIC_WEAPONS: 1498876634,
  ENERGY_WEAPONS: 2465295065,
  POWER_WEAPONS: 953998645,
  HELMET: 3448274439,
  GAUNTLETS: 3551918588,
  CHEST_ARMOR: 14239492,
  LEG_ARMOR: 20886954,
  CLASS_ARMOR: 1585787867,
  GHOST: 4023194814,
  VEHICLE: 2025709351,
  SHIP: 284967655,
  SHADER: 2973005342,
  EMBLEM: 4274335291
};

// Helper functions
export const getClassTypeName = (classType) => {
  switch(classType) {
    case CLASS_TYPES.TITAN: return 'Titan';
    case CLASS_TYPES.HUNTER: return 'Hunter';
    case CLASS_TYPES.WARLOCK: return 'Warlock';
    case CLASS_TYPES.ALL: return 'All Classes';
    default: return 'Unknown';
  }
};

export const getTierTypeName = (tierType) => {
  switch(tierType) {
    case TIER_TYPES.COMMON: return 'Common';
    case TIER_TYPES.RARE: return 'Rare';
    case TIER_TYPES.LEGENDARY: return 'Legendary';
    case TIER_TYPES.EXOTIC: return 'Exotic';
    case TIER_TYPES.CURRENCY: return 'Currency';
    default: return 'Unknown';
  }
};

export const getDamageTypeName = (damageType) => {
  switch(damageType) {
    case DAMAGE_TYPES.KINETIC: return 'Kinetic';
    case DAMAGE_TYPES.ARC: return 'Arc';
    case DAMAGE_TYPES.SOLAR: return 'Solar';
    case DAMAGE_TYPES.VOID: return 'Void';
    case DAMAGE_TYPES.STASIS: return 'Stasis';
    case DAMAGE_TYPES.STRAND: return 'Strand';
    case DAMAGE_TYPES.RAID: return 'Raid';
    default: return 'None';
  }
};

export const getItemTypeName = (itemType) => {
  const typeNames = {
    [ITEM_TYPES.ARMOR]: 'Armor',
    [ITEM_TYPES.WEAPON]: 'Weapon',
    [ITEM_TYPES.GHOST]: 'Ghost',
    [ITEM_TYPES.VEHICLE]: 'Vehicle',
    [ITEM_TYPES.SHIP]: 'Ship',
    [ITEM_TYPES.EMBLEM]: 'Emblem',
    [ITEM_TYPES.SHADER]: 'Shader',
    [ITEM_TYPES.SUBCLASS]: 'Subclass',
    [ITEM_TYPES.CONSUMABLE]: 'Consumable',
    [ITEM_TYPES.MATERIAL]: 'Material',
    [ITEM_TYPES.BOUNTY]: 'Bounty',
    [ITEM_TYPES.QUEST]: 'Quest',
    [ITEM_TYPES.SEASONAL_ARTIFACT]: 'Seasonal Artifact',
    [ITEM_TYPES.FINISHER]: 'Finisher'
  };
  
  return typeNames[itemType] || `Type ${itemType}`;
};

// Equipment slot helpers
export const getEquipmentSlotName = (bucketHash) => {
  const slotNames = {
    [EQUIPMENT_SLOTS.KINETIC_WEAPONS]: 'Kinetic Weapon',
    [EQUIPMENT_SLOTS.ENERGY_WEAPONS]: 'Energy Weapon', 
    [EQUIPMENT_SLOTS.POWER_WEAPONS]: 'Power Weapon',
    [EQUIPMENT_SLOTS.HELMET]: 'Helmet',
    [EQUIPMENT_SLOTS.GAUNTLETS]: 'Gauntlets',
    [EQUIPMENT_SLOTS.CHEST_ARMOR]: 'Chest Armor',
    [EQUIPMENT_SLOTS.LEG_ARMOR]: 'Leg Armor',
    [EQUIPMENT_SLOTS.CLASS_ARMOR]: 'Class Item',
    [EQUIPMENT_SLOTS.GHOST]: 'Ghost',
    [EQUIPMENT_SLOTS.VEHICLE]: 'Vehicle',
    [EQUIPMENT_SLOTS.SHIP]: 'Ship',
    [EQUIPMENT_SLOTS.EMBLEM]: 'Emblem',
    [EQUIPMENT_SLOTS.SHADER]: 'Shader'
  };
  
  return slotNames[bucketHash] || `Slot ${bucketHash}`;
};

export const isWeapon = (item) => {
  return item.itemType === ITEM_TYPES.WEAPON;
};

export const isArmor = (item) => {
  return item.itemType === ITEM_TYPES.ARMOR;
};

export const isSubclass = (item) => {
  return item.itemType === ITEM_TYPES.SUBCLASS;
};

export const isExotic = (item) => {
  return item.inventory?.tierType === TIER_TYPES.EXOTIC;
};

export const isLegendary = (item) => {
  return item.inventory?.tierType === TIER_TYPES.LEGENDARY;
};

// Filter helpers for "active" items
export const isActiveItem = (item) => {
  return !item.redacted && 
         !item.blacklisted && 
         item.displayProperties?.name && 
         item.displayProperties.name.trim() !== '';
};

export const filterArmorBySlot = (items, slotHash) => {
  return items.filter(item => 
    isArmor(item) && 
    isActiveItem(item) && 
    item.inventory?.bucketTypeHash === slotHash
  );
};

export const filterWeaponsBySlot = (items, slotHash) => {
  return items.filter(item => 
    isWeapon(item) && 
    isActiveItem(item) && 
    item.inventory?.bucketTypeHash === slotHash
  );
};

export const filterByClass = (items, classType) => {
  return items.filter(item => 
    item.classType === classType || item.classType === CLASS_TYPES.ALL
  );
};

export const filterByTier = (items, tierType) => {
  return items.filter(item => 
    item.inventory?.tierType === tierType
  );
};

// API call helper
export const callBungieAPI = async (endpoint, apiKey, params = {}) => {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    return data.Response;
  } catch (error) {
    console.error('Bungie API Error:', error);
    throw error;
  }
};

// Search and analysis helpers
export const searchItems = (items, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    item.displayProperties?.name?.toLowerCase().includes(term) ||
    item.displayProperties?.description?.toLowerCase().includes(term) ||
    item.itemTypeDisplayName?.toLowerCase().includes(term)
  );
};

export const groupItemsByType = (items) => {
  return items.reduce((groups, item) => {
    const type = item.itemType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
    return groups;
  }, {});
};

export const groupItemsByClass = (items) => {
  return items.reduce((groups, item) => {
    const classType = item.classType;
    if (!groups[classType]) groups[classType] = [];
    groups[classType].push(item);
    return groups;
  }, {});
};

// Category analysis helpers
export const analyzeCategories = (items) => {
  const categoryCount = {};
  items.forEach(item => {
    if (item.itemCategoryHashes) {
      item.itemCategoryHashes.forEach(hash => {
        categoryCount[hash] = (categoryCount[hash] || 0) + 1;
      });
    }
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20); // Top 20 categories
};

export const getUniqueValues = (items, property) => {
  const values = new Set();
  items.forEach(item => {
    const value = property.split('.').reduce((obj, key) => obj?.[key], item);
    if (value !== undefined && value !== null) {
      values.add(value);
    }
  });
  return Array.from(values).sort();
};