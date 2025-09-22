# Google Maps Integration Setup

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials → API Key
5. Restrict your API key (recommended for production):
   - Application restrictions: HTTP referrers
   - API restrictions: Select the APIs you enabled

### 2. ✅ API Key Already Configured!

Your Google Maps API key has been configured in the application. The map should work immediately!

### 3. Test the Integration
1. Start your React development server: `npm start`
2. Open the add customer modal
3. You should see a Google Map instead of the placeholder
4. Click on the map to select a location
5. The coordinates and address should auto-fill

## Features

✅ **Interactive Google Maps**: Real Google Maps with full navigation  
✅ **Location Selection**: Click anywhere on the map to select a location  
✅ **Reverse Geocoding**: Automatically gets the address from coordinates  
✅ **Auto-fill Form**: Coordinates and address automatically populate the form  
✅ **Clear Selection**: Easy way to clear and re-select locations  
✅ **Custom Marker**: Red marker shows selected location  
✅ **Cairo Default**: Map centers on Cairo, Egypt by default  

## Troubleshooting

- **Map not loading**: Check your API key and make sure Maps JavaScript API is enabled
- **Geocoding not working**: Enable Geocoding API in Google Cloud Console
- **CORS errors**: Make sure your domain is added to API key restrictions

## Security Notes

- Always restrict your API key in production
- Consider using environment variables instead of hardcoding the key
- Monitor your API usage to avoid unexpected charges