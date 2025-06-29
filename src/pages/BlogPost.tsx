import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storyblokService } from '../services/storyblokService';
import { StoryblokStory } from '../types';
import BlogLayout from '../components/BlogLayout';
import RichTextRenderer from '../components/RichTextRenderer';
import AudioPlayer from '../components/AudioPlayer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<StoryblokStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 BlogPost - Fetching post with slug:', slug);
        
        const stories = await storyblokService.getStories();
        console.log('📚 BlogPost - All stories fetched:', stories.length);
        
        const foundPost = stories.find(story => {
          const matches = story.slug === slug || 
                         story.slug === `blog/${slug}` ||
                         story.full_slug === slug ||
                         story.full_slug === `blog/${slug}`;
          
          if (matches) {
            console.log('✅ BlogPost - Found matching story:', {
              name: story.name,
              slug: story.slug,
              full_slug: story.full_slug,
              hasImage: !!story.content?.image,
              hasAudio: !!story.content?.audio,
              imageUrl: story.content?.image,
              audioUrl: story.content?.audio,
              audioUrlType: typeof story.content?.audio,
              audioUrlValid: story.content?.audio && (
                story.content.audio.startsWith('data:audio/') || 
                story.content.audio.startsWith('http')
              )
            });
          }
          
          return matches;
        });
        
        if (foundPost) {
          console.log('📖 BlogPost - Setting post data with audio details:', {
            title: foundPost.content?.title,
            hasImage: !!foundPost.content?.image,
            hasAudio: !!foundPost.content?.audio,
            imageUrl: foundPost.content?.image,
            audioUrl: foundPost.content?.audio,
            audioUrlLength: foundPost.content?.audio?.length || 0,
            audioUrlStartsWith: foundPost.content?.audio?.substring(0, 50) || 'N/A'
          });
          setPost(foundPost);
        } else {
          console.error('❌ BlogPost - No post found with slug:', slug);
          setError('Post not found');
        }
      } catch (error) {
        console.error('❌ BlogPost - Error fetching blog post:', error);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <BlogLayout showBackButton>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading blog post..." />
        </div>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  // Check if audio is available and valid
  const hasValidAudio = post.content.audio && (
    post.content.audio.startsWith('data:audio/') || 
    post.content.audio.startsWith('http')
  );

  console.log('🎵 BlogPost - Audio validation:', {
    hasAudio: !!post.content.audio,
    audioUrl: post.content.audio,
    hasValidAudio,
    audioLength: post.content.audio?.length || 0
  });

  return (
    <BlogLayout
      title={post.content.title}
      excerpt={post.content.excerpt}
      image={post.content.image}
      publishedAt={post.published_at}
      theme={post.content.theme}
      tone={post.content.tone}
      showBackButton
    >
      {/* Audio Player - Show if valid audio is available */}
      {hasValidAudio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <AudioPlayer 
            audioUrl={post.content.audio!} 
            title={post.content.title || 'Blog Post Audio'}
          />
        </motion.div>
      )}

      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: hasValidAudio ? 0.2 : 0 }}
        className="max-w-none"
      >
        {post.content.content && (
          <RichTextRenderer 
            content={post.content.content}
            className="text-lg leading-relaxed"
          />
        )}
      </motion.article>

      {/* Related Posts or Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-12 pt-8 border-t border-gray-200"
      >
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Enjoyed this AI-generated content?
          </h3>
          <p className="text-gray-600 mb-4">
            This post was created using advanced AI technology including {hasValidAudio ? 'text-to-speech audio, ' : ''}content generation with Mistral LLM, image creation with Imagen4 AI, and published through Storyblok CMS.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ AI Content Notice:</strong> This content was generated by artificial intelligence. While we strive for accuracy, AI can sometimes produce incorrect information or "hallucinate" facts. Please verify important information from authoritative sources before making decisions based on this content.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a
              href="/blog"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Read More Posts
            </a>
            <a
              href="/login"
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg border border-purple-200 hover:bg-purple-50 transition-all duration-300"
            >
              Create Your Own
            </a>
          </div>
        </div>
      </motion.div>
    </BlogLayout>
  );
}