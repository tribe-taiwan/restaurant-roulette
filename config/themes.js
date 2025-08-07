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
      address: "台南市中西區", // 實際地址待確認
      phone: "+886-6-xxx-xxxx",
      bookingUrl: "https://www.booking.com/hotel/tw/tai-nan-wu-he-min-su.zh-tw.html"
    },

    // 配色方案
    colors: {
      primary: "#ff6b35",      // 橘紅色
      secondary: "#f7931e",    // 橘色
      accent: "#ffd23f",       // 黃色
      background: "#1a1a2e",   // 深藍色
      surface: "#16213e",      // 藍灰色
      textPrimary: "#ffffff",  // 白色
      textSecondary: "#e5e5e5", // 淺灰色
      success: "#4caf50",      // 綠色
      warning: "#ff9800"       // 橘色警告
    },

    // 圖片資源
    images: {
      banner: "./assets/image/banner.jpg",
      bnbLogo: "./assets/image/maizuru-logo.jpg", // 民宿專屬 logo (需要準備)
      favicon: "./assets/image/favicon.ico"
    },

    // 社交媒體連結
    socialMedia: {
      booking: {
        url: "https://www.booking.com/hotel/tw/tai-nan-wu-he-min-su.zh-tw.html",
        title: "在 Booking.com 預訂",
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
      bookingUrl: "https://www.booking-owlnest.com/qisu"
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
        url: "https://www.booking-owlnest.com/qisu",
        title: "在 Booking.com 預訂柒宿",
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

  // 舞鶴民宿主題 (另一個版本)
  maizuru: {
    brand: {
      subtitle: "舞鶴台南民宿"
    },

    homeBase: {
      name: "舞鶴台南民宿",
      address: "臺南市中西區海安路二段296巷20號",
      phone: "+886-955-674-211",
      bookingUrl: "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751"
    },

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

    images: {
      banner: "./assets/themes/maizuru/banner.jpg",
      bnbLogo: "./assets/themes/maizuru/logo.jpg", // 民宿專屬 logo
      favicon: "./assets/themes/maizuru/favicon.ico"
    },

    socialMedia: {
      booking: {
        url: "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751",
        title: "在 Owlting 預訂舞鶴民宿",
        logo: "./assets/image/booking-logo.png"
      },
      instagram: {
        url: "https://www.instagram.com/maizuru_bnb/",
        title: "關注舞鶴民宿 Instagram",
        logo: "./assets/image/Instagram-Logo.png"
      },
      facebook: {
        url: "https://www.facebook.com/maizuru.bnb/",
        title: "關注舞鶴民宿 Facebook",
        logo: "./assets/image/Facebook-logo.png"
      }
    },

    seo: {
      title: "舞鶴美食探索 - 台南美食輪盤 | 舞鶴民宿",
      description: "舞鶴民宿推薦！探索台南地區的傳統美食和在地小吃，在古都品味府城文化。",
      keywords: "台南美食, 府城小吃, 傳統美食, 舞鶴民宿, 台南民宿, 美食輪盤",
      ogImage: "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751/banner.jpg",
      ogUrl: "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751"
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
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    console.log(`✅ 已載入主題: ${themeName}`, theme);
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
    return this.currentTheme;
  },
  
  // 獲取可用主題列表
  getAvailableThemes: function() {
    return Object.keys(window.THEME_CONFIGS);
  }
};
