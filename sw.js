// Service Worker for Restaurant Roulette PWA
// Version 1.0.1 - Force Update Enabled

const CACHE_VERSION = Date.now(); // 使用時間戳確保每次都是新版本
const CACHE_NAME = `restaurant-roulette-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `restaurant-roulette-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `restaurant-roulette-dynamic-v${CACHE_VERSION}`;

// 靜態資源 - 核心應用檔案
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  
  // 組件檔案
  '/components/LanguageSelector.js',
  '/components/SlotMachineAnimationConfig.js',
  '/components/SlotMachineUtils.js',
  // '/components/SlotMachineSlotAnimation.js', // Removed - complex animation logic eliminated
  '/components/SlotMachineTouchHandler.js',
  '/components/SlotMachineButtonLogic.js',
  '/components/SlotMachineKeyboardHandler.js',
  // '/components/SlotMachineAnimationController.js', // Removed - complex animation logic eliminated
  '/components/SlotMachine.js',
  '/components/RestaurantCard.js',
  '/components/LocationManager.js',
  '/components/SearchSettings.js',
  '/components/StatusMessages.js',
  
  // 工具函式
  '/utils/locationUtils.js',
  '/utils/commonUtils.js',
  '/utils/mealTimeConfig.js',
  
  // 本地API
  '/_local/local-api.js',
  
  // CSS 檔案
  '/components/shared/garmin-design-system.css',
  '/components/shared/shared-components.css',
  '/components/shared/BannerUnified.css',
  '/components/shared/full-page-background.css',
  '/components/shared/responsive-performance.css',
  '/components/shared/unified-layout.css',
  '/components/LocationManager/LocationManager.css',
  '/components/SearchSettings/SearchSettings.css',
  
  // 重要圖片資源
  '/assets/image/logo.png',
  '/assets/image/banner.jpg',
  '/assets/image/apple-touch-icon.png',
  
  // Slot machine 圖片 (只快取前10張，減少初始載入時間)
  '/assets/image/slot-machine/slot (1).jpg',
  '/assets/image/slot-machine/slot (2).jpg',
  '/assets/image/slot-machine/slot (3).jpg',
  '/assets/image/slot-machine/slot (4).jpg',
  '/assets/image/slot-machine/slot (5).jpg',
  '/assets/image/slot-machine/slot (6).jpg',
  '/assets/image/slot-machine/slot (7).jpg',
  '/assets/image/slot-machine/slot (8).jpg',
  '/assets/image/slot-machine/slot (9).jpg',
  '/assets/image/slot-machine/slot (10).jpg'
];

// 動態快取策略的URL模式
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/maps\.googleapis\.com\/maps\/api\/place/,
  /^https:\/\/maps\.googleapis\.com\/maps\/api\/geocode/,
  /^https:\/\/.*\.googleusercontent\.com\//,
  /^https:\/\/images\.unsplash\.com\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/
];

// 不快取的URL模式
const NO_CACHE_PATTERNS = [
  /^https:\/\/www\.google-analytics\.com\//,
  /^https:\/\/analytics\.google\.com\//,
  /^https:\/\/googletagmanager\.com\//
];

// Service Worker 安裝事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker with force update');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // 強制跳過等待，立即啟用新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
        // 即使快取失敗也要跳過等待，確保使用最新版本
        return self.skipWaiting();
      })
  );
});

// Service Worker 啟用事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker with force refresh');
  
  event.waitUntil(
    Promise.all([
      // 刪除所有舊快取
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 刪除所有舊版本的快取，包括當前版本以外的所有快取
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('restaurant-roulette-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有頁面
      self.clients.claim(),
      // 通知所有客戶端重新載入
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'FORCE_RELOAD',
            message: 'New version available, reloading...'
          });
        });
      })
    ]).then(() => {
      console.log('[SW] Service Worker activated and clients notified');
    })
  );
});

// 網路請求攔截
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 忽略非 GET 請求
  if (request.method !== 'GET') {
    return;
  }
  
  // 忽略不需要快取的URL
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    return;
  }
  
  // 處理核心應用檔案 - Network First 策略 (確保總是最新)
  if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // 網路失敗時才從快取返回
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // 離線時的 fallback
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
        })
    );
    return;
  }
  
  // 處理動態內容 - Network First 策略
  if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
                // 限制動態快取大小
                limitCacheSize(DYNAMIC_CACHE_NAME, 100);
              });
          }
          return response;
        })
        .catch(() => {
          // 網路失敗時從快取返回
          return caches.match(request);
        })
    );
    return;
  }
  
  // 其他請求 - Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request).then(response => {
          if (response) {
            return response;
          }
          // 如果快取中也沒有，返回一個基本的錯誤響應
          return new Response('File not found', { 
            status: 404, 
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// 限制快取大小的輔助函數
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // 刪除最舊的項目
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(
      keysToDelete.map(key => cache.delete(key))
    );
  }
}

// 處理推送通知（為未來功能預留）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      tag: 'restaurant-roulette',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: '打開應用',
          icon: '/assets/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: '關閉',
          icon: '/assets/icons/icon-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 處理通知點擊事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 背景同步事件（為未來功能預留）
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 在這裡處理背景同步邏輯
      console.log('[SW] Background sync triggered')
    );
  }
});

// 定期清理快取和更新檢查
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      limitCacheSize(DYNAMIC_CACHE_NAME, 50)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        })
    );
  }
  
  // 處理更新檢查請求
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    event.waitUntil(
      self.registration.update()
        .then(() => {
          console.log('[SW] Update check completed');
        })
        .catch((error) => {
          console.error('[SW] Update check failed:', error);
        })
    );
  }
});
