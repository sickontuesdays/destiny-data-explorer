const fs = require('fs');
const path = require('path');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const AdmZip = require('adm-zip');

class BungieManifestDownloader {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.bungie.net';
    this.manifestUrl = '/Platform/Destiny2/Manifest/';
    this.dataDir = './manifest-data';
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Fetch manifest metadata from Bungie API
   */
  async getManifestInfo() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.bungie.net',
        path: this.manifestUrl,
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'User-Agent': 'Destiny-Data-Explorer/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.ErrorCode !== 1) {
              reject(new Error(`Bungie API Error: ${response.Message}`));
              return;
            }
            
            console.log('✅ Manifest info retrieved successfully');
            console.log(`📊 Version: ${response.Response.version}`);
            
            resolve(response.Response);
          } catch (error) {
            reject(new Error(`Failed to parse manifest response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.end();
    });
  }

  /**
   * Download the SQLite manifest database
   */
  async downloadManifest(manifestInfo) {
    const manifestPath = manifestInfo.mobileWorldContentPaths.en;
    const downloadUrl = this.baseUrl + manifestPath;
    const fileName = path.basename(manifestPath);
    const filePath = path.join(this.dataDir, fileName);

    console.log(`📥 Downloading manifest from: ${downloadUrl}`);
    console.log(`💾 Saving to: ${filePath}`);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(downloadUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r📊 Progress: ${progress}% (${downloadedSize}/${totalSize} bytes)`);
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\n✅ Manifest downloaded successfully');
          resolve(filePath);
        });

        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Delete partial file
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Extract the SQLite database from the ZIP file
   */
  extractManifest(zipFilePath) {
    try {
      console.log('📂 Extracting manifest database...');
      
      const zip = new AdmZip(zipFilePath);
      const zipEntries = zip.getEntries();
      
      if (zipEntries.length === 0) {
        throw new Error('No files found in manifest ZIP');
      }

      // The SQLite file is usually the first (and only) entry
      const entry = zipEntries[0];
      const dbPath = path.join(this.dataDir, 'manifest.db');
      
      // Extract the database
      zip.extractEntryTo(entry, this.dataDir, false, true);
      
      // Rename to a consistent name
      const extractedPath = path.join(this.dataDir, entry.entryName);
      if (extractedPath !== dbPath) {
        fs.renameSync(extractedPath, dbPath);
      }
      
      console.log(`✅ Database extracted to: ${dbPath}`);
      return dbPath;
    } catch (error) {
      throw new Error(`Failed to extract manifest: ${error.message}`);
    }
  }

  /**
   * Get database connection
   */
  getDatabase(dbPath) {
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        throw new Error(`Failed to open database: ${err.message}`);
      }
    });
  }

  /**
   * List all tables in the manifest database
   */
  async listTables(dbPath) {
    const db = this.getDatabase(dbPath);
    
    return new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.close();
        resolve(rows.map(row => row.name));
      });
    });
  }

  /**
   * Get table schema information
   */
  async getTableInfo(dbPath, tableName) {
    const db = this.getDatabase(dbPath);
    
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.close();
        resolve(rows);
      });
    });
  }

  /**
   * Count rows in a table
   */
  async getTableCount(dbPath, tableName) {
    const db = this.getDatabase(dbPath);
    
    return new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.close();
        resolve(row.count);
      });
    });
  }

  /**
   * Complete manifest download and extraction process
   */
  async downloadAndExtract() {
    try {
      console.log('🚀 Starting manifest download process...\n');
      
      // Step 1: Get manifest info
      const manifestInfo = await this.getManifestInfo();
      
      // Step 2: Download the ZIP file
      const zipPath = await this.downloadManifest(manifestInfo);
      
      // Step 3: Extract the SQLite database
      const dbPath = this.extractManifest(zipPath);
      
      // Step 4: Clean up ZIP file
      fs.unlinkSync(zipPath);
      console.log('🗑️ Cleaned up ZIP file');
      
      // Step 5: Analyze database structure
      console.log('\n📋 Analyzing database structure...');
      const tables = await this.listTables(dbPath);
      
      console.log(`\n📊 Found ${tables.length} tables in manifest:`);
      for (const table of tables) {
        const count = await this.getTableCount(dbPath, table);
        console.log(`  • ${table}: ${count.toLocaleString()} records`);
      }
      
      console.log(`\n✅ Manifest ready at: ${dbPath}`);
      return {
        version: manifestInfo.version,
        dbPath: dbPath,
        tables: tables
      };
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

module.exports = BungieManifestDownloader;