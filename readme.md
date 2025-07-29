# Destiny 2 Data Explorer - Manifest Downloader

This tool downloads and analyzes the Bungie Destiny 2 manifest database to understand how items are categorized and structured.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Bungie API Key
1. Go to [Bungie.net Application Portal](https://www.bungie.net/en/Application)
2. Create a new application
3. Copy your API key

### 3. Set Environment Variable
```bash
# Linux/Mac
export BUNGIE_API_KEY=your_api_key_here

# Windows
set BUNGIE_API_KEY=your_api_key_here
```

## Usage

### Step 1: Download Manifest
```bash
npm run download
```
This will:
- Fetch the latest manifest metadata from Bungie
- Download the SQLite database (~100MB)
- Extract and analyze the database structure
- Show you all available tables and record counts

### Step 2: Explore Data Structure
```bash
npm run explore
```
This will:
- Examine item definitions and categories
- Show sample armor, weapons, and subclass items
- Analyze item type distributions
- Generate a category mapping file

### Step 3: Analyze Categories (Coming Next)
```bash
npm run analyze
```

## What You'll Learn

After running the downloader and explorer, you'll understand:

### Database Structure
- **DestinyInventoryItemDefinition**: Contains ALL items (weapons, armor, mods, subclasses, etc.)
- **DestinyItemCategoryDefinition**: Category hierarchy and filtering rules
- **Other tables**: Various definition tables for activities, vendors, etc.

### Item Classification
- **itemType**: High-level type (2=Armor, 3=Weapon, 19=Subclass, etc.)
- **itemSubType**: Specific subtype (Auto Rifle, Helmet, etc.)
- **itemCategoryHashes**: Array of category IDs for modern filtering
- **classType**: Class restriction (0=Titan, 1=Hunter, 2=Warlock, 3=All)

### Filtering Criteria for "Active" Items
- `redacted: false` - Not hidden from API
- `blacklisted: false` - Not removed from game
- Has valid `displayProperties.name` - Not empty/unnamed
- Additional category-specific filters

## Output Files

The tools create several files in `./manifest-data/`:
- `manifest.db` - The SQLite database
- `manifest-info.json` - Version and metadata
- `categories.json` - Category ID to name mapping

## Next Steps

Once you've explored the data structure, we'll create:
1. **Category Analyzer** - Deep dive into specific item categories
2. **Data Filters** - Extract only the items we need
3. **JSON Builders** - Generate clean data files for your app
4. **GitHub Action** - Automate the Tuesday updates

## Troubleshooting

### "API key not set" error
Make sure you've set the `BUNGIE_API_KEY` environment variable.

### "Database not found" error
Run `npm run download` first to download the manifest.

### Large download size
The manifest is ~100MB. This is normal and only downloaded once per week.

## File Structure
```
destiny-data-explorer/
├── manifest-downloader.js    # Core downloader class
├── scripts/
│   ├── download-manifest.js  # Download script
│   └── explore-data.js       # Data exploration
├── manifest-data/           # Downloaded data (created)
│   ├── manifest.db          # SQLite database
│   ├── manifest-info.json   # Metadata
│   └── categories.json      # Category mappings
└── package.json
```