import { useEffect, useState } from "react";
import axios from "axios";

const Solo = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error getting location:", err)
      );
    }
  }, []);

  useEffect(() => {
    if (currentPosition) fetchNearbyUsers();
  }, [currentPosition]);

  const fetchNearbyUsers = async () => {
    if (!currentPosition) return;
    try {
      const res = await axios.get("/api/users/nearby", {
        params: { lat: currentPosition.lat, lng: currentPosition.lng },
      });
      setNearbyUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching nearby users:", e);
      setNearbyUsers([]);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-travel-dark mb-4">Nearby Solo Travelers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            {user.socialLink && (
              <a href={user.socialLink} target="_blank" rel="noopener noreferrer" className="text-travel-blue hover:underline">
                View Profile
              </a>
            )}
          </div>
        ))}
      </div>
      {nearbyUsers.length === 0 && (
        <p className="text-gray-600 mt-4">No nearby travelers found within 10km.</p>
      )}
    </div>
  );
};

export default Solo;
