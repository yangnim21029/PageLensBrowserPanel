# PageLens Chrome Extension

SEO analysis Chrome extension for analyzing webpage performance and readability.

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory

## Architecture

### File Structure
```
PageLensBowserPanel/
├── modules/           # ES6 modules
│   ├── api.js        # API communication with automatic fallback
│   ├── ui.js         # UI rendering and updates
│   ├── wordpress.js  # WordPress-specific functionality
│   └── fullscreen.js # Main analysis controller
├── styles/           # Modular CSS with variables
├── popup.html/js     # Extension popup
├── fullscreen.html   # Analysis dashboard
├── manifest.json     # Manifest V3 configuration
└── CLAUDE.md         # Development instructions
```

### Key Features
- One-click page analysis
- Fullscreen dashboard with detailed SEO/readability metrics
- WordPress/PressLogic network support
- Custom focus keyword analysis
- JSON export functionality

### Data Flow
1. Popup captures current page HTML via Chrome scripting API
2. Data stored in Chrome storage (`analysisData` key)
3. Fullscreen page retrieves data and sends to PageLens API
4. Results rendered through UI module

## API Integration

**Endpoints:**
- Primary: `https://page-lens-zeta.vercel.app`
- Fallback: `http://localhost:3000`
- WordPress: `https://article-api.presslogic.com/v1/articles/getArticleSEO`

**Request Structure:**
```javascript
{
  htmlContent: string,
  pageDetails: { url, title, language },
  focusKeyword: string,
  options: {
    contentSelectors: ['.article', 'main', '.content'],
    assessmentConfig: { enableAll: true }
  }
}
```

## Development

### Chrome Storage Keys
- `analysisData`: Contains `{ html, title, url, timestamp, focusKeyword? }`

### Default Assessments
**SEO:** H1_KEYWORD, ALT_ATTRIBUTE, KEYWORD_DENSITY, META_DESCRIPTION_KEYWORD, TEXT_LENGTH  
**Readability:** SENTENCE_LENGTH_IN_TEXT, PARAGRAPH_TOO_LONG, FLESCH_READING_EASE

### WordPress Sites Support
Supported domains are hardcoded in `modules/wordpress.js`. To add new sites, update the `supportedSites` array.

### Error Handling
- Input validation: Toast notifications
- API failures: Automatic cloud → localhost fallback

## Chrome Permissions
- `activeTab`: Access current tab content
- `scripting`: Execute scripts in tabs
- `storage`: Store analysis data
- Host permissions: All URLs for content analysis

## Testing
1. Click reload in Chrome extensions page after code changes
2. For popup debugging: Right-click extension icon → "Inspect popup"
3. For fullscreen debugging: Open fullscreen page → Use Chrome DevTools
