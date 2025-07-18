/**
 * PageLens API 模組
 * 處理所有與 PageLens API 的通訊
 */
export class PageLensAPI {
  constructor() {
    // 檢查是否在開發模式（可以通過 URL 參數或 localStorage 設定）
    const isDevelopment = this.checkDevelopmentMode();
    
    // 根據模式設定 API 端點順序
    this.apiEndpoints = isDevelopment ? [
      'http://localhost:3000',               // 開發模式優先使用本地版本
      'https://page-lens-zeta.vercel.app'   // 備用雲端版本
    ] : [
      'https://page-lens-zeta.vercel.app',  // 生產模式優先使用雲端版本
      'http://localhost:3000'                // 備用本地版本
    ];
    
    console.log('PageLens API 模式:', isDevelopment ? '開發模式' : '生產模式');
    console.log('API 端點優先順序:', this.apiEndpoints);
  }
  
  /**
   * 檢查是否在開發模式
   * @returns {boolean}
   */
  checkDevelopmentMode() {
    // 方法 1: 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
      return true;
    }
    
    // 方法 2: 檢查 localStorage
    if (localStorage.getItem('pageLensDevMode') === 'true') {
      return true;
    }
    
    // 方法 3: 檢查是否在本地開發環境
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return true;
    }
    
    return false;
  }
  
  /**
   * 切換開發模式
   * @param {boolean} enabled
   */
  setDevelopmentMode(enabled) {
    if (enabled) {
      localStorage.setItem('pageLensDevMode', 'true');
    } else {
      localStorage.removeItem('pageLensDevMode');
    }
    console.log('開發模式已' + (enabled ? '啟用' : '停用') + '，請重新載入頁面');
  }

  /**
   * 調用 PageLens API
   * @param {string} endpoint - API 端點
   * @param {Object} options - fetch 選項
   * @returns {Promise<Response>}
   */
  async callAPI(endpoint, options = {}) {
    const errors = [];
    
    // 嘗試每個 API 端點
    for (const baseUrl of this.apiEndpoints) {
      const url = `${baseUrl}${endpoint}`;
      const apiType = baseUrl.includes('localhost') ? '本地版本' : '雲端版本';
      
      try {
        console.log(`嘗試調用 API: ${url} (${apiType})`);
        
        const response = await fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (response.ok) {
          console.log(`✅ API 調用成功 (${apiType}): ${url}`);
          // 在 response 中標記使用的 API 類型
          response._apiType = apiType;
          response._apiUrl = url;
          return response;
        } else {
          console.warn(`❌ API 調用失敗 (${apiType}): HTTP ${response.status}`);
          errors.push(`${apiType}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`API 連接失敗 (${apiType}):`, error);
        errors.push(`${apiType}: ${error.message}`);
      }
    }
    
    // 所有端點都失敗
    throw new Error(`所有 API 都無法連接。${errors.join(', ')}`);
  }

  /**
   * 分析頁面內容
   * @param {Object} analysisRequest - 分析請求數據
   * @returns {Promise<Object>}
   */
  async analyzePage(analysisRequest) {
    const response = await this.callAPI('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisRequest)
    });
    
    return await response.json();
  }

  /**
   * 分析 WordPress URL
   * @param {Object} analysisRequest - 分析請求數據
   * @returns {Promise<Object>}
   */
  async analyzeWordPressUrl(analysisRequest) {
    const response = await this.callAPI('/analyze-wp-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisRequest)
    });
    
    return await response.json();
  }

  /**
   * 通過 proxy 獲取 WordPress 內容
   * @param {Object} request - 請求數據 { resourceId, siteCode }
   * @returns {Promise<Object>}
   */
  async getWordPressContent(request) {
    const response = await this.callAPI('/api/proxy/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    return await response.json();
  }

  /**
   * 通過 proxy 獲取 WordPress SEO 元數據
   * @param {Object} request - 請求數據 { resourceUrl }
   * @returns {Promise<Object>}
   */
  async getWordPressMetadata(request) {
    const response = await this.callAPI('/api/proxy/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    return await response.json();
  }

  /**
   * 健康檢查
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await this.callAPI('/', {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}