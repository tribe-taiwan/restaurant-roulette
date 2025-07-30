const mockRestaurants = [
  // 台南地區餐廳
  {
    id: 101,
    name: "度小月擔仔麵",
    lat: 22.9985,
    lng: 120.2130,
    rating: 4.5,
    reviewCount: 1234,
    priceLevel: 2,
    cuisine: ["台式料理", "擔仔麵"],
    address: "台南市中西區中正路16號",
    phone: "06-2231744",
    hours: "11:00 AM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
    menuHighlights: [
      { name: "擔仔麵", price: "60" },
      { name: "蝦捲", price: "80" },
      { name: "肉燥飯", price: "40" },
      { name: "虱目魚湯", price: "70" }
    ]
  },
  {
    id: 102,
    name: "阿霞飯店",
    lat: 22.9973,
    lng: 120.2055,
    rating: 4.3,
    reviewCount: 856,
    priceLevel: 3,
    cuisine: ["台菜", "辦桌菜"],
    address: "台南市中西區忠義路二段84巷7號",
    phone: "06-2224420",
    hours: "11:30 AM - 2:00 PM, 5:30 PM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500",
    menuHighlights: [
      { name: "紅蟳米糕", price: "480" },
      { name: "砂鍋魚頭", price: "380" },
      { name: "蝦捲", price: "120" },
      { name: "杏仁豆腐", price: "60" }
    ]
  },
  {
    id: 103,
    name: "赤崁擔仔麵",
    lat: 22.9970,
    lng: 120.2025,
    rating: 4.2,
    reviewCount: 567,
    priceLevel: 2,
    cuisine: ["台式料理", "小吃"],
    address: "台南市中西區民族路三段19號",
    phone: "06-2201897",
    hours: "10:00 AM - 10:00 PM",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
    menuHighlights: [
      { name: "擔仔麵", price: "50" },
      { name: "蚵仔煎", price: "70" },
      { name: "肉粽", price: "45" },
      { name: "四神湯", price: "60" }
    ]
  },
  {
    id: 104,
    name: "福記肉圓",
    lat: 23.0020,
    lng: 120.2180,
    rating: 4.6,
    reviewCount: 789,
    priceLevel: 1,
    cuisine: ["台式小吃", "肉圓"],
    address: "台南市中西區府前路一段218號",
    phone: "06-2258199",
    hours: "8:00 AM - 8:00 PM",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    menuHighlights: [
      { name: "肉圓", price: "35" },
      { name: "四神湯", price: "50" },
      { name: "貢丸湯", price: "40" },
      { name: "滷蛋", price: "15" }
    ]
  },
  {
    id: 105,
    name: "莉莉水果店",
    lat: 22.9950,
    lng: 120.2100,
    rating: 4.4,
    reviewCount: 456,
    priceLevel: 2,
    cuisine: ["飲品", "水果"],
    address: "台南市中西區府前路一段199號",
    phone: "06-2137522",
    hours: "9:00 AM - 11:00 PM",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500",
    menuHighlights: [
      { name: "芒果冰", price: "120" },
      { name: "木瓜牛奶", price: "60" },
      { name: "現打果汁", price: "80" },
      { name: "水果拼盤", price: "150" }
    ]
  },
  {
    id: 106,
    name: "文章牛肉湯",
    lat: 23.0050,
    lng: 120.2200,
    rating: 4.7,
    reviewCount: 1123,
    priceLevel: 2,
    cuisine: ["台式料理", "牛肉湯"],
    address: "台南市中西區海安路一段63號",
    phone: "06-2229142",
    hours: "5:00 AM - 1:00 PM",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500",
    menuHighlights: [
      { name: "溫體牛肉湯", price: "80" },
      { name: "牛肉燥飯", price: "50" },
      { name: "川燙牛肉", price: "120" },
      { name: "牛雜湯", price: "70" }
    ]
  },
  // 保留原始紐約餐廳作為測試資料
  {
    id: 1,
    name: "Sakura Sushi",
    lat: 40.7589,
    lng: -73.9851,
    rating: 4.5,
    reviewCount: 234,
    priceLevel: 3,
    cuisine: ["Japanese", "Sushi"],
    address: "123 Madison Ave, New York, NY",
    phone: "(212) 555-0123",
    hours: "11:00 AM - 10:00 PM",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
    menuHighlights: [
      { name: "Dragon Roll", price: "18" },
      { name: "Chirashi Bowl", price: "22" },
      { name: "Miso Soup", price: "6" },
      { name: "Edamame", price: "8" }
    ]
  },
  {
    id: 2,
    name: "Mama's Italian Kitchen",
    lat: 40.7505,
    lng: -73.9934,
    rating: 4.2,
    reviewCount: 189,
    priceLevel: 2,
    cuisine: ["Italian", "Pizza"],
    address: "456 Broadway, New York, NY",
    phone: "(212) 555-0456",
    hours: "12:00 PM - 11:00 PM",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500",
    menuHighlights: [
      { name: "Margherita Pizza", price: "16" },
      { name: "Fettuccine Alfredo", price: "18" },
      { name: "Caesar Salad", price: "12" },
      { name: "Tiramisu", price: "8" }
    ]
  },
  {
    id: 3,
    name: "Spice Garden",
    lat: 40.7282,
    lng: -74.0776,
    rating: 4.7,
    reviewCount: 312,
    priceLevel: 2,
    cuisine: ["Indian", "Vegetarian"],
    address: "789 Curry Lane, New York, NY",
    phone: "(212) 555-0789",
    hours: "5:00 PM - 10:30 PM",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
    menuHighlights: [
      { name: "Butter Chicken", price: "16" },
      { name: "Biryani", price: "14" },
      { name: "Naan Bread", price: "4" },
      { name: "Mango Lassi", price: "5" }
    ]
  },
  {
    id: 4,
    name: "The Burger Joint",
    lat: 40.7614,
    lng: -73.9776,
    rating: 4.0,
    reviewCount: 156,
    priceLevel: 1,
    cuisine: ["American", "Burgers"],
    address: "321 Beef Street, New York, NY",
    phone: "(212) 555-0321",
    hours: "11:00 AM - 12:00 AM",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    menuHighlights: [
      { name: "Classic Cheeseburger", price: "12" },
      { name: "BBQ Bacon Burger", price: "15" },
      { name: "Sweet Potato Fries", price: "6" },
      { name: "Milkshake", price: "5" }
    ]
  },
  {
    id: 5,
    name: "Le Petit Bistro",
    lat: 40.7831,
    lng: -73.9712,
    rating: 4.8,
    reviewCount: 89,
    priceLevel: 4,
    cuisine: ["French", "Fine Dining"],
    address: "654 French Ave, New York, NY",
    phone: "(212) 555-0654",
    hours: "6:00 PM - 11:00 PM",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500",
    menuHighlights: [
      { name: "Coq au Vin", price: "32" },
      { name: "Bouillabaisse", price: "38" },
      { name: "Escargot", price: "16" },
      { name: "Crème Brûlée", price: "12" }
    ]
  },
  {
    id: 6,
    name: "Taco Libre",
    lat: 40.7400,
    lng: -74.0000,
    rating: 4.3,
    reviewCount: 267,
    priceLevel: 1,
    cuisine: ["Mexican", "Tacos"],
    address: "987 Salsa Street, New York, NY",
    phone: "(212) 555-0987",
    hours: "11:30 AM - 10:00 PM",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500",
    menuHighlights: [
      { name: "Fish Tacos", price: "3.50" },
      { name: "Carnitas Bowl", price: "11" },
      { name: "Guacamole", price: "7" },
      { name: "Churros", price: "6" }
    ]
  }
];