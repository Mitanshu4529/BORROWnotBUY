import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: '', description: '', category: 'Tools' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getUserStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm uppercase tracking-wide mb-1">Trust Score</p>
            <p className="text-5xl font-bold">{stats?.trustScore || user?.trustScore}</p>
            <p className="text-xs mt-2 opacity-90">Community trusted rating</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm uppercase tracking-wide mb-1">Total Borrows</p>
            <p className="text-5xl font-bold">{stats?.totalBorrows || 0}</p>
            <p className="text-xs mt-2 opacity-90">Items borrowed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm uppercase tracking-wide mb-1">Total Lends</p>
            <p className="text-5xl font-bold">{stats?.totalLends || 0}</p>
            <p className="text-xs mt-2 opacity-90">Items lent</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm uppercase tracking-wide mb-1">Member Since</p>
            <p className="text-lg font-bold">
              {stats?.joinedDate
                ? new Date(stats.joinedDate).toLocaleDateString()
                : 'Today'}
            </p>
            <p className="text-xs mt-2 opacity-90">Community member</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => setShowItemModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              📦 List New Item
            </button>
            <button 
              onClick={() => navigate('/items')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              🔍 Search Items
            </button>
            <button 
              onClick={() => navigate('/borrows')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
            >
              📋 My Active Borrows
            </button>
            <button 
              onClick={() => navigate('/community')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
            >
              👥 Community Members
            </button>
            <button 
              onClick={() => navigate('/transactions')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              💳 My Transactions
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Sustainability Impact</h2>
          <p className="text-gray-600 mb-4">
            By borrowing instead of buying, you're helping reduce waste and build community.
          </p>
          <div className="text-center py-6 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {(stats?.totalBorrows || 0) + (stats?.totalLends || 0)} items
            </p>
            <p className="text-gray-600 text-sm">shared in community</p>
          </div>
        </div>
      </div>

      {/* Modal for listing new item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">List New Item</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await fetch('http://localhost:5000/api/items', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(newItemData),
                  });
                  setShowItemModal(false);
                  setNewItemData({ name: '', description: '', category: 'Tools' });
                  alert('Item listed successfully!');
                  window.location.reload();
                } catch (error) {
                  alert('Failed to list item: ' + error.message);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItemData.category}
                  onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Tools">Tools</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Sports">Sports</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  List Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
