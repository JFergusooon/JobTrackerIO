import './App.css';

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import TrackerPage from './pages/TrackerPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tracker' element={<TrackerPage />} />
      </Routes>
    </div>
  );
}

export default App;
