/**
 * Hooks 實現驗證腳本
 * 驗證 useLocationManager 和 useSearchSettings Hooks 的安全性和功能性
 */

// 驗證結果收集器
const validationResults = {
  locationManager: {
    passed: 0,
    failed: 0,
    tests: []
  },
  searchSettings: {
    passed: 0,
    failed: 0,
    tests: []
  },
  communication: {
    passed: 0,
    failed: 0,
    tests: []
  },
  errorBoundary: {
    passed: 0,
    failed: 0,
    tests: []
  }
};

// 測試工具函數
function assert(condition, message, category = 'general') {
  const result = {
    message,
    passed: !!condition,
    timestamp: new Date().toISOString()
  };
  
  if (validationResults[category]) {
    validationResults[category].tests.push(result);
    if (result.passed) {
      validationResults[category].passed++;
    } else {
      validationResults[category].failed++;
    }
  }
  
  console.log(`${result.passed ? '✓' : '✗'} ${message}`);
  return result.passed;
}

function asyncTest(testName, testFn, category = 'general') {
  return new Promise(async (resolve) => {
    try {
      console.log(`\n🧪 執行測試: ${testName}`);
      const result = await testFn();
      assert(result, testName, category);
      resolve(result);
    } catch (error) {
      console.error(`❌ 測試失敗: ${testName}`, error);
      assert(false, `${testName} - ${error.message}`, category);
      resolve(false);
    }
  });
}

// useLocationManager Hook 驗證
async function validateLocationManagerHook() {
  console.log('\n📍 驗證 useLocationManager Hook...');
  
  // 檢查 Hook 是否存在
  assert(typeof window.useLocationManager === 'function', 'useLocationManager Hook 已載入', 'locationManager');
  
  if (typeof window.useLocationManager !== 'function') {
    console.error('useLocationManager Hook 未載入，跳過相關測試');
    return false;
  }
  
  // 創建測試組件來使用 Hook
  let hookInstance = null;
  
  function TestComponent() {
    hookInstance = window.useLocationManager();
    return null;
  }
  
  // 渲染測試組件
  const container = document.createElement('div');
  ReactDOM.render(React.createElement(TestComponent), container);
  
  // 基本屬性驗證
  await asyncTest('Hook 實例創建成功', () => {
    return hookInstance !== null;
  }, 'locationManager');
  
  await asyncTest('Hook 具有唯一 ID', () => {
    return hookInstance.hookId && typeof hookInstance.hookId === 'string';
  }, 'locationManager');
  
  await asyncTest('Hook 健康狀態正常', () => {
    return hookInstance.isHookHealthy === true;
  }, 'locationManager');
  
  await asyncTest('Hook 具有必要的狀態屬性', () => {
    const requiredProps = [
      'locationStatus', 'userLocation', 'userAddress', 'addressInput',
      'isRelocating', 'isGeocodingAddress', 'savedLocations', 'locationError',
      'isGeolocationAvailable'
    ];
    
    return requiredProps.every(prop => hookInstance.hasOwnProperty(prop));
  }, 'locationManager');
  
  await asyncTest('Hook 具有必要的方法', () => {
    const requiredMethods = [
      'getCurrentLocation', 'geocodeAddress', 'handleLocationButton',
      'handleAddressConfirm', 'saveQuickLocation', 'useQuickLocation',
      'clearError', 'resetLocation', 'performHealthCheck'
    ];
    
    return requiredMethods.every(method => typeof hookInstance[method] === 'function');
  }, 'locationManager');
  
  // 健康檢查測試
  await asyncTest('健康檢查功能正常', () => {
    return hookInstance.performHealthCheck() === true;
  }, 'locationManager');
  
  // 錯誤處理測試
  await asyncTest('錯誤處理機制正常', () => {
    // 測試無效參數處理
    const result1 = hookInstance.saveQuickLocation('invalid', null, null);
    const result2 = hookInstance.geocodeAddress('');
    
    // 這些操作應該返回 null 或 false，而不是拋出錯誤
    return (result1 === null || result1 === false) && 
           (result2 === null || result2 === false);
  }, 'locationManager');
  
  // 清理
  ReactDOM.unmountComponentAtNode(container);
  
  return true;
}

// useSearchSettings Hook 驗證
async function validateSearchSettingsHook() {
  console.log('\n⚙️ 驗證 useSearchSettings Hook...');
  
  // 檢查 Hook 是否存在
  assert(typeof window.useSearchSettings === 'function', 'useSearchSettings Hook 已載入', 'searchSettings');
  
  if (typeof window.useSearchSettings !== 'function') {
    console.error('useSearchSettings Hook 未載入，跳過相關測試');
    return false;
  }
  
  // 創建測試組件來使用 Hook
  let hookInstance = null;
  
  function TestComponent() {
    hookInstance = window.useSearchSettings();
    return null;
  }
  
  // 渲染測試組件
  const container = document.createElement('div');
  ReactDOM.render(React.createElement(TestComponent), container);
  
  // 基本屬性驗證
  await asyncTest('Hook 實例創建成功', () => {
    return hookInstance !== null;
  }, 'searchSettings');
  
  await asyncTest('Hook 具有唯一 ID', () => {
    return hookInstance.hookId && typeof hookInstance.hookId === 'string';
  }, 'searchSettings');
  
  await asyncTest('Hook 健康狀態正常', () => {
    return hookInstance.isHookHealthy === true;
  }, 'searchSettings');
  
  await asyncTest('Hook 具有必要的狀態屬性', () => {
    const requiredProps = [
      'selectedMealTime', 'baseUnit', 'unitMultiplier', 'actualSearchRadius',
      'settingsHistory', 'settingsError', 'isDefaultSettings'
    ];
    
    return requiredProps.every(prop => hookInstance.hasOwnProperty(prop));
  }, 'searchSettings');
  
  await asyncTest('Hook 具有必要的方法', () => {
    const requiredMethods = [
      'setSelectedMealTime', 'setBaseUnit', 'setUnitMultiplier',
      'resetSettings', 'clearError', 'getDistanceDisplayText',
      'getMealTimeDisplayText', 'getMealTimeIcon', 'performHealthCheck'
    ];
    
    return requiredMethods.every(method => typeof hookInstance[method] === 'function');
  }, 'searchSettings');
  
  // 功能測試
  await asyncTest('用餐時段設定功能正常', () => {
    const originalMealTime = hookInstance.selectedMealTime;
    const result = hookInstance.setSelectedMealTime('breakfast');
    const changed = hookInstance.selectedMealTime === 'breakfast';
    
    // 恢復原始值
    hookInstance.setSelectedMealTime(originalMealTime);
    
    return result === true && changed;
  }, 'searchSettings');
  
  await asyncTest('距離設定功能正常', () => {
    const originalMultiplier = hookInstance.unitMultiplier;
    const newMultiplier = originalMultiplier === 5 ? 3 : 5;
    
    const result = hookInstance.setUnitMultiplier(newMultiplier);
    const changed = hookInstance.unitMultiplier === newMultiplier;
    
    // 恢復原始值
    hookInstance.setUnitMultiplier(originalMultiplier);
    
    return result === true && changed;
  }, 'searchSettings');
  
  // 錯誤處理測試
  await asyncTest('錯誤處理機制正常', () => {
    // 測試無效參數處理
    const result1 = hookInstance.setSelectedMealTime('invalid');
    const result2 = hookInstance.setUnitMultiplier(-1);
    const result3 = hookInstance.setBaseUnit(999);
    
    // 這些操作應該返回 false
    return result1 === false && result2 === false && result3 === false;
  }, 'searchSettings');
  
  // 清理
  ReactDOM.unmountComponentAtNode(container);
  
  return true;
}

// 組件間通信驗證
async function validateComponentCommunication() {
  console.log('\n📡 驗證組件間通信系統...');
  
  // 檢查通信系統是否存在
  assert(typeof window.componentComm === 'object', 'ComponentCommunication 系統已載入', 'communication');
  assert(typeof window.useComponentCommunication === 'function', 'useComponentCommunication Hook 已載入', 'communication');
  
  if (!window.componentComm) {
    console.error('ComponentCommunication 系統未載入，跳過相關測試');
    return false;
  }
  
  // 基本功能測試
  await asyncTest('事件發送功能正常', () => {
    const result = window.componentComm.emit('test-event', { test: true });
    return result === true;
  }, 'communication');
  
  await asyncTest('事件訂閱功能正常', () => {
    let received = false;
    
    const unsubscribe = window.componentComm.subscribe('test-subscription', (data) => {
      received = true;
    });
    
    window.componentComm.emit('test-subscription', { test: true });
    unsubscribe();
    
    return received === true;
  }, 'communication');
  
  await asyncTest('事件取消訂閱功能正常', () => {
    let callCount = 0;
    
    const unsubscribe = window.componentComm.subscribe('test-unsubscribe', () => {
      callCount++;
    });
    
    window.componentComm.emit('test-unsubscribe', {});
    unsubscribe();
    window.componentComm.emit('test-unsubscribe', {});
    
    return callCount === 1;
  }, 'communication');
  
  await asyncTest('批量事件發送功能正常', () => {
    const events = [
      { eventType: 'batch-test-1', data: { id: 1 } },
      { eventType: 'batch-test-2', data: { id: 2 } }
    ];
    
    const results = window.componentComm.emitBatch(events);
    return results.length === 2 && results.every(r => r.success);
  }, 'communication');
  
  return true;
}

// 錯誤邊界驗證
async function validateErrorBoundary() {
  console.log('\n🛡️ 驗證錯誤邊界系統...');
  
  // 檢查錯誤邊界是否存在
  assert(typeof window.ErrorBoundary === 'function', 'ErrorBoundary 組件已載入', 'errorBoundary');
  assert(typeof window.withErrorBoundary === 'function', 'withErrorBoundary HOC 已載入', 'errorBoundary');
  assert(typeof window.ErrorReportingUtils === 'object', 'ErrorReportingUtils 已載入', 'errorBoundary');
  
  if (!window.ErrorBoundary) {
    console.error('ErrorBoundary 系統未載入，跳過相關測試');
    return false;
  }
  
  // 錯誤報告工具測試
  await asyncTest('錯誤報告工具功能正常', () => {
    const utils = window.ErrorReportingUtils;
    
    // 測試獲取報告
    const reports = utils.getStoredErrorReports();
    const isArray = Array.isArray(reports);
    
    // 測試清除報告
    const clearResult = utils.clearErrorReports();
    
    return isArray && typeof clearResult === 'boolean';
  }, 'errorBoundary');
  
  await asyncTest('withErrorBoundary HOC 功能正常', () => {
    function TestComponent() {
      return React.createElement('div', null, 'Test');
    }
    
    const WrappedComponent = window.withErrorBoundary(TestComponent);
    return typeof WrappedComponent === 'function';
  }, 'errorBoundary');
  
  return true;
}

// 整合測試
async function validateIntegration() {
  console.log('\n🔗 驗證整合功能...');
  
  // 測試 Hooks 與通信系統的整合
  await asyncTest('Hooks 與通信系統整合正常', () => {
    if (!window.useLocationManager || !window.componentComm) {
      return false;
    }
    
    let eventReceived = false;
    
    // 訂閱位置更新事件
    const unsubscribe = window.componentComm.subscribe('location-updated', () => {
      eventReceived = true;
    });
    
    // 創建 Hook 實例並觸發事件
    let hookInstance = null;
    
    function TestComponent() {
      hookInstance = window.useLocationManager();
      return null;
    }
    
    const container = document.createElement('div');
    ReactDOM.render(React.createElement(TestComponent), container);
    
    // 觸發位置更新事件
    if (hookInstance && hookInstance.emitLocationUpdate) {
      hookInstance.emitLocationUpdate({ lat: 25.0330, lng: 121.5654 }, '測試地址');
    }
    
    // 清理
    unsubscribe();
    ReactDOM.unmountComponentAtNode(container);
    
    return eventReceived;
  }, 'communication');
  
  return true;
}

// 主要驗證函數
async function runValidation() {
  console.log('🚀 開始 Hooks 實現驗證...\n');
  
  // 檢查基本依賴
  const dependencies = [
    { name: 'React', check: () => typeof React !== 'undefined' },
    { name: 'ReactDOM', check: () => typeof ReactDOM !== 'undefined' }
  ];
  
  console.log('📋 檢查依賴...');
  dependencies.forEach(dep => {
    assert(dep.check(), `${dep.name} 已載入`, 'general');
  });
  
  // 執行各項驗證
  await validateLocationManagerHook();
  await validateSearchSettingsHook();
  await validateComponentCommunication();
  await validateErrorBoundary();
  await validateIntegration();
  
  // 輸出結果摘要
  console.log('\n📊 驗證結果摘要:');
  console.log('==================');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(validationResults).forEach(([category, results]) => {
    if (results.tests.length > 0) {
      console.log(`${category}: ${results.passed}✓ ${results.failed}✗`);
      totalPassed += results.passed;
      totalFailed += results.failed;
    }
  });
  
  console.log('==================');
  console.log(`總計: ${totalPassed}✓ ${totalFailed}✗`);
  
  const successRate = totalPassed / (totalPassed + totalFailed) * 100;
  console.log(`成功率: ${successRate.toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('🎉 所有測試通過！Hook 實現符合安全要求。');
  } else {
    console.log('⚠️ 部分測試失敗，請檢查實現。');
  }
  
  return {
    passed: totalPassed,
    failed: totalFailed,
    successRate: successRate,
    details: validationResults
  };
}

// 導出驗證函數
if (typeof window !== 'undefined') {
  window.runHooksValidation = runValidation;
  window.validationResults = validationResults;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runValidation,
    validationResults
  };
}

// 如果在瀏覽器環境中直接執行
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延遲執行以確保所有依賴都已載入
    setTimeout(runValidation, 1000);
  });
}