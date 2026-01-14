import { useEffect, useState } from 'react';
import api from '../services/api';

export const NotificationsPage = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/notifications');
        setNotes(res.data.notifications || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n._id} className={`p-4 rounded border ${n.read ? 'bg-gray-50' : 'bg-white shadow'}`}>
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{n.type}</p>
                <p className="text-sm text-gray-600">{JSON.stringify(n.data)}</p>
              </div>
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
