/**
 * 通用滑動容器組件
 * 用於處理項目切換的視覺效果和導航
 */
function SlideContainer({ 
  items = [],
  currentIndex = 0,
  onIndexChange,
  renderItem,
  className = '',
  containerHeight = 'h-64',
  showArrows = true,
  showDots = false,
  autoLoop = true,
  animationDuration = 300,
  enableTouch = true,
  enableKeyboard = true,
  arrowClassName = 'text-white text-4xl drop-shadow-lg',
  children
}) {
  
  // 檢查依賴並使用通用滑動導航 Hook
  if (!window.useSlideNavigation) {
    console.error('❌ SlideContainer 錯誤：window.useSlideNavigation 未定義');
    return (
      <div className={`${containerHeight} ${className} flex items-center justify-center bg-red-100 rounded-lg`}>
        <div className="text-red-600">滑動組件載入失敗：缺少 slideNavigationHook</div>
      </div>
    );
  }

  const {
    isSliding,
    slideDirection,
    slideToNext,
    slideToPrevious,
    touchHandlers,
    canSlideNext,
    canSlidePrevious
  } = window.useSlideNavigation({
    itemCount: items.length,
    currentIndex,
    onIndexChange,
    autoLoop,
    animationDuration,
    enableTouch,
    enableKeyboard
  });

  // 當前項目和下一個項目
  const currentItem = items[currentIndex] || null;
  const nextIndex = slideDirection === 'left' 
    ? (currentIndex + 1) % items.length 
    : currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
  const nextItem = items[nextIndex] || null;

  // 渲染項目內容
  const renderCurrentItem = () => {
    if (renderItem && currentItem) {
      return renderItem(currentItem, currentIndex);
    }
    return children;
  };

  const renderNextItem = () => {
    if (renderItem && nextItem) {
      return renderItem(nextItem, nextIndex);
    }
    return null;
  };

  // 如果只有一個項目，不顯示導航
  const shouldShowNavigation = items.length > 1;

  return (
    <div 
      className={`group relative overflow-hidden ${containerHeight} ${className}`}
      {...touchHandlers}
    >
      {/* 滑動轉場容器 - 連續滑動效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 雙圖滑動容器 */}
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{
            width: '200%', // 容納兩個項目
            transform: isSliding 
              ? (slideDirection === 'left' ? 'translateX(-50%)' : 'translateX(0)')
              : 'translateX(0)'
          }}
        >
          {/* 當前項目 */}
          <div className="w-1/2 h-full relative">
            {renderCurrentItem()}
          </div>
          
          {/* 下一個項目 */}
          <div className="w-1/2 h-full relative">
            {renderNextItem()}
          </div>
        </div>
      </div>

      {/* 左側導航箭頭 */}
      {shouldShowNavigation && showArrows && canSlidePrevious && (
        <div 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            slideToPrevious();
          }}
          title="上一個"
        >
          <div className={`icon-chevron-left ${arrowClassName}`}></div>
        </div>
      )}

      {/* 右側導航箭頭 */}
      {shouldShowNavigation && showArrows && canSlideNext && (
        <div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            slideToNext();
          }}
          title="下一個"
        >
          <div className={`icon-chevron-right ${arrowClassName}`}></div>
        </div>
      )}

      {/* 底部圓點指示器 */}
      {shouldShowNavigation && showDots && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange?.(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 註冊組件到全局
window.SlideContainer = SlideContainer;
