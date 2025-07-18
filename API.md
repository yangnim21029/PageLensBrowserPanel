# PageLens API v2.0 Documentation

簡單易用的網頁 SEO 和可讀性分析 API

## 🚀 快速開始

**API 地址：** `https://page-lens-zeta.vercel.app`

### 基本使用

```javascript
// 分析任何網頁內容
const response = await fetch('https://page-lens-zeta.vercel.app/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    htmlContent: '<html>你的網頁內容...</html>',
    pageDetails: {
      url: 'https://example.com',
      title: '網頁標題'
    },
    focusKeyword: '關鍵詞'
  })
});

const result = await response.json();
console.log('SEO 分數:', result.report.overallScores.seoScore);
```

### 📚 完整文檔

- **`GET /docs`** - 完整 API 文檔和所有 15 個評估項目
- **`GET /example`** - 使用範例和完整請求/回應格式

## 📋 主要端點

### 1. HTML 內容分析

```http
POST /analyze
```

**必要參數：**

- `htmlContent` - HTML 內容字串
- `pageDetails.url` - 網頁 URL
- `pageDetails.title` - 網頁標題

**可選參數：**

- `focusKeyword` - 目標關鍵詞
- `options.contentSelectors` - CSS 選擇器（指定分析區域）
- `options.excludeSelectors` - CSS 選擇器（排除區域）

### 2. WordPress 文章分析

```http
POST /analyze-wp-url
```

**必要參數：**

- `url` - WordPress 文章 URL

**支援網站：** PressLogic 旗下所有網站（holidaysmart.io、girlstyle.com 等）

### 3. 文檔端點

```http
GET /docs     # 完整 API 文檔
GET /example  # 使用範例
```

## ⚡ 新功能亮點 (v2.0)

### 統一評估 ID 格式

- **統一命名：** 所有評估 ID 現在前後端一致（如 `H1_MISSING = 'H1_MISSING'`）
- **固定數量：** 每次分析保證返回 15 個評估結果
- **增強回應：** 包含處理時間、API 版本、時間戳等資訊

### 評估標準值

- **標準範圍：** 部分評估項目現在會返回 `standards` 欄位
- **包含內容：** 最佳範圍 (optimal)、可接受範圍 (acceptable)、單位和說明
- **獨立定義：** 每個評估器內部獨立定義標準值，保持模組化

### 頁面理解資訊

- **新增欄位：** API 現在返回 `pageUnderstanding` 欄位
- **包含內容：** 頁面結構、媒體資訊、連結統計、文字分析等
- **提升 UX：** 讓用戶了解系統如何理解他們的頁面

### 詳細使用指南

```javascript
// WordPress 分析
const response = await fetch(
  'https://page-lens-zeta.vercel.app/analyze-wp-url',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://holidaysmart.io/article/456984/九龍'
    })
  }
);

const result = await response.json();
console.log(result.markdownReport); // 格式化的 Markdown 報告

// 外部網站分析
const response = await fetch('https://page-lens-zeta.vercel.app/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    htmlContent: '<html>...</html>',
    pageDetails: { url: 'https://example.com', title: '標題' },
    focusKeyword: '關鍵詞',
    options: {
      contentSelectors: ['article', 'main'],
      excludeSelectors: ['.ad', '.sidebar']
    }
  })
});
```

### 📄 Markdown 報告功能

API 現在會在 `markdownReport` 欄位返回格式化的 Markdown 報告，包含：

- 📈 **分數總結** - SEO、可讀性和總分
- 🔍 **詳細評估結果** - 每個項目的具體數值和狀態
- 💡 **改進建議** - 自動篩選最重要的改進項目

### 📊 評估標準值功能

部分評估項目會返回 `standards` 欄位，包含該項目的標準值範圍：

```javascript
// API 回應範例（包含 standards）
{
  "id": "KEYWORD_DENSITY_LOW",
  "type": "SEO",
  "name": "Good Keyword Density",
  "status": "good",
  "score": 100,
  "details": { "density": 1.8, "keywordCount": 12, "totalWords": 667 },
  "standards": {
    "optimal": { "min": 0.5, "max": 2.5, "unit": "%" },
    "acceptable": { "min": 0.3, "max": 3.0, "unit": "%" },
    "description": "關鍵字密度最佳範圍 0.5-2.5%"
  }
}
```

### 📖 頁面理解資訊功能

API 現在會在 `pageUnderstanding` 欄位返回頁面的結構化理解資訊：

```javascript
// API 回應範例（包含 pageUnderstanding）
{
  "pageUnderstanding": {
    "title": "男士髮型推薦｜2024年9大最新潮流髮型",
    "metaDescription": "2024年男士髮型推薦，包括韓系髮型、日系髮型等9大潮流趨勢...",
    "wordCount": 1532,
    "readingTime": 6,

    "headingStructure": {
      "h1Count": 1,
      "h2Count": 9,
      "totalHeadings": 15,
      "h1Text": "男士髮型推薦｜2024年9大最新潮流髮型"
    },

    "mediaInfo": {
      "imageCount": 12,
      "imagesWithoutAlt": 2,
      "videoCount": 0
    },

    "linkInfo": {
      "totalLinks": 25,
      "externalLinks": 8,
      "internalLinks": 17
    },

    "textStats": {
      "paragraphCount": 18,
      "sentenceCount": 82,
      "averageWordsPerSentence": 18.7
    }
  }
}
```

```markdown
## 📊 SEO 與可讀性評估報告

**URL:** https://example.com  
**時間:** 2025/7/18 上午 11:58:46

### 📈 分數總結

- **SEO 分數:** 89/100 (良好)
- **可讀性分數:** 68/100 (需改進)
- **總分:** 81/100 (良好)

### 🔍 SEO 評估結果 (8/11 通過)

✅ `H1_MISSING` - **分數=100** - H1 數量=1
❌ `META_DESCRIPTION_NEEDS_IMPROVEMENT` - **分數=50** - Meta="..."
...
```

## 🔧 15 個評估項目

### SEO 項目 (11 個)

- `H1_MISSING` - H1 標籤檢測
- `MULTIPLE_H1` - 多重 H1 檢測
- `H1_KEYWORD_MISSING` - H1 關鍵字檢測
- `IMAGES_MISSING_ALT` - 圖片 Alt 檢測
- `KEYWORD_MISSING_FIRST_PARAGRAPH` - 首段關鍵字檢測
- `KEYWORD_DENSITY_LOW` - 關鍵字密度檢測
- `META_DESCRIPTION_NEEDS_IMPROVEMENT` - Meta 描述檢測
- `META_DESCRIPTION_MISSING` - Meta 描述長度檢測
- `TITLE_NEEDS_IMPROVEMENT` - 標題優化檢測
- `TITLE_MISSING` - 標題關鍵字檢測
- `CONTENT_LENGTH_SHORT` - 內容長度檢測

### 可讀性項目 (4 個)

- `FLESCH_READING_EASE` - 可讀性評分
- `PARAGRAPH_LENGTH_LONG` - 段落長度檢測
- `SENTENCE_LENGTH_LONG` - 句子長度檢測
- `SUBHEADING_DISTRIBUTION_POOR` - 子標題分佈檢測

## 🏢 支援的 WordPress 站點

| 網站域名              | 站點代碼 |
| --------------------- | -------- |
| pretty.presslogic.com | GS_HK    |
| girlstyle.com         | GS_TW    |
| holidaysmart.io       | HS_HK    |
| urbanlifehk.com       | UL_HK    |
| poplady-mag.com       | POP_HK   |
| topbeautyhk.com       | TOP_HK   |
| thekdaily.com         | KD_HK    |
| businessfocus.io      | BF_HK    |
| mamidaily.com         | MD_HK    |
| thepetcity.co         | PET_HK   |

## 📝 API 使用範例

### WordPress 內部站點分析

```bash
curl -X POST "https://page-lens-zeta.vercel.app/analyze-wp-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://holidaysmart.io/article/456984/九龍"
  }'
```

### 外部站點分析

```bash
curl -X POST "https://page-lens-zeta.vercel.app/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html><head><title>Test</title></head><body><h1>Main Title</h1><p>Content here...</p></body></html>",
    "pageDetails": {
      "url": "https://example.com/article",
      "title": "Article Title"
    },
    "focusKeyword": "關鍵詞",
    "options": {
      "contentSelectors": ["article", "main", ".content"],
      "excludeSelectors": [".ad", ".sidebar"]
    }
  }'
```

---

**📖 需要更多資訊？**

- 訪問 `/docs` 獲取完整 API 文檔
- 訪問 `/example` 查看使用範例
- 查看 `DEPLOYMENT_NOTES.md` 了解 v2.0 遷移指南
