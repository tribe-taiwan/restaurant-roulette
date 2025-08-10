/**
 * ErrorBoundary - React 錯誤邊界組件
 * 提供安全的錯誤處理和用戶友好的錯誤顯示
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // 更新狀態以顯示錯誤 UI
    return {
      hasError: true,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤詳情
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 記錄錯誤到控制台
    console.error('ErrorBoundary 捕獲錯誤:', error);
    console.error('錯誤詳情:', errorInfo);

    // 可以在這裡添加錯誤報告服務
    this.reportError(error, errorInfo);

    // 觸覺回饋
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  reportError = (error, errorInfo) => {
    try {
      // 創建錯誤報告
      const errorReport = {
        id: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };

      // 儲存到 localStorage 用於調試
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(errorReport);
      
      // 只保留最近的 10 個錯誤報告
      const recentReports = existingReports.slice(-10);
      localStorage.setItem('errorReports', JSON.stringify(recentReports));

      // 在開發環境中顯示詳細錯誤
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 ErrorBoundary 錯誤報告');
        console.error('錯誤 ID:', errorReport.id);
        console.error('錯誤訊息:', errorReport.message);
        console.error('錯誤堆疊:', errorReport.stack);
        console.error('組件堆疊:', errorReport.componentStack);
        console.groupEnd();
      }
    } catch (reportingError) {
      console.error('錯誤報告失敗:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));

    // 觸覺回饋
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  handleReset = () => {
    // 重置組件狀態
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    });

    // 清除可能的錯誤狀態
    if (this.props.onReset) {
      this.props.onReset();
    }

    // 觸覺回饋
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  handleReload = () => {
    // 重新載入頁面
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 自定義錯誤 UI
      const { fallback: CustomFallback, showDetails = false } = this.props;
      
      if (CustomFallback) {
        return React.createElement(CustomFallback, {
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          onRetry: this.handleRetry,
          onReset: this.handleReset,
          retryCount: this.state.retryCount
        });
      }

      // 預設錯誤 UI
      return React.createElement('div', {
        className: 'error-boundary-container',
        style: {
          padding: '20px',
          margin: '20px',
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--border-radius-large)',
          border: '2px solid var(--error-color)',
          textAlign: 'center'
        }
      }, [
        // 錯誤圖標
        React.createElement('div', {
          key: 'icon',
          style: {
            fontSize: '48px',
            marginBottom: '16px'
          }
        }, '⚠️'),

        // 錯誤標題
        React.createElement('h2', {
          key: 'title',
          style: {
            color: 'var(--error-color)',
            marginBottom: '16px',
            fontSize: '24px'
          }
        }, '哎呀！出現了一些問題'),

        // 錯誤描述
        React.createElement('p', {
          key: 'description',
          style: {
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.5'
          }
        }, '應用程序遇到了意外錯誤。請嘗試重新載入或聯繫技術支援。'),

        // 操作按鈕
        React.createElement('div', {
          key: 'actions',
          style: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }
        }, [
          // 重試按鈕
          React.createElement('button', {
            key: 'retry',
            onClick: this.handleRetry,
            style: {
              padding: '12px 24px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-medium)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px'
            }
          }, `重試 ${this.state.retryCount > 0 ? `(${this.state.retryCount})` : ''}`),

          // 重置按鈕
          React.createElement('button', {
            key: 'reset',
            onClick: this.handleReset,
            style: {
              padding: '12px 24px',
              backgroundColor: 'var(--secondary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-medium)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px'
            }
          }, '重置'),

          // 重新載入按鈕
          React.createElement('button', {
            key: 'reload',
            onClick: this.handleReload,
            style: {
              padding: '12px 24px',
              backgroundColor: 'var(--warning-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-medium)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px'
            }
          }, '重新載入頁面')
        ]),

        // 錯誤詳情（開發模式或明確要求時顯示）
        showDetails && this.state.error && React.createElement('details', {
          key: 'details',
          style: {
            marginTop: '24px',
            textAlign: 'left',
            backgroundColor: 'var(--background-color)',
            padding: '16px',
            borderRadius: 'var(--border-radius-medium)',
            fontSize: '12px',
            fontFamily: 'monospace'
          }
        }, [
          React.createElement('summary', {
            key: 'summary',
            style: {
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '8px'
            }
          }, '錯誤詳情'),
          
          React.createElement('pre', {
            key: 'error-message',
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--error-color)',
              marginBottom: '8px'
            }
          }, this.state.error.message),
          
          React.createElement('pre', {
            key: 'error-stack',
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--text-secondary)',
              fontSize: '10px'
            }
          }, this.state.error.stack)
        ])
      ]);
    }

    // 正常渲染子組件
    return this.props.children;
  }
}

// 便捷的 HOC 包裝器
function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => {
    return React.createElement(ErrorBoundary, errorBoundaryProps,
      React.createElement(Component, props)
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// 錯誤報告工具函數
const ErrorReportingUtils = {
  // 獲取儲存的錯誤報告
  getStoredErrorReports: () => {
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch (error) {
      console.error('讀取錯誤報告失敗:', error);
      return [];
    }
  },

  // 清除錯誤報告
  clearErrorReports: () => {
    try {
      localStorage.removeItem('errorReports');
      return true;
    } catch (error) {
      console.error('清除錯誤報告失敗:', error);
      return false;
    }
  },

  // 匯出錯誤報告
  exportErrorReports: () => {
    try {
      const reports = ErrorReportingUtils.getStoredErrorReports();
      return JSON.stringify(reports, null, 2);
    } catch (error) {
      console.error('匯出錯誤報告失敗:', error);
      return null;
    }
  }
};

// 導出組件和工具
if (typeof window !== 'undefined') {
  window.ErrorBoundary = ErrorBoundary;
  window.withErrorBoundary = withErrorBoundary;
  window.ErrorReportingUtils = ErrorReportingUtils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorBoundary,
    withErrorBoundary,
    ErrorReportingUtils
  };
}