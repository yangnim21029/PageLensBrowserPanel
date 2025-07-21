# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PageLens is a Chrome Extension (Manifest V3) for SEO and readability analysis. It's designed specifically to analyze web pages with special support for WordPress/PressLogic network sites.

## Development Setup

This is a pure Chrome extension without build tools:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
4. The extension will appear with the name "PageLens SEO 分析工具"

To test changes:
- Click the reload button in Chrome extensions page after modifying code
- For popup debugging: Right-click the extension icon → "Inspect popup"
- For fullscreen page debugging: Open the fullscreen page → Use Chrome DevTools

## Architecture

### Module System
The codebase uses ES6 modules with the following structure:
- `modules/api.js` - Handles all PageLens API communication with automatic fallback from cloud to localhost
- `modules/ui.js` - Manages all UI updates and rendering
- `modules/wordpress.js` - WordPress-specific functionality including keyword extraction
- `modules/fullscreen.js` - Main controller that orchestrates the analysis flow

### Data Flow
1. `popup.js` captures current page HTML using Chrome scripting API
2. Data is stored in Chrome storage with key `analysisData`
3. `fullscreen.js` retrieves data and coordinates with API for analysis
4. Results are rendered through the UI module

### API Integration
- Primary endpoint: `https://page-lens-zeta.vercel.app`
- Fallback: `http://localhost:3000`
- WordPress article API: `https://article-api.presslogic.com/v1/articles/getArticleSEO`

The API module automatically tries cloud first, then localhost if cloud fails.

## Key Implementation Details

### WordPress Support
Supported sites are hardcoded in `modules/wordpress.js`:
- holidaysmart.io, pretty.presslogic.com, girlstyle.com, urbanlifehk.com
- weekendhk.com, gotrip.hk, nmplus.hk, sundaymore.com, and others

### Analysis Request Structure
```javascript
{
  htmlContent: "string",
  pageDetails: { url, title, language },
  focusKeyword: "string",
  relatedKeywords: ["string"], // v2.3: renamed from synonyms
  options: {
    contentSelectors: ['.article', 'main', '.content'],
    assessmentConfig: { enableAll: true }
  }
}
```

### Chrome Storage Keys
- `analysisData`: Contains `{ html, title, url, timestamp, focusKeyword? }`

### CSS Architecture
Styles are modular with CSS variables defined in `styles/variables.css`:
- Primary colors: rgb(44, 62, 80), rgb(52, 94, 125), rgb(93, 135, 168)
- Background: rgb(240, 244, 247)

## Common Tasks

### Adding New WordPress Site Support
1. Add domain to `supportedSites` array in `modules/wordpress.js`
2. Map to site code in API documentation if needed

### Modifying Analysis Assessments
Default assessments are defined in `ui.js:renderDefaultAssessments()`:
- SEO: H1_KEYWORD, ALT_ATTRIBUTE, KEYWORD_DENSITY, META_DESCRIPTION_KEYWORD, TEXT_LENGTH
- Readability: SENTENCE_LENGTH_IN_TEXT, PARAGRAPH_TOO_LONG, FLESCH_READING_EASE

### Error Handling
- Input validation errors use Toast notifications (right corner)
- System errors can use inline error messages
- API failures automatically fallback from cloud to localhost

## Extension Permissions
- `activeTab`: Access current tab content
- `scripting`: Execute scripts in tabs
- `storage`: Store analysis data
- Host permissions: All URLs for content analysis