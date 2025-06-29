import StoryblokClient from 'storyblok-js-client';
import { BlogPost, StoryblokStory } from '../types';

const storyblok = new StoryblokClient({
  accessToken: import.meta.env.VITE_STORYBLOK_TOKEN,
});

const storyblokManagement = new StoryblokClient({
  accessToken: import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN,
  oauthToken: import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN,
});

export const storyblokService = {
  async getStories(): Promise<StoryblokStory[]> {
    try {
      // Debug environment variables
      const token = import.meta.env.VITE_STORYBLOK_TOKEN;
      console.log('🔍 Fetching stories from Storyblok...');
      console.log('- Token exists:', !!token);
      console.log('- Space ID:', import.meta.env.VITE_STORYBLOK_SPACE_ID);
      
      if (!token) {
        throw new Error('VITE_STORYBLOK_TOKEN is not set in environment variables');
      }

      const response = await storyblok.get('cdn/stories', {
        version: 'published',
        content_type: 'blog_post',
        starts_with: 'blog/',
        per_page: 100,
        // Force fresh content, bypass cache
        cv: Date.now()
      });
      
      console.log('✅ Storyblok API response received:', {
        storiesCount: response.data.stories.length,
        timestamp: new Date().toISOString()
      });
      
      // Transform stories to ensure image and audio URLs are properly extracted
      const transformedStories = response.data.stories.map((story: any) => {
        let imageUrl = '';
        let audioUrl = '';
        
        // Handle image field
        if (story.content?.image) {
          if (typeof story.content.image === 'string') {
            imageUrl = story.content.image;
          } else if (typeof story.content.image === 'object' && story.content.image?.filename) {
            imageUrl = story.content.image.filename;
          }
        }

        // Handle audio field - CRITICAL: Ensure we preserve data URLs
        if (story.content?.audio) {
          if (typeof story.content.audio === 'string') {
            audioUrl = story.content.audio;
            console.log(`🎵 Story "${story.name}" - Audio URL found:`, {
              type: 'string',
              length: audioUrl.length,
              isDataUrl: audioUrl.startsWith('data:audio/'),
              isHttpUrl: audioUrl.startsWith('http'),
              preview: audioUrl.substring(0, 100) + '...'
            });
          } else if (typeof story.content.audio === 'object' && story.content.audio?.filename) {
            audioUrl = story.content.audio.filename;
            console.log(`🎵 Story "${story.name}" - Audio URL from asset object:`, audioUrl);
          } else {
            console.log(`❌ Story "${story.name}" - Invalid audio field:`, story.content.audio);
          }
        } else {
          console.log(`⚪ Story "${story.name}" - No audio field found`);
        }
        
        return {
          ...story,
          content: {
            ...story.content,
            image: imageUrl,
            audio: audioUrl // Preserve the exact audio URL from Storyblok
          }
        };
      });
      
      console.log('🔄 Transformed stories with normalized URLs');
      
      // Log audio status for each story
      transformedStories.forEach((story: any) => {
        if (story.content.audio) {
          console.log(`🎵 Final audio status for "${story.name}":`, {
            hasAudio: !!story.content.audio,
            audioType: typeof story.content.audio,
            audioLength: story.content.audio.length,
            isValid: story.content.audio.startsWith('data:audio/') || story.content.audio.startsWith('http')
          });
        }
      });
      
      return transformedStories;
    } catch (error: any) {
      console.error('❌ Detailed Storyblok error:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      return [];
    }
  },

  async publishPost(post: BlogPost): Promise<string | null> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      const managementToken = import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN;
      
      console.log('📝 Publishing post to Storyblok:');
      console.log('- Post title:', post.title);
      console.log('- Post has audio:', !!post.audioUrl);
      console.log('- Audio URL type:', typeof post.audioUrl);
      console.log('- Audio URL length:', post.audioUrl?.length || 0);
      console.log('- Audio URL valid:', !!post.audioUrl && (
        post.audioUrl.startsWith('data:audio/') || 
        post.audioUrl.startsWith('http')
      ));
      
      if (!spaceId || !managementToken) {
        throw new Error('Missing Storyblok configuration');
      }
      
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const fullSlug = `blog/${slug}`;
      
      // Check if we should update existing story
      if (post.storyblokId) {
        console.log('🔄 Updating existing story with ID:', post.storyblokId);
        const success = await this.updatePost(post.storyblokId, post);
        return success ? post.storyblokId : null;
      }
      
      // Check if a story with this slug already exists
      const existingStory = await this.findExistingStory(fullSlug);
      if (existingStory) {
        console.log('🔄 Found existing story, updating instead of creating new one');
        const success = await this.updatePost(existingStory.id.toString(), post);
        return success ? existingStory.id.toString() : null;
      }
      
      // Ensure the blog folder exists
      const blogFolderId = await this.ensureBlogFolderExists(spaceId);
      
      // Prepare content object
      const contentObject: any = {
        component: 'blog_post',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        theme: post.theme,
        tone: post.tone,
      };
      
      // Add image if available
      if (post.imageUrl && post.imageUrl.trim()) {
        contentObject.image = post.imageUrl.trim();
        console.log('🖼️ Adding image to content:', post.imageUrl);
      }

      // Add audio if available - CRITICAL: Preserve data URLs
      if (post.audioUrl && post.audioUrl.trim()) {
        contentObject.audio = post.audioUrl.trim();
        console.log('🎵 Adding audio to content:', {
          length: post.audioUrl.length,
          isDataUrl: post.audioUrl.startsWith('data:audio/'),
          preview: post.audioUrl.substring(0, 100) + '...'
        });
      }
      
      const storyData = {
        story: {
          name: post.title,
          slug: fullSlug,
          content: contentObject,
          is_folder: false,
          parent_id: blogFolderId,
        }
      };

      console.log('📤 Publishing story with content keys:', Object.keys(contentObject));

      // Create the story
      const createResponse = await storyblokManagement.post(`spaces/${spaceId}/stories`, storyData);
      
      if (!createResponse.data?.story?.id) {
        throw new Error('Failed to create story - no ID returned');
      }
      
      const storyId = createResponse.data.story.id;
      console.log('✅ Story created successfully with ID:', storyId);
      
      // Publish the story
      try {
        await storyblokManagement.get(`spaces/${spaceId}/stories/${storyId}/publish`);
        console.log('✅ Story published successfully!');
        
        // Verify the audio was saved correctly
        if (post.audioUrl) {
          console.log('🔍 Verifying audio was saved correctly...');
          const savedContent = createResponse.data.story.content;
          console.log('💾 Saved audio field:', {
            exists: !!savedContent.audio,
            type: typeof savedContent.audio,
            length: savedContent.audio?.length || 0,
            matches: savedContent.audio === post.audioUrl
          });
        }
        
        return storyId.toString();
      } catch (publishError) {
        console.error('❌ Failed to publish story:', publishError);
        return storyId.toString();
      }
    } catch (error: any) {
      console.error('❌ DETAILED PUBLISH ERROR:', error);
      throw new Error(`Failed to publish to Storyblok: ${error.message || 'Unknown error'}`);
    }
  },

  async findExistingStory(slug: string): Promise<any | null> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      
      const response = await storyblokManagement.get(`spaces/${spaceId}/stories`, {
        per_page: 100,
        starts_with: 'blog/',
      });
      
      const existingStory = response.data.stories.find((story: any) => 
        story.slug === slug || story.full_slug === slug
      );
      
      return existingStory || null;
    } catch (error: any) {
      console.error('Error checking for existing story:', error);
      return null;
    }
  },

  async ensureBlogFolderExists(spaceId: string): Promise<number> {
    try {
      const response = await storyblokManagement.get(`spaces/${spaceId}/stories`, {
        per_page: 100,
      });
      
      const blogFolder = response.data.stories.find((story: any) => 
        story.is_folder && story.slug === 'blog'
      );
      
      if (!blogFolder) {
        const createResponse = await storyblokManagement.post(`spaces/${spaceId}/stories`, {
          story: {
            name: 'Blog',
            slug: 'blog',
            is_folder: true,
            parent_id: 0,
          }
        });
        
        return createResponse.data.story.id;
      }
      
      return blogFolder.id;
    } catch (error: any) {
      console.error('❌ Error ensuring blog folder exists:', error);
      return 0;
    }
  },

  async updatePost(storyblokId: string, post: BlogPost): Promise<boolean> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      
      console.log('🔄 Updating story:', storyblokId);
      
      const contentObject: any = {
        component: 'blog_post',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        theme: post.theme,
        tone: post.tone,
      };
      
      // Add image if available
      if (post.imageUrl && post.imageUrl.trim()) {
        contentObject.image = post.imageUrl.trim();
      }

      // Add audio if available
      if (post.audioUrl && post.audioUrl.trim()) {
        contentObject.audio = post.audioUrl.trim();
        console.log('🎵 Updating with audio:', {
          length: post.audioUrl.length,
          isDataUrl: post.audioUrl.startsWith('data:audio/')
        });
      }
      
      const storyData = {
        story: {
          content: contentObject
        }
      };

      // Update the story
      await storyblokManagement.put(`spaces/${spaceId}/stories/${storyblokId}`, storyData);
      
      // Publish the updated story
      await storyblokManagement.get(`spaces/${spaceId}/stories/${storyblokId}/publish`);
      
      console.log('✅ Story updated and published successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error updating Storyblok story:', error);
      return false;
    }
  },

  async addAudioToExistingPost(storyblokId: string, audioUrl: string): Promise<boolean> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      
      console.log('🎵 Adding audio to existing Storyblok post:', storyblokId);
      console.log('- Audio URL length:', audioUrl.length);
      console.log('- Is data URL:', audioUrl.startsWith('data:audio/'));
      
      // Get the existing story content
      const getResponse = await storyblokManagement.get(`spaces/${spaceId}/stories/${storyblokId}`);
      const existingContent = getResponse.data.story.content;
      
      // Update the content with the audio field
      const updatedContent = {
        ...existingContent,
        audio: audioUrl
      };
      
      const storyData = {
        story: {
          content: updatedContent
        }
      };

      // Update and publish the story
      await storyblokManagement.put(`spaces/${spaceId}/stories/${storyblokId}`, storyData);
      await storyblokManagement.get(`spaces/${spaceId}/stories/${storyblokId}/publish`);
      
      console.log('✅ Audio added to story and published successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error adding audio to Storyblok story:', error);
      return false;
    }
  }
};