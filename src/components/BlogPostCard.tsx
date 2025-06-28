import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, Edit3, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { BlogPost } from '../types';
import { format } from 'date-fns';

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onPublish: (post: BlogPost) => void;
  onRegenerate: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

export default function BlogPostCard({ post, onEdit, onPublish, onRegenerate, onDelete }: BlogPostCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    generated: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700'
  };

  const statusLabels = {
    draft: 'Draft',
    generated: 'Generated',
    published: 'Published'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-video bg-gradient-to-r from-purple-100 to-blue-100 relative overflow-hidden">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status]}`}>
            {statusLabels[post.status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            {post.theme}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(post.createdAt), 'MMM d, yyyy')}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="capitalize">{post.tone} tone</span>
          <span className="capitalize">{post.length} length</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(post)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>
          
          {post.status !== 'published' && (
            <button
              onClick={() => onPublish(post)}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
              <span>Publish</span>
            </button>
          )}
          
          <button
            onClick={() => onRegenerate(post)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(post)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}