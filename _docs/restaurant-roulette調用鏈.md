# Restaurant Roulette 調用鏈流程圖

## 主要執行流程

```mermaid
flowchart TD
    A[用戶開啟應用程式] --> B[載入 App 組件]
    B --> C[初始化狀態]
    C --> D[檢查瀏覽器地理位置支援]
    
    D --> E{地理位置支援?}
    E -->|是| F[獲取用戶位置]
    E -->|否| G[顯示手動輸入地址]
    
    F --> H[設定用戶座標]
    G --> I[地址轉換為座標]
    I --> H
    
    H --> J[載入 Google Maps API]
    J --> K[反向地理編碼獲取地址]
    K --> L[設定用戶地址顯示]
    L --> M[初次載入自動搜索餐廳]
    
    M --> N[用戶點擊輪盤轉動]
    N --> O[調用 getRandomRestaurant]
    
    O --> P[檢查餐廳歷史記錄]
    P --> Q[開始搜索循環]
    
    Q --> R[調用 Google Places API]
    R --> S[篩選餐廳結果]
    S --> T{有可用餐廳?}
    
    T -->|是| U[隨機選擇餐廳]
    T -->|否| V[擴大搜索半徑]
    V --> W{嘗試次數 < 3?}
    W -->|是| Q
    W -->|否| X[使用模擬數據]
    
    U --> Y[計算距離]
    Y --> Z[更新餐廳歷史]
    Z --> AA[顯示餐廳卡片]
    
    X --> AA
    
    AA --> BB[用戶查看餐廳詳情]
    BB --> CC[點擊導航按鈕]
    CC --> DD[開啟 Google Maps 導航]
```

## 分支流程詳解

### 1. 定位服務分支

```mermaid
flowchart TD
    A[定位服務] --> B{定位方式}
    B -->|自動定位| C[navigator.geolocation]
    B -->|手動輸入| D[地址輸入框]
    B -->|已儲存位置| E[使用已儲存座標]
    
    C --> F[getCurrentPosition]
    F --> G{定位成功?}
    G -->|是| H[設定座標]
    G -->|否| I[顯示錯誤訊息]
    I --> J[嘗試使用上次位置]
    J --> K{有上次位置?}
    K -->|是| H
    K -->|否| D
    
    D --> L[調用 Geocoding API]
    L --> M{地址轉換成功?}
    M -->|是| H
    M -->|否| N[顯示地址錯誤]
    
    E --> H
    H --> O[反向地理編碼]
    O --> P[簡化地址顯示]
```

### 2. 餐廳搜索分支

```mermaid
flowchart TD
    A[開始餐廳搜索] --> B[獲取搜索參數]
    B --> C[設定搜索半徑]
    C --> D[設定用餐時段]
    
    D --> E[調用 Places API nearbySearch]
    E --> F{API 調用成功?}
    F -->|否| G[使用模擬數據]
    F -->|是| H[解析餐廳數據]
    
    H --> I[篩選條件檢查]
    I --> J{餐廳類型正確?}
    J -->|否| K[跳過此餐廳]
    J -->|是| L{營業狀態檢查}
    
    L --> M{選擇用餐時段營業?}
    M -->|否| K
    M -->|是| N{未在歷史記錄?}
    N -->|否| K
    N -->|是| O[加入可用餐廳列表]
    
    K --> P{還有餐廳?}
    P -->|是| I
    P -->|否| Q{可用餐廳數量 > 0?}
    
    O --> P
    Q -->|否| R[擴大搜索半徑]
    Q -->|是| S[隨機選擇餐廳]
    
    R --> T{重試次數 < 3?}
    T -->|是| C
    T -->|否| G
    
    S --> U[計算距離]
    U --> V[更新歷史記錄]
    V --> W[返回餐廳資料]
    
    G --> W
```

### 3. 語言處理分支

```mermaid
flowchart TD
    A[語言選擇] --> B{選擇的語言}
    B -->|中文| C[設定 zh-TW]
    B -->|英文| D[設定 en-US]
    B -->|日文| E[設定 ja-JP]
    B -->|韓文| F[設定 ko-KR]
    B -->|西班牙文| G[設定 es-ES]
    B -->|法文| H[設定 fr-FR]
    
    C --> I[更新 UI 翻譯]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[更新 Google API 語言參數]
    J --> K[重新獲取地址資訊]
    K --> L[更新餐廳搜索語言]
```

### 4. 餐廳卡片互動分支

```mermaid
flowchart TD
    A[顯示餐廳卡片] --> B[渲染基本資訊]
    B --> C[顯示評分和價位]
    C --> D[處理營業時間]
    
    D --> E{有營業時間?}
    E -->|是| F[計算營業狀態]
    E -->|否| G[顯示時間未知]
    
    F --> H{現在營業?}
    H -->|是| I[顯示營業中]
    H -->|否| J[顯示已打烊]
    
    I --> K[用戶點擊互動]
    G --> K
    J --> K
    
    K --> L{點擊類型}
    L -->|導航按鈕| M[建立路線規劃 URL]
    L -->|電話按鈕| N[撥打電話]
    L -->|網站按鈕| O[開啟官網]
    L -->|地址按鈕| P[顯示 Google Maps]
    
    M --> Q[開啟 Google Maps 導航]
    N --> R[系統撥號程式]
    O --> S[開啟新視窗]
    P --> T[顯示位置地圖]
```

### 5. 錯誤處理分支

```mermaid
flowchart TD
    A[發生錯誤] --> B{錯誤類型}
    B -->|定位錯誤| C[顯示定位失敗訊息]
    B -->|API 錯誤| D[切換到模擬數據]
    B -->|網路錯誤| E[顯示重試按鈕]
    B -->|權限錯誤| F[顯示權限請求]
    
    C --> G[提供手動輸入選項]
    D --> H[載入本地餐廳數據]
    E --> I[等待用戶重試]
    F --> J[引導用戶設定權限]
    
    G --> K[繼續流程]
    H --> K
    I --> L{用戶點擊重試?}
    J --> M{權限已授予?}
    
    L -->|是| N[重新執行失敗步驟]
    L -->|否| O[維持當前狀態]
    M -->|是| N
    M -->|否| G
    
    N --> K
    O --> K
```

## 關鍵函數調用順序

1. **App()** - 主應用組件初始化
2. **getUserLocation()** - 獲取用戶位置
3. **getAddressFromCoordinates()** - 反向地理編碼
4. **handleSpin()** - 處理輪盤轉動
5. **getRandomRestaurant()** - 獲取隨機餐廳
6. **searchNearbyRestaurants()** - 搜索附近餐廳
7. **isRestaurantOpenInTimeSlot()** - 檢查營業狀態
8. **calculateDistance()** - 計算距離
9. **updateRestaurantHistory()** - 更新歷史記錄
10. **RestaurantCard()** - 渲染餐廳卡片

## API 調用鏈

```mermaid
sequenceDiagram
    participant U as 用戶
    participant A as App
    participant G as Geolocation API
    participant GM as Google Maps API
    participant GP as Google Places API
    participant GC as Geocoding API

    U->>A: 開啟應用程式
    A->>G: getCurrentPosition()
    G-->>A: 位置座標
    A->>GM: 載入 Maps JavaScript API
    GM-->>A: API 就緒
    A->>GC: reverseGeocode(座標)
    GC-->>A: 地址資訊
    U->>A: 點擊輪盤轉動
    A->>GP: nearbySearch(座標, 參數)
    GP-->>A: 餐廳列表
    A->>A: 篩選和隨機選擇
    A-->>U: 顯示餐廳卡片
    U->>A: 點擊導航
    A->>GM: 開啟導航 URL
```