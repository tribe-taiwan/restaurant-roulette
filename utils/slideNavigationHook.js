/**
 * 通用滑動導航 Hook
 * 可重用於老虎機、主題切換等需要左右滑動的組件
 */
function useSlideNavigation({ 
  itemCount, 
  currentIndex = 0, 
  onIndexChange, 
  autoLoop = true, 
  animationDuration = 300,
  swipeThreshold = 50,
  enableKeyboard = true,
  enableTouch = true 
}) {
  const [isSliding, setIsSliding] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState('left');
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  
  // 計算下一個和上一個索引
  const getNextIndex = React.useCallback((currentIdx) => {
    if (!autoLoop && currentIdx >= itemCount - 1) return currentIdx;
    return (currentIdx + 1) % itemCount;
  }, [itemCount, autoLoop]);
  
  const getPreviousIndex = React.useCallback((currentIdx) => {
    if (!autoLoop && currentIdx <= 0) return currentIdx;
    return currentIdx <= 0 ? itemCount - 1 : currentIdx - 1;
  }, [itemCount, autoLoop]);
  
  // 滑動到下一個
  const slideToNext = React.useCallback(() => {
    if (isSliding || itemCount <= 1) return;
    
    const nextIdx = getNextIndex(currentIndex);
    if (nextIdx === currentIndex && !autoLoop) return;
    
    setSlideDirection('left');
    setIsSliding(true);
    
    setTimeout(() => {
      onIndexChange?.(nextIdx);
      setIsSliding(false);
    }, animationDuration);
  }, [currentIndex, isSliding, itemCount, getNextIndex, onIndexChange, animationDuration, autoLoop]);
  
  // 滑動到上一個
  const slideToPrevious = React.useCallback(() => {
    if (isSliding || itemCount <= 1) return;
    
    const prevIdx = getPreviousIndex(currentIndex);
    if (prevIdx === currentIndex && !autoLoop) return;
    
    setSlideDirection('right');
    setIsSliding(true);
    
    setTimeout(() => {
      onIndexChange?.(prevIdx);
      setIsSliding(false);
    }, animationDuration);
  }, [currentIndex, isSliding, itemCount, getPreviousIndex, onIndexChange, animationDuration, autoLoop]);
  
  // 觸摸事件處理
  const touchHandlers = React.useMemo(() => {
    if (!enableTouch) return {};
    
    return {
      onTouchStart: (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
      },
      onTouchMove: (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
      },
      onTouchEnd: () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > swipeThreshold;
        const isRightSwipe = distance < -swipeThreshold;
        
        if (isLeftSwipe) {
          slideToNext();
        } else if (isRightSwipe) {
          slideToPrevious();
        }
      }
    };
  }, [enableTouch, touchStart, touchEnd, swipeThreshold, slideToNext, slideToPrevious]);
  
  // 鍵盤事件處理
  React.useEffect(() => {
    if (!enableKeyboard) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        slideToPrevious();
      } else if (e.key === 'ArrowRight') {
        slideToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, slideToPrevious, slideToNext]);
  
  return {
    // 狀態
    isSliding,
    slideDirection,
    currentIndex,
    itemCount,
    
    // 操作函數
    slideToNext,
    slideToPrevious,
    
    // 事件處理器
    touchHandlers,
    
    // 工具函數
    canSlideNext: autoLoop || currentIndex < itemCount - 1,
    canSlidePrevious: autoLoop || currentIndex > 0,
    getNextIndex: () => getNextIndex(currentIndex),
    getPreviousIndex: () => getPreviousIndex(currentIndex)
  };
}

// 註冊到全局
window.useSlideNavigation = useSlideNavigation;