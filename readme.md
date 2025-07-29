# Destiny 2 Data Explorer - Web Interface

A web-based tool to explore and understand Bungie's Destiny 2 API data structure. Perfect for understanding how items are categorized before building your main application.

## 🚀 Features

- **🌐 Web-Based**: No local dependencies, runs in browser
- **📊 Interactive Exploration**: Click through different data categories
- **🔍 Real-Time Search**: Filter items as you explore
- **📱 Responsive Design**: Works on desktop and mobile
- **⚡ Fast Deployment**: Deploy to Vercel in minutes
- **🎯 Bungie Data Insights**: Understand item categorization

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Bungie API Key
1. Go to [Bungie.net Application Portal](https://www.bungie.net/en/Application)
2. Create a new application (or use your existing one)
3. Copy your API key

### 3. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and enter your API key.

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable (optional)
vercel env add BUNGIE_API_KEY
```

## 📊 What You'll Discover

### Armor Analysis
- How Bungie categorizes helmets, gauntlets, chest, legs, class items
- Class restrictions (Titan/Hunter/Warlock)
- Tier types (Common/Rare/Legendary/Exotic)
- Equipment slot mappings

### Weapon Analysis  
- Weapon slot categorization (Kinetic/Energy/Power)
- Weapon types (Auto Rifle, Hand Cannon, etc.)
- Damage types (Arc/Solar/Void/Stasis/Strand)
- Intrinsic weapon properties

### Subclass Analysis
- How subclasses are structured as items
- Ability categorization (Super/Melee/Grenade/etc.)
- Element classification
- Talent grid data

### Mod Analysis
- Armor mod categorization
- Weapon mod types
- Seasonal artifact mod structure
- Plug system understanding

## 🎯 Key Insights

### Item Classification System
- **itemType**: High-level category (2=Armor, 3=Weapon, 19=Subclass)
- **itemSubType**: Specific subtype (26=Helmet, 6=Auto Rifle)
- **itemCategoryHashes**: Modern category system (array of category IDs)
- **classType**: Class restriction (0=Titan, 1=Hunter, 2=Warlock, 3=All)

### "Active" Item Filters
- `redacted: false` - Not hidden from API
- `blacklisted: false` - Not removed from game  
- Has valid `displayProperties.name` - Not empty/unnamed
- Proper category assignments

### Equipment Slots (Bucket Hashes)
- Kinetic Weapons: `1498876634`
- Energy Weapons: `2465295065`
- Power Weapons: `953998645`
- Helmet: `3448274439`
- Gauntlets: `3551918588`
- And more...

## 📁 File Structure
```
destiny-data-explorer/
├── pages/
│   ├── index.js              # Main dashboard
│   └── api/bungie.js         # API proxy
├── components/
│   ├── DataExplorer.js       # Main explorer component
│   └── ItemTable.js          # Item display table
├── lib/
│   └── bungie-api.js         # API helpers & constants
├── styles/
│   └── globals.css           # Destiny-themed styles
├── next.config.js            # Next.js configuration
└── package.json
```

## 🔧 How It Works

1. **API Proxy**: Calls Bungie API through `/api/bungie` to avoid CORS
2. **Real-Time Fetching**: No manifest download, always current data
3. **Interactive Filtering**: Explore data with search and categorization
4. **Visual Interface**: See how Bungie structures their data
5. **Export Ready**: Understand structure for your own data processing

## 🚀 Deployment Options

### Vercel (Recommended)
- Push to GitHub
- Connect to Vercel
- Add `BUNGIE_API_KEY` environment variable
- Deploy automatically

### Other Platforms
- Works on any Node.js hosting (Netlify, Railway, etc.)
- Static export available: `npm run build && npm run export`

## 🎮 Usage Flow

1. **Enter API Key**: Validate your Bungie API access
2. **Overview Tab**: See manifest version and feature overview
3. **Category Tabs**: Explore armor, weapons, subclasses, mods
4. **Search & Filter**: Find specific items and see their categorization
5. **Understand Structure**: Use insights for your main application

## 💡 Perfect For

- **App Developers**: Understanding Bungie's data before building
- **Data Analysis**: Exploring item categorization patterns
- **API Learning**: See how Bungie structures their responses
- **Team Sharing**: Share findings with your development team

## 🔗 Integration

Use the insights from this tool to build proper data filters for your main casting-destiny application. The category mappings and classification understanding will help you correctly categorize items.

## 📞 Need Help?

This tool shows you exactly how Bungie categorizes their data, which is essential for building proper filters in your main application. Explore each tab to understand the data structure!