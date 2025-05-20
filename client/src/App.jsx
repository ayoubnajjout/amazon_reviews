// frontend/src/App.jsx
import React from 'react';
import Dashboard from './components/Dashboard';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar/NavBar';
import NotFound from './components/NotFound/NotFound';
import DashboardHistory from './components/DashboardHistory';
import Predict from './components/predict/Predict';

function App() {
  return (
    <div>
      <NavBar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stream" element={<Dashboard />} />
            <Route path="/history" element={<DashboardHistory />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

