class PageLensAnalyzer {
  constructor() {
    this.primaryApiUrl = 'https://page-lens-zeta.vercel.app';
    this.fallbackApiUrl = 'http://localhost:3000';
    this.apiBaseUrl = this.primaryApiUrl; // 預設使用雲端版本
    // 使用 proxy 端點來隱藏實際的 WordPress API
    this.wpProxyMetadataUrl = '/api/proxy/metadata';
    this.wpProxyContentUrl = '/api/proxy/content';
    this.pageData = null;
    this.analysisResult = null;
    this.init();
  }

  async init() {
    try {
      // 載入頁面資料
      const stored = await chrome.storage.local.get(['analysisData']);
      if (stored.analysisData) {
        this.pageData = stored.analysisData;
        this.populateForm();
        
        // 嘗試從 WordPress API 獲取關鍵字
        await this.loadKeywordsFromWordPress();
      }
      
      // 載入可用的檢測項目
      await this.loadAvailableAssessments();
      
      // 綁定事件監聽器
      this.bindEventListeners();
      
    } catch (error) {
      console.error('初始化失敗:', error);
      this.showError('初始化失敗: ' + error.message);
    }
  }

  populateForm() {
    if (!this.pageData) return;
    
    const urlInput = document.getElementById('urlInput');
    urlInput.value = this.pageData.url || '';
    
    // 設定關鍵字
    const focusKeyword = document.getElementById('focusKeyword');
    if (this.pageData.focusKeyword) {
      focusKeyword.value = this.pageData.focusKeyword;
    } else if (this.pageData.title) {
      focusKeyword.placeholder = `例如: ${this.pageData.title.split(' ')[0]}`;
    }
    
    // 填充頁面資訊
    this.renderPageInfo();
    
    // 填充 HTML 元素
    this.renderHTMLElements();
  }
  
  renderPageInfo() {
    const container = document.getElementById('pageInfoContainer');
    if (!this.pageData || !container) return;
    
    // 解析 HTML 獲取基本資訊
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.pageData.html, 'text/html');
    
    const title = doc.title || '無標題';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '無 Meta 描述';
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '無 Meta 關鍵字';
    
    // 優先從 .article 元素中尋找 H1，如果沒有則從整個頁面尋找
    const articleElement = doc.querySelector('.article');
    let h1Text = '無 H1 標題';
    let h1Source = '全頁面';
    
    if (articleElement) {
      const articleH1 = articleElement.querySelector('h1');
      if (articleH1) {
        h1Text = articleH1.textContent.trim();
        h1Source = '文章內';
      } else {
        // 如果文章內沒有 H1，則從全頁面尋找
        const pageH1 = doc.querySelector('h1');
        if (pageH1) {
          h1Text = pageH1.textContent.trim();
          h1Source = '全頁面';
        }
      }
    } else {
      // 沒有 .article 元素，從全頁面尋找
      const h1Elements = doc.querySelectorAll('h1');
      if (h1Elements.length > 0) {
        h1Text = h1Elements[0].textContent.trim();
        h1Source = '全頁面';
      }
    }
    
    container.innerHTML = `
      <div class="info-item">
        <h4>頁面標題</h4>
        <p>Title 標籤內容</p>
        <div class="value">${title}</div>
      </div>
      
      <div class="info-item">
        <h4>Meta 描述</h4>
        <p>Meta description 標籤內容</p>
        <div class="value">${metaDescription}</div>
      </div>
      
      <div class="info-item">
        <h4>Meta 關鍵字</h4>
        <p>Meta keywords 標籤內容</p>
        <div class="value">${metaKeywords}</div>
      </div>
      
      <div class="info-item">
        <h4>H1 標題</h4>
        <p>主要標題內容 (來源: ${h1Source})</p>
        <div class="value">${h1Text}</div>
      </div>
      
      <div class="info-item" id="wpKeywordsContainer">
        <h4>WordPress 關鍵字</h4>
        <p>從 WordPress API 獲取的焦點關鍵字</p>
        <div class="value" id="wpKeywordsValue">載入中...</div>
      </div>
      
      <div class="info-item">
        <h4>URL</h4>
        <p>當前頁面網址</p>
        <div class="value">${this.pageData.url}</div>
      </div>
    `;
    
    // 異步載入 WordPress 關鍵字到專用容器
    this.loadWordPressKeywordsToInfo();
  }
  
  renderHTMLElements() {
    const container = document.getElementById('htmlElementsContainer');
    if (!this.pageData || !container) return;
    
    // 解析 HTML 獲取元素
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.pageData.html, 'text/html');
    
    // 尋找文章容器
    const articleElement = doc.querySelector('.article');
    const hasArticle = articleElement !== null;
    
    // 根據是否有 .article 元素決定搜索範圍
    const searchScope = hasArticle ? articleElement : doc;
    const scopeText = hasArticle ? '文章內' : '全頁面';
    
    // 獲取元素（優先從文章容器內搜索）
    const headings = searchScope.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const images = searchScope.querySelectorAll('img');
    const links = searchScope.querySelectorAll('a[href]');
    const paragraphs = searchScope.querySelectorAll('p');
    
    // 獲取全頁面的 meta 標籤（這些不在文章內）
    const metaTags = doc.querySelectorAll('meta');
    
    // 如果有文章容器，先顯示文章資訊
    let articleInfo = '';
    if (hasArticle) {
      const articleText = articleElement.textContent.trim();
      const wordCount = articleText.length;
      const paragraphCount = paragraphs.length;
      
      articleInfo = `
        <div class="info-item">
          <h4>文章內容</h4>
          <p>文章容器 (.article) 基本資訊</p>
          <div class="value">
            字數: ${wordCount} | 段落數: ${paragraphCount}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = `
      ${articleInfo}
      
      <div class="info-item">
        <h4>${scopeText}標題結構 (${headings.length})</h4>
        <p>${scopeText}的標題標籤</p>
        <div class="element-list">
          ${Array.from(headings).map(h => `
            <div class="element-item">
              <span class="tag">${h.tagName.toLowerCase()}</span>
              <span class="text">${h.textContent.trim().substring(0, 50)}${h.textContent.trim().length > 50 ? '...' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="info-item">
        <h4>${scopeText}圖片 (${images.length})</h4>
        <p>${scopeText}的圖片標籤</p>
        <div class="element-list">
          ${Array.from(images).map(img => `
            <div class="element-item">
              <span class="tag">img</span>
              <span class="text">Alt: ${img.alt || '無'} | Src: ${img.src.substring(0, 40)}${img.src.length > 40 ? '...' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="info-item">
        <h4>${scopeText}連結 (${links.length})</h4>
        <p>${scopeText}的連結標籤</p>
        <div class="element-list">
          ${Array.from(links).slice(0, 10).map(link => `
            <div class="element-item">
              <span class="tag">a</span>
              <span class="text">${link.textContent.trim().substring(0, 30)}${link.textContent.trim().length > 30 ? '...' : ''}</span>
            </div>
          `).join('')}
          ${links.length > 10 ? `<div class="element-item">... 還有 ${links.length - 10} 個連結</div>` : ''}
        </div>
      </div>
      
      ${hasArticle ? `
        <div class="info-item">
          <h4>文章段落 (${paragraphs.length})</h4>
          <p>文章內的段落內容</p>
          <div class="element-list">
            ${Array.from(paragraphs).slice(0, 5).map((p, index) => `
              <div class="element-item">
                <span class="tag">p${index + 1}</span>
                <span class="text">${p.textContent.trim().substring(0, 60)}${p.textContent.trim().length > 60 ? '...' : ''}</span>
              </div>
            `).join('')}
            ${paragraphs.length > 5 ? `<div class="element-item">... 還有 ${paragraphs.length - 5} 個段落</div>` : ''}
          </div>
        </div>
      ` : ''}
      
      <div class="info-item">
        <h4>Meta 標籤 (${metaTags.length})</h4>
        <p>頁面中的 Meta 標籤</p>
        <div class="element-list">
          ${Array.from(metaTags).map(meta => `
            <div class="element-item">
              <span class="tag">meta</span>
              <span class="text">${meta.name || meta.property || meta.httpEquiv || 'unnamed'}: ${(meta.content || '').substring(0, 40)}${(meta.content || '').length > 40 ? '...' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 載入 WordPress 關鍵字到資訊面板
   */
  async loadWordPressKeywordsToInfo() {
    const container = document.getElementById('wpKeywordsContainer');
    const valueDiv = document.getElementById('wpKeywordsValue');
    
    if (!this.pageData || !this.pageData.url || !container || !valueDiv) return;
    
    try {
      // 檢查是否為支持的 WordPress 站點
      const hostname = new URL(this.pageData.url).hostname;
      const supportedSites = [
        'pretty.presslogic.com',
        'she.com',
        'sundaymore.com',
        'cosmopolitan.com.hk',
        'elle.com.hk',
        'harpersbazaar.com.hk',
        'marieclaire.com.hk',
        'holidaysmart.io'
      ];
      
      if (!supportedSites.includes(hostname)) {
        valueDiv.textContent = `非 WordPress 站點 (${hostname})`;
        container.style.opacity = '0.5';
        return;
      }
      
      // 使用 proxy 端點獲取 WordPress metadata
      const response = await this.callPageLensAPI(this.wpProxyMetadataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resourceUrl: this.pageData.url })
      });
      
      if (!response.ok) {
        valueDiv.textContent = '無法獲取 WordPress 關鍵字';
        container.style.opacity = '0.5';
        return;
      }
      
      const data = await response.json();
      
      if (data.focusKeyphrase) {
        const keywords = this.parseFocusKeyphrase(data.focusKeyphrase);
        if (keywords.length > 0) {
          valueDiv.innerHTML = keywords.map(keyword => 
            `<span style="background: #e8f5e8; padding: 2px 6px; border-radius: 3px; margin-right: 5px; font-size: 0.9em;">${keyword}</span>`
          ).join('');
          container.style.background = '#f8fff8';
        } else {
          valueDiv.textContent = '無焦點關鍵字';
          container.style.opacity = '0.5';
        }
      } else {
        valueDiv.textContent = '無焦點關鍵字';
        container.style.opacity = '0.5';
      }
      
    } catch (error) {
      console.error('載入 WordPress 關鍵字到資訊面板失敗:', error);
      valueDiv.textContent = '載入失敗';
      container.style.opacity = '0.5';
    }
  }

  /**
   * 從 WordPress API 獲取關鍵字
   */
  async loadKeywordsFromWordPress() {
    if (!this.pageData || !this.pageData.url) return;
    
    try {
      // 檢查是否為支持的 WordPress 站點
      const hostname = new URL(this.pageData.url).hostname;
      const supportedSites = [
        'pretty.presslogic.com',
        'she.com',
        'sundaymore.com',
        'cosmopolitan.com.hk',
        'elle.com.hk',
        'harpersbazaar.com.hk',
        'marieclaire.com.hk',
        'holidaysmart.io'
      ];
      
      if (!supportedSites.includes(hostname)) {
        console.log(`不是支持的 WordPress 站點 (${hostname})，跳過關鍵字獲取`);
        return;
      }
      
      console.log('嘗試從 WordPress API 獲取關鍵字...');
      
      // 使用 proxy 端點獲取 WordPress metadata
      const response = await this.callPageLensAPI(this.wpProxyMetadataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resourceUrl: this.pageData.url })
      });
      
      if (!response.ok) {
        console.warn('WordPress API 請求失敗:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.focusKeyphrase) {
        const keywords = this.parseFocusKeyphrase(data.focusKeyphrase);
        if (keywords.length > 0) {
          // 更新關鍵字輸入框
          const focusKeywordInput = document.getElementById('focusKeyword');
          if (focusKeywordInput && !focusKeywordInput.value) {
            focusKeywordInput.value = keywords[0]; // 使用第一個關鍵字
            focusKeywordInput.style.background = '#e8f5e8'; // 淡綠色背景表示自動填充
            
            // 添加提示
            const parentDiv = focusKeywordInput.parentElement;
            const hint = document.createElement('div');
            hint.className = 'keyword-hint';
            hint.style.cssText = 'font-size: 0.8rem; color: #28a745; margin-top: 0.25rem;';
            hint.textContent = `✓ 已從 WordPress 自動獲取關鍵字${keywords.length > 1 ? ` (共 ${keywords.length} 個)` : ''}`;
            parentDiv.appendChild(hint);
            
            console.log('WordPress 關鍵字已自動填充:', keywords);
          }
        }
      }
      
    } catch (error) {
      console.error('從 WordPress API 獲取關鍵字失敗:', error);
    }
  }

  /**
   * 解析焦點關鍵字字符串
   */
  parseFocusKeyphrase(focusKeyphrase) {
    if (!focusKeyphrase || focusKeyphrase.trim() === '') {
      return [];
    }
    
    // 支持多種分隔符
    const separators = ['-', ',', '、', '|', ';', '\\n', '\\r\\n'];
    let keywords = [focusKeyphrase];
    
    // 按分隔符分割
    for (const separator of separators) {
      const newKeywords = [];
      for (const keyword of keywords) {
        newKeywords.push(...keyword.split(separator));
      }
      keywords = newKeywords;
    }
    
    // 清理和過濾關鍵字
    keywords = keywords
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0)
      .map(keyword => {
        // 移除括號中的數字 (如: "keyword(123)" -> "keyword")
        return keyword.replace(/\s*\(\d+\)\s*$/, '');
      })
      .filter(keyword => keyword.length > 0);
    
    return keywords;
  }

  /**
   * 智能 API 調用，支持主要和備用 API
   */
  async callPageLensAPI(endpoint, options = {}) {
    const urls = [this.primaryApiUrl, this.fallbackApiUrl];
    
    for (let i = 0; i < urls.length; i++) {
      try {
        const url = `${urls[i]}${endpoint}`;
        console.log(`嘗試調用 API: ${url} (${i === 0 ? '雲端版本' : '本地版本'})`);
        
        const response = await fetch(url, options);
        
        if (response.ok) {
          // 成功時更新當前使用的 API
          this.apiBaseUrl = urls[i];
          console.log(`API 調用成功，使用: ${i === 0 ? '雲端版本' : '本地版本'}`);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`API 調用失敗 (${i === 0 ? '雲端版本' : '本地版本'}):`, error.message);
        
        // 如果是最後一個 URL 且失敗，拋出錯誤
        if (i === urls.length - 1) {
          throw new Error(`所有 API 都無法連接。雲端版本和本地版本都失敗。`);
        }
      }
    }
  }

  async loadAvailableAssessments() {
    try {
      // 由於新 API 沒有 assessments 端點，直接使用預設檢測項目
      this.renderDefaultAssessments();
      
    } catch (error) {
      console.error('載入檢測項目失敗:', error);
      this.showError('無法連接到 PageLens API 服務，請檢查網路連接');
      this.renderDefaultAssessments();
    }
  }

  renderAssessments(assessments) {
    const grid = document.getElementById('assessmentsGrid');
    grid.innerHTML = '';
    
    const assessmentDescriptions = {
      'h1-missing': { name: 'H1 標題檢查', desc: '檢查頁面是否有 H1 標題' },
      'title-needs-improvement': { name: '頁面標題優化', desc: '檢查頁面標題的 SEO 優化' },
      'meta-description-needs-improvement': { name: 'Meta 描述優化', desc: '檢查 Meta 描述的優化' },
      'images-missing-alt': { name: '圖片 Alt 文字', desc: '檢查圖片是否有 Alt 文字' },
      'keyword-density-low': { name: '關鍵字密度', desc: '檢查關鍵字密度是否合適' },
      'content-length-short': { name: '內容長度', desc: '檢查內容長度是否足夠' },
      'flesch-reading-ease': { name: '可讀性評分', desc: 'Flesch 可讀性評分' },
      'sentence-length-long': { name: '句子長度', desc: '檢查句子長度是否合適' },
      'paragraph-length-long': { name: '段落長度', desc: '檢查段落長度是否合適' }
    };
    
    const allAssessments = assessments.currentlyImplemented || [];
    
    allAssessments.forEach(assessment => {
      const info = assessmentDescriptions[assessment] || { 
        name: assessment, 
        desc: '檢查項目' 
      };
      
      const card = document.createElement('div');
      card.className = 'assessment-card selected';
      card.dataset.assessment = assessment;
      
      card.innerHTML = `
        <h4>${info.name}</h4>
        <p>${info.desc}</p>
      `;
      
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
      });
      
      grid.appendChild(card);
    });
  }

  renderDefaultAssessments() {
    const grid = document.getElementById('assessmentsGrid');
    grid.innerHTML = `
      <div class="assessment-card selected" data-assessment="H1_KEYWORD">
        <h4>H1 關鍵字優化</h4>
        <p>檢查 H1 標籤的關鍵字優化</p>
      </div>
      <div class="assessment-card selected" data-assessment="ALT_ATTRIBUTE">
        <h4>圖片 Alt 文字</h4>
        <p>驗證圖片的 alt 文字</p>
      </div>
      <div class="assessment-card selected" data-assessment="INTRODUCTION_KEYWORD">
        <h4>首段關鍵字</h4>
        <p>檢查首段是否包含關鍵字</p>
      </div>
      <div class="assessment-card selected" data-assessment="KEYWORD_DENSITY">
        <h4>關鍵字密度</h4>
        <p>分析焦點關鍵字密度</p>
      </div>
      <div class="assessment-card selected" data-assessment="META_DESCRIPTION_KEYWORD">
        <h4>Meta 描述關鍵字</h4>
        <p>檢查 Meta 描述中的關鍵字使用</p>
      </div>
      <div class="assessment-card selected" data-assessment="PAGE_TITLE_WIDTH">
        <h4>頁面標題長度</h4>
        <p>驗證頁面標題長度</p>
      </div>
      <div class="assessment-card selected" data-assessment="TEXT_LENGTH">
        <h4>內容長度</h4>
        <p>分析內容長度</p>
      </div>
      <div class="assessment-card selected" data-assessment="SENTENCE_LENGTH_IN_TEXT">
        <h4>句子長度</h4>
        <p>檢查平均句子長度</p>
      </div>
      <div class="assessment-card selected" data-assessment="PARAGRAPH_TOO_LONG">
        <h4>段落長度</h4>
        <p>驗證段落長度</p>
      </div>
      <div class="assessment-card selected" data-assessment="FLESCH_READING_EASE">
        <h4>可讀性評分</h4>
        <p>Flesch 可讀性評分</p>
      </div>
    `;
    
    document.querySelectorAll('.assessment-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
      });
    });
  }

  bindEventListeners() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeUrlBtn = document.getElementById('analyzeUrlBtn');
    const saveBtn = document.getElementById('saveBtn');
    const discardBtn = document.getElementById('discardBtn');
    const customUrlInput = document.getElementById('customUrlInput');
    
    analyzeBtn.addEventListener('click', () => this.performAnalysis());
    analyzeUrlBtn.addEventListener('click', () => this.analyzeCustomUrl());
    saveBtn.addEventListener('click', () => this.saveReport());
    discardBtn.addEventListener('click', () => this.discardReport());
    
    // 支援 Enter 鍵提交 URL
    customUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.analyzeCustomUrl();
      }
    });
  }

  async performAnalysis() {
    if (!this.pageData) {
      this.showError('沒有頁面資料可供分析');
      return;
    }
    
    try {
      this.showLoading(true);
      
      // 準備分析請求
      const analysisRequest = this.prepareAnalysisRequest();
      
      // 發送分析請求
      const response = await this.callPageLensAPI('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisRequest)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.analysisResult = result.report;
        this.renderResults();
      } else {
        throw new Error(result.error || '分析失敗');
      }
      
    } catch (error) {
      console.error('分析失敗:', error);
      this.showError('分析失敗: ' + error.message, true);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 分析自定義 URL
   */
  async analyzeCustomUrl() {
    const customUrlInput = document.getElementById('customUrlInput');
    const url = customUrlInput.value.trim();
    
    if (!url) {
      this.showError('請輸入要分析的網址');
      return;
    }
    
    // 驗證 URL 格式
    try {
      new URL(url);
    } catch {
      this.showError('請輸入有效的網址（包含 http:// 或 https://）');
      return;
    }
    
    try {
      this.showLoading(true);
      
      // 檢查是否為支持的 WordPress 站點
      const hostname = new URL(url).hostname;
      const supportedSites = [
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
      
      if (!supportedSites.includes(hostname)) {
        throw new Error(`目前僅支援 WordPress/PressLogic 站點的 URL 分析。支援的站點包括：${supportedSites.join(', ')}`);
      }
      
      // 使用新的 WordPress URL 分析端點
      const analysisRequest = {
        url: url,
        options: {
          contentSelectors: ['.article', 'main', '.content'],
          extractMainContent: true,
          assessmentConfig: { enableAll: true }
        }
      };
      
      // 發送到新的 WordPress URL 分析端點
      const response = await this.callPageLensAPI('/analyze-wp-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisRequest)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.analysisResult = result.report;
        
        // 更新左側面板顯示 WordPress 數據
        this.updatePageInfoForWordPressUrl(url, result.wordpressData || {});
        
        // 更新右側面板顯示分析結果
        this.renderResults();
        
        // 清空輸入框
        customUrlInput.value = '';
        
      } else {
        throw new Error(result.error || '分析失敗');
      }
      
    } catch (error) {
      console.error('自定義 URL 分析失敗:', error);
      this.showError('分析失敗: ' + error.message, true);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 通過 PageLens API 直接分析 URL
   * 不需要預先獲取 HTML 內容
   */
  async analyzeUrlDirectly(url, keyword = null) {
    const analysisRequest = {
      pageDetails: {
        url: url,
        language: 'zh'
      },
      focusKeyword: keyword || '',
      relatedKeywords: [],
      options: {
        contentSelectors: ['.article', 'main', '.content'],
        extractMainContent: true,
        assessmentConfig: { enableAll: true }
      }
    };
    
    // 如果 PageLens API 支援直接 URL 分析，使用此方法
    // 否則發送 URL 讓後端自行獲取內容
    return analysisRequest;
  }

  /**
   * 從 HTML 中提取標題
   */
  extractTitleFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.title || '無標題';
  }

  /**
   * 獲取 WordPress 關鍵字（如果適用）
   */
  async getWordPressKeywords(url) {
    try {
      const hostname = new URL(url).hostname;
      const supportedSites = [
        'pretty.presslogic.com',
        'she.com',
        'sundaymore.com',
        'cosmopolitan.com.hk',
        'elle.com.hk',
        'harpersbazaar.com.hk',
        'marieclaire.com.hk',
        'holidaysmart.io'
      ];
      
      if (!supportedSites.includes(hostname)) {
        return null;
      }
      
      // 使用 proxy 竫點獲取 WordPress metadata
      const response = await this.callPageLensAPI(this.wpProxyMetadataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resourceUrl: url })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.focusKeyphrase) {
          const keywords = this.parseFocusKeyphrase(data.focusKeyphrase);
          return keywords.length > 0 ? keywords[0] : null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('獲取 WordPress 關鍵字失敗:', error);
      return null;
    }
  }

  /**
   * 準備自定義 URL 的分析請求
   */
  prepareCustomAnalysisRequest(pageData, keyword = null) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageData.html, 'text/html');
    
    const title = doc.title || pageData.title || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    return {
      htmlContent: pageData.html,
      pageDetails: {
        url: pageData.url,
        title: title,
        description: metaDescription,
        language: 'zh'
      },
      focusKeyword: keyword || '',
      relatedKeywords: [],
      options: {
        contentSelectors: ['.article', 'main', '.content'],
        extractMainContent: true,
        assessmentConfig: { enableAll: true }
      }
    };
  }

  /**
   * 更新左側面板顯示 WordPress URL 分析結果
   */
  updatePageInfoForWordPressUrl(url, wordpressData) {
    const container = document.getElementById('pageInfoContainer');
    const elementsContainer = document.getElementById('htmlElementsContainer');
    
    if (!container || !elementsContainer) return;
    
    // 顯示 WordPress 專屬資訊
    container.innerHTML = `
      <div class="info-item">
        <h4>分析網址</h4>
        <p>WordPress 文章 URL</p>
        <div class="value">${url}</div>
      </div>
      
      ${wordpressData.postId ? `
        <div class="info-item">
          <h4>文章 ID</h4>
          <p>WordPress 文章識別碼</p>
          <div class="value">${wordpressData.postId}</div>
        </div>
      ` : ''}
      
      ${wordpressData.site ? `
        <div class="info-item">
          <h4>站點代碼</h4>
          <p>PressLogic 網絡站點</p>
          <div class="value">${wordpressData.site}</div>
        </div>
      ` : ''}
      
      ${wordpressData.seoMetadata ? `
        <div class="info-item">
          <h4>SEO 標題</h4>
          <p>WordPress SEO 設定標題</p>
          <div class="value">${wordpressData.seoMetadata.title || '無'}</div>
        </div>
        
        <div class="info-item">
          <h4>SEO 描述</h4>
          <p>WordPress SEO 設定描述</p>
          <div class="value">${wordpressData.seoMetadata.description || '無'}</div>
        </div>
      ` : ''}
      
      <div class="info-item">
        <h4>分析時間</h4>
        <p>分析執行時間</p>
        <div class="value">${new Date().toLocaleString()}</div>
      </div>
    `;
    
    // 顯示 WordPress 專屬元素資訊
    elementsContainer.innerHTML = `
      ${wordpressData.extractedKeywords && wordpressData.extractedKeywords.length > 0 ? `
        <div class="info-item">
          <h4>提取的關鍵字 (${wordpressData.extractedKeywords.length})</h4>
          <p>從 WordPress SEO 資料中提取</p>
          <div class="element-list">
            ${wordpressData.extractedKeywords.map(keyword => `
              <div class="element-item">
                <span class="tag">關鍵字</span>
                <span class="text">${keyword}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${wordpressData.seoMetadata && wordpressData.seoMetadata.focusKeyphrase ? `
        <div class="info-item">
          <h4>焦點關鍵字</h4>
          <p>WordPress 設定的主要關鍵字</p>
          <div class="value" style="background: #e8f5e8; padding: 0.5rem; border-radius: 4px;">
            ${wordpressData.seoMetadata.focusKeyphrase}
          </div>
        </div>
      ` : ''}
      
      <div class="info-item">
        <h4>WordPress 整合</h4>
        <p>自動化資料提取</p>
        <div class="element-list">
          <div class="element-item">
            <span class="tag">✓</span>
            <span class="text">自動獲取文章內容</span>
          </div>
          <div class="element-item">
            <span class="tag">✓</span>
            <span class="text">自動提取 SEO 設定</span>
          </div>
          <div class="element-item">
            <span class="tag">✓</span>
            <span class="text">自動識別關鍵字</span>
          </div>
          <div class="element-item">
            <span class="tag">✓</span>
            <span class="text">專業內容區域分析</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 更新左側面板顯示一般 URL 分析結果
   */
  updatePageInfoForUrl(url) {
    const container = document.getElementById('pageInfoContainer');
    const elementsContainer = document.getElementById('htmlElementsContainer');
    
    if (!container || !elementsContainer) return;
    
    // 顯示基本 URL 資訊
    container.innerHTML = `
      <div class="info-item">
        <h4>分析網址</h4>
        <p>當前分析的網頁地址</p>
        <div class="value">${url}</div>
      </div>
      
      <div class="info-item">
        <h4>分析狀態</h4>
        <p>遠端 URL 分析</p>
        <div class="value" style="color: #28a745;">✓ 分析完成</div>
      </div>
      
      <div class="info-item">
        <h4>分析時間</h4>
        <p>分析執行時間</p>
        <div class="value">${new Date().toLocaleString()}</div>
      </div>
    `;
    
    // 簡化元素顯示
    elementsContainer.innerHTML = `
      <div class="info-item">
        <h4>分析說明</h4>
        <p>此為遠端 URL 分析</p>
        <div class="value">
          由於是分析外部網址，左側面板無法顯示詳細的 HTML 元素結構。<br>
          請查看右側的分析結果了解網頁的 SEO 表現。
        </div>
      </div>
      
      <div class="info-item">
        <h4>分析範圍</h4>
        <p>檢測的內容範圍</p>
        <div class="element-list">
          <div class="element-item">
            <span class="tag">全頁面</span>
            <span class="text">SEO 和可讀性分析</span>
          </div>
          <div class="element-item">
            <span class="tag">內容區塊</span>
            <span class="text">主要內容提取 (.article, main, .content)</span>
          </div>
        </div>
      </div>
    `;
  }

  prepareAnalysisRequest() {
    const focusKeyword = document.getElementById('focusKeyword').value.trim();
    const selectedAssessments = this.getSelectedAssessments();
    
    // 解析 HTML 獲取頁面詳情
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.pageData.html, 'text/html');
    
    const title = doc.title || this.pageData.title || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    return {
      htmlContent: this.pageData.html,
      pageDetails: {
        url: this.pageData.url,
        title: title,
        description: metaDescription,
        language: 'zh'
      },
      focusKeyword: focusKeyword,
      relatedKeywords: [],
      options: {
        contentSelectors: ['.article', 'main', '.content'],
        extractMainContent: true,
        assessmentConfig: selectedAssessments
      }
    };
  }

  getSelectedAssessments() {
    const selectedCards = document.querySelectorAll('.assessment-card.selected');
    const assessments = [];
    
    selectedCards.forEach(card => {
      assessments.push(card.dataset.assessment);
    });
    
    // 如果有選擇特定檢測項目，使用選擇的項目
    if (assessments.length > 0) {
      return { enabledAssessments: assessments };
    }
    
    // 如果沒有選擇任何項目，啟用所有檢測
    return { enableAll: true };
  }

  renderResults() {
    if (!this.analysisResult) return;
    
    // 隱藏表單，顯示結果
    document.getElementById('analysisForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    
    // 渲染問題列表
    this.renderIssuesList();
  }

  renderIssuesList() {
    const issuesList = document.getElementById('issuesList');
    const issues = this.analysisResult.detailedIssues || [];
    
    if (issues.length === 0) {
      issuesList.innerHTML = '<p>太棒了！沒有發現任何問題。</p>';
      return;
    }
    
    // 渲染摘要資訊
    const summary = this.analysisResult.summary || {};
    const summaryHtml = `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">分析摘要</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
          <div>總問題: ${summary.totalIssues || 0}</div>
          <div style="color: #28a745;">良好: ${summary.goodIssues || 0}</div>
          <div style="color: #ffc107;">待改進: ${summary.okIssues || 0}</div>
          <div style="color: #dc3545;">問題: ${summary.badIssues || 0}</div>
        </div>
        ${summary.criticalIssues && summary.criticalIssues.length > 0 ? `
          <div style="margin-top: 0.75rem;">
            <strong style="color: #dc3545;">關鍵問題:</strong>
            ${summary.criticalIssues.map(issue => `<span style="background: #f8d7da; padding: 2px 6px; border-radius: 3px; margin-right: 5px; font-size: 0.8rem;">${issue.name}</span>`).join('')}
          </div>
        ` : ''}
        ${summary.quickWins && summary.quickWins.length > 0 ? `
          <div style="margin-top: 0.5rem;">
            <strong style="color: #17a2b8;">快速改進:</strong>
            ${summary.quickWins.map(issue => `<span style="background: #d1ecf1; padding: 2px 6px; border-radius: 3px; margin-right: 5px; font-size: 0.8rem;">${issue.name}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    const issuesHtml = issues.map(issue => `
      <div class="issue-item">
        <div class="issue-icon ${this.getScoreClass(issue.score)}">${this.getRatingIcon(issue.rating)}</div>
        <div class="issue-content">
          <h4>${issue.name}</h4>
          <p>${issue.description}</p>
          <div class="issue-recommendation">
            <strong>建議:</strong> ${issue.recommendation}
          </div>
          <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
            ${issue.impact ? `<span>影響程度: ${this.getImpactText(issue.impact)}</span>` : ''}
            ${issue.assessmentType ? `<span>類型: ${issue.assessmentType === 'seo' ? 'SEO' : '可讀性'}</span>` : ''}
            ${issue.score ? `<span>分數: ${issue.score}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
    issuesList.innerHTML = summaryHtml + issuesHtml;
  }

  getScoreClass(score) {
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-ok';
    return 'score-bad';
  }

  getGradeText(grade) {
    const gradeMap = {
      'good': '優秀',
      'ok': '良好',
      'needs-improvement': '需要改進',
      'bad': '差'
    };
    return gradeMap[grade] || grade;
  }

  getRatingIcon(rating) {
    const iconMap = {
      'good': '✓',
      'ok': '⚠',
      'bad': '✗'
    };
    return iconMap[rating] || '?';
  }

  getImpactText(impact) {
    const impactMap = {
      'high': '高',
      'medium': '中',
      'low': '低'
    };
    return impactMap[impact] || impact;
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  showError(message, useToast = false) {
    if (useToast) {
      this.showToast(message, 'error');
    } else {
      const errorDiv = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      errorText.textContent = message;
      errorDiv.style.display = 'block';
      
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showToast(message, type = 'error') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      error: '❌',
      success: '✅',
      warning: '⚠️'
    };
    
    const titles = {
      error: '錯誤',
      success: '成功',
      warning: '警告'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // 自動移除
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  saveReport() {
    if (!this.analysisResult) {
      this.showError('沒有分析結果可以儲存');
      return;
    }
    
    const report = {
      url: this.pageData.url,
      title: this.pageData.title,
      exportTimestamp: new Date().toISOString(),
      analysisTimestamp: this.analysisResult.timestamp,
      overallScores: this.analysisResult.overallScores,
      summary: this.analysisResult.summary,
      detailedIssues: this.analysisResult.detailedIssues,
      processingTime: this.analysisResult.processingTime || 0
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagelens-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  discardReport() {
    if (confirm('確定要捨棄此報告？')) {
      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
      });
    }
  }
}

// 初始化分析器
document.addEventListener('DOMContentLoaded', () => {
  new PageLensAnalyzer();
});