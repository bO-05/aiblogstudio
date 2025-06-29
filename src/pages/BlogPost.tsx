import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { storyblokService } from '../services/storyblokService';
import { elevenLabsService } from '../services/elevenLabsService';
import { storage } from '../utils/storage';
import { StoryblokStory } from '../types';
import BlogLayout from '../components/BlogLayout';
import RichTextRenderer from '../components/RichTextRenderer';
import AudioPlayer from '../components/AudioPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'sonner';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<StoryblokStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const isAdmin = storage.isAuthenticated();

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

  const handleGenerateAudio = async () => {
    if (!post || !post.id) return;

    setGeneratingAudio(true);
    toast.info('Generating audio... This may take a few minutes.');

    try {
      // Prepare text content for TTS
      const textContent = `${post.content.title}. ${post.content.excerpt}. ${post.content.content}`;
      
      console.log('🎵 Generating audio for published post:', post.content.title);
      
      // Generate audio using ElevenLabs
      const audioDataUrl = await elevenLabsService.generateAudio(textContent);
      
      console.log('✅ Audio generated successfully for blog post:', {
        isDataUrl: audioDataUrl.startsWith('data:audio/'),
        length: audioDataUrl.length
      });

      // Update the post in Storyblok with the new audio
      const success = await storyblokService.addAudioToExistingPost(post.id.toString(), audioDataUrl);
      
      if (success) {
        // Update local state to show the audio player
        setPost(prevPost => ({
          ...prevPost!,
          content: {
            ...prevPost!.content,
            audio: audioDataUrl
          }
        }));
        
        console.log('✅ Audio added to published Storyblok post and updated locally');
        toast.success('Audio generated and added to blog post successfully!');
      } else {
        console.warn('⚠️ Audio generated but failed to update Storyblok');
        toast.error('Failed to add audio to blog post. Please try again.');
      }
    } catch (error) {
      console.error('❌ Audio generation error:', error);
      toast.error('Failed to generate audio. Please check your ElevenLabs API key and try again.');
    } finally {
      setGeneratingAudio(false);
    }
  };

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

  // Check if admin can generate audio (admin + no audio)
  const canGenerateAudio = isAdmin && !hasValidAudio;

  console.log('🎵 BlogPost - Audio validation:', {
    hasAudio: !!post.content.audio,
    audioUrl: post.content.audio,
    hasValidAudio,
    audioLength: post.content.audio?.length || 0,
    isAdmin,
    canGenerateAudio
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
      {/* Admin Audio Generation Button - Only show if admin and no audio */}
      {canGenerateAudio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl border border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <VolumeX className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No Audio Available</h3>
                  <p className="text-gray-600 text-sm">This post was created before the audio feature. Generate audio now!</p>
                </div>
              </div>
              
              <button
                onClick={handleGenerateAudio}
                disabled={generatingAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {generatingAudio ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>Generate Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Loading Overlay for Audio Generation */}
      {generatingAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                Generating Audio
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Creating natural-sounding speech with ElevenLabs...
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>• Processing blog content for text-to-speech</p>
                <p>• Generating high-quality audio with Rachel voice</p>
                <p>• Adding audio to published blog post</p>
                <p>• This may take 1-2 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </BlogLayout>
  );
}