import axios from 'axios';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export const elevenLabsService = {
  async generateAudio(text: string): Promise<string> {
    try {
      console.log('🎵 Starting audio generation...');
      
      // Try production Netlify function first if available
      if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
        console.log('🌐 Using production Netlify function for audio generation');
        try {
          const audioUrl = await this.generateAudioViaNetlify(text);
          console.log('✅ Production audio generation successful');
          return audioUrl;
        } catch (netlifyError) {
          console.warn('⚠️ Netlify function failed, falling back to client-side generation:', netlifyError);
        }
      }
      
      // Fallback to client-side generation for development
      console.log('🔧 Using client-side audio generation');
      return await this.generateAudioClientSide(text);
    } catch (error: any) {
      console.error('❌ Complete audio generation failure:', error);
      throw new Error('Failed to generate audio. Please check your ElevenLabs configuration.');
    }
  },

  async generateAudioViaNetlify(text: string): Promise<string> {
    try {
      const response = await fetch('/.netlify/functions/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Netlify function failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.audio) {
        throw new Error('No audio data received from Netlify function');
      }

      // Convert base64 to data URL
      const audioDataUrl = `data:${data.contentType};base64,${data.audio}`;
      console.log('✅ Netlify function returned audio data URL');
      return audioDataUrl;
    } catch (error) {
      console.error('❌ Netlify function error:', error);
      throw error;
    }
  },

  async generateAudioClientSide(text: string): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }

      // Use Rachel voice ID
      const voiceId = '21m00Tcm4TlvDq8ikWAM';
      
      // Clean and prepare text for TTS
      const cleanText = this.prepareTextForTTS(text);
      
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/${voiceId}`,
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
          responseType: 'blob'
        }
      );

      // Convert blob to base64 data URL for persistent storage
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const base64Audio = await this.blobToBase64(audioBlob);
      
      console.log('✅ Client-side audio generated as data URL');
      return base64Audio;
    } catch (error: any) {
      console.error('❌ Client-side audio generation error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('ElevenLabs voice not found. Please check the voice ID.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your credentials.');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to generate audio with ElevenLabs');
      }
    }
  },

  // Convert blob to base64 data URL for persistent storage
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  prepareTextForTTS(content: string): string {
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
  }
};