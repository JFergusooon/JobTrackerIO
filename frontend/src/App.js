import './App.css';

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrackerPage from './pages/TrackerPage';
import TermsPage from './pages/TermsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tracker' element={<TrackerPage />} />
        <Route path='/terms' element={<TermsPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
