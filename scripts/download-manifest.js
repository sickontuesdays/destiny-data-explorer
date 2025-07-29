#!/usr/bin/env node

const BungieManifestDownloader = require('../manifest-downloader');
const path = require('path');
const fs = require('fs');

// Configuration
const API_KEY = process.env.BUNGIE_API_KEY || 'YOUR_API_KEY_HERE';

if (API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ Please set your Bungie API key in environment variable BUNGIE_API_KEY');
  console.error('   Example: export BUNGIE_API_KEY=your_api_key_here');
  process.exit(1);
}

async function main() {
  const downloader = new BungieManifestDownloader(API_KEY);
  
  try {
    const result = await downloader.downloadAndExtract();
    
    // Save manifest info for later use
    const infoPath = path.join('./manifest-data', 'manifest-info.json');
    fs.writeFileSync(infoPath, JSON.stringify({
      version: result.version,
      downloadDate: new Date().toISOString(),
      dbPath: result.dbPath,
      tables: result.tables
    }, null, 2));
    
    console.log(`\n📄 Manifest info saved to: ${infoPath}`);
    console.log('\n🎯 Next steps:');
    console.log('  1. Run: npm run explore    # Explore database structure');
    console.log('  2. Run: npm run analyze    # Analyze item categories');
    console.log('  3. Run: npm run build      # Build filtered data files');
    
  } catch (error) {
    console.error('❌ Failed to download manifest:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}