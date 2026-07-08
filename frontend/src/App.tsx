import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NewTrainingPage from './pages/NewTrainingPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import './styles/neu-morphism.scss';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/training/new" element={<NewTrainingPage />} />
        <Route path="/training/:logId/edit" element={<NewTrainingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/detail/:logId" element={<HistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
