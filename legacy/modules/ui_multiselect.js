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
    this.selectedAssessments = new Set(); // 儲存選中的檢測項目
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
      ${pageData.focusKeyword ? `
      <div class="info-item">
        <h4>焦點關鍵字</h4>
        <div class="value">${pageData.focusKeyword}</div>
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
   */
  renderWordPressHtmlInfo(wordpressData) {
    const container = document.getElementById('htmlElementsContainer');
    
    if (!wordpressData) {
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
    
    container.innerHTML = `
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
      
      <div class="info-item" style="background: var(--color-background); border: 1px dashed var(--border-light);">
        <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          💡 提示：WordPress 文章標題會自動作為 H1 進行分析
        </p>
      </div>
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
    document.getElementById('analysisForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    
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
    
    const scoresHtml = `
      <div style="background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%); 
                  border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; color: white;">
        <h4 style="margin-bottom: 1rem; font-size: 1.2rem;">整體分析分數</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: bold;">${scores.overallScore || 0}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">整體分數</div>
            <div style="font-size: 0.8rem; opacity: 0.8; text-transform: uppercase;">
              ${this.getGradeText(scores.overallGrade, scores.overallScore)}
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${scores.seoScore || 0}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">SEO 分數</div>
            <div style="font-size: 0.8rem; opacity: 0.8; text-transform: uppercase;">
              ${this.getGradeText(scores.seoGrade, scores.seoScore)}
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${scores.readabilityScore || 0}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">可讀性分數</div>
            <div style="font-size: 0.8rem; opacity: 0.8; text-transform: uppercase;">
              ${this.getGradeText(scores.readabilityGrade, scores.readabilityScore)}
            </div>
          </div>
        </div>
      </div>
    `;
    
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
                <span style="font-size: 0.85rem; color: var(--color-success);">分數: ${issue.score}/100</span>
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
          ${badIssues.map(issue => this.renderIssueItem(issue)).join('')}
        </div>
      `;
    }
    
    // 顯示警告項目
    if (okIssues.length > 0) {
      allIssuesHtml += `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--color-warning);">⚠️ 建議改進的項目 (${okIssues.length})</h4>
          ${okIssues.map(issue => this.renderIssueItem(issue)).join('')}
        </div>
      `;
    }
    
    // 顯示通過的項目（摺疊）
    if (goodIssues.length > 0) {
      allIssuesHtml += `
        <details style="margin-bottom: 1.5rem;">
          <summary style="cursor: pointer; padding: 0.75rem; background: var(--color-gray-light); 
                           border-radius: 8px; font-weight: 600; color: var(--text-primary);">
            ✅ 查看通過的檢測項目 (${goodIssues.length})
          </summary>
          <div style="margin-top: 1rem; display: grid; gap: 0.5rem;">
            ${goodIssues.map(issue => `
              <div style="background: rgba(72, 142, 128, 0.05); border: 1px solid rgba(72, 142, 128, 0.2); 
                          border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-success); font-size: 1.2rem;">✓</span>
                <div style="flex: 1;">
                  <strong style="color: var(--text-primary);">${issue.name}</strong>
                  ${issue.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${issue.description}</div>` : ''}
                </div>
                <span style="font-size: 0.85rem; color: var(--color-success);">分數: ${issue.score}/100</span>
              </div>
            `).join('')}
          </div>
        </details>
      `;
    }
    
    issuesList.innerHTML = scoresHtml + summaryHtml + allIssuesHtml;
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
   * 渲染預設檢測項目（多選下拉框版本）
   */
  renderDefaultAssessments() {
    const dropdown = document.getElementById('assessmentDropdown');
    const selectedTagsContainer = document.getElementById('selectedTags');
    const selectInput = document.getElementById('assessmentSelectInput');
    
    if (!dropdown || !selectedTagsContainer || !selectInput) {
      console.warn('Multi-select elements not found, falling back to old assessment grid');
      return;
    }
    
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
    
    // 存儲選中的項目
    this.selectedAssessments = new Set(defaultAssessments.map(a => a.id)); // 默認全選
    
    // 添加快速選擇按鈕
    const quickSelectHtml = `
      <div class="quick-select-buttons">
        <button class="quick-select-btn" id="selectAllBtn">全選</button>
        <button class="quick-select-btn" id="deselectAllBtn">全不選</button>
        <button class="quick-select-btn" id="selectSeoBtn">只選 SEO</button>
        <button class="quick-select-btn" id="selectReadabilityBtn">只選可讀性</button>
      </div>
    `;
    
    // 創建下拉選項
    const optionsHtml = defaultAssessments.map(assessment => `
      <div class="multi-select-option ${this.selectedAssessments.has(assessment.id) ? 'selected' : ''}" data-id="${assessment.id}" data-type="${assessment.type}">
        <input type="checkbox" id="check-${assessment.id}" ${this.selectedAssessments.has(assessment.id) ? 'checked' : ''}>
        <label class="multi-select-option-label" for="check-${assessment.id}">${assessment.name}</label>
        <span class="multi-select-option-type">${assessment.type}</span>
      </div>
    `).join('');
    
    dropdown.innerHTML = quickSelectHtml + optionsHtml;
    
    // 綁定下拉框開關
    selectInput.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      selectInput.classList.toggle('active');
    });
    
    // 點擊外部關閉下拉框
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !selectInput.contains(e.target)) {
        dropdown.classList.remove('show');
        selectInput.classList.remove('active');
      }
    });
    
    // 綁定選項點擊事件
    dropdown.querySelectorAll('.multi-select-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = option.dataset.id;
        const checkbox = option.querySelector('input[type="checkbox"]');
        
        checkbox.checked = !checkbox.checked;
        option.classList.toggle('selected');
        
        if (checkbox.checked) {
          this.selectedAssessments.add(id);
        } else {
          this.selectedAssessments.delete(id);
        }
        
        this.updateSelectedTags(defaultAssessments);
      });
    });
    
    // 綁定快速選擇按鈕
    document.getElementById('selectAllBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.querySelectorAll('.multi-select-option').forEach(option => {
        option.classList.add('selected');
        option.querySelector('input[type="checkbox"]').checked = true;
        this.selectedAssessments.add(option.dataset.id);
      });
      this.updateSelectedTags(defaultAssessments);
    });
    
    document.getElementById('deselectAllBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.querySelectorAll('.multi-select-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input[type="checkbox"]').checked = false;
      });
      this.selectedAssessments.clear();
      this.updateSelectedTags(defaultAssessments);
    });
    
    document.getElementById('selectSeoBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.querySelectorAll('.multi-select-option').forEach(option => {
        if (option.dataset.type === 'seo') {
          option.classList.add('selected');
          option.querySelector('input[type="checkbox"]').checked = true;
          this.selectedAssessments.add(option.dataset.id);
        } else {
          option.classList.remove('selected');
          option.querySelector('input[type="checkbox"]').checked = false;
          this.selectedAssessments.delete(option.dataset.id);
        }
      });
      this.updateSelectedTags(defaultAssessments);
    });
    
    document.getElementById('selectReadabilityBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.querySelectorAll('.multi-select-option').forEach(option => {
        if (option.dataset.type === 'readability') {
          option.classList.add('selected');
          option.querySelector('input[type="checkbox"]').checked = true;
          this.selectedAssessments.add(option.dataset.id);
        } else {
          option.classList.remove('selected');
          option.querySelector('input[type="checkbox"]').checked = false;
          this.selectedAssessments.delete(option.dataset.id);
        }
      });
      this.updateSelectedTags(defaultAssessments);
    });
    
    // 初始化顯示選中的標籤
    this.updateSelectedTags(defaultAssessments);
  }
  
  /**
   * 更新選中的標籤顯示
   */
  updateSelectedTags(assessments) {
    const selectedTagsContainer = document.getElementById('selectedTags');
    const selectInput = document.getElementById('assessmentSelectInput');
    
    if (this.selectedAssessments.size === 0) {
      selectedTagsContainer.innerHTML = '';
      selectInput.querySelector('.placeholder').textContent = '選擇檢測項目...';
      return;
    }
    
    selectInput.querySelector('.placeholder').textContent = `已選擇 ${this.selectedAssessments.size} 個項目`;
    
    const tagsHtml = Array.from(this.selectedAssessments).map(id => {
      const assessment = assessments.find(a => a.id === id);
      if (!assessment) return '';
      
      return `
        <span class="tag">
          ${assessment.name}
          <span class="tag-remove" data-id="${id}">×</span>
        </span>
      `;
    }).join('');
    
    selectedTagsContainer.innerHTML = tagsHtml;
    
    // 綁定標籤移除事件
    selectedTagsContainer.querySelectorAll('.tag-remove').forEach(removeBtn => {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = removeBtn.dataset.id;
        this.selectedAssessments.delete(id);
        
        // 更新下拉框中的選中狀態
        const option = document.querySelector(`.multi-select-option[data-id="${id}"]`);
        if (option) {
          option.classList.remove('selected');
          option.querySelector('input[type="checkbox"]').checked = false;
        }
        
        this.updateSelectedTags(assessments);
      });
    });
  }
  
  /**
   * 獲取選中的檢測項目
   */
  getSelectedAssessments() {
    return Array.from(this.selectedAssessments);
  }
}