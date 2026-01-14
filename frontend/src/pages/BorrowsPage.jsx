import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const BorrowsPage = () => {
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowed'); // 'borrowed' or 'requests'

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        // Fetch user's borrows
        const response = await fetch('http://localhost:5000/api/borrows/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setBorrows(Array.isArray(data) ? data : data.borrows || []);

        // Fetch received borrow requests
        const requestResponse = await fetch('http://localhost:5000/api/borrows/received', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const requestData = await requestResponse.json();
        setReceivedRequests(Array.isArray(requestData) ? requestData : requestData.borrows || []);
      } catch (error) {
        console.error('Failed to fetch borrows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrows();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Borrow Management</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`pb-4 px-6 font-semibold text-lg transition ${
            activeTab === 'borrowed'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📥 Items I'm Borrowing ({borrows.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-6 font-semibold text-lg transition ${
            activeTab === 'requests'
              ? 'border-b-4 border-orange-600 text-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Borrow Requests for My Items ({receivedRequests.length})
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        <>
          {/* Items I'm Borrowing */}
          {activeTab === 'borrowed' && (
            <div>
              {borrows.length === 0 ? (
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
                  {borrows.map((borrow) => (
                    <div key={borrow._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-600">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{borrow.item?.name}</h3>
                          <p className="text-gray-600 text-sm">From: <span className="font-bold">{borrow.lender?.name}</span></p>
                          <p className="text-gray-600 text-xs mt-1">Phone: {borrow.lender?.phone}</p>
                          {borrow.lender?.upi && ( 
                            <p className="text-gray-600 text-xs mt-1">UPI: <span className="font-semibold">{borrow.lender.upi}</span></p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          borrow.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          borrow.status === 'returned' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {borrow.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Borrowed on</p>
                          <p className="font-semibold">{new Date(borrow.borrowDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Return by</p>
                          <p className="font-semibold">{new Date(borrow.expectedReturnDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {borrow.status === 'active' && (
                        <button onClick={async ()=>{
                          try{
                            const res = await fetch(`http://localhost:5000/api/borrows/${borrow._id}/return`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                              body: JSON.stringify({ condition: 'ok', comment: 'Returned via app' })
                            });
                            const data = await res.json();
                            if(res.ok){ alert('Marked returned'); window.location.reload(); } else alert('Error: ' + (data.message || 'Failed'));
                          }catch(err){ alert('Error: '+err.message) }
                        }} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Mark as Returned</button>
                      )}
                      {(borrow.status === 'approved' || borrow.status === 'active') && borrow.payment && borrow.payment.method && borrow.payment.method !== 'cash' && (
                        <button onClick={async ()=>{
                          try{
                            const res = await fetch('http://localhost:5000/api/payments/order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                              body: JSON.stringify({ borrowId: borrow._id, amount: borrow.payment.amount || 0 })
                            });
                            const data = await res.json();
                            if(!res.ok){ alert('Error: '+(data.message||'Failed')); return; }
                            const order = data.order;
                            const payment = data.payment;
                            if(payment && payment.provider === 'mock'){
                              // Confirm mock payment via server so notifications/borrow state update
                              try{
                                const conf = await fetch('http://localhost:5000/api/payments/confirm', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                  body: JSON.stringify({ razorpay_order_id: order.id })
                                });
                                const confData = await conf.json();
                                if(conf.ok || confData.message){
                                  alert('Payment recorded (mock)');
                                  window.location.reload();
                                  return;
                                }
                              }catch(e){ console.warn('Mock confirm failed', e); alert('Mock payment recorded, but confirmation failed.'); window.location.reload(); return; }
                            }
                            // Razorpay checkout
                            if(!window.Razorpay){
                              await new Promise((resolve, reject)=>{
                                const s = document.createElement('script');
                                s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
                              });
                            }
                            const options = {
                              key: process.env.REACT_APP_RAZORPAY_KEY || '',
                              amount: order.amount,
                              currency: order.currency || 'INR',
                              name: 'Borrow, Not Buy',
                              description: 'Item payment',
                              order_id: order.id,
                              handler: async function (response){
                                try{
                                  const res = await fetch('http://localhost:5000/api/payments/confirm', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature })
                                  });
                                  const data = await res.json();
                                  if(res.ok){
                                    alert('Payment recorded successfully');
                                    window.location.reload();
                                  } else {
                                    alert('Payment verification failed: ' + (data.message||''));
                                  }
                                }catch(err){ alert('Error confirming payment: '+err.message) }
                              },
                              prefill: { name: borrow.borrower?.name, contact: borrow.borrower?.phone },
                            };
                            const rzp = new window.Razorpay(options);
                            rzp.open();
                          }catch(err){ alert('Error: '+err.message) }
                        }} className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Pay Now</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Borrow Requests Received */}
          {activeTab === 'requests' && (
            <div>
              {receivedRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600 text-lg">No borrow requests yet</p>
                  <p className="text-gray-500 mt-2">When people request to borrow your items, they'll appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-orange-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Item & Requester Info */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">📦 {request.item?.name}</h3>
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-3">
                            <h4 className="font-bold text-orange-800 mb-3">👤 Requested by:</h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-semibold text-gray-700">Name:</span>{' '}
                                <span className="text-blue-600 font-bold">{request.borrower?.name}</span>
                              </p>
                              <p>
                                <span className="font-semibold text-gray-700">Phone:</span>{' '}
                                <span className="text-gray-600">{request.borrower?.phone}</span>
                              </p>
                              <p>
                                <span className="font-semibold text-gray-700">Trust Score:</span>{' '}
                                <span className={request.borrower?.trustScore >= 70 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                  {request.borrower?.trustScore || 50}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Request Details & Actions */}
                        <div>
                          <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-600 text-sm">Request Date</p>
                              <p className="text-lg font-bold text-gray-800">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-blue-600 text-sm font-semibold">Expected Return</p>
                              <p className="text-lg font-bold text-blue-800">
                                {new Date(request.expectedReturnDate).toLocaleDateString()}
                              </p>
                            </div>

                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex gap-2 mt-4">
                            {request.status === 'pending' && (
                              <>
                                <button onClick={async ()=>{
                                  const days = parseInt(prompt('Enter approved duration in days', request.requestedDurationDays || 7)) || request.requestedDurationDays || 7;
                                  const method = prompt('Payment method (cash/card/upi)', request.payment?.method || 'cash') || request.payment?.method || 'cash';
                                  let amount = request.payment?.amount || 0;
                                  if(method !== 'cash'){
                                    amount = parseFloat(prompt('Enter amount (INR)', amount)) || amount;
                                  }
                                  try{
                                    const res = await fetch(`http://localhost:5000/api/borrows/${request._id}/approve`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                      body: JSON.stringify({ approved: true, approvedDurationDays: days, approvedPayment: { method, amount } })
                                    });
                                    const data = await res.json();
                                    if(res.ok){
                                      alert('Approved');
                                      window.location.reload();
                                    } else alert('Error: ' + (data.message || 'Failed'));
                                  }catch(err){ alert('Error: '+err.message) }
                                }} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                                  ✓ Approve
                                </button>
                                <button onClick={async ()=>{
                                  const reason = prompt('Reason for rejection (optional)') || '';
                                  try{
                                    const res = await fetch(`http://localhost:5000/api/borrows/${request._id}/approve`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                      body: JSON.stringify({ approved: false, reason })
                                    });
                                    const data = await res.json();
                                    if(res.ok){ alert('Rejected'); window.location.reload(); } else alert('Error: ' + (data.message || 'Failed'));
                                  }catch(err){ alert('Error: '+err.message) }
                                }} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                                  ✕ Reject
                                </button>
                              </>
                            )}
                            {request.status === 'active' && (
                              <button onClick={async ()=>{
                                try{
                                  const res = await fetch(`http://localhost:5000/api/borrows/${request._id}/return`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify({ condition: 'ok', comment: 'Returned via app' })
                                  });
                                  const data = await res.json();
                                  if(res.ok){ alert('Marked returned'); window.location.reload(); } else alert('Error: ' + (data.message || 'Failed'));
                                }catch(err){ alert('Error: '+err.message) }
                              }} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                                ✓ Mark as Returned
                              </button>
                            )}
                          </div>
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
