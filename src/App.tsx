import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import StandDetailPage from './pages/StandDetailPage';
import AddStandPage from './pages/AddStandPage';
import AboutPage from './pages/AboutPage';
import RoutePage from './pages/RoutePage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/stand/:id" element={<StandDetailPage />} />
          <Route path="/add" element={<AddStandPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/route" element={<RoutePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
