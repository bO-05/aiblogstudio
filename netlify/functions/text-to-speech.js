// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice UUID

// Utility to obfuscate sensitive tokens in logs
const obfuscateToken = (token) => {
  if (!token) return 'undefined';
  if (token.length <= 8) return '***';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
};

const prepareTextForTTS = (content) => {
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

const generateAudioFromText = async (text) => {
  try {
    console.log('🎵 Generating audio with ElevenLabs...');
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    console.log('🔑 Using ElevenLabs API key:', obfuscateToken(apiKey));

    const cleanText = prepareTextForTTS(text);
    console.log('📝 Text prepared for TTS, length:', cleanText.length);
    
    const response = await fetch(
      `${ELEVENLABS_API_URL}/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    console.log('✅ Audio generated successfully');
    return await response.arrayBuffer();
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    throw error;
  }
};

exports.handler = async (event) => {
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
    const { text } = body;

    if (!text) {
      throw new Error('text parameter is required');
    }

    console.log('📋 Processing text-to-speech request');

    // Generate audio
    const audioBuffer = await generateAudioFromText(text);
    if (!audioBuffer) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error while generating the audio.' }),
      };
    }

    // Convert ArrayBuffer to base64 for response
    const audioArray = new Uint8Array(audioBuffer);
    const audioBase64 = Buffer.from(audioArray).toString('base64');

    console.log('🎉 Text-to-speech process completed successfully');
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Text-to-Speech successfully generated.',
        audio: audioBase64,
        contentType: 'audio/mpeg'
      }),
    };
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