import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import RoomsPage from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';
import GuestsPage from './pages/GuestsPage';
import PaymentsPage from './pages/PaymentsPage';
import ServicesPage from './pages/ServicesPage';
import RoomTypesPage from './pages/RoomTypesPage';
import UsersPage from './pages/UsersPage';
import ReviewsPage from './pages/ReviewsPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/rooms" element={
            <PrivateRoute>
              <RoomsPage />
            </PrivateRoute>
          } />
          <Route path="/bookings" element={
            <PrivateRoute>
              <BookingsPage />
            </PrivateRoute>
          } />
          <Route path="/guests" element={
            <PrivateRoute>
              <GuestsPage />
            </PrivateRoute>
          } />
          <Route path="/payments" element={
            <PrivateRoute>
              <PaymentsPage />
            </PrivateRoute>
          } />
          <Route path="/services" element={
            <PrivateRoute>
              <ServicesPage />
            </PrivateRoute>
          } />
          <Route path="/room-types" element={
            <PrivateRoute>
              <RoomTypesPage />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="/reviews" element={
            <PrivateRoute>
              <ReviewsPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
