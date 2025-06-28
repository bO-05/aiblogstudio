import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, AlertCircle, Clock, Info, Sparkles, Timeline, CheckCircle } from 'lucide-react';
import { GenerationRequest, BlogPost } from '../types';
import { aiService } from '../services/aiService';
import { storage } from '../utils/storage';
import { rateLimiter } from '../utils/rateLimiter';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessModal from '../components/SuccessModal';
import { toast } from 'sonner';

export default function Admin() {
  const [formData, setFormData] = useState<GenerationRequest>({
    theme: '',
    tone: 'professional',
    length: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(rateLimiter.checkLimit());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Update rate limit status every minute
    const interval = setInterval(() => {
      setRateLimit(rateLimiter.checkLimit());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimit.isLimited) {
      toast.error('Rate limit exceeded. Please wait before generating more content.');
      return;
    }

    setLoading(true);

    try {
      // Record the request for rate limiting
      rateLimiter.recordRequest();
      setRateLimit(rateLimiter.checkLimit());

      // Generate content and image in parallel
      const [contentResult, imageUrl] = await Promise.all([
        aiService.generateContent(formData),
        aiService.generateImage(formData.theme)
      ]);

      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: contentResult.title,
        content: contentResult.content,
        excerpt: contentResult.excerpt,
        imageUrl,
        theme: formData.theme,
        tone: formData.tone,
        length: formData.length,
        status: 'generated', // Keep as local draft
        createdAt: new Date().toISOString()
      };

      // Save to local storage only (no auto-publishing)
      storage.addPost(newPost);
      setGeneratedPost(newPost);

      console.log('✅ Blog post generated and saved locally');
      toast.success('Blog post generated successfully! Go to Timeline to publish.');

      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        theme: '',
        tone: 'professional',
        length: 'medium'
      });

    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate blog post');
    } finally {
      setLoading(false);
    }
  };

  const getRateLimitResetTime = () => {
    const resetDate = new Date(rateLimit.resetTime);
    return resetDate.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wand2 className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Generate Blog Post</h1>
          </div>
          <p className="text-lg text-gray-600">
            Create engaging content with AI-powered tools
          </p>
        </motion.div>

        {/* Workflow Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Content Creation Workflow</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">1. Generate</p>
                    <p className="text-gray-600">AI creates local draft</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Timeline className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">2. Review</p>
                    <p className="text-gray-600">Edit in Timeline</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">3. Publish</p>
                    <p className="text-gray-600">Go live to blog</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rate Limit Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <div className={`p-4 rounded-lg border ${
            rateLimit.isLimited 
              ? 'bg-red-50 border-red-200' 
              : rateLimit.remaining <= 3 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2">
              {rateLimit.isLimited ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-green-600" />
              )}
              <span className={`font-medium ${
                rateLimit.isLimited ? 'text-red-800' : 'text-gray-800'
              }`}>
                {rateLimit.isLimited 
                  ? `Rate limit exceeded. Resets at ${getRateLimitResetTime()}`
                  : `${rateLimit.remaining} generations remaining this hour`
                }
              </span>
            </div>
          </div>
        </motion.div>

        {/* Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Theme Input */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Theme/Topic *
              </label>
              <input
                type="text"
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Sustainable Technology, Digital Marketing Trends, Remote Work Best Practices"
              />
              <p className="mt-1 text-sm text-gray-500">
                Describe the main topic or theme for your blog post
              </p>
            </div>

            {/* Tone Selection */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Writing Tone
              </label>
              <select
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="professional">Professional - Authoritative and informative</option>
                <option value="casual">Casual - Conversational and friendly</option>
                <option value="humorous">Humorous - Entertaining with wit and humor</option>
              </select>
            </div>

            {/* Length Selection */}
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                Content Length
              </label>
              <select
                id="length"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="short">Short - 300-500 words</option>
                <option value="medium">Medium - 800-1200 words</option>
                <option value="long">Long - 1500-2000 words</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.theme || rateLimit.isLimited}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Generating content..." />
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Blog Post</span>
                </>
              )}
            </button>
          </form>

          {loading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Generation in progress...</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p>• Creating engaging content with Mistral LLM</p>
                <p>• Generating atmospheric images with Imagen4 AI</p>
                <p>• Saving as local draft for review</p>
                <p>• Optimizing for SEO and readability</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips for Better Results</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Be specific with your theme - include key points you want covered</li>
            <li>• Choose the tone that matches your target audience</li>
            <li>• Longer posts provide more detailed coverage of complex topics</li>
            <li>• Generated posts are saved as drafts - review them in Timeline</li>
            <li>• You can edit and regenerate content before publishing</li>
          </ul>
        </motion.div>
      </div>

      {/* Success Modal */}
      {generatedPost && (
        <SuccessModal
          post={generatedPost}
          isVisible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setGeneratedPost(null);
          }}
        />
      )}
    </div>
  );
}