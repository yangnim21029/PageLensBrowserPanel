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
    focusKeyword: '焦點關鍵詞',
    relatedKeywords: ['相關關鍵詞1', '相關關鍵詞2']
  })
});

const result = await response.json();
console.log('SEO 分數:', result.report.overallScores.seoScore);
```

### 📚 完整文檔

- **`GET /docs`** - 完整 API 文檔和所有 16 個評估項目
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

- `focusKeyword` - 焦點關鍵詞
- `relatedKeywords` - 相關關鍵字清單（字串陣列）
- `synonyms` - 同義詞清單（字串陣列，預留給未來功能）_目前建議使用 relatedKeywords_
- `options.contentSelectors` - CSS 選擇器（指定分析區域）
- `options.excludeSelectors` - CSS 選擇器（排除區域）

### 2. WordPress 文章分析

```http
POST /analyze-wp-url
```

**必要參數：**

- `url` - WordPress 文章 URL

**支援網站：** PressLogic 旗下所有網站（holidaysmart.io、girlstyle.com 等）

**⚠️ WordPress 關鍵字特殊處理規則：**

WordPress API 返回的 `focusKeyphrase` 欄位會使用 `-` 作為分隔符，格式為：

```
焦點關鍵字-相關關鍵字1-相關關鍵字2-相關關鍵字3
```

系統會自動解析為：

- **焦點關鍵字 (focusKeyword)**：第一個關鍵字
- **相關關鍵字清單 (relatedKeywords)**：其餘所有關鍵字

範例：

```json
// WordPress API 返回
{
  "focusKeyphrase": "香港半日遊好去處-九龍半日遊好去處-港島半日遊好去處-新界半日遊好去處"
}

// PageLens 解析後
{
  "focusKeyword": "香港半日遊好去處",
  "relatedKeywords": ["九龍半日遊好去處", "港島半日遊好去處", "新界半日遊好去處"]
}
```

**注意：** 此特殊規則僅適用於 WordPress 端點，一般 `/analyze` 端點仍需分別提供 `focusKeyword` 和 `relatedKeywords`。

### 3. 代理端點（隱藏 WordPress 路由）

```http
POST /api/proxy/content    # 獲取文章內容
POST /api/proxy/metadata   # 獲取 SEO 元數據
```

**用途：** 通過代理層訪問 WordPress API，隱藏實際的 WordPress 端點

**Content 端點參數：**

- `resourceId` - 文章 ID
- `siteCode` - 站點代碼（如 GS_HK）

**Metadata 端點參數：**

- `resourceUrl` - 文章完整 URL

### 4. 文檔端點

```http
GET /docs     # 完整 API 文檔
GET /example  # 使用範例
```

## ⚡ 新功能亮點 (v2.0)

### 統一評估 ID 格式

- **統一命名：** 所有評估 ID 現在前後端一致（如 `H1_MISSING = 'H1_MISSING'`）
- **固定數量：** 每次分析保證返回 16 個評估結果（12 個 SEO + 4 個可讀性）
- **增強回應：** 包含處理時間、API 版本、時間戳等資訊

### 🆕 像素寬度計算

- **精確評估：** 針對中文內容使用像素寬度計算，而非字符數
- **計算規則：** 中文字 14px、英文字母 5px、數字 8px、空格 5px
- **智能標準：** Title >150px 良好(最大 600px)、Meta Description >600px 良好(最大 960px)
- **雙重數據：** 同時提供 `pixelWidth` 和 `charEquivalent` 兩種數據

### 評估標準值

- **標準範圍：** 部分評估項目現在會返回 `standards` 欄位
- **像素單位：** Title 和 Meta Description 使用 px 單位，更準確
- **包含內容：** 最佳範圍 (optimal)、可接受範圍 (acceptable)、單位和說明
- **獨立定義：** 每個評估器內部獨立定義標準值，保持模組化

### 頁面理解資訊

- **新增欄位：** API 現在返回 `pageUnderstanding` 欄位
- **包含內容：** 頁面結構、媒體資訊、連結統計、文字分析等
- **提升 UX：** 讓用戶了解系統如何理解他們的頁面

### 術語更新 (v2.3)

- **更名：** `synonyms` → `relatedKeywords` 更準確反映其用途
- **相關關鍵字：** 這些是與焦點關鍵字相關的次要關鍵字，而非同義詞
- **向後兼容：** API 仍接受 `synonyms` 參數，會自動映射到 `relatedKeywords`
- **未來保留：** `synonyms` 欄位保留給未來真正的同義詞功能使用

### 首段關鍵字檢測改進 (v2.5)

- **精準檢測：** 首段檢測現在使用 `paragraphs` 陣列，只分析 `<p>` 標籤內容
- **排除標題：** 不再將 H1 或其他標題文字誤判為首段內容
- **標準回應：** 評估結果包含 `details.firstParagraph` 顯示前 100 字預覽
- **新增標準值：** 添加 `standards` 欄位，說明「首段（前 100 字）應包含焦點關鍵字」

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
    focusKeyword: '焦點關鍵詞',
    relatedKeywords: ['相關關鍵詞1', '相關關鍵詞2'],
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

部分評估項目會返回 `standards` 欄位，包含該項目的標準值範圍。**新版本採用像素寬度計算**，更準確地評估中文內容：

```javascript
// API 回應範例（Meta Description - 使用像素寬度）
{
  "id": "META_DESCRIPTION_MISSING",
  "type": "SEO",
  "name": "Meta Description Length Good",
  "status": "good",
  "score": 100,
  "details": {
    "pixelWidth": 837,
    "charEquivalent": 60
  },
  "standards": {
    "optimal": { "min": 600, "max": 960, "unit": "px" },
    "acceptable": { "min": 300, "max": 960, "unit": "px" },
    "description": "Meta 描述寬度最佳 >600px，最大960px"
  }
}

// API 回應範例（Title - 使用像素寬度）
{
  "id": "TITLE_NEEDS_IMPROVEMENT",
  "type": "SEO",
  "name": "Title Length Good",
  "status": "good",
  "score": 100,
  "details": {
    "pixelWidth": 263,
    "charEquivalent": 19
  },
  "standards": {
    "optimal": { "min": 150, "max": 600, "unit": "px" },
    "acceptable": { "min": 100, "max": 600, "unit": "px" },
    "description": "標題寬度最佳 >150px，最大600px"
  }
}
```

#### 像素寬度計算規則：

- **中文字符**: 14px/字
- **英文字母**: 5px/字
- **數字**: 8px/字
- **空格**: 5px/字
- **標點符號**: 忽略不計算

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

## 🔧 16 個評估項目

### SEO 項目 (12 個)

- `H1_MISSING` - H1 標籤檢測
- `MULTIPLE_H1` - 多重 H1 檢測
- `H1_KEYWORD_MISSING` - H1 關鍵字檢測
- `H2_SYNONYMS_MISSING` - H2 相關關鍵字檢測（檢查 relatedKeywords）
- `IMAGES_MISSING_ALT` - 圖片 Alt 檢測
- `KEYWORD_MISSING_FIRST_PARAGRAPH` - 首段關鍵字檢測（v2.5: 排除標題，只分析實際段落內容）
- `KEYWORD_DENSITY_LOW` - 關鍵字密度檢測（v2.4: 考慮關鍵字長度，H2 關鍵字享 2x 權重；支援空格分隔的關鍵字）
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

## 🎯 新增評估標準 (v2.3)

### H1 和 Title 關鍵字要求

- **H1 標籤：** 必須同時包含焦點關鍵字和至少一個相關關鍵字
- **Title 標籤：** 必須同時包含焦點關鍵字和至少一個相關關鍵字
- **字符級匹配：** 使用字符級匹配算法，特別適合中文關鍵字（如「九龍好去處」和「九龍好玩」）

### H2 相關關鍵字覆蓋

- **H2_SYNONYMS_MISSING：** 檢查所有相關關鍵字是否出現在 H2 標籤中
- **覆蓋率評分：** 100% 覆蓋得滿分，50% 以上為 OK，低於 50% 為 BAD
- **內容結構：** 確保相關關鍵字分佈在各個章節，提升內容相關性

### 關鍵字密度計算 (v2.4)

- **計算公式：** (關鍵字長度 × 出現次數) / 總字數 × 100%
- **H2 權重：** H2 中的關鍵字獲得 2 倍權重
- **空格支援：** 關鍵字如「洗面乳 推薦」會分別計算每個詞
- **回應新增：** `keywordLength` 顯示關鍵字長度
- **最佳範圍：** 0.5-2.5%（optimal）
- **可接受範圍：** 0.5-6.0%（acceptable）

### 最近更新

**v2.5**

- 首段關鍵字檢測改進：排除標題文字，只分析 `<p>` 標籤內容
- 為 KEYWORD_MISSING_FIRST_PARAGRAPH 添加 standards 欄位

**v2.4**

- 關鍵字密度計算考慮關鍵字長度
- H2 關鍵字獲得 2x 權重
- 支援空格分隔的關鍵字

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
    "focusKeyword": "焦點關鍵詞",
    "relatedKeywords": ["相關關鍵詞1", "相關關鍵詞2"],
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
