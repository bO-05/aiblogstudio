import axios from 'axios';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export const elevenLabsService = {
  async generateAudio(text: string): Promise<string> {
    try {
      console.log('🎵 Generating audio with ElevenLabs...');
      
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }

      // Use Rachel voice ID (actual UUID for Rachel voice)
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

      // Convert blob to URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Audio generated successfully');
      return audioUrl;
    } catch (error) {
      console.error('❌ Error generating audio:', error);
      throw new Error('Failed to generate audio with ElevenLabs');
    }
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

    // Limit length for API constraints (ElevenLabs has character limits)
    if (cleanText.length > 2500) {
      cleanText = cleanText.substring(0, 2500) + '...';
    }

    return cleanText;
  },

  // For serverless function use
  async generateAudioBuffer(text: string): Promise<Buffer> {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }

      const voiceId = '21m00Tcm4TlvDq8ikWAM';
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
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error generating audio buffer:', error);
      throw error;
    }
  }
};