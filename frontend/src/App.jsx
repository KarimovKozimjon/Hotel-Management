import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GuestAuthProvider } from './context/GuestAuthContext';
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
import GuestLogin from './components/guest/GuestLogin';
import GuestRegister from './components/guest/GuestRegister';
import GuestLayout from './components/guest/GuestLayout';
import GuestDashboard from './pages/guest/GuestDashboard';
import MyBookingsPage from './pages/guest/MyBookingsPage';
import GuestProfile from './pages/guest/GuestProfile';
import BookRoomPage from './pages/guest/BookRoomPage';
import ChangePassword from './pages/guest/ChangePassword';
import PaymentHistory from './pages/guest/PaymentHistory';
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import PublicRoomsPage from './pages/public/PublicRoomsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <GuestAuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            } />
            <Route path="/public/rooms" element={
              <PublicLayout>
                <PublicRoomsPage />
              </PublicLayout>
            } />
            <Route path="/public/about" element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            } />
            <Route path="/public/contact" element={
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            } />

            {/* Staff routes */}
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

            {/* Guest routes */}
            <Route path="/guest/login" element={<GuestLogin />} />
            <Route path="/guest/register" element={<GuestRegister />} />
            <Route path="/guest/dashboard" element={
              <GuestLayout>
                <GuestDashboard />
              </GuestLayout>
            } />
            <Route path="/guest/my-bookings" element={
              <GuestLayout>
                <MyBookingsPage />
              </GuestLayout>
            } />
            <Route path="/guest/book-room" element={
              <GuestLayout>
                <BookRoomPage />
              </GuestLayout>
            } />
            <Route path="/guest/profile" element={
              <GuestLayout>
                <GuestProfile />
              </GuestLayout>
            } />
            <Route path="/guest/change-password" element={
              <GuestLayout>
                <ChangePassword />
              </GuestLayout>
            } />
            <Route path="/guest/payment-history" element={
              <GuestLayout>
                <PaymentHistory />
              </GuestLayout>
            } />
          </Routes>
        </Router>
      </GuestAuthProvider>
    </AuthProvider>
  );
}

export default App;
