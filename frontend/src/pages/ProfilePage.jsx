import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', upi: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        setUser(res.data);
        setForm({ name: res.data.name || '', email: res.data.email || '', upi: res.data.upi || '' });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const save = async () => {
    try {
      const res = await authService.updateProfile(form);
      alert('Profile updated');
      setUser(res.data.user);
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white p-6 rounded shadow-md max-w-xl">
        <label className="block mb-2">Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded mb-4" />
        <label className="block mb-2">Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded mb-4" />
        <label className="block mb-2">UPI ID</label>
        <input value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} placeholder="example@bank" className="w-full border p-2 rounded mb-4" />
        <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Save Profile</button>
      </div>
    </div>
  );
};
