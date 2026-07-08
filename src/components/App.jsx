import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CheckerPage from './pages/CheckerPage.jsx';
import PlannerPage from './pages/PlannerPage.jsx';
import ExecutorPage from './pages/ExecutorPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HierarchyPage from './pages/HierarchyPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/checker" element={<CheckerPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/executor" element={<ExecutorPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hierarchy" element={<HierarchyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
