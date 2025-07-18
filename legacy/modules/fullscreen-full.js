/**
 * PageLens SEO 分析器主模組
 * 整合所有子模組並管理分析流程
 */
import { PageLensAPI } from './api.js';
import { UI } from './ui.js';
import { WordPress } from './wordpress.js';

class PageLensAnalyzer {
  constructor() {
    // 初始化模組
    this.api = new PageLensAPI();
    this.ui = new UI();
    this.wordpress = new WordPress();
    
    // 初始化狀態
    this.pageData = null;
    this.analysisResult = null;
    
    this.init();
  }

  async init() {
    try {
      // 從 Chrome storage 載入頁面資料
      const result = await chrome.storage.local.get(['analysisData']);
      if (result.analysisData) {
        this.pageData = result.analysisData;
        console.log('載入頁面資料:', this.pageData);
        
        // 顯示頁面資訊
        this.ui.renderPageInfo(this.pageData);
        
        // 顯示 HTML 元素分析
        if (this.pageData.html) {
          this.ui.renderHtmlElements(this.pageData.html);
        }
        
        // 填充表單
        this.populateForm();
        
        // 載入檢測項目
        await this.loadAssessments();
        
        // 嘗試從 WordPress 獲取關鍵字
        await this.tryFetchWordPressKeywords();
      } else {
        // 沒有頁面資料，顯示提示
        console.warn('沒有找到分析資料');
        this.ui.renderPageInfo({
          title: '請從擴充功能彈窗開啟',
          url: '請在要分析的網頁上點擊擴充功能圖示',
          description: '然後點擊「開啟全螢幕分析」按鈕'
        });
        this.ui.renderHtmlElements('<p>無內容</p>');
      }
      
      // 綁定事件監聽器
      this.bindEventListeners();
      
    } catch (error) {
      console.error('初始化失敗:', error);
      this.ui.showError('初始化失敗: ' + error.message);
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
  }

  async loadAssessments() {
    try {
      // 檢查 API 健康狀態
      const isHealthy = await this.api.healthCheck();
      if (!isHealthy) {
        console.warn('API 服務不可用，使用預設檢測項目');
        this.ui.renderDefaultAssessments();
        return;
      }
      
      // 由於新 API 沒有 assessments 端點，直接使用預設檢測項目
      this.ui.renderDefaultAssessments();
      
    } catch (error) {
      console.error('載入檢測項目失敗:', error);
      this.ui.showError('無法連接到 PageLens API 服務，請檢查網路連接');
      this.ui.renderDefaultAssessments();
    }
  }

  async tryFetchWordPressKeywords() {
    if (!this.pageData || !this.pageData.url) return;
    
    // 如果不是支援的站點，直接跳過
    if (!this.wordpress.isSupportedSite(this.pageData.url)) {
      console.log('非 WordPress 站點，跳過關鍵字獲取');
      return;
    }
    
    try {
      // 設定超時時間為 3 秒
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('獲取關鍵字超時')), 3000)
      );
      
      const fetchPromise = this.wordpress.fetchKeywordsFromWordPress(this.pageData.url);
      
      // 使用 Promise.race 實現超時控制
      const keywords = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (keywords && keywords.length > 0) {
        const focusKeyword = document.getElementById('focusKeyword');
        if (!focusKeyword.value) {
          focusKeyword.value = keywords[0];
          this.ui.showToast(`自動填入關鍵字: ${keywords[0]}`, 'success');
        }
      }
    } catch (error) {
      console.warn('獲取 WordPress 關鍵字失敗或超時:', error.message);
      // 不顯示錯誤給用戶，因為這是可選功能
    }
  }

  bindEventListeners() {
    // 分析按鈕
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', () => this.performAnalysis());
    
    // 自定義 URL 分析按鈕
    const analyzeUrlBtn = document.getElementById('analyzeUrlBtn');
    analyzeUrlBtn.addEventListener('click', () => this.analyzeCustomUrl());
    
    // Enter 鍵提交 URL
    const customUrlInput = document.getElementById('customUrlInput');
    customUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.analyzeCustomUrl();
      }
    });
    
    // 儲存和捨棄按鈕
    const saveBtn = document.getElementById('saveBtn');
    const discardBtn = document.getElementById('discardBtn');
    
    saveBtn.addEventListener('click', () => this.saveReport());
    discardBtn.addEventListener('click', () => this.discardReport());
  }

  async performAnalysis() {
    if (!this.pageData) {
      this.ui.showError('沒有頁面資料可供分析', true);
      return;
    }
    
    try {
      this.ui.showLoading(true);
      
      // 準備分析請求
      const analysisRequest = this.prepareAnalysisRequest();
      
      // 調試：查看請求內容
      console.log('=== 分析請求詳情 ===');
      console.log('頁面 URL:', analysisRequest.pageDetails.url);
      console.log('頁面標題:', analysisRequest.pageDetails.title);
      console.log('HTML 內容長度:', analysisRequest.htmlContent?.length || 0);
      console.log('HTML 內容是否存在:', !!analysisRequest.htmlContent);
      console.log('HTML 內容開頭:', analysisRequest.htmlContent?.substring(0, 200) || '無');
      
      // 顯示 HTML 大小信息
      if (analysisRequest.htmlContent) {
        const htmlSize = new Blob([analysisRequest.htmlContent]).size;
        const sizeInMB = (htmlSize / (1024 * 1024)).toFixed(2);
        console.log(`HTML 內容大小: ${sizeInMB} MB`);
        
        if (htmlSize > 5 * 1024 * 1024) {
          console.warn('HTML 內容較大，API 處理可能需要更多時間');
        }
      } else {
        console.error('❌ HTML 內容為空！');
      }
      
      console.log('焦點關鍵字:', analysisRequest.focusKeyword || '無');
      console.log('語言設定:', analysisRequest.pageDetails.language);
      console.log('檢測配置:', analysisRequest.options.assessmentConfig);
      
      const isWordPressSite = this.wordpress.isSupportedSite(this.pageData.url);
      if (isWordPressSite) {
        console.log('WordPress 站點模式 (extractMainContent: true) - 使用內容萃取');
      } else {
        console.log('外站模式 - 使用指定的 contentSelectors');
        console.log('內容選擇器:', analysisRequest.options.contentSelectors);
        console.log('排除選擇器:', analysisRequest.options.excludeSelectors);
      }
      
      // 調試：檢查完整的請求物件
      console.log('完整請求物件:', JSON.stringify({
        htmlContent: analysisRequest.htmlContent ? `[${analysisRequest.htmlContent.length} chars]` : null,
        pageDetails: analysisRequest.pageDetails,
        focusKeyword: analysisRequest.focusKeyword,
        options: analysisRequest.options
      }, null, 2));
      
      // 發送分析請求
      const result = await this.api.analyzePage(analysisRequest);
      
      // 調試：查看回應
      console.log('=== API 回應詳情 ===');
      console.log('API 回應狀態:', result.success);
      console.log('整體分數:', result.report?.overallScores);
      console.log('詳細問題數量:', result.report?.detailedIssues?.length || 0);
      if (result.report?.detailedIssues?.length > 0) {
        console.log('前 3 個檢測項目:', result.report.detailedIssues.slice(0, 3));
      }
      
      // API v2.0 新增的回應信息
      if (result.processingTime) {
        console.log('處理時間:', result.processingTime, 'ms');
      }
      if (result.apiVersion) {
        console.log('API 版本:', result.apiVersion);
      }
      
      if (result.success) {
        this.analysisResult = result.report;
        this.ui.renderAnalysisResults(this.analysisResult);
      } else {
        throw new Error(result.error || '分析失敗');
      }
      
    } catch (error) {
      console.error('分析失敗:', error);
      this.ui.showError('分析失敗: ' + error.message, true);
    } finally {
      this.ui.showLoading(false);
    }
  }

  async analyzeCustomUrl() {
    const customUrlInput = document.getElementById('customUrlInput');
    const url = customUrlInput.value.trim();
    
    // 驗證 URL
    const validation = this.wordpress.validateUrl(url);
    if (!validation.isValid) {
      this.ui.showError(validation.error, true);  // 使用 toast 通知
      return;
    }
    
    try {
      this.ui.showLoading(true);
      
      // 檢查是否為支持的 WordPress 站點
      if (!this.wordpress.isSupportedSite(url)) {
        const supportedSites = this.wordpress.getSupportedSites();
        
        // 檢查是否為支援的網域但不是文章頁
        const hostname = new URL(url).hostname;
        if (supportedSites.includes(hostname)) {
          throw new Error('請輸入文章頁面網址（需包含 /article/）。標籤頁、分類頁等其他頁面暫不支援。');
        } else {
          throw new Error(`目前僅支援 WordPress/PressLogic 站點的文章頁面分析。支援的站點包括：${supportedSites.join(', ')}`);
        }
      }
      
      // 準備分析請求
      const analysisRequest = this.wordpress.prepareAnalysisRequest(url);
      
      // 發送到新的 WordPress URL 分析端點
      const result = await this.api.analyzeWordPressUrl(analysisRequest);
      
      if (result.success) {
        this.analysisResult = result.report;
        
        // 調試：查看 API 返回的數據結構
        console.log('API 返回數據:', result);
        console.log('WordPress 數據:', result.wordpressData);
        
        // 更新左側面板顯示 WordPress 數據
        const wordpressData = this.wordpress.formatWordPressData(url, result.wordpressData);
        this.ui.renderPageInfo(wordpressData);
        
        // 對於 WordPress URL 分析，顯示簡化的 HTML 結構信息
        this.ui.renderWordPressHtmlInfo(result.wordpressData);
        
        // 更新右側面板顯示分析結果
        this.ui.renderAnalysisResults(this.analysisResult);
        
        // 清空輸入框
        customUrlInput.value = '';
        
        this.ui.showToast('URL 分析完成', 'success');
        
      } else {
        throw new Error(result.error || '分析失敗');
      }
      
    } catch (error) {
      console.error('自定義 URL 分析失敗:', error);
      this.ui.showError('分析失敗: ' + error.message, true);
    } finally {
      this.ui.showLoading(false);
    }
  }

  prepareAnalysisRequest() {
    const focusKeyword = document.getElementById('focusKeyword').value.trim();
    const language = document.getElementById('language').value;
    const selectedAssessments = this.getSelectedAssessments();
    
    // 判斷是否為支援的 WordPress 站點
    const isWordPressSite = this.wordpress.isSupportedSite(this.pageData.url);
    
    const options = {
      assessmentConfig: selectedAssessments
    };
    
    if (isWordPressSite) {
      // WordPress 站點使用內容萃取
      options.extractMainContent = true;
    } else {
      // 外站需要指定 contentSelectors (根據 API v2.0 文檔要求)
      options.contentSelectors = ['article', 'main', '.content'];
      options.excludeSelectors = ['.ad', '.sidebar'];
    }
    
    return {
      htmlContent: this.pageData.html,
      pageDetails: {
        url: this.pageData.url,
        title: this.pageData.title,
        description: this.pageData.description || undefined,
        language: language
      },
      focusKeyword: focusKeyword || undefined,
      options: options
    };
  }

  getSelectedAssessments() {
    // 使用 UI 模組的方法來獲取選中的項目（支援新舊兩種方式）
    const assessments = this.ui.getSelectedAssessments();
    
    // 如果有選擇特定檢測項目，使用選擇的項目
    if (assessments.length > 0) {
      return { enabledAssessments: assessments };
    }
    
    // 如果沒有選擇任何項目，啟用所有檢測 (根據 API 文檔)
    return { 
      enableAllSEO: true,
      enableAllReadability: true
    };
  }


  saveReport() {
    if (!this.analysisResult) {
      this.ui.showError('沒有分析結果可以儲存', true);
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
    
    this.ui.showToast('報告已儲存', 'success');
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