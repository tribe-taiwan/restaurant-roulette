// logManager.js - 統一LOG管理系統
// 提供關鍵字搜索、級別控制、統計功能

class LogManager {
  constructor() {
    // LOG級別定義
    this.levels = {
      DEBUG: 0,
      INFO: 1, 
      WARN: 2,
      ERROR: 3,
      STATS: 4
    };
    
    // 當前LOG級別 (開發中設為DEBUG，生產環境可設為INFO)
    this.currentLevel = this.levels.DEBUG;
    
    // 統計計數器
    this.stats = {
      // 搜索相關統計
      searchAttempts: 0,
      searchSuccess: 0,
      searchErrors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      
      // API相關統計
      apiCalls: 0,
      apiErrors: 0,
      apiRetries: 0,
      
      // 位置相關統計
      locationUpdates: 0,
      locationErrors: 0,
      
      // UI相關統計
      userClicks: 0,
      uiErrors: 0
    };
    
    // LOG緩存 (用於統計和批量輸出)
    this.logBuffer = [];
    this.bufferSize = 100;
    
    // 關鍵字映射 (用於快速搜索代碼位置)
    this.keywordMap = {
      // 搜索相關 - RR_SEARCH_
      'RR_SEARCH_START': '餐廳搜索開始',
      'RR_SEARCH_CACHE': '快取檢查',
      'RR_SEARCH_API': 'API調用搜索',
      'RR_SEARCH_FILTER': '餐廳篩選',
      'RR_SEARCH_RESULT': '搜索結果',
      'RR_SEARCH_ERROR': '搜索錯誤',
      
      // 位置相關 - RR_LOCATION_
      'RR_LOCATION_GET': '獲取位置',
      'RR_LOCATION_UPDATE': '位置更新',
      'RR_LOCATION_ERROR': '位置錯誤',
      
      // 快取相關 - RR_CACHE_
      'RR_CACHE_HIT': '快取命中',
      'RR_CACHE_MISS': '快取未命中',
      'RR_CACHE_UPDATE': '快取更新',
      'RR_CACHE_CLEAR': '快取清除',
      
      // API相關 - RR_API_
      'RR_API_CALL': 'API調用',
      'RR_API_SUCCESS': 'API成功',
      'RR_API_ERROR': 'API錯誤',
      'RR_API_RETRY': 'API重試',
      
      // UI相關 - RR_UI_
      'RR_UI_CLICK': '用戶點擊',
      'RR_UI_UPDATE': '界面更新',
      'RR_UI_ERROR': '界面錯誤',
      
      // 性能相關 - RR_PERF_
      'RR_PERF_START': '性能監控開始',
      'RR_PERF_END': '性能監控結束',
      'RR_PERF_MEMORY': '記憶體使用',
      
      // 測試相關 - RR_TEST_
      'RR_TEST_START': '測試開始',
      'RR_TEST_END': '測試結束',
      'RR_TEST_ERROR': '測試錯誤'
    };
  }
  
  // 設置LOG級別
  setLevel(level) {
    if (typeof level === 'string') {
      level = this.levels[level.toUpperCase()];
    }
    this.currentLevel = level;
  }
  
  // 檢查是否應該輸出LOG
  shouldLog(level) {
    return level >= this.currentLevel;
  }
  
  // 格式化LOG訊息
  formatMessage(keyword, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const description = this.keywordMap[keyword] || '未知操作';
    
    let formattedMessage = `[${timestamp}] ${keyword} ${description}: ${message}`;
    
    if (data) {
      formattedMessage += ` | 數據: ${JSON.stringify(data)}`;
    }
    
    return formattedMessage;
  }
  
  // 添加到LOG緩存
  addToBuffer(level, keyword, message, data) {
    const logEntry = {
      timestamp: Date.now(),
      level,
      keyword,
      message,
      data
    };
    
    this.logBuffer.push(logEntry);
    
    // 保持緩存大小
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer.shift();
    }
  }
  
  // DEBUG級別LOG
  debug(keyword, message, data = null) {
    if (!this.shouldLog(this.levels.DEBUG)) return;
    
    const formattedMessage = this.formatMessage(keyword, message, data);
    console.log('🔍', formattedMessage);
    this.addToBuffer(this.levels.DEBUG, keyword, message, data);
  }
  
  // INFO級別LOG
  info(keyword, message, data = null) {
    if (!this.shouldLog(this.levels.INFO)) return;
    
    const formattedMessage = this.formatMessage(keyword, message, data);
    console.log('ℹ️', formattedMessage);
    this.addToBuffer(this.levels.INFO, keyword, message, data);
  }
  
  // WARN級別LOG
  warn(keyword, message, data = null) {
    if (!this.shouldLog(this.levels.WARN)) return;
    
    const formattedMessage = this.formatMessage(keyword, message, data);
    console.warn('⚠️', formattedMessage);
    this.addToBuffer(this.levels.WARN, keyword, message, data);
  }
  
  // ERROR級別LOG
  error(keyword, message, data = null) {
    if (!this.shouldLog(this.levels.ERROR)) return;
    
    const formattedMessage = this.formatMessage(keyword, message, data);
    console.error('❌', formattedMessage);
    this.addToBuffer(this.levels.ERROR, keyword, message, data);
    
    // 錯誤統計
    if (keyword.includes('SEARCH')) this.stats.searchErrors++;
    else if (keyword.includes('API')) this.stats.apiErrors++;
    else if (keyword.includes('LOCATION')) this.stats.locationErrors++;
    else if (keyword.includes('UI')) this.stats.uiErrors++;
  }
  
  // 統計級別LOG (總是顯示)
  stats(keyword, message, data = null) {
    const formattedMessage = this.formatMessage(keyword, message, data);
    console.log('📊', formattedMessage);
    this.addToBuffer(this.levels.STATS, keyword, message, data);
  }
  
  // 更新統計計數
  updateStats(category, operation) {
    switch (category) {
      case 'search':
        if (operation === 'attempt') this.stats.searchAttempts++;
        else if (operation === 'success') this.stats.searchSuccess++;
        break;
      case 'cache':
        if (operation === 'hit') this.stats.cacheHits++;
        else if (operation === 'miss') this.stats.cacheMisses++;
        break;
      case 'api':
        if (operation === 'call') this.stats.apiCalls++;
        else if (operation === 'retry') this.stats.apiRetries++;
        break;
      case 'location':
        if (operation === 'update') this.stats.locationUpdates++;
        break;
      case 'ui':
        if (operation === 'click') this.stats.userClicks++;
        break;
    }
  }
  
  // 輸出統計摘要
  printStats() {
    const summary = {
      搜索統計: {
        嘗試次數: this.stats.searchAttempts,
        成功次數: this.stats.searchSuccess,
        錯誤次數: this.stats.searchErrors,
        成功率: this.stats.searchAttempts > 0 ? 
          `${((this.stats.searchSuccess / this.stats.searchAttempts) * 100).toFixed(1)}%` : '0%'
      },
      快取統計: {
        命中次數: this.stats.cacheHits,
        未命中次數: this.stats.cacheMisses,
        命中率: (this.stats.cacheHits + this.stats.cacheMisses) > 0 ? 
          `${((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(1)}%` : '0%'
      },
      API統計: {
        調用次數: this.stats.apiCalls,
        錯誤次數: this.stats.apiErrors,
        重試次數: this.stats.apiRetries
      },
      用戶互動: {
        點擊次數: this.stats.userClicks,
        位置更新: this.stats.locationUpdates,
        界面錯誤: this.stats.uiErrors
      }
    };
    
    console.group('📊 RR_STATS_SUMMARY 系統統計摘要');
    console.table(summary);
    console.groupEnd();
  }
  
  // 清除統計
  clearStats() {
    Object.keys(this.stats).forEach(key => {
      this.stats[key] = 0;
    });
    this.info('RR_STATS_CLEAR', '統計數據已清除');
  }
  
  // 搜索LOG (根據關鍵字)
  searchLogs(keyword) {
    const results = this.logBuffer.filter(log => 
      log.keyword.includes(keyword) || log.message.includes(keyword)
    );
    
    console.group(`🔍 LOG搜索結果: "${keyword}"`);
    results.forEach(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${log.keyword}: ${log.message}`);
    });
    console.groupEnd();
    
    return results;
  }
  
  // 導出LOG數據
  exportLogs() {
    return {
      stats: this.stats,
      logs: this.logBuffer,
      timestamp: Date.now()
    };
  }
}

// 創建全局LOG管理器實例
window.logManager = new LogManager();

// 提供簡化的全局函數
window.RRLog = {
  debug: (keyword, message, data) => window.logManager.debug(keyword, message, data),
  info: (keyword, message, data) => window.logManager.info(keyword, message, data),
  warn: (keyword, message, data) => window.logManager.warn(keyword, message, data),
  error: (keyword, message, data) => window.logManager.error(keyword, message, data),
  stats: (keyword, message, data) => window.logManager.stats(keyword, message, data),
  updateStats: (category, operation) => window.logManager.updateStats(category, operation),
  printStats: () => window.logManager.printStats(),
  clearStats: () => window.logManager.clearStats(),
  searchLogs: (keyword) => window.logManager.searchLogs(keyword),
  setLevel: (level) => window.logManager.setLevel(level)
};

console.log('✅ RR_SYSTEM_INIT LOG管理系統已初始化');
