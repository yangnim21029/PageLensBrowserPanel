# Chrome Web Store 權限說明

## Single Purpose Description (單一用途描述)
PageLens SEO 分析工具是一個專業的網頁 SEO 和可讀性分析擴充功能，幫助內容創作者和網站管理員優化網頁內容，提升搜尋引擎排名和用戶體驗。

## Permission Justifications (權限使用說明)

### activeTab 權限
- **用途**：當用戶點擊擴充功能圖標時，需要存取當前瀏覽頁面的內容進行 SEO 分析
- **必要性**：這是核心功能所需，用於獲取頁面 HTML 內容、標題、URL 等信息進行分析
- **使用時機**：僅在用戶主動點擊擴充功能時才會使用

### scripting 權限
- **用途**：在當前頁面執行腳本以提取頁面完整的 HTML 內容
- **必要性**：確保能夠獲取動態生成的內容，提供準確的 SEO 分析結果
- **使用時機**：僅在用戶點擊分析按鈕時執行

### storage 權限
- **用途**：暫存分析數據，以便在全螢幕分析頁面中顯示詳細結果
- **必要性**：在 popup 和全螢幕頁面之間傳遞分析數據
- **儲存內容**：僅儲存當前分析的頁面內容和結果，不會收集用戶個人資料

### host_permissions (http://localhost/* 和 https://*)
- **用途**：連接到 PageLens API 服務進行 SEO 分析
- **必要性**：
  - `http://localhost/*`：用於本地開發和測試
  - `https://*/*`：用於連接雲端 API 服務 (https://page-lens-zeta.vercel.app)
- **資料使用**：僅傳送頁面內容進行分析，不收集用戶瀏覽歷史或個人資料

### Remote Code (遠端程式碼)
- **說明**：本擴充功能不使用任何遠端程式碼
- **所有功能**：均在本地執行，僅通過 API 傳送分析請求

## Privacy Practices (隱私實踐)

1. **資料收集**：僅收集用戶主動選擇分析的頁面內容
2. **資料使用**：僅用於 SEO 和可讀性分析
3. **資料儲存**：暫時儲存在本地，關閉擴充功能後自動清除
4. **資料傳輸**：使用 HTTPS 加密傳輸到分析 API
5. **第三方分享**：不與任何第三方分享用戶資料

## Data Usage Certification (資料使用認證)
我們承諾遵守 Chrome Web Store 開發者計劃政策，不會：
- 收集或傳輸用戶個人識別資訊
- 追蹤用戶瀏覽行為
- 將資料用於廣告或行銷目的
- 儲存或分享敏感資料