/**
 * 多選下拉框組件
 * 處理檢測項目的多選功能
 */
export class MultiSelect {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.multi-select-container');
    this.selectInput = options.input || document.getElementById('assessmentSelectInput');
    this.dropdown = options.dropdown || document.getElementById('assessmentDropdown');
    this.tagsContainer = options.tagsContainer || document.getElementById('selectedTags');
    
    this.selectedItems = new Set();
    this.items = [];
    this.onChangeCallback = options.onChange || null;
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    if (!this.container || !this.selectInput || !this.dropdown) {
      console.error('MultiSelect: Required elements not found');
      return;
    }
    
    this.bindEvents();
    this.bindTabSwitching();
  }
  
  /**
   * 綁定 Tab 切換事件
   */
  bindTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        // 更新按鈕狀態
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 更新面板顯示
        tabPanels.forEach(panel => {
          if (panel.id === `${targetTab}-tab`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }
  
  /**
   * 綁定事件
   */
  bindEvents() {
    // 下拉框開關
    this.selectInput.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // 點擊外部關閉
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && !e.target.closest('.quick-select-buttons')) {
        this.closeDropdown();
      }
    });
    
    // 防止下拉框內部點擊關閉
    this.dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // 綁定快速選擇按鈕（位於下拉框外部）
    this.bindExternalQuickSelectButtons();
  }
  
  /**
   * 設置選項數據
   * @param {Array} items - 選項數組
   */
  setItems(items) {
    this.items = items;
    this.selectedItems = new Set(items.map(item => item.id)); // 默認全選
    this.render();
  }
  
  /**
   * 渲染下拉框內容
   */
  render() {
    // 創建選項（下拉框內只有選項，沒有快速選擇按鈕）
    const optionsHtml = this.items.map(item => `
      <div class="multi-select-option ${this.selectedItems.has(item.id) ? 'selected' : ''}" 
           data-id="${item.id}" 
           data-type="${item.type}">
        <input type="checkbox" 
               id="check-${item.id}" 
               ${this.selectedItems.has(item.id) ? 'checked' : ''}>
        <label class="multi-select-option-label" for="check-${item.id}">
          ${item.name}
        </label>
        <span class="multi-select-option-type">${item.type}</span>
      </div>
    `).join('');
    
    this.dropdown.innerHTML = optionsHtml;
    
    // 綁定選項點擊
    this.bindOptionClicks();
    
    // 更新標籤顯示
    this.updateTags();
  }
  
  /**
   * 綁定外部快速選擇按鈕
   */
  bindExternalQuickSelectButtons() {
    const buttons = document.querySelectorAll('.quick-select-buttons .quick-select-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.dataset.action;
        
        switch (action) {
          case 'select-all':
            this.selectAll();
            break;
          case 'deselect-all':
            this.deselectAll();
            break;
          case 'select-seo':
            this.selectByType('seo');
            break;
          case 'select-readability':
            this.selectByType('readability');
            break;
        }
      });
    });
  }
  
  /**
   * 綁定選項點擊事件
   */
  bindOptionClicks() {
    const options = this.dropdown.querySelectorAll('.multi-select-option');
    
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = option.dataset.id;
        const checkbox = option.querySelector('input[type="checkbox"]');
        
        // 切換選中狀態
        if (this.selectedItems.has(id)) {
          this.selectedItems.delete(id);
          option.classList.remove('selected');
          checkbox.checked = false;
        } else {
          this.selectedItems.add(id);
          option.classList.add('selected');
          checkbox.checked = true;
        }
        
        this.updateTags();
        this.triggerChange();
      });
    });
  }
  
  /**
   * 全選
   */
  selectAll() {
    this.items.forEach(item => this.selectedItems.add(item.id));
    this.updateUI();
  }
  
  /**
   * 全不選
   */
  deselectAll() {
    this.selectedItems.clear();
    this.updateUI();
  }
  
  /**
   * 按類型選擇
   * @param {string} type
   */
  selectByType(type) {
    this.selectedItems.clear();
    this.items
      .filter(item => item.type === type)
      .forEach(item => this.selectedItems.add(item.id));
    this.updateUI();
  }
  
  /**
   * 更新 UI 狀態
   */
  updateUI() {
    // 更新選項狀態
    this.dropdown.querySelectorAll('.multi-select-option').forEach(option => {
      const id = option.dataset.id;
      const checkbox = option.querySelector('input[type="checkbox"]');
      
      if (this.selectedItems.has(id)) {
        option.classList.add('selected');
        checkbox.checked = true;
      } else {
        option.classList.remove('selected');
        checkbox.checked = false;
      }
    });
    
    this.updateTags();
    this.triggerChange();
  }
  
  /**
   * 更新標籤顯示
   */
  updateTags() {
    // 更新輸入框文字
    const placeholder = this.selectInput.querySelector('.placeholder');
    if (this.selectedItems.size === 0) {
      placeholder.textContent = '選擇檢測項目...';
      placeholder.style.display = 'block';
      this.tagsContainer.innerHTML = '';
      return;
    }
    
    // 隱藏 placeholder
    placeholder.style.display = 'none';
    
    // 創建標籤
    const tagsHtml = Array.from(this.selectedItems).map(id => {
      const item = this.items.find(i => i.id === id);
      if (!item) return '';
      
      return `
        <span class="tag" data-id="${id}">
          ${item.name}
          <span class="tag-remove">×</span>
        </span>
      `;
    }).join('');
    
    this.tagsContainer.innerHTML = tagsHtml;
    
    // 綁定標籤移除事件
    this.tagsContainer.querySelectorAll('.tag').forEach(tag => {
      const removeBtn = tag.querySelector('.tag-remove');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = tag.dataset.id;
        this.removeItem(id);
      });
    });
  }
  
  /**
   * 移除項目
   * @param {string} id
   */
  removeItem(id) {
    this.selectedItems.delete(id);
    
    // 更新下拉框中的狀態
    const option = this.dropdown.querySelector(`.multi-select-option[data-id="${id}"]`);
    if (option) {
      option.classList.remove('selected');
      option.querySelector('input[type="checkbox"]').checked = false;
    }
    
    this.updateTags();
    this.triggerChange();
  }
  
  /**
   * 切換下拉框顯示
   */
  toggleDropdown() {
    if (this.dropdown.classList.contains('show')) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  
  /**
   * 打開下拉框
   */
  openDropdown() {
    this.dropdown.classList.add('show');
    this.selectInput.classList.add('active');
  }
  
  /**
   * 關閉下拉框
   */
  closeDropdown() {
    this.dropdown.classList.remove('show');
    this.selectInput.classList.remove('active');
  }
  
  /**
   * 獲取選中的項目
   * @returns {Array}
   */
  getSelectedItems() {
    return Array.from(this.selectedItems);
  }
  
  /**
   * 觸發變更事件
   */
  triggerChange() {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.getSelectedItems());
    }
  }
  
  /**
   * 銷毀組件
   */
  destroy() {
    // 移除事件監聽器
    this.selectInput.removeEventListener('click', this.toggleDropdown);
    // 清空內容
    this.dropdown.innerHTML = '';
    this.tagsContainer.innerHTML = '';
  }
}