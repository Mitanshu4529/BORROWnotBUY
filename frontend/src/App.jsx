import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Common/Header';
import { OTPForm } from './components/Auth/OTPForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ItemsPage } from './pages/ItemsPage';
import { BorrowsPage } from './pages/BorrowsPage';
import { CommunityPage } from './pages/CommunityPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<OTPForm />} />
              <Route path="/login" element={<OTPForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/borrows" element={<BorrowsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
