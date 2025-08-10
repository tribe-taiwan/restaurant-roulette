/**
 * 安全的組件間通信系統
 * 提供事件驅動的組件通信機制，避免全局變數衝突
 */

class ComponentCommunicationSystem {
  constructor() {
    this.eventBus = new EventTarget();
    this.subscribers = new Map();
    this.messageQueue = [];
    this.isInitialized = false;
    this.debugMode = false;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // 設置調試模式
    this.debugMode = localStorage.getItem('componentCommunicationDebug') === 'true';
    
    // 設置錯誤處理
    this.eventBus.addEventListener('error', this.handleError.bind(this));
    
    this.isInitialized = true;
    this.log('ComponentCommunicationSystem 已初始化');
  }

  log(message, data = null) {
    if (this.debugMode) {
      console.log(`[ComponentComm] ${message}`, data || '');
    }
  }

  handleError(event) {
    console.error('ComponentCommunicationSystem 錯誤:', event.error);
  }

  // 訂閱事件
  subscribe(eventType, callback, options = {}) {
    if (!eventType || typeof callback !== 'function') {
      throw new Error('訂閱事件需要有效的事件類型和回調函數');
    }

    const subscriberId = `${eventType}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    
    // 包裝回調函數以提供錯誤處理
    const wrappedCallback = (event) => {
      try {
        callback(event.detail, event);
      } catch (error) {
        console.error(`事件處理器錯誤 (${eventType}):`, error);
        
        // 觸發錯誤事件
        this.emit('component-communication-error', {
          eventType,
          subscriberId,
          error: error.message,
          timestamp: Date.now()
        });
      }
    };

    // 添加事件監聽器
    this.eventBus.addEventListener(eventType, wrappedCallback, options);
    
    // 記錄訂閱者
    this.subscribers.set(subscriberId, {
      eventType,
      callback: wrappedCallback,
      originalCallback: callback,
      options,
      subscribedAt: Date.now()
    });

    this.log(`訂閱事件: ${eventType}`, { subscriberId });

    // 返回取消訂閱函數
    return () => this.unsubscribe(subscriberId);
  }

  // 取消訂閱
  unsubscribe(subscriberId) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      this.log(`找不到訂閱者: ${subscriberId}`);
      return false;
    }

    try {
      this.eventBus.removeEventListener(
        subscriber.eventType,
        subscriber.callback,
        subscriber.options
      );
      
      this.subscribers.delete(subscriberId);
      this.log(`取消訂閱: ${subscriber.eventType}`, { subscriberId });
      
      return true;
    } catch (error) {
      console.error('取消訂閱失敗:', error);
      return false;
    }
  }

  // 發送事件
  emit(eventType, data = null, options = {}) {
    if (!eventType) {
      throw new Error('發送事件需要有效的事件類型');
    }

    try {
      const event = new CustomEvent(eventType, {
        detail: data,
        bubbles: options.bubbles || false,
        cancelable: options.cancelable || false
      });

      // 添加元數據
      event.detail = {
        ...data,
        _meta: {
          eventType,
          timestamp: Date.now(),
          source: options.source || 'unknown'
        }
      };

      this.eventBus.dispatchEvent(event);
      this.log(`發送事件: ${eventType}`, data);

      return true;
    } catch (error) {
      console.error('發送事件失敗:', error);
      return false;
    }
  }

  // 一次性事件監聽
  once(eventType, callback) {
    return this.subscribe(eventType, callback, { once: true });
  }

  // 等待事件（Promise 版本）
  waitFor(eventType, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`等待事件 ${eventType} 超時`));
      }, timeout);

      const unsubscribe = this.once(eventType, (data) => {
        clearTimeout(timeoutId);
        resolve(data);
      });

      // 如果超時，確保取消訂閱
      setTimeout(() => {
        if (timeoutId) {
          unsubscribe();
        }
      }, timeout);
    });
  }

  // 批量發送事件
  emitBatch(events) {
    if (!Array.isArray(events)) {
      throw new Error('批量發送事件需要事件陣列');
    }

    const results = [];
    
    events.forEach(({ eventType, data, options }) => {
      try {
        const result = this.emit(eventType, data, options);
        results.push({ eventType, success: result });
      } catch (error) {
        results.push({ eventType, success: false, error: error.message });
      }
    });

    return results;
  }

  // 獲取訂閱者統計
  getSubscriberStats() {
    const stats = {};
    
    this.subscribers.forEach((subscriber, id) => {
      const eventType = subscriber.eventType;
      if (!stats[eventType]) {
        stats[eventType] = {
          count: 0,
          subscribers: []
        };
      }
      
      stats[eventType].count++;
      stats[eventType].subscribers.push({
        id,
        subscribedAt: subscriber.subscribedAt
      });
    });

    return stats;
  }

  // 清除所有訂閱者
  clearAllSubscribers() {
    const subscriberIds = Array.from(this.subscribers.keys());
    let clearedCount = 0;

    subscriberIds.forEach(id => {
      if (this.unsubscribe(id)) {
        clearedCount++;
      }
    });

    this.log(`清除了 ${clearedCount} 個訂閱者`);
    return clearedCount;
  }

  // 啟用/停用調試模式
  setDebugMode(enabled) {
    this.debugMode = enabled;
    localStorage.setItem('componentCommunicationDebug', enabled.toString());
    this.log(`調試模式 ${enabled ? '啟用' : '停用'}`);
  }
}

// 創建全局實例
const componentComm = new ComponentCommunicationSystem();

// 預定義的事件類型常數
const EVENT_TYPES = {
  // 位置管理事件
  LOCATION_UPDATED: 'location-updated',
  LOCATION_ERROR: 'location-error',
  LOCATION_LOADING: 'location-loading',
  SAVED_LOCATION_CHANGED: 'saved-location-changed',
  
  // 搜索設定事件
  MEAL_TIME_CHANGED: 'meal-time-changed',
  DISTANCE_CHANGED: 'distance-changed',
  SETTINGS_RESET: 'settings-reset',
  SETTINGS_IMPORTED: 'settings-imported',
  
  // UI 事件
  COMPONENT_MOUNTED: 'component-mounted',
  COMPONENT_UNMOUNTED: 'component-unmounted',
  COMPONENT_ERROR: 'component-error',
  
  // 觸控事件
  TOUCH_FEEDBACK: 'touch-feedback',
  HAPTIC_FEEDBACK: 'haptic-feedback',
  
  // 系統事件
  THEME_CHANGED: 'theme-changed',
  LANGUAGE_CHANGED: 'language-changed',
  NETWORK_STATUS_CHANGED: 'network-status-changed'
};

// 便捷的 Hook 包裝器
function useComponentCommunication() {
  const [isConnected, setIsConnected] = React.useState(true);
  const subscribersRef = React.useRef(new Set());

  // 訂閱事件
  const subscribe = React.useCallback((eventType, callback, options = {}) => {
    const unsubscribe = componentComm.subscribe(eventType, callback, options);
    subscribersRef.current.add(unsubscribe);
    return unsubscribe;
  }, []);

  // 發送事件
  const emit = React.useCallback((eventType, data, options = {}) => {
    return componentComm.emit(eventType, data, {
      ...options,
      source: 'react-hook'
    });
  }, []);

  // 一次性事件
  const once = React.useCallback((eventType, callback) => {
    const unsubscribe = componentComm.once(eventType, callback);
    subscribersRef.current.add(unsubscribe);
    return unsubscribe;
  }, []);

  // 等待事件
  const waitFor = React.useCallback((eventType, timeout) => {
    return componentComm.waitFor(eventType, timeout);
  }, []);

  // 清理訂閱者
  React.useEffect(() => {
    return () => {
      subscribersRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('清理訂閱者失敗:', error);
        }
      });
      subscribersRef.current.clear();
    };
  }, []);

  return {
    subscribe,
    emit,
    once,
    waitFor,
    isConnected,
    EVENT_TYPES
  };
}

// 導出
if (typeof window !== 'undefined') {
  window.ComponentCommunicationSystem = ComponentCommunicationSystem;
  window.componentComm = componentComm;
  window.useComponentCommunication = useComponentCommunication;
  window.EVENT_TYPES = EVENT_TYPES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ComponentCommunicationSystem,
    componentComm,
    useComponentCommunication,
    EVENT_TYPES
  };
}