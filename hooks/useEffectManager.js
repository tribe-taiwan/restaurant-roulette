// useEffectManager.js - useEffect 管理器
// 解決 React useEffect 競態條件和依賴管理問題

/**
 * 安全的 useUpdateEffect - 只在更新時執行，避免初始渲染衝突
 * 使用場景：防止餐廳狀態更新和滑動動畫的初始渲染衝突
 */
function useUpdateEffect(effect, deps) {
  const isFirstMount = React.useRef(true);
  
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    return effect();
  }, deps);
}

/**
 * 協調器 - 防止動畫衝突的狀態管理
 * 確保滑動轉場和餐廳狀態更新不會同時執行
 */
function useAnimationCoordinator() {
  const [animationState, setAnimationState] = React.useState({
    isSliding: false,
    isSpinning: false,
    pendingUpdate: null
  });
  
  const canStartSlide = React.useMemo(() => {
    return !animationState.isSliding && !animationState.isSpinning;
  }, [animationState]);
  
  const startSlideAnimation = React.useCallback(() => {
    setAnimationState(prev => ({ ...prev, isSliding: true }));
  }, []);
  
  const endSlideAnimation = React.useCallback(() => {
    setAnimationState(prev => {
      const newState = { ...prev, isSliding: false };
      // 執行待定的更新
      if (prev.pendingUpdate) {
        setTimeout(prev.pendingUpdate, 0);
        newState.pendingUpdate = null;
      }
      return newState;
    });
  }, []);
  
  const setPendingUpdate = React.useCallback((updateFn) => {
    setAnimationState(prev => ({ ...prev, pendingUpdate: updateFn }));
  }, []);
  
  return {
    canStartSlide,
    isSliding: animationState.isSliding,
    startSlideAnimation,
    endSlideAnimation,
    setPendingUpdate
  };
}

/**
 * 滑動轉場管理器 - 專門處理滑動換圖的狀態協調
 * 核心功能：確保狀態更新和動畫的正確時序
 */
function useSlideTransitionManager(currentRestaurant, setCurrentRestaurant) {
  const coordinator = useAnimationCoordinator();
  const [slideTransitionFn, setSlideTransitionFn] = React.useState(null);
  
  // 安全的餐廳切換函數
  const safeRestaurantSwitch = React.useCallback((newRestaurant, direction = 'left') => {
    if (!coordinator.canStartSlide || !slideTransitionFn || !currentRestaurant) {
      // 如果無法滑動，直接更新
      setCurrentRestaurant(newRestaurant);
      return;
    }
    
    // 開始滑動動畫
    coordinator.startSlideAnimation();
    
    // 設置動畫完成後的狀態更新
    coordinator.setPendingUpdate(() => {
      setCurrentRestaurant(newRestaurant);
    });
    
    // 觸發滑動轉場
    slideTransitionFn(currentRestaurant, newRestaurant, direction, () => {
      coordinator.endSlideAnimation();
    });
  }, [currentRestaurant, setCurrentRestaurant, slideTransitionFn, coordinator]);
  
  // 註冊滑動轉場函數
  const registerSlideTransition = React.useCallback((transitionFn) => {
    setSlideTransitionFn(() => transitionFn);
  }, []);
  
  return {
    safeRestaurantSwitch,
    registerSlideTransition,
    isSliding: coordinator.isSliding,
    canStartSlide: coordinator.canStartSlide
  };
}

/**
 * 深度比較 Effect - 處理複雜對象依賴
 * 避免物件引用變更導致的不必要重渲染
 */
function useDeepCompareEffect(effect, deps) {
  const ref = React.useRef();
  
  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }
  
  React.useEffect(effect, ref.current);
}

// 簡單的深度比較函數
function isEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  
  return false;
}

// 全域暴露
if (typeof window !== 'undefined') {
  window.useUpdateEffect = useUpdateEffect;
  window.useAnimationCoordinator = useAnimationCoordinator;
  window.useSlideTransitionManager = useSlideTransitionManager;
  window.useDeepCompareEffect = useDeepCompareEffect;
}