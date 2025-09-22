import React, { useState, useRef, useEffect } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { MapPin, X, Search } from 'lucide-react';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyA0u-17fM-AgBUwZIwXpjzWeNFhNgBV8wQ';

console.log('🔑 Using Google Maps API Key:', GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');

const MapComponent = ({ 
  center, 
  zoom, 
  onLocationSelect, 
  selectedLocation, 
  onClearSelection 
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (mapRef.current && !map) {
      console.log('🗺️ Initializing Google Map...');
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1f2937' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#374151' }]
          }
        ]
      });

      // Initialize geocoder
      geocoderRef.current = new window.google.maps.Geocoder();

      // Add click listener
      newMap.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        console.log('🗺️ Map clicked at:', { lat, lng });
        
        // Get detailed address and place information
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            let locationData = {
              lat,
              lng,
              address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              city: '',
              country: '',
              postalCode: '',
              phone: '',
              name: '',
              industry: ''
            };
            
            console.log('🌍 Geocoding status:', status);
            
            if (status === 'OK' && results[0]) {
              const result = results[0];
              locationData.address = result.formatted_address;
              console.log('📍 Geocoding result:', result);
              
              // Extract detailed address components
              result.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                  locationData.city = component.long_name;
                } else if (types.includes('country')) {
                  locationData.country = component.long_name;
                } else if (types.includes('postal_code')) {
                  locationData.postalCode = component.long_name;
                }
              });
              
              // Send basic location data immediately (this ensures form gets populated)
              console.log('📤 Sending basic locationData:', locationData);
              onLocationSelect(locationData);
              
              // Try to get place details if it's a business (as enhancement)
              if (result.place_id) {
                const service = new window.google.maps.places.PlacesService(newMap);
                service.getDetails(
                  {
                    placeId: result.place_id,
                    fields: ['name', 'formatted_phone_number', 'types', 'business_status']
                  },
                  (place, placeStatus) => {
                    if (placeStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
                      // If it's a business/store, populate name and phone
                      if (place.types && (
                        place.types.includes('store') ||
                        place.types.includes('supermarket') ||
                        place.types.includes('grocery_or_supermarket') ||
                        place.types.includes('establishment')
                      )) {
                        // Create enhanced data with business info
                        const enhancedData = {
                          ...locationData,
                          name: place.name || '',
                          phone: place.formatted_phone_number || ''
                        };
                        
                        // Auto-detect industry based on place types
                        if (place.types.includes('supermarket') || place.types.includes('grocery_or_supermarket')) {
                          enhancedData.industry = 'Supermarket';
                        } else if (place.types.includes('convenience_store')) {
                          enhancedData.industry = 'Convenience Store';
                        } else if (place.types.includes('department_store')) {
                          enhancedData.industry = 'Retail';
                        } else if (place.types.includes('store') || place.types.includes('establishment')) {
                          enhancedData.industry = 'Retail';
                        }
                        
                        console.log('📤 Sending enhanced locationData:', enhancedData);
                        onLocationSelect(enhancedData);
                      }
                    }
                  }
                );
              }
            } else {
              console.log('📤 Sending locationData (geocoding failed):', locationData);
              onLocationSelect(locationData);
            }
          }
        );
      });

      setMap(newMap);
      console.log('✅ Google Map initialized successfully');
      
      // Initialize Places Autocomplete after map is ready
      if (searchInputRef.current && !autocompleteRef.current) {
        console.log('🔍 Initializing Places Autocomplete...');
        autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'eg' }, // Restrict to Egypt, change as needed
        });
        
        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          console.log('📍 Place selected from search:', place);
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Create location data from the selected place
            const locationData = {
              lat,
              lng,
              address: place.formatted_address || place.name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              city: '',
              country: '',
              postalCode: '',
              phone: place.formatted_phone_number || '',
              name: place.name || '',
              industry: ''
            };
            
            // Extract address components
            if (place.address_components) {
              place.address_components.forEach(component => {
                const types = component.types;
                if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                  locationData.city = component.long_name;
                } else if (types.includes('country')) {
                  locationData.country = component.long_name;
                } else if (types.includes('postal_code')) {
                  locationData.postalCode = component.long_name;
                }
              });
            }
            
            // Auto-detect industry based on place types
            if (place.types) {
              if (place.types.includes('supermarket') || place.types.includes('grocery_or_supermarket')) {
                locationData.industry = 'Supermarket';
              } else if (place.types.includes('convenience_store')) {
                locationData.industry = 'Convenience Store';
              } else if (place.types.includes('department_store')) {
                locationData.industry = 'Retail';
              } else if (place.types.includes('store') || place.types.includes('establishment')) {
                locationData.industry = 'Retail';
              }
            }
            
            // Center map on selected location
            newMap.setCenter({ lat, lng });
            newMap.setZoom(17); // Zoom in closer for search results
            
            console.log('📤 Sending search result locationData:', locationData);
            onLocationSelect(locationData);
            
            // Clear search input after selection
            setSearchValue('');
          } else {
            console.warn('⚠️ No geometry found for selected place');
          }
        });
        
        console.log('✅ Places Autocomplete initialized successfully');
      }
    }
  }, [center, zoom, map, onLocationSelect]);

  useEffect(() => {
    if (map && selectedLocation) {
      // Clear existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        map: map,
        title: 'Selected Location',
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3' fill='white'/%3E%3C/svg%3E",
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 30)
        }
      });

      // Center map on selected location
      map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation]);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-600/50">
      {/* Search Input */}
      <div className="absolute top-2 left-2 right-20 z-10">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search locations..."
            className="w-full px-3 py-1.5 pr-8 text-sm bg-white/95 backdrop-blur-sm border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Search size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      <div ref={mapRef} className="w-full h-full" />
      
      {selectedLocation && (
        <div className="absolute bottom-2 left-2 bg-gray-800/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white border border-gray-600/50 shadow-lg">
          <div className="flex items-center space-x-1 mb-1">
            <MapPin size={12} className="text-red-400" />
            <span className="text-red-400 font-medium">Selected Location</span>
          </div>
          <div className="space-y-0.5 text-gray-300">
            <div>Lat: {selectedLocation.lat.toFixed(6)}</div>
            <div>Lng: {selectedLocation.lng.toFixed(6)}</div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <button
          type="button"
          onClick={onClearSelection}
          className="absolute bottom-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

const LoadingComponent = () => (
  <div className="w-full h-64 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500 mx-auto mb-2"></div>
      <p className="text-gray-400 text-sm">Loading Google Maps...</p>
    </div>
  </div>
);

const ErrorComponent = ({ error }) => (
  <div className="w-full h-64 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl border border-red-600/30 flex items-center justify-center">
    <div className="text-center">
      <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-red-400 text-sm font-medium mb-1">Google Maps Error</p>
      <p className="text-gray-400 text-xs">{error?.message || 'Failed to load map'}</p>
      {GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE' && (
        <p className="text-yellow-400 text-xs mt-2">Please configure your Google Maps API key</p>
      )}
    </div>
  </div>
);

const GoogleMapSelector = ({ 
  selectedLocation, 
  onLocationSelect, 
  onClearSelection,
  center = { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt
  zoom = 13 
}) => {
  const render = (status) => {
    switch (status) {
      case 'LOADING':
        return <LoadingComponent />;
      case 'FAILURE':
        return <ErrorComponent error={new Error('Failed to load Google Maps')} />;
      case 'SUCCESS':
        return (
          <MapComponent
            center={center}
            zoom={zoom}
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
            onClearSelection={onClearSelection}
          />
        );
      default:
        return <LoadingComponent />;
    }
  };

  if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE' || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Select Location on Map
        </label>
        <ErrorComponent error={new Error('Google Maps API key not configured')} />
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mt-0.5 flex-shrink-0"></div>
            <div className="text-sm text-yellow-400">
              <p className="font-medium mb-1">Google Maps API Key Required</p>
              <ol className="text-xs space-y-1 text-yellow-300">
                <li>1. Get an API key from <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="underline">Google Maps Platform</a></li>
                <li>2. Enable the Maps JavaScript API</li>
                <li>3. Replace 'YOUR_API_KEY_HERE' in GoogleMapSelector.js with your key</li>
                <li>4. Or set REACT_APP_GOOGLE_MAPS_API_KEY environment variable</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Select Location on Map
        </label>
        {selectedLocation && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      <Wrapper
        apiKey={GOOGLE_MAPS_API_KEY}
        render={render}
        libraries={['places', 'geometry']}
      />
      
      <div className="space-y-2">
        <div className="flex items-start space-x-2 text-xs text-gray-400">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center mt-0.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <p>Search for a location using the search bar or click on the map.</p>
            <p>Address and coordinates will be automatically filled.</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2 text-xs text-blue-400">
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mt-0.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
          <div>
            <p><strong>Search Tips:</strong> Try searching for business names, addresses, or landmarks for best results!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapSelector;