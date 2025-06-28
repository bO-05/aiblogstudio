import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Baseline as Timeline, Settings, LogOut, BookOpen, Home } from 'lucide-react';
import { storage } from '../utils/storage';

interface NavbarProps {
  variant?: 'admin' | 'blog';
}

export default function Navbar({ variant = 'admin' }: NavbarProps) {
  const navigate = useNavigate();
  const isAuthenticated = storage.isAuthenticated();

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/');
  };

  if (variant === 'blog') {
    return (
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Blog Studio
                </span>
              </Link>
              
              <div className="flex space-x-4">
                <NavLink
                  to="/"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </NavLink>
                
                <NavLink
                  to="/blog"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Blog</span>
                </NavLink>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Admin variant (for authenticated users)
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Blog Studio
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="flex space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`
                  }
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </NavLink>
                
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`
                  }
                >
                  <Settings className="h-4 w-4" />
                  <span>Generate</span>
                </NavLink>
                
                <NavLink
                  to="/timeline"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`
                  }
                >
                  <Timeline className="h-4 w-4" />
                  <span>Timeline</span>
                </NavLink>
                
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`
                  }
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Blog</span>
                </NavLink>
              </div>
            )}
          </div>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}