# 實施計畫 - 簡化版

- [x] 1. 建立 ButtonStylesManager 核心模組





  - 建立 `components/shared/ButtonStylesManager.js` 包含基礎樣式常數和變體
  - 定義 base、variants、states 物件結構
  - 實作 `getButtonClasses` 和 `getButtonStyle` 兩個主要函數
  - 註冊到 window 物件供全域使用
  - _需求: 1.1, 2.1, 3.1, 6.4_

- [x] 2. 直接更新 SlotMachine 按鈕樣式





  - 修改 SlotMachine.js 中的按鈕樣式，使用 ButtonStylesManager
  - 替換現有的 `buttonLogic.getAddButtonStyle()` 呼叫
  - 移除重複的 Tailwind 類別定義
  - 測試按鈕功能和外觀保持一致
  - _需求: 1.1, 1.3, 4.2_

- [x] 3. 更新 MealTimeSelector 按鈕樣式





  - 替換 MealTimeSelector.js 中的內聯樣式和 className
  - 使用 ButtonStylesManager 統一按鈕樣式
  - 確保兩行布局和主題切換正常運作
  - 移除重複的漸層和邊框定義
  - _需求: 1.1, 2.4, 5.1, 5.2_
-

- [x] 4. 更新 SearchSettings 和 LocationManager 組件




  - 修改 DistanceControl.js 和其他 SearchSettings 組件的按鈕樣式
  - 更新 LocationManager 相關組件的按鈕
  - 統一使用 ButtonStylesManager 的 margin: 0 和 touchAction 修正
  - 測試所有按鈕功能正常
  - _需求: 1.1, 3.5, 5.4_

-

- [x] 5. 建立基本測試和驗證



  - 撰寫簡單的測試驗證 ButtonStylesManager 函數正常運作
  - 測試所有主題（舞鶴、柒宿、沐旅）的按鈕樣式
  - 驗證按鈕在不同狀態下的外觀和行為
  - 確認程式碼重複度確實減少
  - _需求: 2.4, 4.3, 6.1_

- [ ] 6. 清理和文件




  - 移除所有重複的按鈕樣式定義
  - 撰寫簡單的使用說明文件
  - 驗證所有按鈕外觀一致且功能正常
  - 確認達成減少 80% 重複程式碼的目標
  - _需求: 1.3, 4.1_