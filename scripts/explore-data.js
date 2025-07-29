#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class DestinyDataExplorer {
  constructor() {
    this.dbPath = './manifest-data/manifest.db';
    this.manifestInfo = this.loadManifestInfo();
  }

  loadManifestInfo() {
    const infoPath = './manifest-data/manifest-info.json';
    if (!fs.existsSync(infoPath)) {
      console.error('❌ Manifest info not found. Run: npm run download first');
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  }

  getDatabase() {
    return new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY);
  }

  // Query helper with promise wrapper
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.getDatabase();
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Get a single record
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.getDatabase();
      db.get(sql, params, (err, row) => {
        db.close();
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Examine DestinyInventoryItemDefinition table structure
   */
  async examineItemDefinitions() {
    console.log('🔍 Examining DestinyInventoryItemDefinition...\n');
    
    try {
      // Get table schema
      const schema = await this.query("PRAGMA table_info(DestinyInventoryItemDefinition)");
      console.log('📋 Table Schema:');
      schema.forEach(col => {
        console.log(`  • ${col.name} (${col.type})`);
      });

      // Get total count
      const count = await this.get("SELECT COUNT(*) as count FROM DestinyInventoryItemDefinition");
      console.log(`\n📊 Total Items: ${count.count.toLocaleString()}`);

      // Sample a few records to understand JSON structure
      console.log('\n🔬 Sample Items:');
      const samples = await this.query(`
        SELECT id, json 
        FROM DestinyInventoryItemDefinition 
        WHERE id > 0 
        LIMIT 3
      `);

      samples.forEach((item, index) => {
        const data = JSON.parse(item.json);
        console.log(`\n--- Sample ${index + 1} ---`);
        console.log(`ID: ${item.id}`);
        console.log(`Name: ${data.displayProperties?.name || 'No Name'}`);
        console.log(`Item Type: ${data.itemType}`);
        console.log(`Item Sub Type: ${data.itemSubType}`);
        console.log(`Tier Type: ${data.inventory?.tierType}`);
        console.log(`Categories: ${JSON.stringify(data.itemCategoryHashes)}`);
        console.log(`Redacted: ${data.redacted}`);
        console.log(`Blacklisted: ${data.blacklisted}`);
      });

    } catch (error) {
      console.error('❌ Error examining items:', error.message);
    }
  }

  /**
   * Examine item categories
   */
  async examineItemCategories() {
    console.log('\n🏷️  Examining DestinyItemCategoryDefinition...\n');
    
    try {
      const count = await this.get("SELECT COUNT(*) as count FROM DestinyItemCategoryDefinition");
      console.log(`📊 Total Categories: ${count.count.toLocaleString()}`);

      // Get all categories
      console.log('\n📋 All Item Categories:');
      const categories = await this.query(`
        SELECT id, json 
        FROM DestinyItemCategoryDefinition 
        ORDER BY id
      `);

      const categoryMap = {};
      categories.forEach(cat => {
        const data = JSON.parse(cat.json);
        categoryMap[cat.id] = {
          name: data.displayProperties?.name || 'Unknown',
          description: data.displayProperties?.description || '',
          visible: data.visible,
          deprecated: data.deprecated
        };
        
        if (data.visible && !data.deprecated) {
          console.log(`  • ${cat.id}: ${data.displayProperties?.name || 'Unnamed'}`);
        }
      });

      // Save category mapping for reference
      fs.writeFileSync('./manifest-data/categories.json', JSON.stringify(categoryMap, null, 2));
      console.log('\n💾 Category mapping saved to ./manifest-data/categories.json');

    } catch (error) {
      console.error('❌ Error examining categories:', error.message);
    }
  }

  /**
   * Find armor items by category
   */
  async findArmorItems() {
    console.log('\n🛡️  Finding Armor Items...\n');
    
    try {
      // Look for items that might be armor
      const armorQuery = `
        SELECT id, json 
        FROM DestinyInventoryItemDefinition 
        WHERE json LIKE '%"itemType":2%' 
        AND json NOT LIKE '%"redacted":true%'
        AND json NOT LIKE '%"blacklisted":true%'
        LIMIT 10
      `;
      
      const armorItems = await this.query(armorQuery);
      
      console.log(`Found ${armorItems.length} armor samples:`);
      armorItems.forEach(item => {
        const data = JSON.parse(item.json);
        console.log(`\n📦 ${data.displayProperties?.name || 'Unnamed'}`);
        console.log(`  Type: ${data.itemType} | SubType: ${data.itemSubType}`);
        console.log(`  Categories: ${JSON.stringify(data.itemCategoryHashes)}`);
        console.log(`  Class Type: ${data.classType}`);
        console.log(`  Tier: ${data.inventory?.tierType}`);
      });

    } catch (error) {
      console.error('❌ Error finding armor:', error.message);
    }
  }

  /**
   * Find weapon items by category
   */
  async findWeaponItems() {
    console.log('\n⚔️  Finding Weapon Items...\n');
    
    try {
      const weaponQuery = `
        SELECT id, json 
        FROM DestinyInventoryItemDefinition 
        WHERE json LIKE '%"itemType":3%' 
        AND json NOT LIKE '%"redacted":true%'
        AND json NOT LIKE '%"blacklisted":true%'
        LIMIT 10
      `;
      
      const weaponItems = await this.query(weaponQuery);
      
      console.log(`Found ${weaponItems.length} weapon samples:`);
      weaponItems.forEach(item => {
        const data = JSON.parse(item.json);
        console.log(`\n⚔️  ${data.displayProperties?.name || 'Unnamed'}`);
        console.log(`  Type: ${data.itemType} | SubType: ${data.itemSubType}`);
        console.log(`  Categories: ${JSON.stringify(data.itemCategoryHashes)}`);
        console.log(`  Damage Type: ${data.defaultDamageType}`);
        console.log(`  Tier: ${data.inventory?.tierType}`);
        console.log(`  Equip Bucket: ${data.inventory?.bucketTypeHash}`);
      });

    } catch (error) {
      console.error('❌ Error finding weapons:', error.message);
    }
  }

  /**
   * Find subclass items
   */
  async findSubclassItems() {
    console.log('\n🔮 Finding Subclass Items...\n');
    
    try {
      const subclassQuery = `
        SELECT id, json 
        FROM DestinyInventoryItemDefinition 
        WHERE json LIKE '%"itemType":19%' 
        AND json NOT LIKE '%"redacted":true%'
        LIMIT 5
      `;
      
      const subclasses = await this.query(subclassQuery);
      
      console.log(`Found ${subclasses.length} subclass samples:`);
      subclasses.forEach(item => {
        const data = JSON.parse(item.json);
        console.log(`\n🔮 ${data.displayProperties?.name || 'Unnamed'}`);
        console.log(`  Type: ${data.itemType} | SubType: ${data.itemSubType}`);
        console.log(`  Categories: ${JSON.stringify(data.itemCategoryHashes)}`);
        console.log(`  Class Type: ${data.classType}`);
        console.log(`  Has Talent Grid: ${!!data.talentGrid}`);
      });

    } catch (error) {
      console.error('❌ Error finding subclasses:', error.message);
    }
  }

  /**
   * Analyze item type distribution
   */
  async analyzeItemTypes() {
    console.log('\n📊 Analyzing Item Type Distribution...\n');
    
    try {
      const typeQuery = `
        SELECT 
          json_extract(json, '$.itemType') as itemType,
          json_extract(json, '$.itemSubType') as itemSubType,
          COUNT(*) as count
        FROM DestinyInventoryItemDefinition 
        WHERE json NOT LIKE '%"redacted":true%'
        AND json NOT LIKE '%"blacklisted":true%'
        GROUP BY itemType, itemSubType
        ORDER BY count DESC
        LIMIT 20
      `;
      
      const distribution = await this.query(typeQuery);
      
      console.log('Top Item Type/SubType combinations:');
      distribution.forEach(row => {
        console.log(`  Type ${row.itemType}, SubType ${row.itemSubType}: ${row.count} items`);
      });

    } catch (error) {
      console.error('❌ Error analyzing types:', error.message);
    }
  }

  /**
   * Run complete exploration
   */
  async explore() {
    console.log('🚀 Starting Destiny 2 Data Exploration...\n');
    console.log(`📅 Manifest Version: ${this.manifestInfo.version}`);
    console.log(`📅 Downloaded: ${this.manifestInfo.downloadDate}\n`);
    
    await this.examineItemDefinitions();
    await this.examineItemCategories();
    await this.analyzeItemTypes();
    await this.findArmorItems();
    await this.findWeaponItems();
    await this.findSubclassItems();
    
    console.log('\n✅ Exploration complete!');
    console.log('\n🎯 Next steps:');
    console.log('  • Review ./manifest-data/categories.json for category mappings');
    console.log('  • Run: npm run analyze    # Deep dive into categorization');
    console.log('  • Run: npm run build      # Generate filtered data files');
  }
}

async function main() {
  const explorer = new DestinyDataExplorer();
  await explorer.explore();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Exploration failed:', error.message);
    process.exit(1);
  });
}

module.exports = DestinyDataExplorer;