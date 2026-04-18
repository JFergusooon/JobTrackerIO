import './App.css';

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrackerPage from './pages/TrackerPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tracker' element={<TrackerPage />} />
        <Route path='/terms' element={<TermsPage />} />
      </Routes>
    </div>
  );
}

export default App;
