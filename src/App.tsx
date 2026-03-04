import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const StandDetailPage = lazy(() => import('./pages/StandDetailPage'));
const AddStandPage = lazy(() => import('./pages/AddStandPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RoutePage = lazy(() => import('./pages/RoutePage'));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const EditStandPage = lazy(() => import('./pages/EditStandPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminPendingPage = lazy(() => import('./pages/admin/PendingPage'));
const AdminManageStandsPage = lazy(() => import('./pages/admin/ManageStandsPage'));
const AdminAddStandPage = lazy(() => import('./pages/admin/AddStandPage'));
const AdminSponsorsPage = lazy(() => import('./pages/admin/SponsorsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Loader2 className="w-8 h-8 text-forest animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Admin routes — no Header/Footer */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/pending" element={<AdminRoute><AdminPendingPage /></AdminRoute>} />
          <Route path="/admin/stands" element={<AdminRoute><AdminManageStandsPage /></AdminRoute>} />
          <Route path="/admin/add" element={<AdminRoute><AdminAddStandPage /></AdminRoute>} />
          <Route path="/admin/sponsors" element={<AdminRoute><AdminSponsorsPage /></AdminRoute>} />

          {/* Public routes */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/stand/:id" element={<StandDetailPage />} />
                  <Route path="/stand/:id/edit" element={<ProtectedRoute><EditStandPage /></ProtectedRoute>} />
                  <Route path="/add" element={<AddStandPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/route" element={<RoutePage />} />
                  <Route path="/advertise" element={<AdvertisePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}
