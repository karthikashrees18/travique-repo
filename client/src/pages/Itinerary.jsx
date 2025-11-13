import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Custom Red Marker Icon Definition for Suggested Places ---
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
// -------------------------------------------------------------

const Itinerary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [allNearbyPlaces, setAllNearbyPlaces] = useState({});
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geolocLoading, setGeolocLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('restaurant');

  const categories = {
    // Broader filters to improve results
    restaurant: 'restaurant|fast_food|food_court|pub|bar', 
    cafe: 'cafe|coffee_shop',
    park: 'park',
    museum: 'museum',
    temple: 'temple|church|synagogue|mosque',
    shop: 'shop',
    hotel: 'hotel',
    attraction: 'attraction',
  };

  const categoryEmoji = {
    restaurant: '🍽️',
    cafe: '☕',
    park: '🌳',
    museum: '🏛️',
    temple: '⛪',
    shop: '🛍️',
    hotel: '🏨',
    attraction: '✨',
  };

  /**
   * Fetches nearby places from Overpass API.
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} category - Category key (e.g., 'restaurant')
   * @param {boolean} updateState - Whether to immediately update suggestedPlaces/allNearbyPlaces state.
   */
  const fetchNearbyPlaces = async (lat, lng, category, updateState = true) => {
    // Check for invalid coordinates before fetching
    if (!lat || !lng) {
      console.error("Invalid coordinates received for fetch:", {lat, lng});
      return [];
    }

    if (updateState) setLoading(true);

    try {
      const categoryFilter = categories[category] || 'restaurant';
      const query = `[out:json];
        (
          // Increased radius to 10000 meters (10 km) for better results
          node["amenity"~"${categoryFilter}"](around:10000,${lat},${lng});
          way["amenity"~"${categoryFilter}"](around:10000,${lat},${lng});
        );
        out center 50;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();
      const places = data.elements
        .filter(el => el.lat && el.lon)
        .map((el, idx) => ({
          id: el.id || idx,
          name: el.tags?.name || `${category} #${idx + 1}`,
          lat: el.lat,
          lon: el.lon,
          type: el.tags?.amenity || category,
          description: el.tags?.description || '',
          openingHours: el.tags?.['opening_hours'] || '',
        }))
        .slice(0, 15);

      if (updateState) {
        setSuggestedPlaces(places);
        setAllNearbyPlaces(prev => ({ ...prev, [category]: places }));
      }
      return places; 
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    } finally {
      if (updateState) setLoading(false);
    }
  };

  // --- Initial Location and Data Fetch on Mount ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(coords);
          setMapCenter([coords.lat, coords.lng]);

          const fetchAllAndSetInitial = async (lat, lng) => {
            setLoading(true);
            const fetchedData = {};
            const categoryKeys = Object.keys(categories);
            
            // Fetch all categories concurrently
            const fetchPromises = categoryKeys.map(cat => 
              fetchNearbyPlaces(lat, lng, cat, false) 
            );
            
            const results = await Promise.all(fetchPromises);
            
            categoryKeys.forEach((cat, index) => {
                fetchedData[cat] = results[index];
            });

            setAllNearbyPlaces(fetchedData);
            
            // Set the initial suggested places to the default category's results
            setSuggestedPlaces(fetchedData['restaurant'] || []);
            setLoading(false);
          };

          fetchAllAndSetInitial(coords.lat, coords.lng);
        },
        (err) => console.error('Error getting initial location:', err)
      );
    }
  }, []);
  // -----------------------------------------------------

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
      if (data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Use the already fetched data from allNearbyPlaces
    setSuggestedPlaces(allNearbyPlaces[category] || []);
    setSearchResults([]); // Clear search results when switching category view
  };

  // Handles 'Use my location' button click
  const handleLocateAndFetch = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    try {
      setGeolocLoading(true);
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCurrentLocation(coords);
      setMapCenter([coords.lat, coords.lng]);

      // Fetch and set the results for the currently selected category (updateState=true)
      await fetchNearbyPlaces(coords.lat, coords.lng, selectedCategory, true);
      
      // Re-fetch all categories in the background (updateState=false for background)
      Object.keys(categories).forEach((cat) => fetchNearbyPlaces(coords.lat, coords.lng, cat, false));
    } catch (err) {
      console.error('Error getting location:', err);
      alert('Unable to get your location. Please allow location access and try again.');
    } finally {
      setGeolocLoading(false);
    }
  };

  // markers to display on the map
  const mapMarkers = searchResults.length > 0
    ? searchResults.map((p) => ({ lat: parseFloat(p.lat), lon: parseFloat(p.lon), name: p.display_name }))
    : suggestedPlaces.map((p) => ({ lat: p.lat, lon: p.lon, name: p.name }));


  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-travel-dark mb-2">🗺️ Itinerary Planner</h1>
      <p className="text-gray-600 mb-4">Discover amazing places to visit near you</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: controls + lists */}
        <div className="lg:col-span-1">
          {/* Search Section */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <input
              type="text"
              placeholder="Search for a specific place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={searchPlaces}
                className="flex-1 bg-travel-blue text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Search Place
              </button>
              <button
                onClick={handleLocateAndFetch}
                disabled={geolocLoading}
                className={`bg-white border border-gray-300 px-4 py-2 rounded ${geolocLoading ? 'opacity-60 cursor-wait' : 'hover:bg-gray-100'}`}
              >
                {geolocLoading ? 'Locating...' : 'Use my location'}
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Nearby Categories</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categories).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded capitalize ${
                    selectedCategory === cat
                      ? 'bg-travel-blue text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lists: either search results or nearby places for the selected category */}
          <div>
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-xl font-bold mb-2">🔍 Search Results</h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {searchResults.map((place, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition">
                      <h3 className="font-bold text-travel-dark">{place.display_name?.split(',')[0]}</h3>
                      <p className="text-sm text-gray-600">{place.type}</p>
                      <p className="text-xs text-gray-500 mt-2">{place.display_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-2">📍 Nearby {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>
                {loading && <p className="p-4 text-center text-blue-500">Loading places...</p>}
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {!loading && suggestedPlaces.length === 0 ? (
                    <p className="text-gray-500 p-4">No places found nearby for this category.</p>
                  ) : (
                    suggestedPlaces.map((place, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow hover:shadow-lg transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                              <div className="text-2xl">{categoryEmoji[selectedCategory]}</div>
                              <div>
                                <h4 className="font-semibold">{place.name}</h4>
                                <p className="text-xs text-gray-500">{place.openingHours || place.description}</p>
                              </div>
                          </div>
                          <button className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600">
                             Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: persistent map */}
        <div className="lg:col-span-2">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '80vh', width: '100%', borderRadius: '8px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>📍 Your Location</Popup>
              </Marker>
            )}
            
            {/* Markers for suggested/searched places */}
            {mapMarkers.map((m, i) => (
              <Marker 
                    key={i} 
                    position={[m.lat, m.lon]}
                    // Apply RedIcon if we are showing suggested places (not search results)
                    icon={searchResults.length === 0 ? RedIcon : undefined} 
                >
                <Popup>{m.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;