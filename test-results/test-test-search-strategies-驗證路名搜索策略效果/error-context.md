# Page snapshot

```yaml
- heading "餐廳搜索策略測試 (使用新 Places API)" [level=1]
- strong: "🆕 API 版本:"
- text: 使用 Google Places API (New) - google.maps.places.Place
- 'heading "測試 1: 隨機偏移搜索中心點" [level=2]'
- paragraph:
  - emphasis: 說明：在中心點周圍隨機偏移進行多次搜索，檢查重複率問題
- button "執行隨機偏移測試"
- paragraph: ⏳ 正在載入 Google Maps API，請稍後再試...
- 'heading "測試 2: 按路名搜索" [level=2]'
- paragraph:
  - emphasis: 說明：基於地理位置獲取附近道路，在每條路上搜索餐廳
- button "執行路名搜索測試"
```