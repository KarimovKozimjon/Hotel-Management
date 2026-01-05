import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GuestAuthProvider } from './context/GuestAuthContext';
import PrivateRoute from './components/PrivateRoute';
import GuestPrivateRoute from './components/GuestPrivateRoute';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import RoomsPage from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';
import GuestsPage from './pages/GuestsPage';
import PaymentsPage from './pages/PaymentsPage';
import ServicesPage from './pages/ServicesPage';
import RoomTypesPage from './pages/RoomTypesPage';
import UsersPage from './pages/UsersPage';
import ReviewsPage from './pages/ReviewsPage';
import ReportsPage from './pages/ReportsPage';
import DiscountsPage from './pages/DiscountsPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import GuestDetailsPage from './pages/GuestDetailsPage';
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
            <Route path="/rooms" element={
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
            <Route
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/rooms" element={<RoomsPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/guests/:id" element={<GuestDetailsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/room-types" element={<RoomTypesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/discounts" element={<DiscountsPage />} />
              <Route path="/messages" element={<ContactMessagesPage />} />
            </Route>

            {/* Guest routes */}
            <Route path="/guest/login" element={<GuestLogin />} />
            <Route path="/guest/register" element={<GuestRegister />} />
            <Route path="/guest/dashboard" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <GuestDashboard />
                </GuestLayout>
              </GuestPrivateRoute>
            } />
            <Route path="/guest/my-bookings" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <MyBookingsPage />
                </GuestLayout>
              </GuestPrivateRoute>
            } />
            <Route path="/guest/book-room" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <BookRoomPage />
                </GuestLayout>
              </GuestPrivateRoute>
            } />
            <Route path="/guest/profile" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <GuestProfile />
                </GuestLayout>
              </GuestPrivateRoute>
            } />
            <Route path="/guest/change-password" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <ChangePassword />
                </GuestLayout>
              </GuestPrivateRoute>
            } />

            <Route path="/guest/payment-history" element={
              <GuestPrivateRoute>
                <GuestLayout>
                  <PaymentHistory />
                </GuestLayout>
              </GuestPrivateRoute>
            } />
          </Routes>
        </Router>
      </GuestAuthProvider>
    </AuthProvider>
  );
}

export default App;
