import './App.css';

import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrackerPage from './pages/TrackerPage';
import TermsPage from './pages/TermsPage';
import SettingsPage from './pages/SettingsPage';
import { applyCurrentGradient } from './appearanceTheme';

function App() {
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
