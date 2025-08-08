// 品牌主題配置系統 - 支援多品牌客製化與完整多語言
// 每個品牌包含完整的設定、多語言翻譯，可輕鬆切換適用於各種業務場景

window.BRAND_THEME_CONFIGS = {
  // 舞鶴品牌主題（當前預設）
  maizuru: {
    // 品牌資訊 - 支援多語言
    brand: {
      subtitle: {
        zh: "舞鶴台南民宿",
        en: "Maizuru Tainan B&B", 
        ja: "まいづる台南民宿",
        ko: "우허 타이난 민박",
        vi: "Nhà nghỉ Vũ Hạc Đài Nam",
        ms: "Rumah Tumpangan Wuhe Tainan"
      },
      displayName: {
        zh: "舞鶴民宿",
        en: "Maizuru B&B",
        ja: "舞鶴ゲストハウス", 
        ko: "무학 게스트하우스",
        vi: "Nhà nghỉ Vũ Hạc",
        ms: "Rumah Tumpangan Maizuru"
      }
    },

    // 品牌基地資訊（作為導航起點）
    homeBase: {
      name: "舞鶴台南民宿",
      address: "台南市中西區海安路二段296巷20號",
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
      bookingLogo: "./assets/image/booking-logo.png",
      favicon: "./assets/themes/maizuru/favicon.ico"
    },

    // 社交媒體連結
    socialMedia: {
      booking: {
        url: "https://www.booking.com/hotel/tw/tai-nan-wu-he-min-su.zh-tw.html",
        title: {
          zh: "在 Booking.com 預訂舞鶴民宿",
          en: "Book Maizuru B&B on Booking.com",
          ja: "Booking.comで舞鶴民宿を予約",
          ko: "Booking.com에서 무학 민박 예약",
          vi: "Đặt phòng Vũ Hạc trên Booking.com", 
          ms: "Tempah Maizuru di Booking.com"
        }
      },
      instagram: {
        url: "https://www.instagram.com/tainanbnb_maizuru/",
        title: {
          zh: "關注我們的 Instagram",
          en: "Follow us on Instagram",
          ja: "インスタグラムをフォロー",
          ko: "인스타그램 팔로우",
          vi: "Theo dõi Instagram của chúng tôi",
          ms: "Ikuti Instagram kami"
        }
      },
      facebook: {
        url: "https://www.facebook.com/p/%E5%8F%B0%E5%8D%97%E8%88%9E%E9%B6%B4%E6%B0%91%E5%AE%BF-61555629563065/?locale=zh_TW",
        title: {
          zh: "關注我們的 Facebook",
          en: "Follow us on Facebook",
          ja: "フェイスブックをフォロー",
          ko: "페이스북 팔로우",
          vi: "Theo dõi Facebook của chúng tôi",
          ms: "Ikuti Facebook kami"
        }
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

  // 柒宿品牌主題
  qisu: {
    brand: {
      subtitle: {
        zh: "柒宿",
        en: "Qisu Guesthouse", 
        ja: "七宿ゲストハウス",
        ko: "칠숙 게스트하우스",
        vi: "Nhà nghỉ Thất Túc", 
        ms: "Rumah Tumpangan Qisu"
      },
      displayName: {
        zh: "柒宿",
        en: "Qisu",
        ja: "七宿",
        ko: "칠숙",
        vi: "Thất Túc",
        ms: "Qisu"
      }
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
      bnbLogo: "./assets/themes/qisu/logo.jpg",
      bookingLogo: "./assets/image/booking-logo.png",
      favicon: "./assets/themes/qisu/favicon.ico"
    },

    socialMedia: {
      booking: {
        url: "https://tw.trip.com/hotels/tainan-hotel-detail-124450348/mulu/",
        title: {
          zh: "在 trip.com 預訂柒宿",
          en: "Book Qisu on trip.com",
          ja: "trip.comで七宿を予約",
          ko: "trip.com에서 칠숙 예약",
          vi: "Đặt Thất Túc trên trip.com",
          ms: "Tempah Qisu di trip.com"
        }
      },
      instagram: {
        url: "https://www.instagram.com/qisu_bnb/",
        title: {
          zh: "關注柒宿 Instagram",
          en: "Follow Qisu on Instagram", 
          ja: "七宿のインスタグラムをフォロー",
          ko: "칠숙 인스타그램 팔로우",
          vi: "Theo dõi Thất Túc trên Instagram",
          ms: "Ikuti Qisu di Instagram"
        }
      },
      facebook: {
        url: "https://www.facebook.com/qisu.bnb/",
        title: {
          zh: "關注柒宿 Facebook",
          en: "Follow Qisu on Facebook",
          ja: "七宿のフェイスブックをフォロー", 
          ko: "칠숙 페이스북 팔로우",
          vi: "Theo dõi Thất Túc trên Facebook",
          ms: "Ikuti Qisu di Facebook"
        }
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

  // 台南沐旅品牌主題
  muluInn: {
    brand: {
      subtitle: {
        zh: "台南沐旅",
        en: "Mulu Inn Tainan",
        ja: "台南沐旅",
        ko: "타이난 목려", 
        vi: "Mulu Inn Đài Nam",
        ms: "Mulu Inn Tainan"
      },
      displayName: {
        zh: "台南沐旅",
        en: "Mulu Inn",
        ja: "沐旅",
        ko: "목려",
        vi: "Mulu Inn", 
        ms: "Mulu Inn"
      }
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
      bookingLogo: "./assets/image/booking-logo.png", 
      favicon: "./assets/themes/muluInn/favicon.ico"
    },

    socialMedia: {
      booking: {
        url: "https://tw.trip.com/hotels/tainan-hotel-detail-124450348/mulu/",
        title: {
          zh: "在 trip.com 預訂台南沐旅",
          en: "Book Mulu Inn on trip.com",
          ja: "trip.comで台南沐旅を予約",
          ko: "trip.com에서 타이난 목려 예약",
          vi: "Đặt Mulu Inn trên trip.com",
          ms: "Tempah Mulu Inn di trip.com"
        }
      },
      instagram: {
        url: "https://www.instagram.com/mulu.inn/",
        title: {
          zh: "關注台南沐旅 Instagram",
          en: "Follow Mulu Inn on Instagram",
          ja: "台南沐旅のインスタグラムをフォロー",
          ko: "타이난 목려 인스타그램 팔로우", 
          vi: "Theo dõi Mulu Inn trên Instagram",
          ms: "Ikuti Mulu Inn di Instagram"
        }
      },
      facebook: {
        url: "https://www.facebook.com/p/%E5%8F%B0%E5%8D%97%E6%B2%90%E6%97%85%E6%B0%91%E5%AE%BFmu-inn-100086380783531/?locale=zh_TW",
        title: {
          zh: "關注台南沐旅 Facebook",
          en: "Follow Mulu Inn on Facebook",
          ja: "台南沐旅のフェイスブックをフォロー",
          ko: "타이난 목려 페이스북 팔로우",
          vi: "Theo dõi Mulu Inn trên Facebook", 
          ms: "Ikuti Mulu Inn di Facebook"
        }
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

// 預設品牌主題
window.DEFAULT_BRAND_THEME = 'maizuru';

// 品牌主題管理系統
window.BrandThemeManager = {
  currentTheme: null,
  
  // 初始化主題系統
  init: function(themeName = null) {
    // 從 URL 參數或預設值決定主題
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTheme = themeName || urlParams.get('theme') || window.DEFAULT_BRAND_THEME;
    
    this.loadTheme(selectedTheme);
  },
  
  // 載入指定主題
  loadTheme: function(themeName) {
    const theme = window.BRAND_THEME_CONFIGS[themeName];
    if (!theme) {
      console.warn(`品牌主題 "${themeName}" 不存在，使用預設主題`);
      themeName = window.DEFAULT_BRAND_THEME;
      theme = window.BRAND_THEME_CONFIGS[themeName];
    }
    
    this.currentTheme = { ...theme, id: themeName };
    this.applyTheme(theme);
    console.log(`✅ 已載入品牌主題: ${themeName}`, theme);
    
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
    return this.currentTheme || window.BRAND_THEME_CONFIGS[window.DEFAULT_BRAND_THEME];
  },
  
  // 獲取當前主題 ID
  getCurrentThemeId: function() {
    return this.currentTheme?.id || window.DEFAULT_BRAND_THEME;
  },
  
  // 獲取可用主題列表
  getAvailableThemes: function() {
    return Object.keys(window.BRAND_THEME_CONFIGS);
  },

  // 獲取多語言品牌名稱
  getBrandSubtitle: function(language = 'zh') {
    const currentTheme = this.getCurrentTheme();
    return currentTheme?.brand?.subtitle?.[language] || currentTheme?.brand?.subtitle?.zh || '';
  },

  // 獲取多語言顯示名稱  
  getDisplayName: function(language = 'zh') {
    const currentTheme = this.getCurrentTheme();
    return currentTheme?.brand?.displayName?.[language] || currentTheme?.brand?.displayName?.zh || '';
  },

  // 獲取多語言社交媒體標題
  getSocialMediaTitle: function(platform, language = 'zh') {
    const currentTheme = this.getCurrentTheme();
    const socialMedia = currentTheme?.socialMedia?.[platform];
    return socialMedia?.title?.[language] || socialMedia?.title?.zh || `關注我們的 ${platform}`;
  }
};

// 向後兼容：保持舊的 API 名稱以支援現有代碼
window.THEME_CONFIGS = window.BRAND_THEME_CONFIGS;
window.DEFAULT_THEME = window.DEFAULT_BRAND_THEME;
window.ThemeManager = window.BrandThemeManager;
window.GUEST_HOUSE_CONFIGS = window.BRAND_THEME_CONFIGS;
window.DEFAULT_GUEST_HOUSE = window.DEFAULT_BRAND_THEME;
window.GuestHouseManager = window.BrandThemeManager;