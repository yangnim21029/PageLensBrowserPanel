// Content script for PageLens SEO Tool
(function() {
  'use strict';
  
  // 避免重複注入
  if (window.pageLensInjected) {
    return;
  }
  window.pageLensInjected = true;
  
  // 監聽來自 popup 的訊息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      try {
        const pageData = {
          html: document.documentElement.outerHTML,
          title: document.title,
          url: window.location.href,
          meta: getMetaData(),
          headings: getHeadings(),
          images: getImages(),
          links: getLinks()
        };
        
        sendResponse({success: true, data: pageData});
      } catch (error) {
        sendResponse({success: false, error: error.message});
      }
    }
    return true;
  });
  
  // 獲取 meta 資料
  function getMetaData() {
    const meta = {};
    
    // 獲取 title
    meta.title = document.title;
    
    // 獲取 meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    meta.description = metaDescription ? metaDescription.getAttribute('content') : '';
    
    // 獲取 meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    meta.keywords = metaKeywords ? metaKeywords.getAttribute('content') : '';
    
    // 獲取 Open Graph 標籤
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    meta.og = {
      title: ogTitle ? ogTitle.getAttribute('content') : '',
      description: ogDescription ? ogDescription.getAttribute('content') : '',
      image: ogImage ? ogImage.getAttribute('content') : ''
    };
    
    return meta;
  }
  
  // 獲取標題結構
  function getHeadings() {
    const headings = [];
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach(heading => {
      headings.push({
        level: parseInt(heading.tagName.charAt(1)),
        text: heading.textContent.trim(),
        tag: heading.tagName.toLowerCase()
      });
    });
    
    return headings;
  }
  
  // 獲取圖片資訊
  function getImages() {
    const images = [];
    const imageElements = document.querySelectorAll('img');
    
    imageElements.forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        width: img.width,
        height: img.height
      });
    });
    
    return images;
  }
  
  // 獲取連結資訊
  function getLinks() {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    
    linkElements.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        links.push({
          href: href,
          text: link.textContent.trim(),
          title: link.title || '',
          target: link.target || '',
          rel: link.rel || ''
        });
      }
    });
    
    return links;
  }
  
  console.log('PageLens content script loaded');
})();