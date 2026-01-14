import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ItemsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowRequest, setBorrowRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestForm, setRequestForm] = useState({ days: 7, paymentMethod: 'cash', amount: 0, notes: '' });
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userId = localStorage.getItem('userId');
        setCurrentUserId(userId);
        
        const response = await fetch('http://localhost:5000/api/items', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Available Items</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading items...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600 text-lg">No items available yet</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            List Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📦</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                <p className="text-xs text-gray-500 mt-2">Owner: {item.owner?.name || 'Unknown'}</p>
                
                {/* Check if user is the owner */}
                {item.owner?._id === currentUserId || item.owner === currentUserId ? (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-semibold">⚠️ You listed this item</p>
                    <p className="text-yellow-700 text-xs mt-1">You cannot borrow your own item</p>
                  </div>
                ) : (
                    <div className="flex justify-between items-center mt-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRequestModal(true);
                          setRequestForm({ days: 7, paymentMethod: 'cash', amount: 0, notes: '' });
                        }}
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm`}
                      >
                        Request Borrow
                      </button>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Request to borrow: {selectedItem.name}</h3>
            <label className="block text-sm mb-1">Duration (days)</label>
            <input type="number" value={requestForm.days} onChange={(e)=>setRequestForm({...requestForm, days: parseInt(e.target.value)})} className="w-full border p-2 rounded mb-3" />
            <label className="block text-sm mb-1">Payment method</label>
            <select value={requestForm.paymentMethod} onChange={(e)=>setRequestForm({...requestForm, paymentMethod: e.target.value})} className="w-full border p-2 rounded mb-3">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
            {requestForm.paymentMethod !== 'cash' && (
              <>
                <label className="block text-sm mb-1">Amount (INR)</label>
                <input type="number" value={requestForm.amount} onChange={(e)=>setRequestForm({...requestForm, amount: parseFloat(e.target.value)})} className="w-full border p-2 rounded mb-3" />
              </>
            )}
            <label className="block text-sm mb-1">Notes</label>
            <textarea value={requestForm.notes} onChange={(e)=>setRequestForm({...requestForm, notes: e.target.value})} className="w-full border p-2 rounded mb-3" />
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 rounded border" onClick={()=>{setShowRequestModal(false); setSelectedItem(null);}}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={async ()=>{
                try{
                  if(requestForm.paymentMethod !== 'cash' && (!requestForm.amount || requestForm.amount <= 0)){
                    alert('Please enter a valid amount for non-cash payments');
                    return;
                  }
                  const token = localStorage.getItem('token');
                  const expectedReturnDate = new Date(Date.now() + requestForm.days * 24 * 60 * 60 * 1000);
                  const response = await fetch('http://localhost:5000/api/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ itemId: selectedItem._id, borrowDate: new Date(), returnDate: expectedReturnDate, notes: requestForm.notes, requestedDurationDays: requestForm.days, payment: { method: requestForm.paymentMethod, amount: requestForm.amount } })
                  });
                  const data = await response.json();
                  if(response.ok){
                    alert('Borrow request sent');
                    setBorrowRequest(selectedItem._id);
                    setShowRequestModal(false);
                    setSelectedItem(null);
                  } else {
                    alert('Error: ' + (data.message || 'Failed'));
                  }
                }catch(err){
                  alert('Error: ' + err.message);
                }
              }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
