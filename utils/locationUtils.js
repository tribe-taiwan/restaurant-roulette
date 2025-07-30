function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  try {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return 0;
  }
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getRandomRestaurant(userLocation) {
  try {
    if (!userLocation) {
      return mockRestaurants[Math.floor(Math.random() * mockRestaurants.length)];
    }

    // Filter restaurants within 50km for better coverage
    const nearbyRestaurants = mockRestaurants.filter(restaurant => {
      const distance = getDistanceFromLatLng(
        userLocation.lat, 
        userLocation.lng, 
        restaurant.lat, 
        restaurant.lng
      );
      return distance <= 50;
    });

    const restaurants = nearbyRestaurants.length > 0 ? nearbyRestaurants : mockRestaurants;
    return restaurants[Math.floor(Math.random() * restaurants.length)];
  } catch (error) {
    console.error('Get random restaurant error:', error);
    return mockRestaurants[Math.floor(Math.random() * mockRestaurants.length)];
  }
}
