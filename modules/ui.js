/**
 * UI 主模組
 * 整合所有 UI 子模組並提供統一的介面
 */
import { UIBase } from './ui-base.js';
import { UIResults } from './ui-results.js';
import { UIPageInfo } from './ui-page-info.js';

export class UI {
  constructor() {
    this.base = new UIBase();
    this.results = new UIResults();
    this.pageInfo = new UIPageInfo();
    this.currentLanguage = 'zh-TW';
  }

  /**
   * 設定當前語言
   * @param {string} language - 語言代碼 ('zh-TW' 或 'en')
   */
  setLanguage(language) {
    this.currentLanguage = language;
    this.results.setLanguage(language);
  }

  // === 基礎 UI 功能 ===
  
  /**
   * 顯示/隱藏載入中覆蓋層
   * @param {boolean} show
   */
  showLoading(show) {
    this.base.showLoading(show);
  }

  /**
   * 顯示錯誤訊息
   * @param {string} message
   * @param {boolean} useToast - 是否使用 Toast 通知而非全螢幕錯誤
   */
  showError(message, useToast = false) {
    this.base.showError(message, useToast);
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message
   * @param {string} type - 'error', 'success', 'warning', 'info'
   */
  showToast(message, type = 'error') {
    this.base.showToast(message, type);
  }

  // === 頁面資訊功能 ===
  
  /**
   * 格式化關鍵字列表
   * @param {string} focusKeyword - 焦點關鍵字
   * @param {Array|string} keywords - 其他關鍵字
   * @param {Array} relatedKeywords - 相關關鍵字
   * @returns {string}
   */
  formatKeywords(focusKeyword, keywords, relatedKeywords) {
    return this.pageInfo.formatKeywords(focusKeyword, keywords, relatedKeywords);
  }

  /**
   * 渲染頁面資訊
   * @param {Object} pageData
   */
  renderPageInfo(pageData) {
    this.pageInfo.renderPageInfo(pageData);
  }

  /**
   * 渲染 WordPress URL 分析的簡化信息
   * @param {Object} wordpressData
   * @param {Object} pageUnderstanding
   */
  renderWordPressHtmlInfo(wordpressData, pageUnderstanding) {
    this.pageInfo.renderWordPressHtmlInfo(wordpressData, pageUnderstanding);
  }

  /**
   * 渲染 HTML 元素分析
   * @param {string} html
   */
  renderHtmlElements(html) {
    this.pageInfo.renderHtmlElements(html);
  }

  // === 分析結果功能 ===
  
  /**
   * 渲染分析結果
   * @param {Object} analysisResult
   */
  renderAnalysisResults(analysisResult) {
    this.results.renderAnalysisResults(analysisResult);
  }

  // === 默認檢測項目 ===
  
  /**
   * 渲染默認檢測項目
   */
  renderDefaultAssessments() {
    const container = document.getElementById('assessmentsContainer');
    
    container.innerHTML = `
      <div class="assessment-group">
        <h4>SEO 檢測項目</h4>
        <div class="assessment-list">
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="H1_KEYWORD" checked>
              <span>H1 關鍵字檢測</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="ALT_ATTRIBUTE" checked>
              <span>圖片替代文字</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="KEYWORD_DENSITY" checked>
              <span>關鍵字密度</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="META_DESCRIPTION_KEYWORD" checked>
              <span>Meta 描述關鍵字</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="TEXT_LENGTH" checked>
              <span>文本長度</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="assessment-group">
        <h4>可讀性檢測項目</h4>
        <div class="assessment-list">
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="SENTENCE_LENGTH_IN_TEXT" checked>
              <span>句子長度</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="PARAGRAPH_TOO_LONG" checked>
              <span>段落長度</span>
            </label>
          </div>
          <div class="assessment-item">
            <label>
              <input type="checkbox" value="FLESCH_READING_EASE" checked>
              <span>可讀性評分</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 獲取選中的檢測項目
   * @returns {Array}
   */
  getSelectedAssessments() {
    const container = document.getElementById('assessmentsContainer');
    if (!container) return [];
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }
}