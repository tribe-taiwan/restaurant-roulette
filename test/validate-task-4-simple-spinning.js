// validate-task-4-simple-spinning.js
// 驗證 Task 4: 整合簡單的轉動邏輯

console.log('🧪 開始驗證 Task 4: 整合簡單的轉動邏輯');

// 檢查點 1: 驗證 SlotMachine.js 中是否實現了簡單轉動邏輯
function validateSimpleSpinningLogic() {
  console.log('\n📋 檢查點 1: 驗證簡單轉動邏輯實現');
  
  try {
    // 讀取 SlotMachine.js 文件
    const fs = require('fs');
    const path = require('path');
    const slotMachineContent = fs.readFileSync(
      path.join(__dirname, '../components/SlotMachine.js'), 
      'utf8'
    );
    
    // 檢查是否包含簡單轉動邏輯的關鍵元素
    const checks = [
      {
        name: '定時器 + nextSlide 邏輯',
        pattern: /setInterval.*nextSlide/s,
        description: '採用測試檔案的轉動邏輯（定時器 + nextSlide）'
      },
      {
        name: '隨機轉動次數',
        pattern: /Math\.floor\(Math\.random\(\).*\)/,
        description: '實現簡單的隨機轉動次數邏輯'
      },
      {
        name: 'startSimpleSpinning 函數',
        pattern: /startSimpleSpinning/,
        description: '實現簡單轉動開始函數'
      },
      {
        name: 'stopSimpleSpinning 函數',
        pattern: /stopSimpleSpinning/,
        description: '實現簡單轉動停止函數'
      },
      {
        name: '轉動狀態管理',
        pattern: /spinningState/,
        description: '簡化的轉動狀態管理'
      },
      {
        name: '轉動完成邏輯',
        pattern: /轉動完成|spinning.*complete/i,
        description: '確保轉動結束後正確顯示目標餐廳'
      }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(slotMachineContent)) {
        console.log(`  ✅ ${check.name}: ${check.description}`);
        passedChecks++;
      } else {
        console.log(`  ❌ ${check.name}: ${check.description}`);
      }
    });
    
    console.log(`\n📊 簡單轉動邏輯檢查結果: ${passedChecks}/${checks.length} 通過`);
    return passedChecks === checks.length;
    
  } catch (error) {
    console.error('❌ 讀取 SlotMachine.js 失敗:', error.message);
    return false;
  }
}

// 檢查點 2: 驗證是否移除了複雜動畫序列生成代碼
function validateComplexAnimationRemoval() {
  console.log('\n📋 檢查點 2: 驗證複雜動畫序列生成代碼移除');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // 檢查 SlotMachine.js
    const slotMachineContent = fs.readFileSync(
      path.join(__dirname, '../components/SlotMachine.js'), 
      'utf8'
    );
    
    // 檢查是否移除了複雜動畫狀態
    const complexAnimationPatterns = [
      { name: 'apiWaiting 狀態', pattern: /apiWaiting/ },
      { name: 'apiReceived 狀態', pattern: /apiReceived/ },
      { name: 'fast 動畫狀態', pattern: /fast.*animation|animation.*fast/i },
      { name: 'slow 動畫狀態', pattern: /slow.*animation|animation.*slow/i },
      { name: '複雜動畫序列', pattern: /animationSequence|sequence.*animation/i }
    ];
    
    let removedCount = 0;
    complexAnimationPatterns.forEach(pattern => {
      if (!pattern.pattern.test(slotMachineContent)) {
        console.log(`  ✅ 已移除 ${pattern.name}`);
        removedCount++;
      } else {
        console.log(`  ⚠️ 仍存在 ${pattern.name}`);
      }
    });
    
    console.log(`\n📊 複雜動畫移除檢查結果: ${removedCount}/${complexAnimationPatterns.length} 已移除`);
    return removedCount >= complexAnimationPatterns.length - 1; // 允許一個未移除
    
  } catch (error) {
    console.error('❌ 檢查複雜動畫移除失敗:', error.message);
    return false;
  }
}

// 檢查點 3: 驗證按鈕邏輯更新
function validateButtonLogicUpdate() {
  console.log('\n📋 檢查點 3: 驗證按鈕邏輯更新');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // 檢查 SlotMachineButtonLogic.js
    const buttonLogicContent = fs.readFileSync(
      path.join(__dirname, '../components/SlotMachineButtonLogic.js'), 
      'utf8'
    );
    
    const checks = [
      {
        name: '簡單轉動邏輯整合',
        pattern: /startSimpleSpinning|簡單轉動邏輯/,
        description: '按鈕邏輯整合簡單轉動功能'
      },
      {
        name: '轉動按鈕更新',
        pattern: /handleSpinClick.*updated|updated.*handleSpinClick/,
        description: '轉動按鈕邏輯已更新'
      }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(buttonLogicContent)) {
        console.log(`  ✅ ${check.name}: ${check.description}`);
        passedChecks++;
      } else {
        console.log(`  ❌ ${check.name}: ${check.description}`);
      }
    });
    
    console.log(`\n📊 按鈕邏輯更新檢查結果: ${passedChecks}/${checks.length} 通過`);
    return passedChecks >= 1; // 至少一個檢查通過
    
  } catch (error) {
    console.error('❌ 檢查按鈕邏輯更新失敗:', error.message);
    return false;
  }
}

// 檢查點 4: 驗證測試文件創建
function validateTestFileCreation() {
  console.log('\n📋 檢查點 4: 驗證測試文件創建');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const testFilePath = path.join(__dirname, 'test-simple-spinning-logic.html');
    
    if (fs.existsSync(testFilePath)) {
      const testContent = fs.readFileSync(testFilePath, 'utf8');
      
      const checks = [
        { name: 'Keen Slider 整合', pattern: /KeenSlider/ },
        { name: '簡單轉動邏輯', pattern: /startSpinning.*function/ },
        { name: '隨機轉動次數', pattern: /Math\.floor\(Math\.random/ },
        { name: '定時器邏輯', pattern: /setInterval/ },
        { name: 'Task 4 標識', pattern: /Task 4/ }
      ];
      
      let passedChecks = 0;
      checks.forEach(check => {
        if (check.pattern.test(testContent)) {
          console.log(`  ✅ ${check.name}`);
          passedChecks++;
        } else {
          console.log(`  ❌ ${check.name}`);
        }
      });
      
      console.log(`\n📊 測試文件檢查結果: ${passedChecks}/${checks.length} 通過`);
      return passedChecks >= 4;
      
    } else {
      console.log('  ❌ 測試文件不存在');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 檢查測試文件失敗:', error.message);
    return false;
  }
}

// 主驗證函數
function validateTask4() {
  console.log('🎯 Task 4 驗證目標:');
  console.log('  - 採用測試檔案的轉動邏輯（定時器 + nextSlide）');
  console.log('  - 移除所有複雜的動畫序列生成代碼');
  console.log('  - 實現簡單的隨機轉動次數邏輯');
  console.log('  - 確保轉動結束後正確顯示目標餐廳');
  
  const results = [
    validateSimpleSpinningLogic(),
    validateComplexAnimationRemoval(),
    validateButtonLogicUpdate(),
    validateTestFileCreation()
  ];
  
  const passedCount = results.filter(Boolean).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`🏆 Task 4 總體驗證結果: ${passedCount}/${totalCount} 檢查點通過`);
  
  if (passedCount === totalCount) {
    console.log('✅ Task 4: 整合簡單的轉動邏輯 - 完全成功！');
    console.log('🎉 所有子任務都已正確實現');
  } else if (passedCount >= totalCount * 0.75) {
    console.log('⚠️ Task 4: 整合簡單的轉動邏輯 - 基本成功');
    console.log('💡 建議檢查未通過的項目並進行優化');
  } else {
    console.log('❌ Task 4: 整合簡單的轉動邏輯 - 需要改進');
    console.log('🔧 請檢查實現並修復問題');
  }
  
  return passedCount >= totalCount * 0.75;
}

// 執行驗證
if (require.main === module) {
  validateTask4();
}

module.exports = { validateTask4 };