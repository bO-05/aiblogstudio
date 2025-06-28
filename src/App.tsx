import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Timeline from './pages/Timeline';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { storage } from './utils/storage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Routes>
          {/* Blog Routes (Public) */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="/login" element={
              storage.isAuthenticated() ? <Navigate to="/admin" replace /> : <Login />
            } />
            
            {/* Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
        
        <Toaster 
          position="top-right"
          richColors
          expand={true}
          closeButton
        />
      </div>
    </Router>
  );
}

export default App;