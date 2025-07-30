# Restaurant Roulette - Random Restaurant Finder

## Overview
Restaurant Roulette is a fun, slot machine-style web application that helps users discover random restaurants near their location. The app features an engaging spinning animation and displays comprehensive restaurant information including pricing, menu items, hours, and photos.

## Features
- **Slot Machine Interface**: Fun spinning animation while searching for restaurants
- **Location-based**: Uses user's GPS location to find nearby restaurants
- **Multi-language Support**: Supports English, Chinese, Japanese, Korean, Spanish, and French
- **Enhanced Restaurant Details**: Complete restaurant information including name, address, phone
- **Interactive Gallery**: Three clickable sections for menu, food photos, and navigation
- **Direct Integration**: Links to Google Maps for directions and external menu viewing
- **Responsive Design**: Works on desktop and mobile devices

## Technical Stack
- React 18 with Babel for JSX transformation
- TailwindCSS for styling with custom theme variables
- Lucide icons for UI elements
- Geolocation API for user positioning
- Mock data for restaurant information (can be replaced with Google Places API)

## Components
- `App.js`: Main application component
- `LanguageSelector.js`: Multi-language selection interface
- `SlotMachine.js`: Animated slot machine component
- `RestaurantCard.js`: Enhanced restaurant information display with interactive gallery
- `locationUtils.js`: Location calculation utilities
- `mockData.js`: Sample restaurant data

## Language Priority
1. English (always first)
2. Local language based on user location
3. Other languages ordered by proximity and population

## Future Enhancements
- Integration with Google Places API for real data
- User reviews and ratings
- Favorite restaurants functionality
- Social sharing features
- Advanced filtering options
## Data Structure
Each restaurant object contains:
- `id`: Unique identifier
- `name`: Restaurant name
- `lat/lng`: Geographic coordinates
- `rating`: Star rating (1-5)
- `reviewCount`: Number of reviews
- `priceLevel`: Price category (1-4)
- `cuisine`: Array of cuisine types
- `address`: Full address
- `phone`: Contact number
- `hours`: Operating hours
- `image`: Restaurant photo URL
- `menuHighlights`: Popular dishes with prices

## Localization
The app supports multiple languages with priority:
1. English (default, always first)
2. User's local language based on geolocation
3. Regional languages by proximity and population

Current translations available for Chinese (zh) and English (en).

## Development Notes
- Uses mock data for demonstration
- Geolocation API for user positioning
- 10km radius for nearby restaurant filtering
- 2.5 second spin animation duration
- Responsive design for mobile and desktop

## Next Steps
- Integrate Google Places API for real restaurant data
- Add more language translations
- Implement user preferences and favorites
- Add restaurant reviews and photos
- Enhanced filtering by cuisine type and price range
