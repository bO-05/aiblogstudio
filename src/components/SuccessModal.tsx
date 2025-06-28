import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Baseline as Timeline, Edit3, ArrowRight, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';

interface SuccessModalProps {
  post: BlogPost;
  onClose: () => void;
  isVisible: boolean;
}

export default function SuccessModal({ post, onClose, isVisible }: SuccessModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Blog Post Generated!</h2>
              <p className="text-blue-100 text-sm">Your content is ready for review</p>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-6">
          <div className="mb-6">
            {post.imageUrl && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {post.excerpt}
            </p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                {post.theme}
              </span>
              <span className="capitalize">{post.tone} tone</span>
              <span className="capitalize">{post.length} length</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">Saved as Local Draft</p>
                <p className="text-blue-700 text-sm">Go to Timeline to review and publish to blog</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/timeline"
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              <Timeline className="h-5 w-5" />
              <span>Review in Timeline</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <Edit3 className="h-4 w-4" />
                <span>Create Another</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}