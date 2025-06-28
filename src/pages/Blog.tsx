import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search, Filter, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { storyblokService } from '../services/storyblokService';
import { StoryblokStory } from '../types';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Blog() {
  const [posts, setPosts] = useState<StoryblokStory[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<StoryblokStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const stories = await storyblokService.getStories();
        setPosts(stories);
        setFilteredPosts(stories);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by theme
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(post => 
        post.content.theme?.toLowerCase().includes(selectedTheme.toLowerCase())
      );
    }

    // Filter by tone
    if (selectedTone !== 'all') {
      filtered = filtered.filter(post => 
        post.content.tone?.toLowerCase() === selectedTone.toLowerCase()
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedTheme, selectedTone]);

  // Get unique themes and tones for filters
  const themes = Array.from(new Set(posts.map(post => post.content.theme).filter(Boolean)));
  const tones = Array.from(new Set(posts.map(post => post.content.tone).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar variant="blog" />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading blog posts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar variant="blog" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              AI-Generated Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover cutting-edge insights powered by artificial intelligence. 
              Content generated with Mistral LLM and beautiful images by Imagen4 AI.
            </p>
          </motion.div>
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts by title, theme, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
              />
            </div>

            {/* Theme Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Themes</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>

            {/* Tone Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Tones</option>
                {tones.map(tone => (
                  <option key={tone} value={tone} className="capitalize">{tone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{themes.length}</p>
                <p className="text-sm text-gray-600">Unique Themes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{filteredPosts.length}</p>
                <p className="text-sm text-gray-600">Showing</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {posts.length === 0 ? 'No blog posts yet' : 'No posts match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {posts.length === 0 
                  ? 'Create your first AI-generated blog post to see it here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {posts.length === 0 && (
                <Link
                  to="/login"
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
                  <article className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="aspect-video bg-gradient-to-r from-purple-100 to-blue-100 relative overflow-hidden">
                      {post.content.image ? (
                        <img 
                          src={post.content.image} 
                          alt={post.content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Theme Badge */}
                      {post.content.theme && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-white/90 backdrop-blur-sm rounded-full">
                            {post.content.theme}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {post.published_at && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(post.published_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.content.title}
                      </h2>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {post.content.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        {post.content.tone && (
                          <span className="capitalize">{post.content.tone} tone</span>
                        )}
                        <span>AI Generated</span>
                      </div>

                      {/* Action */}
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center justify-center space-x-1 w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                      >
                        <span>Read More</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}