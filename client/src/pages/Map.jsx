import { useEffect, useState, useRef } from 'react'; // <-- Import useRef
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas'; // <-- Import html2canvas

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
    const [position, setPosition] = useState([51.505, -0.09]);
    // 1. Create a ref for the map container
    const mapContainerRef = useRef(null); 

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.error('Error getting location:', err);
                }
            );
        }
    }, []);

    // 2. Function to capture and download the map image
    const handleSaveImage = () => {
        if (mapContainerRef.current) {
            // Select the map element (the div containing MapContainer)
            html2canvas(mapContainerRef.current, { 
                useCORS: true, // Needed to properly capture external tiles
                // Ignore the Save Image button itself from the capture
                ignoreElements: (element) => element.id === 'save-image-button', 
            }).then(canvas => {
                // Convert the canvas to a data URL (PNG)
                const image = canvas.toDataURL('image/png');
                
                // Create a temporary link element to trigger the download
                const link = document.createElement('a');
                link.href = image;
                link.download = 'travel-map-snapshot.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    };

    return (
        <div className="h-screen">
            <h1 className="text-3xl font-bold text-travel-dark mb-4">Interactive Map</h1>
            
            {/* Save Image Button */}
            <button
                id="save-image-button" // Used to ignore this element in the capture
                onClick={handleSaveImage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                💾 Save Map Image
            </button>
            
            {/* 3. Attach the ref to the map's container div */}
            <div ref={mapContainerRef} style={{ height: '80vh', width: '100%' }}>
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        // Set crossOrigin to anonymous for tiles to be captured properly by html2canvas
                        crossOrigin="" 
                    />
                    <Marker position={position}>
                        <Popup>You are here!</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default Map;