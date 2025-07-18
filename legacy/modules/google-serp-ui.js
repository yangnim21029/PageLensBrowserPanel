/**
 * Google SERP 相關的 UI 方法 - 已移除，影響內容判斷
 */

/**
 * 格式化 URL 為 Google SERP 風格
 * @param {string} url
 * @returns {string}
 */
function formatSerpUrl(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const domain = urlObj.hostname;
    
    // 建立麵包屑格式
    let breadcrumbs = domain;
    if (pathParts.length > 0) {
      breadcrumbs += ' › ' + pathParts.slice(0, 2).join(' › ');
    }
    
    return breadcrumbs;
  } catch {
    return url;
  }
}

/**
 * 渲染 Google SERP 預覽
 * @param {Object} data
 * @returns {string}
 */
function renderSerpPreview(data) {
  return `
    <div class="serp-preview">
      <div class="serp-title">${data.title || '無標題'}</div>
      <div class="serp-url">${formatSerpUrl(data.url)}</div>
      <div class="serp-description">${data.description || '無描述'}</div>
    </div>
  `;
}