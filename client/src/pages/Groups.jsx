import { useEffect, useState } from 'react';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'interest' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentUserId = 1; // Demo user ID

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      setError('Please enter a group name');
      return;
    }
    try {
      setLoading(true);
      setError('');
      console.log('Creating group:', newGroup);
      const response = await axios.post('/api/groups', newGroup);
      console.log('Group created successfully:', response.data);
      setNewGroup({ name: '', description: '', type: 'interest' });
      await fetchGroups();
      setError('');
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      const errMsg = error.response?.data?.error || error.message;
      setError(errMsg);
      alert('Error creating group: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      setLoading(true);
      setError('');
      console.log('Joining group:', groupId);
      const response = await axios.post(`/api/groups/${groupId}/join`, { userId: currentUserId });
      console.log('Successfully joined group:', response.data);
      await fetchGroups();
      alert('Successfully joined the group!');
    } catch (error) {
      console.error('Error joining group:', error);
      const errMsg = error.response?.data?.error || error.message;
      setError(errMsg);
      alert('Error joining group: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-travel-dark mb-4">Travel Groups</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <p className="text-gray-600 mb-2">{group.description}</p>
            <p className="text-sm text-travel-blue mb-4">Type: {group.type}</p>
            <p className="text-xs text-gray-500 mb-2">Members: {group.members?.length || 0}</p>
            <button
              onClick={() => joinGroup(group.id)}
              disabled={group.members?.some(m => m.id === currentUserId) || loading}
              className={`px-4 py-2 rounded text-white ${
                group.members?.some(m => m.id === currentUserId)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : loading ? 'bg-blue-300 cursor-wait' : 'bg-travel-blue hover:bg-blue-600'
              }`}
            >
              {loading ? 'Processing...' : group.members?.some(m => m.id === currentUserId) ? 'Already Joined' : 'Join Group'}
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          placeholder="Description"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <select
          value={newGroup.type}
          onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="interest">Interest</option>
          <option value="vibe">Vibe</option>
          <option value="destination">Destination</option>
        </select>
        <button
          onClick={createGroup}
          disabled={loading}
          className={`${loading ? 'bg-green-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
};

export default Groups;
