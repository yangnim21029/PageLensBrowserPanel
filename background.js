// Service Worker for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('PageLens SEO 分析工具已安裝');
});

// 處理來自 content script 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // 獲取頁面內容的邏輯
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          func: () => {
            return {
              html: document.documentElement.outerHTML,
              title: document.title,
              url: window.location.href
            };
          }
        }, (results) => {
          if (results && results[0]) {
            sendResponse({success: true, data: results[0].result});
          } else {
            sendResponse({success: false, error: '無法獲取頁面內容'});
          }
        });
      } else {
        sendResponse({success: false, error: '無法找到活動標籤'});
      }
    });
    return true; // 保持訊息通道開啟
  }
});

// 處理擴展程式圖標點擊
chrome.action.onClicked.addListener((tab) => {
  // 當用戶點擊擴展程式圖標時的處理邏輯
  console.log('擴展程式圖標被點擊');
});