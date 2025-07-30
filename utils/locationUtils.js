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
      throw new Error("User location not available. Please ensure location access is enabled.");
    }

    // Filter restaurants within 10km
    const nearbyRestaurants = mockRestaurants.filter(restaurant => {
      const distance = getDistanceFromLatLng(
        userLocation.lat, 
        userLocation.lng, 
        restaurant.lat, 
        restaurant.lng
      );
      return distance <= 10; // Changed radius to 10km
    });

    if (nearbyRestaurants.length === 0) {
      throw new Error("No restaurants found within 10km of your location. Please try again later or report this issue.");
    }

    return nearbyRestaurants[Math.floor(Math.random() * nearbyRestaurants.length)];
  } catch (error) {
    console.error('Get random restaurant error:', error.message); // Log the specific error message
    // Re-throw the error so the calling function can handle it (e.g., display an error message to the user)
    throw error; 
  }
}
