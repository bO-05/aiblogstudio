import { Handler } from '@netlify/functions';
import StoryblokClient from 'storyblok-js-client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { FormData } from 'formdata-node';

// Initialize Storyblok client
const storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN,
});

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = 'Rachel'; // Professional female voice

interface SignedResponse {
  fields: { [key: string]: string };
  post_url: string;
  pretty_url: string;
  id: number;
}

interface StoryblokAssetResponse {
  data: SignedResponse;
}

const prepareTextForTTS = (content: string): string => {
  // Remove markdown formatting
  let cleanText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  // Limit length for API constraints
  if (cleanText.length > 2500) {
    cleanText = cleanText.substring(0, 2500) + '...';
  }

  return cleanText;
};

const getStoryUrl = async (spaceId: number, storyId: number): Promise<string> => {
  try {
    const res = await storyblok.get(`/spaces/${spaceId}/stories/${storyId}`);
    return res.data.story.full_slug;
  } catch (err) {
    console.log('Error getting story URL:', err);
    return '';
  }
};

const getStoryContent = async (spaceId: number, storyId: number): Promise<string> => {
  try {
    console.log('📖 Fetching story content for audio generation...');
    
    const domain = process.env.PRODUCTION_DOMAIN;
    if (!domain) {
      throw new Error('PRODUCTION_DOMAIN environment variable is required');
    }

    const url = await getStoryUrl(spaceId, storyId);
    const urlToCrawl = `${domain}/${url}?ts=${Date.now()}`;
    
    console.log('🔍 Crawling URL:', urlToCrawl);
    
    const res = await fetch(urlToCrawl);
    const urlText = await res.text();
    const cheerioDocument = cheerio.load(urlText);
    
    // Extract title and content using selectors
    const titleSelector = 'h1';
    const bodySelector = '[data-blog-content], .prose, article, main';
    
    const title = cheerioDocument(titleSelector).first().text().trim();
    const content = cheerioDocument(bodySelector).first().text().trim();
    
    if (!title && !content) {
      // Fallback: get story directly from Storyblok
      console.log('⚠️ Could not crawl content, falling back to Storyblok API...');
      const response = await storyblok.get(`/spaces/${spaceId}/stories/${storyId}`);
      const story = response.data.story;
      
      const fallbackTitle = story.content.title || story.name || 'Article';
      const fallbackContent = story.content.content || story.content.excerpt || '';
      
      return `Article title: ${fallbackTitle}. <break time="1.0s" /> Article content: ${prepareTextForTTS(fallbackContent)}`;
    }
    
    const fullText = `Article title: ${title}. <break time="1.0s" /> Article content: ${content}`;
    console.log('✅ Story content extracted successfully, length:', fullText.length);
    
    return fullText;
  } catch (error) {
    console.error('❌ Error fetching story content:', error);
    throw error;
  }
};

const generateAudioFromText = async (text: string): Promise<Buffer> => {
  try {
    console.log('🎵 Generating audio with ElevenLabs...');
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    const cleanText = prepareTextForTTS(text);
    console.log('📝 Text prepared for TTS, length:', cleanText.length);
    
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${VOICE_ID}`,
      {
        text: cleanText,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('✅ Audio generated successfully');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    throw error;
  }
};

const uploadAssetToStoryblok = async (
  audioBuffer: Buffer,
  spaceId: number,
  storyId: number
): Promise<boolean> => {
  try {
    console.log('📤 Uploading audio to Storyblok...');
    
    const fileName = `${storyId}-text-to-speech.mp3`;
    
    // Create new asset entry
    const newAssetEntry = (await storyblok.post(`/spaces/${spaceId}/assets/`, {
      filename: fileName,
    })) as unknown as StoryblokAssetResponse;

    const signedResponse = newAssetEntry.data as SignedResponse;
    const blob = new Blob([audioBuffer]);
    const assetRequestBody = new FormData();

    // Add all required fields from signed response
    for (let key in signedResponse.fields) {
      if (signedResponse.fields[key]) {
        assetRequestBody.set(key, signedResponse.fields[key]);
      }
    }

    assetRequestBody.set('file', blob, fileName);

    // Upload to Storyblok's CDN
    await fetch(signedResponse.post_url, {
      method: 'POST',
      body: assetRequestBody,
    });

    // Finish upload
    await storyblok.get(`spaces/${spaceId}/assets/${signedResponse.id}/finish_upload`);

    // Update story with audio asset
    const getStoryRes = await storyblok.get(`/spaces/${spaceId}/stories/${storyId}`);
    const updatePayload = getStoryRes.data;
    const oldAudio = getStoryRes.data.story.content.audio;

    updatePayload.story.content.audio = {
      filename: signedResponse.pretty_url,
      fieldtype: 'asset',
      is_external_url: false,
      id: signedResponse.id,
    };

    await storyblok.put(`/spaces/${spaceId}/stories/${storyId}`, updatePayload);

    // Clean up old audio if exists
    if (oldAudio && oldAudio.id) {
      try {
        await storyblok.delete(`/spaces/${spaceId}/assets/${oldAudio.id}`, {});
        console.log('🗑️ Old audio asset cleaned up');
      } catch (err) {
        console.log('⚠️ Could not delete old audio asset:', err);
      }
    }

    console.log('✅ Audio uploaded and linked to story successfully');
    return true;
  } catch (error) {
    console.error('❌ Error uploading audio to Storyblok:', error);
    return false;
  }
};

export const handler: Handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    console.log('🚀 Text-to-speech function started');
    
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const body = JSON.parse(event.body);
    const { space_id, story_id } = body;

    if (!space_id || !story_id) {
      throw new Error('space_id and story_id are required');
    }

    console.log('📋 Processing request for:', { space_id, story_id });

    // Step 1: Get story content
    const content = await getStoryContent(space_id, story_id);
    if (!content) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'The entry content is empty.' }),
      };
    }

    // Step 2: Generate audio
    const audioBuffer = await generateAudioFromText(content);
    if (!audioBuffer) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error while generating the audio.' }),
      };
    }

    // Step 3: Upload to Storyblok
    const uploadSuccess = await uploadAssetToStoryblok(audioBuffer, space_id, story_id);

    if (uploadSuccess) {
      console.log('🎉 Text-to-speech process completed successfully');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Text-to-Speech successfully created and uploaded.',
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Something went wrong during upload.' }),
      };
    }
  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};