/**
 * MobileCard - 移動端卡片容器組件
 * 提供標準化的卡片布局和樣式
 */

class MobileCard {
    constructor(options = {}) {
        this.options = {
            title: null,
            subtitle: null,
            padding: 'normal', // 'compact', 'normal', 'spacious'
            shadow: 'normal', // 'none', 'subtle', 'normal', 'elevated'
            border: true,
            rounded: 'normal', // 'none', 'small', 'normal', 'large'
            fullWidth: true,
            maxWidth: '480px',
            className: '',
            ...options
        };
        
        this.element = null;
        this.headerElement = null;
        this.contentElement = null;
        this.footerElement = null;
    }

    /**
     * 創建卡片元素
     */
    createElement() {
        const card = document.createElement('div');
        card.className = this.getCardClasses();
        
        // 設置樣式
        this.setCardStyles(card);
        
        // 創建卡片結構
        this.createCardStructure(card);
        
        this.element = card;
        return card;
    }

    /**
     * 獲取卡片CSS類名
     */
    getCardClasses() {
        const classes = ['mobile-card'];
        
        // 內邊距變體
        classes.push(`mobile-card--padding-${this.options.padding}`);
        
        // 陰影變體
        classes.push(`mobile-card--shadow-${this.options.shadow}`);
        
        // 圓角變體
        classes.push(`mobile-card--rounded-${this.options.rounded}`);
        
        // 邊框
        if (this.options.border) {
            classes.push('mobile-card--bordered');
        }
        
        // 全寬
        if (this.options.fullWidth) {
            classes.push('mobile-card--full-width');
        }
        
        // 自定義類名
        if (this.options.className) {
            classes.push(this.options.className);
        }
        
        return classes.join(' ');
    }

    /**
     * 設置卡片樣式
     */
    setCardStyles(card) {
        if (this.options.maxWidth) {
            card.style.maxWidth = this.options.maxWidth;
        }
    }

    /**
     * 創建卡片結構
     */
    createCardStructure(card) {
        // 創建標題區域
        if (this.options.title || this.options.subtitle) {
            this.headerElement = this.createHeader();
            card.appendChild(this.headerElement);
        }
        
        // 創建內容區域
        this.contentElement = this.createContent();
        card.appendChild(this.contentElement);
        
        // 創建底部區域（預留）
        this.footerElement = this.createFooter();
        card.appendChild(this.footerElement);
    }

    /**
     * 創建標題區域
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'mobile-card__header';
        
        if (this.options.title) {
            const title = document.createElement('h3');
            title.className = 'mobile-card__title';
            title.textContent = this.options.title;
            header.appendChild(title);
        }
        
        if (this.options.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'mobile-card__subtitle';
            subtitle.textContent = this.options.subtitle;
            header.appendChild(subtitle);
        }
        
        return header;
    }

    /**
     * 創建內容區域
     */
    createContent() {
        const content = document.createElement('div');
        content.className = 'mobile-card__content';
        return content;
    }

    /**
     * 創建底部區域
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'mobile-card__footer';
        footer.style.display = 'none'; // 預設隱藏
        return footer;
    }

    /**
     * 添加內容到卡片
     */
    setContent(content) {
        if (!this.contentElement) return this;
        
        // 清空現有內容
        this.contentElement.innerHTML = '';
        
        if (typeof content === 'string') {
            this.contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentElement.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    const div = document.createElement('div');
                    div.innerHTML = item;
                    this.contentElement.appendChild(div);
                } else if (item instanceof HTMLElement) {
                    this.contentElement.appendChild(item);
                }
            });
        }
        
        return this;
    }

    /**
     * 添加底部內容
     */
    setFooter(content) {
        if (!this.footerElement) return this;
        
        this.footerElement.style.display = 'block';
        this.footerElement.innerHTML = '';
        
        if (typeof content === 'string') {
            this.footerElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.footerElement.appendChild(content);
        }
        
        return this;
    }

    /**
     * 隱藏底部區域
     */
    hideFooter() {
        if (this.footerElement) {
            this.footerElement.style.display = 'none';
        }
        return this;
    }

    /**
     * 添加CSS類名
     */
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        }
        return this;
    }

    /**
     * 移除CSS類名
     */
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
        }
        return this;
    }

    /**
     * 設置載入狀態
     */
    setLoading(loading) {
        if (!this.element) return this;
        
        if (loading) {
            this.element.classList.add('mobile-card--loading');
            
            // 添加載入指示器
            const loader = document.createElement('div');
            loader.className = 'mobile-card__loader';
            loader.innerHTML = `
                <div class="mobile-card__spinner">
                    <svg viewBox="0 0 24 24" class="mobile-card__spinner-svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" 
                                fill="none" stroke-linecap="round" stroke-dasharray="31.416" 
                                stroke-dashoffset="31.416">
                            <animate attributeName="stroke-dasharray" dur="2s" 
                                     values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="2s" 
                                     values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </div>
            `;
            this.element.appendChild(loader);
        } else {
            this.element.classList.remove('mobile-card--loading');
            
            // 移除載入指示器
            const loader = this.element.querySelector('.mobile-card__loader');
            if (loader) {
                loader.remove();
            }
        }
        
        return this;
    }

    /**
     * 獲取卡片元素
     */
    getElement() {
        return this.element || this.createElement();
    }

    /**
     * 獲取內容區域元素
     */
    getContentElement() {
        return this.contentElement;
    }

    /**
     * 獲取底部區域元素
     */
    getFooterElement() {
        return this.footerElement;
    }
}

// 工廠函數
window.createMobileCard = function(options) {
    return new MobileCard(options);
};

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileCard;
}