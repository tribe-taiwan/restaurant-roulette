/**
 * 過時API檢查工具 - 防止AI寫入已棄用的Google Places API語法
 * 當檢測到過時語法時阻止應用啟動，強制修復問題
 */

// 🛠️ 開發者開關：設為 false 可停用過時API檢查
// 暫時關閉，因為我們的清理代碼被誤報為使用過時API
const ENABLE_DEPRECATED_API_CHECK = true;

window.DeprecatedApiChecker = {
  // 已知的過時語法模式
  deprecatedPatterns: [
    {
      pattern: /open_now/g,
      name: 'open_now',
      description: 'open_now 已於 2021 年棄用，應使用 opening_hours.isOpen() 或 business_status',
      severity: 'high',
      excludePatterns: [/delete\s+.*open_now/] // 排除清理代碼
    },
    {
      pattern: /permanently_closed/g,
      name: 'permanently_closed',
      description: 'permanently_closed 已於 2020 年棄用，應使用 business_status',
      severity: 'high',
      excludePatterns: [/delete\s+.*permanently_closed/] // 排除清理代碼
    },
    {
      pattern: /utc_offset(?!_minutes)/g,
      name: 'utc_offset',
      description: 'utc_offset 已棄用，應使用 utc_offset_minutes',
      severity: 'medium'
    },
    {
      pattern: /place\.opening_hours\.open_now/g,
      name: 'opening_hours.open_now',
      description: 'opening_hours.open_now 已棄用，應使用 opening_hours.isOpen() 方法',
      severity: 'high'
    },
    {
      pattern: /nearbySearch.*fields/g,
      name: 'nearbySearch with fields',
      description: 'nearbySearch 不支援 fields 參數，請使用 getDetails 獲取詳細資訊',
      severity: 'medium'
    },
    {
      pattern: /geometry\.viewport/g,
      name: 'geometry.viewport',
      description: 'geometry.viewport 在某些 API 版本中可能不可用，建議檢查',
      severity: 'low'
    }
  ],

  // 掃描檔案內容
  scanContent: function(content, filePath) {
    const issues = [];

    this.deprecatedPatterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const locations = this.findMatchLocations(content, pattern);

        // 如果有有效的匹配位置（排除了清理代碼），才添加到問題列表
        if (locations.length > 0) {
          issues.push({
            file: filePath,
            pattern: pattern.name,
            description: pattern.description,
            severity: pattern.severity,
            matches: locations.length,
            locations: locations
          });
        }
      }
    });

    return issues;
  },

  // 尋找匹配位置（行號），並排除清理代碼
  findMatchLocations: function(content, patternObj) {
    const lines = content.split('\n');
    const locations = [];

    lines.forEach((line, index) => {
      if (line.match(patternObj.pattern)) {
        // 檢查是否應該排除這一行
        let shouldExclude = false;
        if (patternObj.excludePatterns) {
          shouldExclude = patternObj.excludePatterns.some(excludePattern =>
            line.match(excludePattern)
          );
        }

        // 只有不被排除的行才添加到位置列表
        if (!shouldExclude) {
          locations.push({
            line: index + 1,
            content: line.trim()
          });
        }
      }
    });
    
    return locations;
  },

  // 掃描多個檔案
  scanFiles: async function(filePaths) {
    const allIssues = [];
    
    for (const filePath of filePaths) {
      try {
        const response = await fetch(filePath);
        const content = await response.text();
        const issues = this.scanContent(content, filePath);
        allIssues.push(...issues);
      } catch (error) {
        console.warn(`⚠️ 無法掃描檔案 ${filePath}:`, error);
      }
    }
    
    return allIssues;
  },

  // 執行完整檢查
  performFullCheck: async function() {
    // 檢查開關狀態
    if (!ENABLE_DEPRECATED_API_CHECK) {
      console.log('🔧 過時API檢查已停用 (ENABLE_DEPRECATED_API_CHECK = false)');
      return {
        hasIssues: false,
        issues: [],
        summary: { totalIssues: 0, filesAffected: 0, severityCount: { high: 0, medium: 0, low: 0 }, criticalIssues: false }
      };
    }
    
    console.log('🔍 開始掃描過時API語法...');
    
    // 需要檢查的檔案列表
    const filesToCheck = [
      './utils/locationUtils.js',
      './app.js',
      './components/SlotMachine.js',
      './components/RestaurantCard.js',
      './components/LocationManager.js',
      './components/SearchSettings.js'
    ];
    
    const issues = await this.scanFiles(filesToCheck);
    
    return {
      hasIssues: issues.length > 0,
      issues: issues,
      summary: this.generateSummary(issues)
    };
  },

  // 生成摘要報告
  generateSummary: function(issues) {
    const severityCount = {
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    };
    
    const fileCount = [...new Set(issues.map(i => i.file))].length;
    
    return {
      totalIssues: issues.length,
      filesAffected: fileCount,
      severityCount: severityCount,
      criticalIssues: severityCount.high > 0
    };
  },

  // 格式化報告用於顯示
  formatReport: function(checkResult) {
    if (!checkResult.hasIssues) {
      return '✅ 未發現過時API語法';
    }
    
    let report = `❌ 發現 ${checkResult.summary.totalIssues} 個過時API問題\n\n`;
    
    if (checkResult.summary.criticalIssues) {
      report += '🚨 發現高危險性問題，必須立即修復！\n\n';
    }
    
    // 按嚴重性分組顯示
    const groupedIssues = {};
    checkResult.issues.forEach(issue => {
      if (!groupedIssues[issue.severity]) {
        groupedIssues[issue.severity] = [];
      }
      groupedIssues[issue.severity].push(issue);
    });
    
    ['high', 'medium', 'low'].forEach(severity => {
      if (groupedIssues[severity]) {
        const severityIcon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
        report += `${severityIcon} ${severity.toUpperCase()} 嚴重性問題：\n`;
        
        groupedIssues[severity].forEach(issue => {
          report += `\n檔案：${issue.file}\n`;
          report += `問題：${issue.pattern} (${issue.matches} 處)\n`;
          report += `說明：${issue.description}\n`;
          
          issue.locations.forEach(loc => {
            report += `  第${loc.line}行：${loc.content}\n`;
          });
          report += '\n';
        });
      }
    });
    
    return report;
  }
};
