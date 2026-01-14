import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const [lentItems, setLentItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [listedItems, setListedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lent');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const currentUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        // Fetch all borrows
        const borrowResponse = await fetch('http://localhost:5000/api/borrows/history', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const borrowData = await borrowResponse.json();
        const borrows = Array.isArray(borrowData) ? borrowData : borrowData.borrows || [];

        // Separate lent and borrowed items
        const lent = borrows.filter(b => b.lender?._id === currentUserId || b.lender === currentUserId);
        const borrowed = borrows.filter(b => b.borrower?._id === currentUserId || b.borrower === currentUserId);

        setLentItems(lent);
        setBorrowedItems(borrowed);

        // Fetch user's listed items
        const itemsResponse = await fetch('http://localhost:5000/api/items', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const itemsData = await itemsResponse.json();
        const allItems = Array.isArray(itemsData) ? itemsData : itemsData.items || [];

        const userItems = allItems.filter(item => item.owner?._id === currentUserId || item.owner === currentUserId);

        const enrichedItems = userItems.map(item => {
          const activeBorrow = borrows.find(b => b.item?._id === item._id && b.status === 'active');
          const lastBorrow = borrows.find(b => b.item?._id === item._id && b.status === 'returned');
          return { ...item, currentBorrow: activeBorrow, lastBorrow: lastBorrow };
        });

        setListedItems(enrichedItems);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const daysUntilDue = (date) => {
    const today = new Date();
    const due = new Date(date);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Transactions</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b-2 border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lent')}
          className={`pb-4 px-6 font-semibold text-lg transition whitespace-nowrap ${
            activeTab === 'lent'
              ? 'border-b-4 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📤 Items I Lent ({lentItems.length})
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`pb-4 px-6 font-semibold text-lg transition whitespace-nowrap ${
            activeTab === 'borrowed'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📥 Items I Borrowed ({borrowedItems.length})
        </button>
        <button
          onClick={() => setActiveTab('listed')}
          className={`pb-4 px-6 font-semibold text-lg transition whitespace-nowrap ${
            activeTab === 'listed'
              ? 'border-b-4 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 My Listed Items ({listedItems.length})
        </button>
      </div>

      {loading ? (
        <p className="text-center py-12">Loading transactions...</p>
      ) : (
        <>
          {activeTab === 'lent' && (
            <div>
              {lentItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600 text-lg">You haven't lent any items yet</p>
                  <p className="text-gray-500 mt-2">List items and wait for borrowers to request them!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lentItems.map((t) => (
                    <div key={t._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">📦 {t.item?.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{t.item?.description}</p>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">Lent to:</span>{' '}
                              <span className="text-blue-600 font-bold">{t.borrower?.name}</span>
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span> {t.borrower?.phone}
                            </p>
                            <p>
                              <span className="font-semibold">Trust Score:</span>{' '}
                              <span className={t.borrower?.trustScore >= 70 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                {t.borrower?.trustScore || 50}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-gray-600 text-sm">Lent on</p>
                            <p className="font-bold">{formatDate(t.borrowDate)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-gray-600 text-sm">Expected return</p>
                            <p className="font-bold">{formatDate(t.expectedReturnDate)}</p>
                            {t.status === 'active' && (
                              <p
                                className={`text-sm mt-2 ${
                                  daysUntilDue(t.expectedReturnDate) <= 0 ? 'text-red-600' : 'text-green-600'
                                } font-semibold`}
                              >
                                {daysUntilDue(t.expectedReturnDate) > 0
                                  ? `${daysUntilDue(t.expectedReturnDate)} days left`
                                  : 'OVERDUE!'}
                              </p>
                            )}
                          </div>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(t.status)}`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div>
              {borrowedItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600 text-lg">You haven't borrowed any items yet</p>
                  <button
                    onClick={() => navigate('/items')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Search Items to Borrow
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {borrowedItems.map((t) => (
                    <div key={t._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">📦 {t.item?.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{t.item?.description}</p>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">From:</span>{' '}
                              <span className="text-green-600 font-bold">{t.lender?.name}</span>
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span> {t.lender?.phone}
                            </p>
                            <p>
                              <span className="font-semibold">Trust Score:</span>{' '}
                              <span className={t.lender?.trustScore >= 70 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                {t.lender?.trustScore || 50}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-gray-600 text-sm">Borrowed on</p>
                            <p className="font-bold">{formatDate(t.borrowDate)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-gray-600 text-sm">Must return by</p>
                            <p className="font-bold">{formatDate(t.expectedReturnDate)}</p>
                            {t.status === 'active' && (
                              <p
                                className={`text-sm mt-2 ${
                                  daysUntilDue(t.expectedReturnDate) <= 0 ? 'text-red-600' : 'text-green-600'
                                } font-semibold`}
                              >
                                {daysUntilDue(t.expectedReturnDate) > 0
                                  ? `${daysUntilDue(t.expectedReturnDate)} days left`
                                  : 'OVERDUE!'}
                              </p>
                            )}
                          </div>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(t.status)}`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'listed' && (
            <div>
              {listedItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600 text-lg">You haven't listed any items yet</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    📦 List an Item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {listedItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">📦 {item.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">Category:</span> {item.category}
                            </p>
                            <p>
                              <span className="font-semibold">Listed:</span> {formatDate(item.createdAt)}
                            </p>
                            <p>
                              <span className="font-semibold">Status:</span>{' '}
                              <span className={item.currentBorrow ? 'text-orange-600 font-bold' : 'text-green-600 font-bold'}>
                                {item.currentBorrow ? 'Borrowed' : 'Available'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div>
                          {item.currentBorrow ? (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-3">
                              <h4 className="font-bold text-orange-800 mb-3">👤 Borrowed by:</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-semibold">Name:</span>{' '}
                                  <span className="text-blue-600 font-bold">{item.currentBorrow.borrower?.name}</span>
                                </p>
                                <p>
                                  <span className="font-semibold">Phone:</span> {item.currentBorrow.borrower?.phone}
                                </p>
                                <p>
                                  <span className="font-semibold">Trust:</span>{' '}
                                  <span className={item.currentBorrow.borrower?.trustScore >= 70 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                    {item.currentBorrow.borrower?.trustScore || 50}
                                  </span>
                                </p>
                              </div>
                              <div className="mt-3 bg-blue-50 p-3 rounded">
                                <p className="text-blue-600 font-semibold text-sm">
                                  Due: {formatDate(item.currentBorrow.expectedReturnDate)}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    daysUntilDue(item.currentBorrow.expectedReturnDate) <= 0
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  } font-semibold`}
                                >
                                  {daysUntilDue(item.currentBorrow.expectedReturnDate) > 0
                                    ? `${daysUntilDue(item.currentBorrow.expectedReturnDate)} days left`
                                    : 'OVERDUE!'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-3">
                              <p className="text-green-800 font-semibold text-sm">✓ Available</p>
                              <p className="text-green-700 text-xs mt-1">Waiting for borrowers...</p>
                            </div>
                          )}
                          <button
                            onClick={async () => {
                              if (window.confirm('Remove this item from listings?')) {
                                try {
                                  const response = await fetch(`http://localhost:5000/api/items/${item._id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                  });
                                  if (response.ok) {
                                    alert('Item removed from listings');
                                    setListedItems(listedItems.filter((i) => i._id !== item._id));
                                  } else {
                                    alert('Error removing item');
                                  }
                                } catch (error) {
                                  alert('Error: ' + error.message);
                                }
                              }
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            🗑️ Remove from Listings
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
