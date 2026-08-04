import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { MovieDetail } from './pages/MovieDetail';
import { Stats } from './pages/Stats';
import { AddMovie } from './pages/AddMovie';
import { NotFound } from './pages/NotFound';

function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/add" element={<AddMovie />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;

