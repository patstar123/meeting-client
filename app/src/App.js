import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';
import HomePage from './components/HomePage';
import MeetingPage from './components/MeetingPage';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-meeting" element={<MeetingPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;