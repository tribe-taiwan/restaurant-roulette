const mockRestaurants = [
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