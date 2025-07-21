# Chrome Web Store 上架檢查清單

## ✅ 已完成項目：

1. **Icons (圖標)**
   - ✓ 16x16 - `icons/icon16.png`
   - ✓ 32x32 - `icons/icon32.png`
   - ✓ 48x48 - `icons/icon48.png`
   - ✓ 128x128 - `icons/icon128.png`

2. **宣傳圖片**
   - ✓ 440x280 小型宣傳圖 - `store_assets/promo_440x280.png`

3. **權限說明文件**
   - ✓ 完整的權限使用說明 - `store_assets/permissions_justification.md`

## ❌ 需要你在 Chrome Web Store 開發者控制台中完成：

### 1. Account Tab (帳戶標籤)
- [ ] 提供聯絡電子郵件
- [ ] 驗證電子郵件地址

### 2. Privacy Practices Tab (隱私實踐標籤)
需要填寫以下內容（使用 `permissions_justification.md` 中的說明）：

**Single Purpose Description:**
```
PageLens SEO 分析工具是一個專業的網頁 SEO 和可讀性分析擴充功能，幫助內容創作者和網站管理員優化網頁內容，提升搜尋引擎排名和用戶體驗。
```

**Permission Justifications:**
- **activeTab**: 當用戶點擊擴充功能圖標時，需要存取當前瀏覽頁面的內容進行 SEO 分析
- **scripting**: 在當前頁面執行腳本以提取頁面完整的 HTML 內容
- **storage**: 暫存分析數據，以便在全螢幕分析頁面中顯示詳細結果
- **host permissions**: 連接到 PageLens API 服務進行 SEO 分析
- **remote code**: 本擴充功能不使用任何遠端程式碼

### 3. Store Listing Tab (商店列表標籤)
- [ ] 上傳至少一張截圖（1280x800 或 640x400）
  - 建議截圖內容：
    1. Popup 介面
    2. 全螢幕分析結果
    3. SEO 分析詳情
    4. 可讀性分析結果

### 4. 其他必填項目
- [ ] 選擇類別 (建議: Productivity 或 Developer Tools)
- [ ] 選擇語言 (中文繁體)
- [ ] 填寫詳細描述
- [ ] 勾選資料使用合規認證

## 📸 截圖製作建議：

1. 使用實際的擴充功能運行截圖
2. 展示主要功能和優勢
3. 確保文字清晰可讀
4. 使用高對比度的配色

## 📝 描述文案建議：

**簡短描述 (132字元以內):**
```
專業的 SEO 分析工具，一鍵分析網頁 SEO 表現，提供詳細的優化建議，支援 WordPress 網站關鍵字自動提取。
```

**詳細描述:**
```
PageLens SEO 分析工具是您網站優化的得力助手！

主要功能：
✓ 一鍵分析當前網頁的 SEO 表現
✓ 提供詳細的 SEO 評分和優化建議
✓ 分析網頁可讀性，提升用戶體驗
✓ 支援 WordPress/PressLogic 網站自動提取關鍵字
✓ 中英文雙語界面，適合不同用戶需求

技術特點：
• 使用先進的 SEO 分析算法
• 即時分析，快速獲得結果
• 支援動態網頁內容分析
• 本地處理，保護隱私安全

適合人群：
- 內容創作者
- 網站管理員
- SEO 專業人員
- 數位行銷人員

立即安裝 PageLens，讓您的網頁在搜尋結果中脫穎而出！
```