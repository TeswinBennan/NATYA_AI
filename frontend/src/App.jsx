import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import NatyaGuruChatbot from './components/NatyaGuruChatbot';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import PoseAnalysis from './pages/PoseAnalysis';
import LiveRehearsal from './pages/LiveRehearsal';
import DigitalTwin from './pages/DigitalTwin';
import StyleClassification from './pages/StyleClassification';
import MudraStudio from './pages/MudraStudio';
import TalaMetronome from './pages/TalaMetronome';
import ThreeDStudio from './pages/ThreeDStudio';
import AnalysisHistory from './pages/AnalysisHistory';


function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-drawer-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="main-wrapper">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>

      {/* Floating Mobile Bottom Navigation Dock */}
      <MobileNav />

      {/* Floating AI Natya Guru Multilingual Assistant Chatbot */}
      <NatyaGuruChatbot />
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Master AI Studios */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/mudra-studio" element={
            <ProtectedRoute>
              <MainLayout>
                <MudraStudio />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/tala-metronome" element={
            <ProtectedRoute>
              <MainLayout>
                <TalaMetronome />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/3d-studio" element={
            <ProtectedRoute>
              <MainLayout>
                <ThreeDStudio />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/analyze" element={
            <ProtectedRoute>
              <MainLayout>
                <PoseAnalysis />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/live-rehearsal" element={
            <ProtectedRoute>
              <MainLayout>
                <LiveRehearsal />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/digital-twin" element={
            <ProtectedRoute>
              <MainLayout>
                <DigitalTwin />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/classify" element={
            <ProtectedRoute>
              <MainLayout>
                <StyleClassification />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <MainLayout>
                <AnalysisHistory />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
