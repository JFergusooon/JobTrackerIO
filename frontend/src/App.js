import './App.css';

import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrackerPage from './pages/TrackerPage';
import TermsPage from './pages/TermsPage';
import SettingsPage from './pages/SettingsPage';
import { applyCurrentGradient } from './appearanceTheme';

function App() {
  const [tooSmall, setTooSmall] = useState(
    window.innerWidth < window.screen.width * 0.75
  );

  useEffect(() => {
    const checkSize = () => setTooSmall(window.innerWidth < window.screen.width * 0.75);
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    const applyTheme = () => applyCurrentGradient();

    applyTheme();
    window.addEventListener('authChange', applyTheme);
    window.addEventListener('appearanceChange', applyTheme);
    window.addEventListener('storage', applyTheme);

    return () => {
      window.removeEventListener('authChange', applyTheme);
      window.removeEventListener('appearanceChange', applyTheme);
      window.removeEventListener('storage', applyTheme);
    };
  }, []);

  return (
    <div className="App">
      {tooSmall && (
        <div className="windowTooSmallBlocker">
          <p>Window too small, please fullscreen window</p>
        </div>
      )}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/home' element={<HomePage />} />
        <Route path='/tracker' element={<TrackerPage />} />
        <Route path='/terms' element={<TermsPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
