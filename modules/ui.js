/**
 * UI 模組
 * 處理所有 UI 相關的更新和渲染
 */
export class UI {
  constructor() {
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.errorMessage = document.getElementById('errorMessage');
    this.errorText = document.getElementById('errorText');
    this.toastContainer = document.getElementById('toastContainer');
  }

  /**
   * 顯示/隱藏載入中覆蓋層
   * @param {boolean} show
   */
  showLoading(show) {
    this.loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  /**
   * 顯示錯誤訊息
   * @param {string} message
   * @param {boolean} useToast - 是否使用 toast 通知
   */
  showError(message, useToast = false) {
    if (useToast) {
      this.showToast(message, 'error');
    } else {
      this.errorText.textContent = message;
      this.errorMessage.style.display = 'block';
      
      setTimeout(() => {
        this.errorMessage.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message
   * @param {string} type - 'error', 'success', 'warning'
   */
  showToast(message, type = 'error') {
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
    
    this.toastContainer.appendChild(toast);
    
    // 自動移除
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * 格式化關鍵字列表
   * @param {string} focusKeyword - 焦點關鍵字
   * @param {Array|string} keywords - 其他關鍵字
   * @returns {string}
   */
  formatKeywords(focusKeyword, keywords) {
    let keywordList = [];
    
    // 如果有焦點關鍵字，放在第一個
    if (focusKeyword) {
      keywordList.push(focusKeyword + ' (焦點)');
    }
    
    // 處理其他關鍵字
    if (keywords) {
      if (typeof keywords === 'string') {
        // 如果是字串，按逗號分割
        const additionalKeywords = keywords.split(',').map(k => k.trim()).filter(k => k && k !== focusKeyword);
        keywordList.push(...additionalKeywords);
      } else if (Array.isArray(keywords)) {
        // 如果是陣列，過濾掉焦點關鍵字
        const additionalKeywords = keywords.filter(k => k && k !== focusKeyword);
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
        <div class="value">${this.formatKeywords(pageData.focusKeyword, pageData.keywords)}</div>
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
      htmlContent += `
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
    
    // WordPress 特定資訊
    if (wordpressData) {
      htmlContent += `
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
    
    // 提示訊息
    htmlContent += `
      <div class="info-item" style="background: var(--color-background); border: 1px dashed var(--border-light);">
        <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          💡 提示：WordPress 文章標題會自動作為 H1 進行分析
        </p>
      </div>
    `;
    
    container.innerHTML = htmlContent;
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
          `).join('') || '<div class="element-item">沒有找到標題</div>'}
        </div>
      </div>
      
      <div class="info-item">
        <h4>圖片 (${elements.images.length})</h4>
        <div class="element-list">
          ${elements.images.map(img => `
            <div class="element-item">
              <span class="tag">IMG</span>
              <span class="text">${img.alt || '(無 alt 文字)'}</span>
            </div>
          `).join('') || '<div class="element-item">沒有找到圖片</div>'}
        </div>
      </div>
      
      <div class="info-item">
        <h4>連結 (${elements.links.length})</h4>
        <div class="element-list">
          ${elements.links.slice(0, 10).map(link => `
            <div class="element-item">
              <span class="tag">A</span>
              <span class="text">${link.text || link.href}</span>
            </div>
          `).join('') || '<div class="element-item">沒有找到連結</div>'}
          ${elements.links.length > 10 ? `<div class="element-item">...還有 ${elements.links.length - 10} 個連結</div>` : ''}
        </div>
      </div>
      
      <div class="info-item">
        <h4>Meta 標籤 (${elements.meta.length})</h4>
        <div class="element-list">
          ${elements.meta.map(meta => `
            <div class="element-item">
              <span class="tag">META</span>
              <span class="text">${meta.name || meta.property || meta.httpEquiv}: ${meta.content}</span>
            </div>
          `).join('') || '<div class="element-item">沒有找到 Meta 標籤</div>'}
        </div>
      </div>
    `;
  }

  /**
   * 提取標題元素
   */
  extractHeadings(doc) {
    const headings = [];
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach(heading => {
      headings.push({
        tag: heading.tagName,
        text: heading.textContent.trim().substring(0, 100)
      });
    });
    
    return headings;
  }

  /**
   * 提取圖片元素
   */
  extractImages(doc) {
    const images = [];
    const imgElements = doc.querySelectorAll('img');
    
    imgElements.forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt
      });
    });
    
    return images;
  }

  /**
   * 提取連結元素
   */
  extractLinks(doc) {
    const links = [];
    const linkElements = doc.querySelectorAll('a[href]');
    
    linkElements.forEach(link => {
      links.push({
        href: link.href,
        text: link.textContent.trim().substring(0, 50)
      });
    });
    
    return links;
  }

  /**
   * 提取 Meta 標籤
   */
  extractMeta(doc) {
    const metas = [];
    const metaElements = doc.querySelectorAll('meta[content]');
    
    metaElements.forEach(meta => {
      if (meta.name || meta.property || meta.httpEquiv) {
        metas.push({
          name: meta.name,
          property: meta.property,
          httpEquiv: meta.httpEquiv,
          content: meta.content.substring(0, 100)
        });
      }
    });
    
    return metas;
  }

  /**
   * 渲染分析結果
   * @param {Object} analysisResult
   */
  renderAnalysisResults(analysisResult) {
    // 隱藏表單，顯示結果
    // 不隱藏表單，只顯示結果
    document.getElementById('resultsContainer').classList.add('show');
    
    const issuesList = document.getElementById('issuesList');
    const issues = analysisResult.detailedIssues || [];
    
    // 將問題按評級分組
    const goodIssues = issues.filter(issue => issue.rating === 'good');
    const okIssues = issues.filter(issue => issue.rating === 'ok');
    const badIssues = issues.filter(issue => issue.rating === 'bad');
    
    // 計算分數 - 如果 API 沒有提供分數，根據問題計算
    const scores = analysisResult.overallScores || {};
    
    // 如果沒有分數但有詳細問題，計算分數
    if ((!scores.overallScore || scores.overallScore === 0) && issues.length > 0) {
      const totalScore = issues.reduce((sum, issue) => sum + (issue.score || 0), 0);
      const avgScore = Math.round(totalScore / issues.length);
      
      scores.overallScore = avgScore;
      scores.seoScore = Math.round(
        issues.filter(i => i.assessmentType === 'seo')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) / 
        Math.max(1, issues.filter(i => i.assessmentType === 'seo').length)
      );
      scores.readabilityScore = Math.round(
        issues.filter(i => i.assessmentType === 'readability')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) / 
        Math.max(1, issues.filter(i => i.assessmentType === 'readability').length)
      );
    }
    
    
    // 渲染摘要資訊 - 根據實際的 issues 計算統計
    const summary = analysisResult.summary || {};
    const actualGoodCount = goodIssues.length;
    const actualOkCount = okIssues.length;
    const actualBadCount = badIssues.length;
    const actualTotal = issues.length;
    
    const summaryHtml = `
      <div style="background: var(--color-gray-light); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">檢測項目統計 ${actualTotal === 15 ? '(API v2.0 完整檢測)' : ''}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
          <div>總檢測項目: ${actualTotal}</div>
          <div style="color: var(--color-success);">✅ 良好: ${actualGoodCount}</div>
          <div style="color: var(--color-warning);">⚠️ 改進: ${actualOkCount}</div>
          <div style="color: var(--color-error);">❌ 問題: ${actualBadCount}</div>
        </div>
      </div>
    `;
    
    // 如果只有良好的項目（沒有警告或問題）
    const hasOnlyGoodResults = goodIssues.length > 0 && okIssues.length === 0 && badIssues.length === 0;
    
    if (hasOnlyGoodResults) {
      // 顯示慶祝訊息
      const celebrationHtml = `
        <div style="background: rgba(72, 142, 128, 0.1); border: 2px solid rgba(72, 142, 128, 0.3); 
                    border-radius: 12px; padding: 2rem; text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h3 style="color: var(--color-success); margin-bottom: 0.5rem;">太棒了！</h3>
          <p style="color: var(--text-primary); font-size: 1.1rem;">
            您的網頁通過了所有檢測項目，沒有發現任何需要改進的地方。
          </p>
        </div>
      `;
      
      // 顯示所有通過的檢測項目
      const goodIssuesHtml = `
        <div style="margin-top: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--text-primary);">✅ 通過的檢測項目 (${goodIssues.length})</h4>
          <div style="display: grid; gap: 0.5rem;">
            ${goodIssues.map(issue => `
              <div style="background: rgba(72, 142, 128, 0.05); border: 1px solid rgba(72, 142, 128, 0.2); 
                          border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-success); font-size: 1.2rem;">✓</span>
                <div style="flex: 1;">
                  <strong style="color: var(--text-primary);">${issue.name}</strong>
                  ${issue.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${issue.description}</div>` : ''}
                </div>
                <span style="font-size: 0.85rem; color: var(--color-success);">${this.getIssueData(issue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      issuesList.innerHTML = scoresHtml + summaryHtml + celebrationHtml + goodIssuesHtml;
      return;
    }
    
    // 如果有需要改進的項目，分組顯示所有結果
    let allIssuesHtml = '';
    
    // 顯示問題項目
    if (badIssues.length > 0) {
      allIssuesHtml += `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--color-error);">❌ 需要修復的問題 (${badIssues.length})</h4>
          <div style="display: grid; gap: 0.5rem;">
            ${badIssues.map(issue => `
              <div style="background: rgba(255, 0, 0, 0.05); border: 1px solid rgba(255, 0, 0, 0.2); 
                          border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-error); font-size: 1.2rem;">✗</span>
                <div style="flex: 1;">
                  <strong style="color: var(--text-primary);">${issue.name}</strong>
                  ${issue.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${issue.description}</div>` : ''}
                </div>
                <span style="font-size: 0.85rem; color: var(--color-error);">${this.getIssueData(issue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // 顯示警告項目
    if (okIssues.length > 0) {
      allIssuesHtml += `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--color-warning);">⚠️ 建議改進的項目 (${okIssues.length})</h4>
          <div style="display: grid; gap: 0.5rem;">
            ${okIssues.map(issue => `
              <div style="background: rgba(255, 193, 7, 0.05); border: 1px solid rgba(255, 193, 7, 0.2); 
                          border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-warning); font-size: 1.2rem;">⚠</span>
                <div style="flex: 1;">
                  <strong style="color: var(--text-primary);">${issue.name}</strong>
                  ${issue.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${issue.description}</div>` : ''}
                </div>
                <span style="font-size: 0.85rem; color: var(--color-warning);">${this.getIssueData(issue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // 顯示通過的項目
    if (goodIssues.length > 0) {
      allIssuesHtml += `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--color-success);">✅ 通過的檢測項目 (${goodIssues.length})</h4>
          <div style="display: grid; gap: 0.5rem;">
            ${goodIssues.map(issue => `
              <div style="background: rgba(72, 142, 128, 0.05); border: 1px solid rgba(72, 142, 128, 0.2); 
                          border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-success); font-size: 1.2rem;">✓</span>
                <div style="flex: 1;">
                  <strong style="color: var(--text-primary);">${issue.name}</strong>
                  ${issue.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${issue.description}</div>` : ''}
                </div>
                <span style="font-size: 0.85rem; color: var(--color-success);">${this.getIssueData(issue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    issuesList.innerHTML = summaryHtml + allIssuesHtml;
  }

  /**
   * 獲取問題的實際數據
   * @param {Object} issue
   * @returns {string}
   */
  getIssueData(issue) {
    let dataStr = '';
    const details = issue.details || {};
    
    // 根據不同的評估 ID 返回相應的數據
    switch(issue.id) {
      case 'H1_MISSING':
        dataStr = `H1: ${details.count || details.h1Count || 0} 個`;
        break;
      case 'MULTIPLE_H1':
        dataStr = `H1: ${details.count || details.h1Count || 2} 個`;
        break;
      case 'H1_KEYWORD_MISSING':
        dataStr = details.h1Text ? `"${details.h1Text.substring(0, 30)}..."` : '無 H1';
        break;
      case 'IMAGES_MISSING_ALT':
        const total = details.totalImages || details.imageCount || 0;
        const missing = details.missingAltCount || details.imagesWithoutAlt || 0;
        dataStr = `${missing}/${total} 張缺少`;
        break;
      case 'KEYWORD_MISSING_FIRST_PARAGRAPH':
        dataStr = details.firstParagraph ? 
          `"${details.firstParagraph.substring(0, 50)}..."` : 
          `關鍵字: ${details.keywordCount || 0} 次`;
        break;
      case 'KEYWORD_DENSITY_LOW':
        const density = details.density || details.keywordDensity || '0';
        const keywordCount = details.keywordCount || 0;
        const totalWords = details.totalWords || details.wordCount || 0;
        dataStr = `${density}% (${keywordCount}/${totalWords} 字)`;
        break;
      case 'META_DESCRIPTION_MISSING':
      case 'META_DESCRIPTION_NEEDS_IMPROVEMENT':
        const metaDesc = details.metaDescription || details.description || '';
        const metaLength = details.length || metaDesc.length || 0;
        dataStr = `${metaLength} 字`;
        if (metaDesc && metaLength > 0) {
          dataStr += `: "${metaDesc.substring(0, 30)}..."`;
        }
        break;
      case 'TITLE_MISSING':
      case 'TITLE_NEEDS_IMPROVEMENT':
        const title = details.title || '';
        const titleLength = details.length || title.length || 0;
        dataStr = `${titleLength} 字`;
        if (title) {
          dataStr += `: "${title.substring(0, 30)}..."`;
        }
        break;
      case 'CONTENT_LENGTH_SHORT':
        dataStr = `${details.wordCount || details.totalWords || 0} 字`;
        break;
      case 'PARAGRAPH_LENGTH_LONG':
        const longestPara = details.longestParagraph || details.maxLength || 0;
        const paraCount = details.paragraphCount || details.totalParagraphs || 0;
        dataStr = `最長 ${longestPara} 字 (共 ${paraCount} 段)`;
        break;
      case 'SENTENCE_LENGTH_LONG':
        const longestSentence = details.longestSentence || details.maxLength || 0;
        const avgSentenceLength = details.averageSentenceLength || 0;
        dataStr = `最長 ${longestSentence} 字`;
        if (avgSentenceLength > 0) {
          dataStr += ` (平均 ${Math.round(avgSentenceLength)} 字)`;
        }
        break;
      case 'SUBHEADING_DISTRIBUTION_POOR':
        const maxGap = details.maxGap || details.longestGap || 0;
        const subheadingCount = details.subheadingCount || details.headingCount || 0;
        dataStr = `最大間隔 ${maxGap} 字 (${subheadingCount} 個子標題)`;
        break;
      case 'FLESCH_READING_EASE':
        const readingScore = details.score || details.fleschScore || 0;
        const difficulty = this.getReadingDifficulty(readingScore);
        dataStr = `${readingScore} (${difficulty})`;
        break;
      default:
        // 如果有其他數據，嘗試提取
        if (details.count !== undefined) {
          dataStr = `數量: ${details.count}`;
        } else if (details.length !== undefined) {
          dataStr = `長度: ${details.length}`;
        } else if (details.score !== undefined) {
          dataStr = `分數: ${details.score}`;
        } else if (issue.actual) {
          dataStr = issue.actual;
        }
    }
    
    // 如果有標準值，附加顯示
    if (issue.standards && issue.standards.optimal) {
      const optimal = issue.standards.optimal;
      const unit = issue.standards.unit || '';
      if (optimal.min !== undefined && optimal.max !== undefined) {
        dataStr += ` (建議: ${optimal.min}-${optimal.max}${unit})`;
      } else if (optimal.value !== undefined) {
        dataStr += ` (建議: ${optimal.value}${unit})`;
      }
    }
    
    return dataStr || '無數據';
  }

  /**
   * 根據 Flesch Reading Ease 分數獲取難度描述
   * @param {number} score
   * @returns {string}
   */
  getReadingDifficulty(score) {
    if (score >= 90) return '非常容易';
    if (score >= 80) return '容易';
    if (score >= 70) return '較容易';
    if (score >= 60) return '標準';
    if (score >= 50) return '較困難';
    if (score >= 30) return '困難';
    return '非常困難';
  }

  /**
   * 渲染單個問題項目
   * @param {Object} issue
   */
  renderIssueItem(issue) {
    const colors = {
      good: '#48bb78',
      ok: '#f6ad55',
      bad: '#fc8181'
    };
    
    const bgColors = {
      good: '#c6f6d5',
      ok: '#fed7a8',
      bad: '#fed7d7'
    };
    
    return `
      <div class="issue-item">
        <div class="issue-icon" style="background-color: ${bgColors[issue.rating]}; color: ${colors[issue.rating]}">
          ${issue.rating === 'good' ? '✓' : issue.rating === 'ok' ? '!' : '✗'}
        </div>
        <div class="issue-content" style="flex: 1;">
          <h4>${issue.name}</h4>
          <p>${issue.description}</p>
          ${issue.recommendation ? `
            <div class="issue-recommendation">
              <strong>建議:</strong> ${issue.recommendation}
            </div>
          ` : ''}
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.85rem; color: #718096;">
            <span>類型: ${issue.assessmentType === 'seo' ? 'SEO' : '可讀性'}</span>
            <span>影響: ${issue.impact === 'high' ? '高' : issue.impact === 'medium' ? '中' : '低'}</span>
            <span>分數: ${issue.score}/100</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 獲取評級文字
   * @param {string} grade
   * @param {number} score
   * @returns {string}
   */
  getGradeText(grade, score) {
    const gradeTexts = {
      'excellent': '優秀',
      'good': '良好',
      'needs-improvement': '需要改進',
      'poor': '較差'
    };
    
    // 如果沒有評級但有分數，根據分數計算評級
    if (!grade && score !== undefined) {
      if (score >= 80) return '優秀';
      if (score >= 60) return '良好';
      if (score >= 40) return '需要改進';
      return '較差';
    }
    
    return gradeTexts[grade] || grade || '未評級';
  }

  /**
   * 渲染預設檢測項目
   */
  renderDefaultAssessments() {
    // 如果頁面有新的多選下拉框元素，使用新方法
    if (document.getElementById('assessmentDropdown')) {
      this.initAssessmentSelect();
      return;
    }
    
    // 否則仍然使用舊的卡片式設計
    const grid = document.getElementById('assessmentsGrid');
    
    const defaultAssessments = [
      // SEO 檢測項目 (11 項) - 根據 API v2.0 文檔的 15 個評估項目
      { id: 'H1_MISSING', name: 'H1 標籤檢測', desc: '檢查是否有 H1 標籤', type: 'seo' },
      { id: 'MULTIPLE_H1', name: '多重 H1 檢測', desc: '檢測是否有多個 H1 標籤', type: 'seo' },
      { id: 'H1_KEYWORD_MISSING', name: 'H1 關鍵字檢測', desc: '檢查 H1 是否包含關鍵字', type: 'seo' },
      { id: 'IMAGES_MISSING_ALT', name: '圖片 Alt 檢測', desc: '檢查圖片是否有 alt 屬性', type: 'seo' },
      { id: 'KEYWORD_MISSING_FIRST_PARAGRAPH', name: '首段關鍵字檢測', desc: '檢查首段是否包含關鍵字', type: 'seo' },
      { id: 'KEYWORD_DENSITY_LOW', name: '關鍵字密度檢測', desc: '檢查關鍵字密度 (0.5-2.5%)', type: 'seo' },
      { id: 'META_DESCRIPTION_NEEDS_IMPROVEMENT', name: 'Meta 描述檢測', desc: '檢查 meta description 中的關鍵字', type: 'seo' },
      { id: 'META_DESCRIPTION_MISSING', name: 'Meta 描述長度檢測', desc: '檢查 meta description 長度 (150-160 字)', type: 'seo' },
      { id: 'TITLE_NEEDS_IMPROVEMENT', name: '標題優化檢測', desc: '檢查頁面標題優化', type: 'seo' },
      { id: 'TITLE_MISSING', name: '標題關鍵字檢測', desc: '檢查標題是否包含關鍵字', type: 'seo' },
      { id: 'CONTENT_LENGTH_SHORT', name: '內容長度檢測', desc: '檢查內容長度 (最少 300 字)', type: 'seo' },
      
      // 可讀性檢測項目 (4 項) - API v2.0 保證返回所有 15 個評估結果
      { id: 'FLESCH_READING_EASE', name: '可讀性評分', desc: '閱讀難度評分', type: 'readability' },
      { id: 'PARAGRAPH_LENGTH_LONG', name: '段落長度檢測', desc: '檢查段落長度 (最多 150 字)', type: 'readability' },
      { id: 'SENTENCE_LENGTH_LONG', name: '句子長度檢測', desc: '檢查句子長度 (最多 20 字)', type: 'readability' },
      { id: 'SUBHEADING_DISTRIBUTION_POOR', name: '子標題分佈檢測', desc: '檢查子標題分佈', type: 'readability' }
    ];
    
    // 添加快速選擇按鈕
    const quickSelectHtml = `
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-small" id="selectAllBtn">全選</button>
        <button class="btn btn-small" id="deselectAllBtn">全不選</button>
        <button class="btn btn-small" id="selectSeoBtn">只選 SEO</button>
        <button class="btn btn-small" id="selectReadabilityBtn">只選可讀性</button>
      </div>
    `;
    
    grid.innerHTML = quickSelectHtml + defaultAssessments.map(assessment => `
      <div class="assessment-card selected" data-assessment="${assessment.id}" data-type="${assessment.type}">
        <h4>${assessment.name}</h4>
        <p>${assessment.desc}</p>
        <small style="color: #718096; text-transform: uppercase;">${assessment.type}</small>
      </div>
    `).join('');
    
    // 綁定檢測項目點擊事件
    grid.querySelectorAll('.assessment-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
      });
    });
    
    // 綁定快速選擇按鈕事件
    document.getElementById('selectAllBtn').addEventListener('click', () => {
      grid.querySelectorAll('.assessment-card').forEach(card => {
        card.classList.add('selected');
      });
    });
    
    document.getElementById('deselectAllBtn').addEventListener('click', () => {
      grid.querySelectorAll('.assessment-card').forEach(card => {
        card.classList.remove('selected');
      });
    });
    
    document.getElementById('selectSeoBtn').addEventListener('click', () => {
      grid.querySelectorAll('.assessment-card').forEach(card => {
        if (card.dataset.type === 'seo') {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    });
    
    document.getElementById('selectReadabilityBtn').addEventListener('click', () => {
      grid.querySelectorAll('.assessment-card').forEach(card => {
        if (card.dataset.type === 'readability') {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    });
  }
  
  /**
   * 初始化多選檢測項目
   */
  initAssessmentSelect() {
    const defaultAssessments = [
      // SEO 檢測項目 (11 項) - 根據 API v2.0 文檔的 15 個評估項目
      { id: 'H1_MISSING', name: 'H1 標籤檢測', desc: '檢查是否有 H1 標籤', type: 'seo' },
      { id: 'MULTIPLE_H1', name: '多重 H1 檢測', desc: '檢測是否有多個 H1 標籤', type: 'seo' },
      { id: 'H1_KEYWORD_MISSING', name: 'H1 關鍵字檢測', desc: '檢查 H1 是否包含關鍵字', type: 'seo' },
      { id: 'IMAGES_MISSING_ALT', name: '圖片 Alt 檢測', desc: '檢查圖片是否有 alt 屬性', type: 'seo' },
      { id: 'KEYWORD_MISSING_FIRST_PARAGRAPH', name: '首段關鍵字檢測', desc: '檢查首段是否包含關鍵字', type: 'seo' },
      { id: 'KEYWORD_DENSITY_LOW', name: '關鍵字密度檢測', desc: '檢查關鍵字密度 (0.5-2.5%)', type: 'seo' },
      { id: 'META_DESCRIPTION_NEEDS_IMPROVEMENT', name: 'Meta 描述檢測', desc: '檢查 meta description 中的關鍵字', type: 'seo' },
      { id: 'META_DESCRIPTION_MISSING', name: 'Meta 描述長度檢測', desc: '檢查 meta description 長度 (150-160 字)', type: 'seo' },
      { id: 'TITLE_NEEDS_IMPROVEMENT', name: '標題優化檢測', desc: '檢查頁面標題優化', type: 'seo' },
      { id: 'TITLE_MISSING', name: '標題關鍵字檢測', desc: '檢查標題是否包含關鍵字', type: 'seo' },
      { id: 'CONTENT_LENGTH_SHORT', name: '內容長度檢測', desc: '檢查內容長度 (最少 300 字)', type: 'seo' },
      
      // 可讀性檢測項目 (4 項) - API v2.0 保證返回所有 15 個評估結果
      { id: 'FLESCH_READING_EASE', name: '可讀性評分', desc: '閱讀難度評分', type: 'readability' },
      { id: 'PARAGRAPH_LENGTH_LONG', name: '段落長度檢測', desc: '檢查段落長度 (最多 150 字)', type: 'readability' },
      { id: 'SENTENCE_LENGTH_LONG', name: '句子長度檢測', desc: '檢查句子長度 (最多 20 字)', type: 'readability' },
      { id: 'SUBHEADING_DISTRIBUTION_POOR', name: '副標題分佈檢測', desc: '檢查副標題分佈', type: 'readability' }
    ];
    
    // 初始化多選組件
    this.multiSelect = new MultiSelect({
      onChange: (selectedItems) => {
        console.log('Selected assessments:', selectedItems);
      }
    });
    
    // 設置檢測項目
    this.multiSelect.setItems(defaultAssessments);
  }
  
  /**
   * 獲取選中的檢測項目（支援新舊兩種方式）
   * @returns {Array}
   */
  getSelectedAssessments() {
    // 新的多選下拉框方式
    if (this.multiSelect) {
      return this.multiSelect.getSelectedItems();
    }
    
    // 舊的卡片方式
    const selectedCards = document.querySelectorAll('.assessment-card.selected');
    const assessments = [];
    
    selectedCards.forEach(card => {
      assessments.push(card.dataset.assessment);
    });
    
    return assessments;
  }
}