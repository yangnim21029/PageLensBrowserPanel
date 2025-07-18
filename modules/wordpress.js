/**
 * WordPress 模組
 * 處理 WordPress 相關功能
 */
export class WordPress {
  constructor() {
    this.supportedSites = [
      'pretty.presslogic.com',
      'girlstyle.com',
      'holidaysmart.io',
      'urbanlifehk.com',
      'poplady-mag.com',
      'topbeautyhk.com',
      'thekdaily.com',
      'businessfocus.io',
      'mamidaily.com',
      'thepetcity.co'
    ];
  }

  /**
   * 檢查是否為支援的 WordPress 站點
   * @param {string} url
   * @returns {boolean}
   */
  isSupportedSite(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      // 檢查是否為支援的站點
      if (!this.supportedSites.includes(hostname)) {
        return false;
      }
      
      // 檢查是否為文章頁面（必須包含 /article/）
      if (!pathname.includes('/article/')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 獲取支援的站點列表
   * @returns {string[]}
   */
  getSupportedSites() {
    return this.supportedSites;
  }

  /**
   * 從 WordPress API 獲取關鍵字
   * @param {string} url
   * @returns {Promise<string[]>}
   */
  async fetchKeywordsFromWordPress(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      // 從 URL 路徑提取文章 slug
      const pathParts = pathname.split('/').filter(Boolean);
      const articleSlug = pathParts[pathParts.length - 1];
      
      if (!articleSlug || !this.isSupportedSite(url)) {
        return [];
      }
      
      // 構建 WordPress API URL
      const apiUrl = `https://${hostname}/wp-json/wp/v2/posts?slug=${articleSlug}&_fields=id,yoast_meta,tags,categories`;
      
      console.log('嘗試從 WordPress API 獲取關鍵字...');
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(3000) // 3 秒超時
      });
      
      if (!response.ok) {
        console.warn('WordPress API 回應錯誤:', response.status);
        return [];
      }
      
      const posts = await response.json();
      
      if (!posts || posts.length === 0) {
        console.warn('找不到對應的文章');
        return [];
      }
      
      const post = posts[0];
      const keywords = [];
      
      // 從 Yoast SEO 元數據中提取關鍵字
      let fullFocusKeyword = null; // 保存完整的焦點關鍵字
      
      if (post.yoast_meta) {
        if (post.yoast_meta.yoast_wpseo_focuskw) {
          fullFocusKeyword = post.yoast_meta.yoast_wpseo_focuskw;
          // 特殊規則：如果關鍵字是 xxx-xxx2-xxx3 格式，只取第一個部分作為焦點關鍵字
          const splitKeyword = fullFocusKeyword.split('-')[0].trim();
          keywords.push(splitKeyword);
        }
        if (post.yoast_meta.yoast_wpseo_metakeywords) {
          keywords.push(...post.yoast_meta.yoast_wpseo_metakeywords.split(',').map(k => k.trim()));
        }
      }
      
      // 獲取標籤名稱
      if (post.tags && post.tags.length > 0) {
        const tagPromises = post.tags.map(tagId => 
          fetch(`https://${hostname}/wp-json/wp/v2/tags/${tagId}?_fields=name`)
            .then(res => res.json())
            .then(tag => tag.name)
            .catch(() => null)
        );
        
        const tagNames = await Promise.all(tagPromises);
        keywords.push(...tagNames.filter(Boolean));
      }
      
      // 去重並過濾空值
      const uniqueKeywords = [...new Set(keywords.filter(k => k && k.trim()))];
      
      console.log('WordPress 關鍵字已自動填充:', uniqueKeywords);
      console.log('完整焦點關鍵字:', fullFocusKeyword);
      
      // 返回一個物件，包含關鍵字列表和完整的焦點關鍵字
      return {
        keywords: uniqueKeywords,
        fullFocusKeyword: fullFocusKeyword
      };
      
    } catch (error) {
      console.error('獲取 WordPress 關鍵字失敗:', error);
      return { keywords: [], fullFocusKeyword: null };
    }
  }

  /**
   * 驗證 URL 格式
   * @param {string} url
   * @returns {Object} - { isValid: boolean, error?: string }
   */
  validateUrl(url) {
    if (!url || !url.trim()) {
      return { isValid: false, error: '請輸入要分析的網址' };
    }
    
    try {
      const urlObj = new URL(url);
      
      // 檢查協議
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: '請輸入有效的網址（需要 http:// 或 https://）' };
      }
      
      return { isValid: true };
    } catch {
      return { isValid: false, error: '請輸入有效的網址（包含 http:// 或 https://）' };
    }
  }

  /**
   * 準備 WordPress URL 分析請求
   * 注意：WordPress 文章標題會自動被加入為 H1 標籤進行 SEO 分析 (v1.1.1)
   * @param {string} url
   * @returns {Object}
   */
  prepareAnalysisRequest(url) {
    return {
      url: url,
      options: {
        extractMainContent: true,
        assessmentConfig: { 
          enableAllSEO: true,
          enableAllReadability: false
        }
      }
    };
  }

  /**
   * 更新頁面資訊（用於 WordPress URL 分析）
   * @param {string} url
   * @param {Object} wordpressData
   * @returns {Object}
   */
  formatWordPressData(url, wordpressData = {}) {
    // 優先使用 SEO 標題，其次使用一般標題
    const title = wordpressData.seoMetadata?.title || 
                   wordpressData.title || 
                   '無標題';
    
    const description = wordpressData.seoMetadata?.description || 
                        wordpressData.description || 
                        '';
    
    // 處理焦點關鍵字和相關關鍵字
    const fullFocusKeyword = wordpressData.seoMetadata?.focusKeyphrase || 
                            wordpressData.focusKeyword || 
                            (wordpressData.extractedKeywords && wordpressData.extractedKeywords[0]) || 
                            '';
    
    let focusKeyword = fullFocusKeyword;
    let relatedKeywords = [];
    
    // 特殊規則：如果關鍵字是 xxx-xxx2-xxx3 格式，分割成焦點和相關關鍵字
    if (fullFocusKeyword && fullFocusKeyword.includes('-')) {
      const parts = fullFocusKeyword.split('-').map(k => k.trim());
      focusKeyword = parts[0];
      relatedKeywords = parts.slice(1);
    }
    
    return {
      url: url,
      title: title,
      description: description,
      author: wordpressData.author || '',
      publishedDate: wordpressData.publishedDate || '',
      modifiedDate: wordpressData.modifiedDate || '',
      category: wordpressData.category || '',
      tags: wordpressData.tags || [],
      focusKeyword: focusKeyword,
      relatedKeywords: relatedKeywords,
      fullFocusKeyword: fullFocusKeyword
    };
  }
}