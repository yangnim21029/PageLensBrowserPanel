// 立即顯示基本 UI，避免延遲
(function() {
  // 預先定義支援的站點列表（避免重複定義）
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

  // 檢查是否為 WordPress 站點（簡化版本）
  function isWordPressSite(url) {
    try {
      const urlObj = new URL(url);
      return supportedSites.includes(urlObj.hostname);
    } catch {
      return false;
    }
  }

  // 主要初始化函數
  async function initialize() {
    // 獲取 DOM 元素
    const initialLoading = document.getElementById('initialLoading');
    const mainContent = document.getElementById('mainContent');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const pageTitle = document.getElementById('pageTitle');
    const pageUrl = document.getElementById('pageUrl');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const quickActions = document.querySelectorAll('.quick-action');
    
    let currentTab = null;

    // 顯示錯誤訊息
    function showError(message) {
      error.textContent = message;
      error.style.display = 'block';
      setTimeout(() => {
        error.style.display = 'none';
      }, 5000);
    }

    // 顯示載入狀態
    function showLoading(show = true) {
      loading.style.display = show ? 'block' : 'none';
      analyzeBtn.disabled = show;
      if (show) {
        analyzeBtn.textContent = '分析中...';
      } else {
        analyzeBtn.innerHTML = '🚀 開啟全螢幕分析';
      }
    }

    // 更新 UI 以顯示非 WordPress 站點狀態
    function updateUIForNonWordPress() {
      analyzeBtn.innerHTML = '🚧 外站分析開發中';
      analyzeBtn.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
      
      const quickActionsContainer = document.querySelector('.quick-actions');
      quickActionsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; 
                    background: rgba(243, 156, 18, 0.1); border-radius: 8px; 
                    border: 1px solid rgba(243, 156, 18, 0.3);">
          <div style="font-size: 24px; margin-bottom: 10px;">🚧</div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">外站分析功能開發中</div>
          <div style="font-size: 12px; opacity: 0.8;">目前僅支援 WordPress/PressLogic 站點</div>
        </div>
      `;
    }

    // 獲取當前頁面資訊（優化版）
    async function getCurrentPageInfo() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;
        
        // 立即更新頁面資訊顯示
        pageTitle.textContent = tab.title || '無標題';
        pageUrl.textContent = tab.url || '無 URL';
        
        // 隱藏初始載入，顯示主要內容
        initialLoading.style.display = 'none';
        mainContent.style.display = 'block';
        
        // 檢查是否為有效的網頁
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
          throw new Error('無法分析此頁面類型');
        }
        
        // 檢查是否為 WordPress 站點
        if (!isWordPressSite(tab.url)) {
          updateUIForNonWordPress();
        }
        
        return tab;
      } catch (err) {
        initialLoading.style.display = 'none';
        mainContent.style.display = 'block';
        showError('無法獲取頁面資訊: ' + err.message);
        return null;
      }
    }

    // 獲取頁面 HTML 內容（僅在需要時調用）
    async function getPageContent() {
      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: () => {
            return {
              html: document.documentElement.outerHTML,
              title: document.title,
              url: window.location.href
            };
          }
        });
        
        return result.result;
      } catch (err) {
        throw new Error('無法獲取頁面內容: ' + err.message);
      }
    }

    // 開啟全螢幕分析頁面
    async function openFullscreenAnalysis() {
      if (!currentTab) return;
      
      try {
        showLoading(true);
        
        // 延遲獲取頁面內容，只在真正需要時才執行
        const pageContent = await getPageContent();
        
        // 檢查 HTML 內容大小
        const htmlSize = new Blob([pageContent.html]).size;
        const sizeInMB = (htmlSize / (1024 * 1024)).toFixed(2);
        
        console.log(`HTML 內容大小: ${sizeInMB} MB`);
        
        // 如果超過 10MB，顯示警告但仍繼續
        if (htmlSize > 10 * 1024 * 1024) {
          console.warn('HTML 內容較大，可能影響分析速度');
        }
        
        // 將頁面內容存儲到 Chrome storage
        await chrome.storage.local.set({
          analysisData: {
            html: pageContent.html,
            title: pageContent.title,
            url: pageContent.url,
            timestamp: Date.now(),
            htmlSize: htmlSize
          }
        });
        
        // 開啟全螢幕分析頁面
        const fullscreenUrl = chrome.runtime.getURL('fullscreen.html');
        await chrome.tabs.create({
          url: fullscreenUrl,
          active: true
        });
        
        // 關閉彈窗
        window.close();
        
      } catch (err) {
        console.error('分析失敗:', err);
        showError('分析失敗: ' + err.message);
      } finally {
        showLoading(false);
      }
    }

    // 快速操作處理
    function handleQuickAction(actionId) {
      openFullscreenAnalysis();
    }

    // 綁定事件監聽（使用事件委派提高性能）
    analyzeBtn.addEventListener('click', openFullscreenAnalysis);
    
    // 使用單一事件監聽器處理所有快速操作
    const quickActionsContainer = document.querySelector('.quick-actions');
    quickActionsContainer.addEventListener('click', (e) => {
      const quickAction = e.target.closest('.quick-action');
      if (quickAction) {
        handleQuickAction(quickAction.id);
      }
    });

    // 執行初始化
    await getCurrentPageInfo();
  }

  // 確保 DOM 完全載入後再執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM 已經載入完成
    initialize();
  }
})();