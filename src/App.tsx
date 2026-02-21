import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import StandDetailPage from './pages/StandDetailPage';
import AddStandPage from './pages/AddStandPage';
import AboutPage from './pages/AboutPage';
import RoutePage from './pages/RoutePage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminPendingPage from './pages/admin/PendingPage';
import AdminManageStandsPage from './pages/admin/ManageStandsPage';
import AdminAddStandPage from './pages/admin/AddStandPage';
import AdminSponsorsPage from './pages/admin/SponsorsPage';
import AdvertisePage from './pages/AdvertisePage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
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
                <Route path="/add" element={<AddStandPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/route" element={<RoutePage />} />
                <Route path="/advertise" element={<AdvertisePage />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}
