import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Start from './components/Start.jsx';
import Role from "./components/Role.jsx"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/role" element={<Role />} />
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
};

export default App;