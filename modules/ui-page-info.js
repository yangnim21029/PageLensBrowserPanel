/**
 * UI 頁面資訊顯示模組
 * 處理頁面基本資訊和 HTML 元素分析的顯示
 */
export class UIPageInfo {
  constructor() {}

  /**
   * 格式化關鍵字列表
   * @param {string} focusKeyword - 焦點關鍵字
   * @param {Array|string} keywords - 其他關鍵字
   * @param {Array} relatedKeywords - 相關關鍵字（從焦點關鍵字分割出來的）
   * @returns {string}
   */
  formatKeywords(focusKeyword, keywords, relatedKeywords) {
    let keywordList = [];
    
    // 如果有焦點關鍵字，放在第一個
    if (focusKeyword) {
      keywordList.push(focusKeyword + ' (焦點)');
    }
    
    // 如果有相關關鍵字（從焦點關鍵字分割出來的）
    if (relatedKeywords && relatedKeywords.length > 0) {
      relatedKeywords.forEach(kw => {
        keywordList.push(kw + ' (相關)');
      });
    }
    
    // 處理其他關鍵字
    if (keywords) {
      if (typeof keywords === 'string') {
        // 如果是字串，按逗號分割
        const additionalKeywords = keywords.split(',').map(k => k.trim()).filter(k => k && k !== focusKeyword);
        keywordList.push(...additionalKeywords);
      } else if (Array.isArray(keywords)) {
        // 如果是陣列，過濾掉焦點關鍵字和相關關鍵字
        const additionalKeywords = keywords.filter(k => {
          return k && k !== focusKeyword && (!relatedKeywords || !relatedKeywords.includes(k));
        });
        keywordList.push(...additionalKeywords);
      }
    }
    
    // 如果沒有任何關鍵字
    if (keywordList.length === 0) {
      return '無';
    }
    
    // 使用 - 分行顯示
    return keywordList.map((keyword, index) => {
      return `${index === 0 ? '' : '- '}${keyword}`;
    }).join('<br>');
  }

  /**
   * 渲染頁面資訊
   * @param {Object} pageData
   */
  renderPageInfo(pageData) {
    const container = document.getElementById('pageInfoContainer');
    
    container.innerHTML = `
      <div class="info-item">
        <h4>頁面標題</h4>
        <div class="value">${pageData.title || '無標題'}</div>
      </div>
      <div class="info-item">
        <h4>頁面 URL</h4>
        <div class="value">${pageData.url || '無 URL'}</div>
      </div>
      ${pageData.description ? `
      <div class="info-item">
        <h4>頁面描述</h4>
        <div class="value">${pageData.description}</div>
      </div>
      ` : ''}
      ${pageData.focusKeyword || pageData.keywords ? `
      <div class="info-item">
        <h4>關鍵字清單</h4>
        <div class="value">${this.formatKeywords(pageData.focusKeyword, pageData.keywords, pageData.relatedKeywords)}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <h4>分析時間</h4>
        <div class="value">${new Date().toLocaleString('zh-TW')}</div>
      </div>
    `;
  }

  /**
   * 渲染 WordPress URL 分析的簡化信息
   * @param {Object} wordpressData
   * @param {Object} pageUnderstanding - API v2.0 新增的頁面理解資訊
   */
  renderWordPressHtmlInfo(wordpressData, pageUnderstanding) {
    const container = document.getElementById('htmlElementsContainer');
    
    if (!wordpressData && !pageUnderstanding) {
      container.innerHTML = `
        <div class="info-item">
          <p style="text-align: center; color: var(--text-secondary);">
            WordPress URL 分析模式<br>
            <small>HTML 結構信息由 API 自動處理</small>
          </p>
        </div>
      `;
      return;
    }
    
    // 準備顯示內容
    let htmlContent = '';
    
    // 頁面理解資訊 (API v2.0 新功能)
    if (pageUnderstanding) {
      htmlContent += this.renderPageUnderstanding(pageUnderstanding);
    }
    
    // WordPress 特定資訊
    if (wordpressData) {
      htmlContent += this.renderWordPressInfo(wordpressData);
    }
    
    // 提示訊息
    htmlContent += `
      <div class="info-item" style="background: var(--color-background); border: 1px dashed var(--border-light);">
        <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          💡 提示：WordPress 文章標題會自動作為 H1 進行分析<br>
          🆕 新功能：API v2.0 使用像素寬度計算，更準確評估中文內容
        </p>
      </div>
    `;
    
    container.innerHTML = htmlContent;
  }

  /**
   * 渲染頁面理解資訊
   */
  renderPageUnderstanding(pageUnderstanding) {
    return `
      <div class="info-item">
        <h4>📖 頁面結構分析</h4>
        
        ${pageUnderstanding.headingStructure ? `
          <div style="margin-bottom: 1rem;">
            <strong>標題結構:</strong>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>H1: ${pageUnderstanding.headingStructure.h1Count || 0} 個</p>
              <p>H2: ${pageUnderstanding.headingStructure.h2Count || 0} 個</p>
              <p>總標題數: ${pageUnderstanding.headingStructure.totalHeadings || 0} 個</p>
            </div>
          </div>
        ` : ''}
        
        ${pageUnderstanding.textStats ? `
          <div style="margin-bottom: 1rem;">
            <strong>文字統計:</strong>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>總字數: ${pageUnderstanding.wordCount || 0} 字</p>
              <p>閱讀時間: ${pageUnderstanding.readingTime || 0} 分鐘</p>
              <p>段落數: ${pageUnderstanding.textStats.paragraphCount || 0} 個</p>
              <p>句子數: ${pageUnderstanding.textStats.sentenceCount || 0} 個</p>
              <p>平均句長: ${pageUnderstanding.textStats.averageWordsPerSentence || 0} 字</p>
            </div>
          </div>
        ` : ''}
        
        ${pageUnderstanding.mediaInfo ? `
          <div style="margin-bottom: 1rem;">
            <strong>媒體資訊:</strong>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>圖片總數: ${pageUnderstanding.mediaInfo.imageCount || 0} 張</p>
              ${pageUnderstanding.mediaInfo.imagesWithoutAlt ? `
                <p style="color: var(--color-warning);">缺少 Alt 文字: ${pageUnderstanding.mediaInfo.imagesWithoutAlt} 張</p>
              ` : ''}
              ${pageUnderstanding.mediaInfo.videoCount !== undefined ? `
                <p>影片數量: ${pageUnderstanding.mediaInfo.videoCount} 個</p>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        ${pageUnderstanding.linkInfo ? `
          <div>
            <strong>連結統計:</strong>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>總連結數: ${pageUnderstanding.linkInfo.totalLinks || 0} 個</p>
              <p>內部連結: ${pageUnderstanding.linkInfo.internalLinks || 0} 個</p>
              <p>外部連結: ${pageUnderstanding.linkInfo.externalLinks || 0} 個</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染 WordPress 資訊
   */
  renderWordPressInfo(wordpressData) {
    return `
      <div class="info-item">
        <h4>WordPress 文章信息</h4>
        ${wordpressData.postId ? `
          <p>文章 ID: <span class="value">${wordpressData.postId}</span></p>
        ` : ''}
        ${wordpressData.site ? `
          <p>站點: <span class="value">${wordpressData.site}</span></p>
        ` : ''}
        ${wordpressData.extractedKeywords && wordpressData.extractedKeywords.length > 0 ? `
          <p>提取的關鍵字:</p>
          <div class="element-list">
            ${wordpressData.extractedKeywords.map(keyword => `
              <div class="element-item">
                <span class="tag">關鍵字</span>
                <span class="text">${keyword}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      ${wordpressData.seoMetadata ? `
      <div class="info-item">
        <h4>SEO 元數據</h4>
        ${wordpressData.seoMetadata.title ? `
          <p>SEO 標題:</p>
          <div class="value">${wordpressData.seoMetadata.title}</div>
        ` : ''}
        ${wordpressData.seoMetadata.description ? `
          <p>SEO 描述:</p>
          <div class="value">${wordpressData.seoMetadata.description}</div>
        ` : ''}
        ${wordpressData.seoMetadata.focusKeyphrase ? `
          <p>焦點關鍵詞:</p>
          <div class="value">${wordpressData.seoMetadata.focusKeyphrase}</div>
        ` : ''}
      </div>
      ` : ''}
    `;
  }

  /**
   * 渲染 HTML 元素分析
   * @param {string} html
   */
  renderHtmlElements(html) {
    const container = document.getElementById('htmlElementsContainer');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 統計各種元素
    const elements = {
      headings: this.extractHeadings(doc),
      images: this.extractImages(doc),
      links: this.extractLinks(doc),
      meta: this.extractMeta(doc)
    };
    
    container.innerHTML = `
      <div class="info-item">
        <h4>標題結構 (${elements.headings.length})</h4>
        <div class="element-list">
          ${elements.headings.map(h => `
            <div class="element-item">
              <span class="tag">${h.tag}</span>
              <span class="text">${h.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="info-item">
        <h4>圖片 (${elements.images.length})</h4>
        <div class="element-list">
          ${elements.images.slice(0, 5).map(img => `
            <div class="element-item">
              <span class="tag">${img.hasAlt ? 'ALT' : 'NO ALT'}</span>
              <span class="text">${img.alt || img.src}</span>
            </div>
          `).join('')}
          ${elements.images.length > 5 ? `
            <div class="element-item">
              <span class="text" style="color: var(--text-secondary);">...還有 ${elements.images.length - 5} 張圖片</span>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="info-item">
        <h4>連結 (${elements.links.length})</h4>
        <div class="element-list">
          ${elements.links.slice(0, 5).map(link => `
            <div class="element-item">
              <span class="tag">${link.type}</span>
              <span class="text">${link.text || link.href}</span>
            </div>
          `).join('')}
          ${elements.links.length > 5 ? `
            <div class="element-item">
              <span class="text" style="color: var(--text-secondary);">...還有 ${elements.links.length - 5} 個連結</span>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="info-item">
        <h4>Meta 標籤</h4>
        <div class="element-list">
          ${elements.meta.title ? `
            <div class="element-item">
              <span class="tag">Title</span>
              <span class="text">${elements.meta.title}</span>
            </div>
          ` : ''}
          ${elements.meta.description ? `
            <div class="element-item">
              <span class="tag">Description</span>
              <span class="text">${elements.meta.description}</span>
            </div>
          ` : ''}
          ${elements.meta.keywords ? `
            <div class="element-item">
              <span class="tag">Keywords</span>
              <span class="text">${elements.meta.keywords}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * 提取標題元素
   */
  extractHeadings(doc) {
    const headings = [];
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      doc.querySelectorAll(tag).forEach(heading => {
        headings.push({
          tag: tag.toUpperCase(),
          text: heading.textContent.trim().substring(0, 50) + (heading.textContent.trim().length > 50 ? '...' : '')
        });
      });
    });
    return headings;
  }

  /**
   * 提取圖片元素
   */
  extractImages(doc) {
    return Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      hasAlt: !!img.alt
    }));
  }

  /**
   * 提取連結元素
   */
  extractLinks(doc) {
    return Array.from(doc.querySelectorAll('a[href]')).map(link => {
      const href = link.href;
      let type = '內部';
      try {
        const linkUrl = new URL(href);
        const pageUrl = new URL(doc.location?.href || window.location.href);
        if (linkUrl.hostname !== pageUrl.hostname) {
          type = '外部';
        }
      } catch (e) {
        // 相對連結
      }
      return {
        href: href,
        text: link.textContent.trim().substring(0, 30),
        type: type
      };
    });
  }

  /**
   * 提取 Meta 標籤
   */
  extractMeta(doc) {
    return {
      title: doc.querySelector('title')?.textContent || '',
      description: doc.querySelector('meta[name="description"]')?.content || '',
      keywords: doc.querySelector('meta[name="keywords"]')?.content || ''
    };
  }
}