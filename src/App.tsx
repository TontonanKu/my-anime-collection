import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { MovieDetail } from './pages/MovieDetail';
import { Stats } from './pages/Stats';
import { AddMovie } from './pages/AddMovie';
import { CategoryView } from './pages/CategoryView';
import { LoginGate } from './components/LoginGate';
import { NotFound } from './pages/NotFound';
import { GridGenerator } from './pages/GridGenerator';
import { History } from './pages/History';

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/add" element={<LoginGate><AddMovie /></LoginGate>} />
          <Route path="/history" element={<History />} />
          <Route path="/category/:type" element={<CategoryView />} />
          <Route path="/grid" element={<GridGenerator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;

