import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Control from './pages/Control';
import OverlayBg from './pages/OverlayBg';
import OverlayDraw from './pages/OverlayDraw';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/control" element={<Control />} />
        <Route path="/overlay-bg" element={<OverlayBg />} />
        <Route path="/overlay-draw" element={<OverlayDraw />} />
        <Route path="*" element={<Navigate to="/control" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

