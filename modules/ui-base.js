/**
 * UI 基礎功能模組
 * 處理載入狀態、錯誤訊息、Toast 通知等基礎 UI 功能
 */
export class UIBase {
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
   * @param {boolean} useToast - 是否使用 Toast 通知而非全螢幕錯誤
   */
  showError(message, useToast = false) {
    if (useToast) {
      this.showToast(message, 'error');
    } else {
      this.errorText.textContent = message;
      this.errorMessage.style.display = 'flex';
      
      setTimeout(() => {
        this.errorMessage.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message
   * @param {string} type - 'error', 'success', 'warning', 'info'
   */
  showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 根據類型設定圖示
    const icons = {
      'error': '❌',
      'success': '✅',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // 觸發動畫
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}