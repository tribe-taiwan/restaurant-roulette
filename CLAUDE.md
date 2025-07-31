# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant Roulette (餐廳輪盤) is a bilingual (English/Traditional Chinese) web application that helps users discover restaurants near their location using Google Places API. The app features a slot machine-style interface for randomly selecting restaurants with real-time location detection and meal time filtering.

## Development Commands

### Core Next.js Commands
- `npm run dev --turbopack` - Start development server with Turbopack for fast builds
- `npm run build` - Build production version
- `npm start` - Start production server

### Project Structure
The project uses a hybrid architecture mixing Next.js App Router with legacy React components:
- **Next.js App Router**: `app/` directory with layout.tsx and page.tsx
- **Legacy React Components**: Main app logic in `app.js` with component-based architecture
- **Static HTML Entry**: `index.html` serves as the primary entry point

## Architecture & Key Components

### Main Application Logic
- **`app.js`**: Core application with React hooks for state management, location services, and restaurant discovery
- **`components/`**: Modular components (SlotMachine, RestaurantCard, LanguageSelector)
- **`utils/locationUtils.js`**: Google Places API integration with geolocation services

### API Integration
- **Google Places API**: Primary restaurant data source with fallback to mock data
- **Geocoding**: Address conversion and location services
- **Error Handling**: Comprehensive error boundaries and user-friendly fallbacks

### State Management
The app uses React hooks for:
- Language selection (English/Traditional Chinese)
- Location services and user coordinates
- Restaurant search radius (1-20km)
- Meal time filtering (breakfast/lunch/dinner)
- Address correction and saved locations

### Internationalization
- Bilingual support with built-in translation objects
- Language-aware address geocoding
- Localized Google Places API queries

## Key Features to Understand

### Location Services
- Automatic geolocation detection
- Manual address input with geocoding
- Saved locations (home/office)
- Smart address simplification for display

### Restaurant Discovery
- Real-time Google Places API integration
- Configurable search radius
- Meal time filtering based on operating hours
- Fallback to mock data when API fails

### UI Components
- Slot machine animation for restaurant selection
- Responsive design with CSS custom properties
- Error boundaries for graceful failure handling

## Development Guidelines

### API Configuration
- Google Places API key is hardcoded in `utils/locationUtils.js`
- Search radius is dynamically configurable (1-20km)
- Language settings affect both UI and API responses

### Error Handling
- Always implement fallback mechanisms for API failures
- Use detailed error logging with timestamps
- Provide user-friendly error messages in both languages

### Component Development
- Follow existing naming conventions for React components
- Use CSS custom properties for theming
- Implement proper TypeScript types where applicable

## Testing
- Use `test-api.html` for Google Places API testing and debugging
- Browser console provides detailed error information
- Location services can be tested with different coordinates

## File Organization
```
restaurant-roulette/
├── app.js                    # Main React application
├── index.html               # Static HTML entry point
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/             # React components
├── utils/                  # Utility functions and API integration
├── config/                 # Configuration files
└── trickle/               # Mock data and assets
```

## Important Notes

- 無論我用何種語言，你都用繁體中文回答我
- The project mixes legacy HTML/React patterns with modern Next.js
- Google Places API integration is the primary data source
- All user-facing text must support both English and Traditional Chinese
- Location permissions are required for core functionality
- The app gracefully degrades when APIs are unavailable
