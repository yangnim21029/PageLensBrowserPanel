/**
 * PageLens API 模組
 * 處理所有與 PageLens API 的通訊
 */
export class PageLensAPI {
  constructor() {
    this.apiEndpoints = [
      'https://page-lens-zeta.vercel.app',  // 雲端版本
      'http://localhost:3000'                // 本地版本
    ];
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
          console.log(`API 調用成功 (${apiType})`);
          return response;
        } else {
          console.warn(`API 調用失敗 (${apiType}): HTTP ${response.status}`);
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