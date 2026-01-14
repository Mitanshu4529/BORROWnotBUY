import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const CommunityPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(10); // 10km default

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : data.users || []);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    const fetchNearbyMembers = async () => {
      if (location) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/locations/nearby-users?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          const data = await response.json();
          setNearbyMembers(data.users || []);
        } catch (error) {
          console.error('Failed to fetch nearby members:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMembers();
    fetchNearbyMembers();
  }, [location, radius]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Community Members</h1>
          <p className="text-gray-600 mt-2">Total members: {members.length}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-green-800 mb-2">How to Invite Others</h2>
        <p className="text-green-700">
          Share this link with others to join your community: <br />
          <code className="bg-white px-3 py-2 rounded mt-2 inline-block">
            http://localhost:3000
          </code>
        </p>
        <p className="text-green-700 mt-4">
          🌍 Once they sign up with their phone number and OTP, they'll automatically join the community and be able to borrow/lend items!
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-blue-800 mb-4">🎯 Nearby Community (Auto-Discovery)</h2>
        <p className="text-blue-700 mb-4">
          Members within <strong>{radius}km</strong> of your location will automatically appear here based on GPS.
        </p>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="font-semibold">{radius}km</span>
          </label>
          {location && (
            <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded">
              ✓ Your location: ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading nearby members...</p>
      ) : nearbyMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg mb-8">
          <p className="text-gray-600 text-lg">No nearby members yet within {radius}km</p>
          <p className="text-gray-500 mt-2">Try increasing the radius or wait for others to join!</p>
        </div>
      ) : (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Members Near You ({nearbyMembers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                    <p className="text-gray-600 text-sm">{member.phone}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 text-sm">Trust Score</span>
                    <span className="text-2xl font-bold text-green-600">{member.trustScore || 50}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Items Lent</p>
                      <p className="text-xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-gray-600">Items Borrowed</p>
                      <p className="text-xl font-bold text-purple-600">0</p>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t-2 pt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">All Community Members ({members.length})</h3>
        {members.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No members yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                    <p className="text-gray-600 text-sm">{member.phone}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 text-sm">Trust Score</span>
                    <span className="text-2xl font-bold text-green-600">{member.trustScore || 50}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Items Lent</p>
                      <p className="text-xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-gray-600">Items Borrowed</p>
                      <p className="text-xl font-bold text-purple-600">0</p>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
