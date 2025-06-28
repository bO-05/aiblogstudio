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
      
      // Debug each story's image field in detail
      response.data.stories.forEach((story: any, index: number) => {
        console.log(`📖 Story ${index + 1}: "${story.name}"`);
        console.log('  - Slug:', story.slug);
        console.log('  - Published:', story.published_at);
        console.log('  - Content keys:', Object.keys(story.content || {}));
        
        if (story.content?.image) {
          console.log('  - 🖼️ Image field details:');
          console.log('    - Raw value:', story.content.image);
          console.log('    - Type:', typeof story.content.image);
          console.log('    - Is string:', typeof story.content.image === 'string');
          console.log('    - Length:', story.content.image?.length || 0);
          console.log('    - Starts with http:', story.content.image?.startsWith?.('http'));
          
          // Check if it's a Storyblok asset object vs external URL
          if (typeof story.content.image === 'object' && story.content.image !== null) {
            console.log('    - ⚠️ Image is an object (Storyblok asset):', story.content.image);
            console.log('    - Asset filename:', story.content.image.filename);
            console.log('    - Asset alt:', story.content.image.alt);
            
            // CRITICAL: Check if the filename contains our external URL
            if (story.content.image.filename && story.content.image.filename.startsWith('http')) {
              console.log('    - ✅ Found external URL in filename field:', story.content.image.filename);
            } else if (!story.content.image.filename || story.content.image.filename === '') {
              console.log('    - ❌ Empty filename - external URL was not saved properly');
            }
          } else if (typeof story.content.image === 'string') {
            console.log('    - ✅ Image is external URL string');
            
            // Validate URL format
            try {
              new URL(story.content.image);
              console.log('    - ✅ Valid URL format');
            } catch {
              console.log('    - ❌ Invalid URL format');
            }
          }
        } else {
          console.log('  - ❌ No image field found');
        }
        console.log('  ---');
      });
      
      // Transform stories to ensure image URLs are properly extracted
      const transformedStories = response.data.stories.map((story: any) => {
        let imageUrl = '';
        
        if (story.content?.image) {
          if (typeof story.content.image === 'string') {
            // External URL - use as is
            imageUrl = story.content.image;
            console.log(`🔄 Story "${story.name}" - Using string image URL:`, imageUrl);
          } else if (typeof story.content.image === 'object' && story.content.image?.filename) {
            // Storyblok asset object - extract filename
            imageUrl = story.content.image.filename;
            console.log(`🔄 Story "${story.name}" - Extracted image URL from asset object:`, imageUrl);
          } else if (typeof story.content.image === 'object') {
            // Empty asset object - this is the problem case
            console.log(`❌ Story "${story.name}" - Asset object is empty, no image URL available:`, story.content.image);
            imageUrl = ''; // Keep empty
          }
        }
        
        return {
          ...story,
          content: {
            ...story.content,
            image: imageUrl // Ensure it's always a string URL
          }
        };
      });
      
      console.log('🔄 Transformed stories with normalized image URLs');
      
      return transformedStories;
    } catch (error: any) {
      console.error('❌ Detailed Storyblok error:', {
        message: error.message,
        status: error.status,
        response: error.response,
        config: error.config,
        request: error.request,
        stack: error.stack
      });
      
      // Provide specific error messages based on status
      if (error.status === 401) {
        console.error('🔑 Authentication Error: Check your VITE_STORYBLOK_TOKEN');
        console.error('- Make sure the token is a valid Preview token from Storyblok');
        console.error('- Token should start with something like "Ik8Kj5BdHlqO"');
        console.error('- Get it from: Settings → Access Tokens → Preview');
      } else if (error.status === 404) {
        console.error('📁 Content Not Found: No stories found with content_type "blog_post"');
        console.error('- Make sure you have created a "blog_post" content type in Storyblok');
        console.error('- Make sure you have published stories in the blog/ folder');
      } else if (error.status === 403) {
        console.error('🚫 Forbidden: Token doesn\'t have permission to access this space');
      } else {
        console.error('❌ Unknown error:', error);
      }
      
      return [];
    }
  },

  async publishPost(post: BlogPost): Promise<string | null> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      const managementToken = import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN;
      
      console.log('📝 Publishing post to Storyblok:');
      console.log('- Space ID:', spaceId);
      console.log('- Management token exists:', !!managementToken);
      console.log('- Post title:', post.title);
      console.log('- Post image URL:', post.imageUrl);
      console.log('- Image URL type:', typeof post.imageUrl);
      console.log('- Image URL valid:', !!post.imageUrl && post.imageUrl.startsWith('http'));
      console.log('- Post has storyblokId:', !!post.storyblokId);
      
      if (!spaceId) {
        throw new Error('VITE_STORYBLOK_SPACE_ID is not set in environment variables');
      }
      
      if (!managementToken) {
        throw new Error('VITE_STORYBLOK_MANAGEMENT_TOKEN is not set in environment variables');
      }
      
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const fullSlug = `blog/${slug}`;
      
      // Check if we should update existing story or create new one
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
      
      // First, ensure the blog folder exists
      const blogFolderId = await this.ensureBlogFolderExists(spaceId);
      
      // Validate and prepare image URL
      let imageFieldValue = '';
      if (post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.trim()) {
        // Clean the URL and ensure it's valid
        const cleanUrl = post.imageUrl.trim();
        
        try {
          new URL(cleanUrl); // Validate URL format
          imageFieldValue = cleanUrl;
          console.log('✅ Valid external image URL confirmed:', imageFieldValue);
        } catch (urlError) {
          console.warn('⚠️ Invalid image URL format, will create post without image:', cleanUrl);
          imageFieldValue = '';
        }
      } else {
        console.warn('⚠️ No valid image URL provided, will create post without image');
        imageFieldValue = '';
      }
      
      // CRITICAL: Create the content object with the exact field structure
      const contentObject = {
        component: 'blog_post',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        theme: post.theme,
        tone: post.tone,
      };
      
      // IMPORTANT: For external URLs in Storyblok asset fields, use string directly
      if (imageFieldValue) {
        contentObject.image = imageFieldValue;
        console.log('🔧 Using direct string URL for image field');
      }
      
      const storyData = {
        story: {
          name: post.title,
          slug: fullSlug,
          content: contentObject,
          is_folder: false,
          parent_id: blogFolderId,
          // CRITICAL: Do NOT set published: true here - create as draft first
        }
      };

      console.log('📤 DETAILED PAYLOAD BEING SENT TO STORYBLOK:');
      console.log('- Story name:', storyData.story.name);
      console.log('- Story slug:', storyData.story.slug);
      console.log('- Content component:', storyData.story.content.component);
      console.log('- Content keys:', Object.keys(storyData.story.content));
      console.log('- Image field present:', 'image' in storyData.story.content);
      console.log('- Image field value:', storyData.story.content.image || 'NOT SET');
      console.log('- Image field type:', typeof storyData.story.content.image);
      console.log('- Full content object:', JSON.stringify(storyData.story.content, null, 2));

      // Step 1: Create the story as draft
      const createResponse = await storyblokManagement.post(`spaces/${spaceId}/stories`, storyData);
      
      if (!createResponse.data?.story?.id) {
        throw new Error('Failed to create story - no ID returned');
      }
      
      const storyId = createResponse.data.story.id;
      console.log('✅ Story created successfully with ID:', storyId);
      
      // Step 2: Publish the story using the publish endpoint
      console.log('📤 Publishing story to make it live...');
      try {
        const publishResponse = await storyblokManagement.get(`spaces/${spaceId}/stories/${storyId}/publish`);
        console.log('✅ Story published successfully!');
        console.log('🌐 Story is now live and visible in blog');
        
        // Log the final response to see what Storyblok actually saved
        console.log('📋 FINAL STORYBLOK RESPONSE:');
        console.log('- Story ID:', storyId);
        console.log('- Published status:', true);
        console.log('- Image field in content:', createResponse.data.story.content?.image || 'NOT FOUND');
        
        return storyId.toString();
      } catch (publishError) {
        console.error('❌ Failed to publish story:', publishError);
        console.log('⚠️ Story was created but not published - it remains as draft');
        return storyId.toString(); // Return ID even if publish failed
      }
    } catch (error: any) {
      console.error('❌ DETAILED PUBLISH ERROR:');
      console.error('- Message:', error.message);
      console.error('- Status:', error.status);
      console.error('- Response data:', error.response?.data);
      console.error('- Full error object:', error);
      
      if (error.status === 401) {
        throw new Error('Authentication failed. Check your VITE_STORYBLOK_MANAGEMENT_TOKEN');
      } else if (error.status === 403) {
        throw new Error('Permission denied. Make sure your management token has write permissions');
      } else if (error.status === 404) {
        throw new Error('Resource not found. Check your space ID');
      } else if (error.status === 422) {
        const errorDetails = error.response?.data || error.response || 'Unknown validation error';
        console.error('📝 VALIDATION ERROR DETAILS:', errorDetails);
        
        // Handle slug conflicts by adding timestamp
        if (Array.isArray(errorDetails) && errorDetails.some(err => err.includes('already taken'))) {
          console.log('🔄 Slug conflict detected, will retry with timestamp...');
          // You could implement retry logic here with a modified slug
        }
        
        throw new Error(`Validation error: ${JSON.stringify(errorDetails)}`);
      } else {
        throw new Error(`Failed to publish to Storyblok: ${error.message || 'Unknown error'}`);
      }
    }
  },

  async findExistingStory(slug: string): Promise<any | null> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      
      console.log('🔍 Checking if story already exists with slug:', slug);
      
      const response = await storyblokManagement.get(`spaces/${spaceId}/stories`, {
        per_page: 100,
        starts_with: 'blog/',
      });
      
      const existingStory = response.data.stories.find((story: any) => 
        story.slug === slug || story.full_slug === slug
      );
      
      if (existingStory) {
        console.log('📝 Found existing story:', {
          id: existingStory.id,
          name: existingStory.name,
          slug: existingStory.slug,
          published: existingStory.published
        });
        return existingStory;
      }
      
      console.log('✨ No existing story found, will create new one');
      return null;
    } catch (error: any) {
      console.error('Error checking for existing story:', error);
      return null;
    }
  },

  async ensureBlogFolderExists(spaceId: string): Promise<number> {
    try {
      console.log('📁 Checking if blog folder exists...');
      
      // Check if blog folder already exists
      const response = await storyblokManagement.get(`spaces/${spaceId}/stories`, {
        per_page: 100,
      });
      
      const blogFolder = response.data.stories.find((story: any) => 
        story.is_folder && story.slug === 'blog'
      );
      
      if (!blogFolder) {
        console.log('📁 Blog folder not found, creating...');
        
        // Create blog folder
        const createResponse = await storyblokManagement.post(`spaces/${spaceId}/stories`, {
          story: {
            name: 'Blog',
            slug: 'blog',
            is_folder: true,
            parent_id: 0,
          }
        });
        
        const folderId = createResponse.data.story.id;
        console.log('✅ Blog folder created successfully with ID:', folderId);
        return folderId;
      } else {
        console.log('✅ Blog folder already exists with ID:', blogFolder.id);
        return blogFolder.id;
      }
    } catch (error: any) {
      console.error('❌ Error ensuring blog folder exists:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Return 0 as fallback (root folder)
      console.log('🔄 Using root folder as fallback');
      return 0;
    }
  },

  async updatePost(storyblokId: string, post: BlogPost): Promise<boolean> {
    try {
      const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID;
      
      console.log('🔄 Updating story:', storyblokId);
      
      // Validate and prepare image URL
      let imageFieldValue = '';
      if (post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.trim()) {
        const cleanUrl = post.imageUrl.trim();
        try {
          new URL(cleanUrl);
          imageFieldValue = cleanUrl;
          console.log('✅ Valid external image URL for update:', cleanUrl);
        } catch {
          console.warn('⚠️ Invalid image URL format for update:', cleanUrl);
        }
      }
      
      const contentObject = {
        component: 'blog_post',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        theme: post.theme,
        tone: post.tone,
      };
      
      // Only add image field if we have a valid URL
      if (imageFieldValue) {
        contentObject.image = imageFieldValue;
      }
      
      const storyData = {
        story: {
          content: contentObject
        }
      };

      console.log('📤 UPDATE PAYLOAD:');
      console.log('- Content keys:', Object.keys(contentObject));
      console.log('- Image field present:', 'image' in contentObject);
      console.log('- Image field value:', contentObject.image || 'NOT SET');

      // Update the story
      await storyblokManagement.put(`spaces/${spaceId}/stories/${storyblokId}`, storyData);
      
      // Publish the updated story immediately
      await storyblokManagement.get(`spaces/${spaceId}/stories/${storyblokId}/publish`);
      
      console.log('✅ Story updated and published successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error updating Storyblok story:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      return false;
    }
  }
};