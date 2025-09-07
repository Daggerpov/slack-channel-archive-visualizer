import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GuestHome from './components/GuestHome';
import ClubApp from './components/ClubApp';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestHome />} />
      <Route path="/mmhc" element={<ClubApp />} />
    </Routes>
  );
}

export default App;
