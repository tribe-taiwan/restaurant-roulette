// 主題配置系統 - 支援多民宿品牌客製化
// 每個主題包含完整的品牌設定，可輕鬆切換

window.THEME_CONFIGS = {
  // 舞鶴民宿主題（當前預設）
  maizuru: {
    // 基本品牌資訊
    brand: {
      subtitle: "舞鶴台南民宿"
    },

    // 民宿位置資訊（作為導航起點）
    homeBase: {
      name: "舞鶴台南民宿",
      address: "台南市中西區海安路二段296巷20號", // 實際地址待確認
      phone: "+886-955-674-211",
      officialWebsite: "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751"
    },

    // 配色方案
    colors: {
      primary: "#dc143c",      // 日本紅
      secondary: "#000000",    // 黑色
      accent: "#ffd700",       // 金色
      background: "#1a1a1a",   // 深黑色
      surface: "#2d2d2d",      // 深灰色
      textPrimary: "#ffffff",  // 白色
      textSecondary: "#f5f5f5", // 淺白色
      success: "#dc143c",      // 日本紅
      warning: "#ffd700"       // 金色
    },

    // 圖片資源
    images: {
      banner: "./assets/themes/maizuru/banner.jpg",
      bnbLogo: "./assets/themes/maizuru/logo.jpg",
      favicon: "./assets/themes/maizuru/favicon.ico"
    },

    // 社交媒體連結
    socialMedia: {
      booking: {
        url: "https://www.booking.com/hotel/tw/tai-nan-wu-he-min-su.zh-tw.html",
        title: "在 Owlting 預訂舞鶴民宿",
        logo: "./assets/image/logo.png"
      },
      instagram: {
        url: "https://www.instagram.com/tainanbnb_maizuru/",
        title: "關注我們的 Instagram",
        logo: "./assets/image/Instagram-Logo.png"
      },
      facebook: {
        url: "https://www.facebook.com/p/%E5%8F%B0%E5%8D%97%E8%88%9E%E9%B6%B4%E6%B0%91%E5%AE%BF-61555629563065/?locale=zh_TW",
        title: "關注我們的 Facebook",
        logo: "./assets/image/Facebook-logo.png"
      }
    },

    // SEO 設定
    seo: {
      title: "甲崩喔 Restaurant Roulette - 台南美食輪盤 | 舞鶴台南民宿",
      description: "舞鶴台南民宿推薦！隨機發現台南附近的美食餐廳，使用有趣的老虎機介面探索在地美味，支援多語言和精準定位功能。",
      keywords: "台南美食, 台南餐廳, 美食輪盤, 甲崩喔, 舞鶴民宿, 台南民宿, restaurant roulette, tainan food",
      ogImage: "https://eat.tribe.org.tw/assets/image/banner.jpg",
      ogUrl: "https://eat.tribe.org.tw/"
    }
  },

  // 柒宿民宿主題
  qisu: {
    brand: {
      subtitle: "柒宿"
    },

    homeBase: {
      name: "柒宿",
      address: "700台南市中西區西門路二段300巷8號",
      phone: "+886-976-722-208",
      officialWebsite: "https://www.booking-owlnest.com/qisu"
    },

    colors: {
      primary: "#0077be",      // 海藍色
      secondary: "#00a8cc",    // 淺藍色
      accent: "#ffd700",       // 金色
      background: "#001f3f",   // 深海藍
      surface: "#003d6b",      // 中海藍
      textPrimary: "#ffffff",
      textSecondary: "#e5f4fd",
      success: "#20b2aa",      // 海綠色
      warning: "#ff6347"       // 珊瑚色
    },

    images: {
      banner: "./assets/themes/qisu/banner.jpg",
      bnbLogo: "./assets/themes/qisu/logo.jpg", // 民宿專屬 logo
      favicon: "./assets/themes/qisu/favicon.ico"
    },

    socialMedia: {
      booking: {
        url: "https://tw.trip.com/hotels/tainan-hotel-detail-124450348/mulu/",
        title: "在 trip.com 預訂柒宿",
        logo: "./assets/image/booking-logo.png"
      },
      instagram: {
        url: "https://www.instagram.com/qisu_bnb/",
        title: "關注柒宿 Instagram",
        logo: "./assets/image/Instagram-Logo.png"
      },
      facebook: {
        url: "https://www.facebook.com/qisu.bnb/",
        title: "關注柒宿 Facebook",
        logo: "./assets/image/Facebook-logo.png"
      }
    },

    seo: {
      title: "柒宿美食探索 - 台南美食 | 柒宿",
      description: "柒宿推薦！探索台南最棒的在地美食和特色小吃，在古都品味府城美味。",
      keywords: "台南美食, 台南餐廳, 府城小吃, 柒宿, 台南民宿, 美食",
      ogImage: "https://www.booking-owlnest.com/qisu/assets/image/banner.jpg",
      ogUrl: "https://www.booking-owlnest.com/qisu/"
    }
  },

  // 台南沐旅主題
  muluInn: {
    brand: {
      subtitle: "台南沐旅"
    },

    homeBase: {
      name: "台南沐旅",
      address: "台南市中西區美學街52號",
      phone: "+886-968-022-270",
      officialWebsite: "https://www.booking-owlnest.com/muluinn"
    },

    colors: {
      primary: "#2d8659",      // 森林綠
      secondary: "#4a7c59",    // 深綠色
      accent: "#f0d97d",       // 淺黃色（陽光）
      background: "#1a2f23",   // 深森林綠
      surface: "#2d3e2f",      // 中森林綠
      textPrimary: "#ffffff",
      textSecondary: "#e8f5e8",
      success: "#52c41a",      // 亮綠色
      warning: "#faad14"       // 橘黃色
    },

    images: {
      banner: "./assets/themes/muluInn/banner.jpg",
      bnbLogo: "./assets/themes/muluInn/logo.jpg",
      favicon: "./assets/themes/muluInn/favicon.ico"
    },

    socialMedia: {
      booking: {
        url: "https://tw.trip.com/hotels/tainan-hotel-detail-124450348/mulu/",
        title: "在 trip.com 預訂台南沐旅",
        logo: "./assets/image/booking-logo.png"
      },
      instagram: {
        url: "https://www.instagram.com/mulu.inn/",
        title: "關注台南沐旅 Instagram",
        logo: "./assets/image/Instagram-Logo.png"
      },
      facebook: {
        url: "https://www.facebook.com/p/%E5%8F%B0%E5%8D%97%E6%B2%90%E6%97%85%E6%B0%91%E5%AE%BFmu-inn-100086380783531/?locale=zh_TW",
        title: "關注台南沐旅 Facebook",
        logo: "./assets/image/Facebook-logo.png"
      }
    },

    seo: {
      title: "台南沐旅美食探索 - 台南美食輪盤 | 台南沐旅",
      description: "台南沐旅推薦！在綠意盎然的環境中探索台南在地美食和自然風味。",
      keywords: "台南美食, 輕旅行, 台南沐旅, 台南民宿, 美食輪盤, 自然風味",
      ogImage: "https://example.com/muluInn/banner.jpg",
      ogUrl: "https://example.com/muluInn/"
    }
  }
};

// 預設主題
window.DEFAULT_THEME = 'maizuru';

// 主題管理函數
window.ThemeManager = {
  currentTheme: null,
  
  // 初始化主題系統
  init: function(themeName = null) {
    // 從 URL 參數或預設值決定主題
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTheme = themeName || urlParams.get('theme') || window.DEFAULT_THEME;
    
    this.loadTheme(selectedTheme);
  },
  
  // 載入指定主題
  loadTheme: function(themeName) {
    const theme = window.THEME_CONFIGS[themeName];
    if (!theme) {
      console.warn(`主題 "${themeName}" 不存在，使用預設主題`);
      themeName = window.DEFAULT_THEME;
      theme = window.THEME_CONFIGS[themeName];
    }
    
    this.currentTheme = { ...theme, id: themeName };
    this.applyTheme(theme);
    console.log(`✅ 已載入主題: ${themeName}`, theme);
    
    // 觸發主題變更事件，讓 React 組件重新渲染
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { themeId: themeName, theme: this.currentTheme } 
    }));
  },
  
  // 應用主題設定
  applyTheme: function(theme) {
    // 應用配色
    this.applyColors(theme.colors);
    
    // 更新頁面標題和 meta 標籤
    this.updateSEO(theme.seo);
    
    // 更新背景圖片
    this.updateImages(theme.images);
  },
  
  // 應用配色方案
  applyColors: function(colors) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--success-color', colors.success);
    root.style.setProperty('--warning-color', colors.warning);
  },
  
  // 更新 SEO 設定
  updateSEO: function(seo) {
    document.title = seo.title;
    
    // 更新 meta 標籤
    this.updateMetaTag('description', seo.description);
    this.updateMetaTag('keywords', seo.keywords);
    this.updateMetaTag('og:title', seo.title);
    this.updateMetaTag('og:description', seo.description);
    this.updateMetaTag('og:image', seo.ogImage);
    this.updateMetaTag('og:url', seo.ogUrl);
  },
  
  // 更新圖片資源
  updateImages: function(images) {
    // 更新背景圖片會在組件中處理
    // 這裡可以更新 favicon
    if (images.favicon) {
      this.updateFavicon(images.favicon);
    }
  },
  
  // 輔助函數：更新 meta 標籤
  updateMetaTag: function(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    }
  },
  
  // 輔助函數：更新 favicon
  updateFavicon: function(faviconUrl) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  },
  
  // 獲取當前主題配置
  getCurrentTheme: function() {
    return this.currentTheme || window.THEME_CONFIGS[window.DEFAULT_THEME];
  },
  
  // 獲取當前主題 ID
  getCurrentThemeId: function() {
    return this.currentTheme?.id || window.DEFAULT_THEME;
  },
  
  // 獲取可用主題列表
  getAvailableThemes: function() {
    return Object.keys(window.THEME_CONFIGS);
  }
};
