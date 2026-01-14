import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <span className="text-2xl font-bold text-green-600">♻️</span>
          <h1 className="text-xl font-bold text-gray-800 ml-2">Borrow, Not Buy</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Trust Score: </span>
              <span className="ml-1 font-bold text-green-600">{user.trustScore}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              {user.name}
            </button>
            <button onClick={() => navigate('/notifications')} className="text-gray-600 hover:text-gray-900 font-medium">
              🔔
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
