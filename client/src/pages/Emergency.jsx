import { useEffect, useState } from 'react';
import axios from 'axios';

const Emergency = () => {
  const [contacts, setContacts] = useState({});

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const response = await axios.get('/api/emergency');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    }
  };

  const callNumber = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-travel-dark mb-4">Emergency Contacts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(contacts).map(([service, number]) => (
          <div key={service} className="bg-white rounded-lg shadow-md p-4 text-center">
            <h3 className="text-xl font-semibold capitalize mb-2">{service}</h3>
            <p className="text-2xl font-bold text-red-600 mb-4">{number}</p>
            <button
              onClick={() => callNumber(number)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Call Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Emergency;
