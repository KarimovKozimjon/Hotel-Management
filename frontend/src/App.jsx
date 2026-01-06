import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GuestAuthProvider } from './context/GuestAuthContext';
import PrivateRoute from './components/PrivateRoute';
import GuestPrivateRoute from './components/GuestPrivateRoute';
import Loader from './components/common/Loader';

const Login = lazy(() => import('./components/auth/Login'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));

const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const GuestsPage = lazy(() => import('./pages/GuestsPage'));
const GuestDetailsPage = lazy(() => import('./pages/GuestDetailsPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const RoomTypesPage = lazy(() => import('./pages/RoomTypesPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const DiscountsPage = lazy(() => import('./pages/DiscountsPage'));
const ContactMessagesPage = lazy(() => import('./pages/ContactMessagesPage'));

const GuestLogin = lazy(() => import('./components/guest/GuestLogin'));
const GuestRegister = lazy(() => import('./components/guest/GuestRegister'));
const GuestLayout = lazy(() => import('./components/guest/GuestLayout'));
const GuestDashboard = lazy(() => import('./pages/guest/GuestDashboard'));
const MyBookingsPage = lazy(() => import('./pages/guest/MyBookingsPage'));
const GuestProfile = lazy(() => import('./pages/guest/GuestProfile'));
const BookRoomPage = lazy(() => import('./pages/guest/BookRoomPage'));
const ChangePassword = lazy(() => import('./pages/guest/ChangePassword'));
const PaymentHistory = lazy(() => import('./pages/guest/PaymentHistory'));

const PublicLayout = lazy(() => import('./components/public/PublicLayout'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const PublicRoomsPage = lazy(() => import('./pages/public/PublicRoomsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
import './index.css';

function App() {
  return (
    <AuthProvider>
      <GuestAuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" />
          <Suspense fallback={<Loader fullScreen showText={false} />}>
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
          </Suspense>
        </Router>
      </GuestAuthProvider>
    </AuthProvider>
  );
}

export default App;
