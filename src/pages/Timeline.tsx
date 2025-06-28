import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Info, Zap, Upload, Eye, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { storage } from '../utils/storage';
import { storyblokService } from '../services/storyblokService';
import { aiService } from '../services/aiService';
import BlogPostCard from '../components/BlogPostCard';
import EditPostModal from '../components/EditPostModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'sonner';

export default function Timeline() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'published'>('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPosts = () => {
      const savedPosts = storage.getPosts();
      setPosts(savedPosts);
    };

    loadPosts();
    window.addEventListener('focus', loadPosts);
    return () => window.removeEventListener('focus', loadPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, statusFilter]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = (updatedPost: BlogPost) => {
    storage.updatePost(updatedPost.id, updatedPost);
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setEditingPost(null);
    toast.success('Post updated successfully!');
  };

  const handlePublish = async (post: BlogPost) => {
    setLoading(true);
    try {
      const storyblokId = await storyblokService.publishPost(post);
      if (storyblokId) {
        const updatedPost = {
          ...post,
          status: 'published' as const,
          publishedAt: new Date().toISOString(),
          storyblokId
        };
        storage.updatePost(post.id, updatedPost);
        setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
        toast.success('Post published and live on blog!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async (post: BlogPost) => {
    if (!post.storyblokId) {
      toast.error('Post must be published before generating audio');
      return;
    }

    // Update audio status to generating
    const updatedPost = { ...post, audioStatus: 'generating' as const };
    storage.updatePost(post.id, updatedPost);
    setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
    
    toast.info('Generating audio... This may take a few minutes.');

    try {
      // Call the Netlify function
      const response = await fetch('/.netlify/functions/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: parseInt(import.meta.env.VITE_STORYBLOK_SPACE_ID),
          story_id: parseInt(post.storyblokId)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const result = await response.json();
      console.log('Audio generation result:', result);

      // Update post status to ready
      const finalPost = { ...post, audioStatus: 'ready' as const };
      storage.updatePost(post.id, finalPost);
      setPosts(prev => prev.map(p => p.id === post.id ? finalPost : p));
      
      toast.success('Audio generated successfully! It will appear on the blog post.');
    } catch (error) {
      console.error('Audio generation error:', error);
      
      // Update status to error
      const errorPost = { ...post, audioStatus: 'error' as const };
      storage.updatePost(post.id, errorPost);
      setPosts(prev => prev.map(p => p.id === post.id ? errorPost : p));
      
      toast.error('Failed to generate audio. Please try again.');
    }
  };

  const handleRegenerate = async (post: BlogPost) => {
    setLoading(true);
    try {
      const [contentResult, imageUrl] = await Promise.all([
        aiService.generateContent({
          theme: post.theme,
          tone: post.tone,
          length: post.length
        }),
        aiService.generateImage(post.theme)
      ]);

      const updatedPost = {
        ...post,
        title: contentResult.title,
        content: contentResult.content,
        excerpt: contentResult.excerpt,
        imageUrl,
        status: 'generated' as const
      };

      storage.updatePost(post.id, updatedPost);
      setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
      toast.success('Post regenerated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (post: BlogPost) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      storage.deletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast.success('Post deleted successfully!');
    }
  };

  // Calculate stats
  const totalPosts = posts.length;
  const localDrafts = posts.filter(p => p.status === 'generated').length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const postsWithAudio = posts.filter(p => p.audioStatus === 'ready').length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Timeline</h1>
            <p className="text-lg text-gray-600">Manage your AI-generated blog posts with audio</p>
          </div>
          
          <Link
            to="/admin"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        </motion.div>

        {/* Enhanced Workflow Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎵 Enhanced AI Workflow</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">1. Generate</p>
                    <p className="text-gray-600">AI creates content locally</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">2. Publish</p>
                    <p className="text-gray-600">Send to Storyblok & go live</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Volume2 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">3. Audio</p>
                    <p className="text-gray-600">Generate TTS with ElevenLabs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">4. Experience</p>
                    <p className="text-gray-600">Multi-modal content live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts by title, theme, or excerpt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="generated">Local Drafts</option>
                <option value="published">Published Live</option>
              </select>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{localDrafts}</p>
                <p className="text-sm text-gray-600">Local Drafts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
                <p className="text-sm text-gray-600">Published Live</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{postsWithAudio}</p>
                <p className="text-sm text-gray-600">With Audio</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {posts.length === 0 ? 'No posts yet' : 'No posts match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {posts.length === 0 
                  ? 'Create your first AI-generated blog post with audio to get started'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {posts.length === 0 && (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Post</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <BlogPostCard
                    post={post}
                    onEdit={handleEdit}
                    onPublish={handlePublish}
                    onRegenerate={handleRegenerate}
                    onDelete={handleDelete}
                    onGenerateAudio={handleGenerateAudio}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={handleSaveEdit}
          onClose={() => setEditingPost(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8">
            <LoadingSpinner size="lg" text="Processing..." />
          </div>
        </div>
      )}
    </div>
  );
}