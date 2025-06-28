import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Globe, ArrowRight, AlertCircle, ExternalLink, Workflow, Clock, CheckCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storyblokService } from '../services/storyblokService';
import { StoryblokStory } from '../types';
import { format } from 'date-fns';
import { debugEnv } from '../services/debug';

export default function Home() {
  const [publishedPosts, setPublishedPosts] = useState<StoryblokStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug environment variables on component mount
    debugEnv();
    
    const fetchPublishedPosts = async () => {
      try {
        setError(null);
        console.log('Starting to fetch published posts...');
        
        const stories = await storyblokService.getStories();
        console.log('Fetched stories:', stories);
        
        setPublishedPosts(stories.slice(0, 6)); // Show latest 6 posts
      } catch (error: any) {
        console.error('Error in fetchPublishedPosts:', error);
        setError(error.message || 'Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedPosts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="h-12 w-12 text-purple-600" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Blog Studio
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate stunning blog posts with AI-powered content creation, beautiful images, and natural speech audio. 
              Publish directly to Storyblok CMS with just a few clicks.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link
                to="/login"
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Start Creating</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                to="/blog"
                className="flex items-center space-x-2 px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold border border-purple-200 hover:bg-purple-50 transition-all duration-300"
              >
                <span>View Blog</span>
                <ExternalLink className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Workflow className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Simple 4-Step Workflow
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From idea to published multimedia blog post in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                step: '1',
                title: 'Generate with AI',
                description: 'Enter your topic and let Mistral LLM create compelling content with beautiful Imagen4 visuals.',
                color: 'text-blue-600 bg-blue-100',
                status: 'Local Draft'
              },
              {
                icon: Volume2,
                step: '2',
                title: 'Add Audio',
                description: 'Generate natural-sounding speech with ElevenLabs text-to-speech for accessibility and engagement.',
                color: 'text-orange-600 bg-orange-100',
                status: 'Audio Ready'
              },
              {
                icon: Globe,
                step: '3',
                title: 'Publish to Storyblok',
                description: 'One-click publishing sends your multimedia content to Storyblok CMS and makes it instantly live.',
                color: 'text-purple-600 bg-purple-100',
                status: 'Published Live'
              },
              {
                icon: CheckCircle,
                step: '4',
                title: 'View & Share',
                description: 'Your blog post is immediately visible with professional formatting, images, and audio playback.',
                color: 'text-green-600 bg-green-100',
                status: 'Live on Blog'
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>

                <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center mb-4 mt-2`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {step.status}
                </div>

                {/* Connector Arrow */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI-Driven Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create and publish professional multimedia blog content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI Content Generation',
                description: 'Create compelling blog posts with Mistral LLM. Choose your tone, length, and theme for personalized content.',
                color: 'text-yellow-600 bg-yellow-100'
              },
              {
                icon: Sparkles,
                title: 'AI Image Creation',
                description: 'Generate beautiful, atmospheric images with Imagen4 AI that perfectly complement your blog content.',
                color: 'text-purple-600 bg-purple-100'
              },
              {
                icon: Volume2,
                title: 'AI Text-to-Speech',
                description: 'Convert your content to natural-sounding audio with ElevenLabs for accessibility and enhanced user engagement.',
                color: 'text-orange-600 bg-orange-100'
              },
              {
                icon: Globe,
                title: 'Instant Publishing',
                description: 'Seamlessly publish multimedia content to Storyblok CMS with automatic deployment. Your content goes live immediately.',
                color: 'text-blue-600 bg-blue-100'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest AI-Generated Posts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check out our latest AI-generated multimedia content published through Storyblok
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-semibold">Unable to load blog posts</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <p className="text-red-600 text-xs mt-2">
                    Check the browser console for detailed error information and environment variable debug output.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : publishedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {post.content.image && (
                      <div className="aspect-video bg-gradient-to-r from-purple-100 to-blue-100 relative">
                        <img 
                          src={post.content.image} 
                          alt={post.content.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Audio indicator */}
                        {post.content.audio && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                              <Volume2 className="h-4 w-4 text-orange-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        {post.content.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.content.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        {post.published_at && (
                          <p className="text-sm text-gray-500">
                            {format(new Date(post.published_at), 'MMMM d, yyyy')}
                          </p>
                        )}
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  to="/blog"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>View All Posts</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </>
          ) : !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first AI-generated multimedia blog post to see it here
              </p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Amazing Multimedia Content?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join the future of content creation with AI-powered blog generation, stunning visuals, natural speech audio, and seamless Storyblok integration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg"
              >
                Start Creating Now
              </Link>
              <Link
                to="/blog"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Explore Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}