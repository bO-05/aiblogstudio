import axios from 'axios';
import { GenerationRequest } from '../types';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const FAL_API_URL = 'https://fal.run/fal-ai/imagen4/preview/fast';

export const aiService = {
  async generateContent(request: GenerationRequest): Promise<{ title: string; content: string; excerpt: string }> {
    try {
      const wordCounts = {
        short: '300-500',
        medium: '800-1200',
        long: '1500-2000'
      };

      const toneInstructions = {
        professional: 'Use a professional, authoritative tone with industry insights and data-driven content.',
        casual: 'Write in a conversational, friendly tone that feels like talking to a knowledgeable friend.',
        humorous: 'Include humor, wit, and entertaining examples while maintaining informative content.'
      };

      const prompt = `Write a comprehensive blog post about "${request.theme}". 

Requirements:
- Length: ${wordCounts[request.length]} words
- Tone: ${toneInstructions[request.tone]}
- Include engaging headlines and subheadings
- Add practical examples and actionable insights
- Format with proper markdown structure

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "title": "Your compelling title here (max 60 characters)",
  "excerpt": "Your brief excerpt here (max 160 characters)",
  "content": "Your full blog post content in markdown format"
}

Do not include any other text, explanations, or formatting outside of this JSON structure.`;

      const response = await axios.post(
        MISTRAL_API_URL,
        {
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content.trim();
      console.log('Raw AI response:', content);
      
      try {
        // Clean the response - remove any markdown code blocks or extra formatting
        let cleanContent = content;
        
        // Remove markdown code block formatting if present
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON within the response
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }
        
        console.log('Cleaned content for parsing:', cleanContent);
        
        const parsed = JSON.parse(cleanContent);
        
        // Validate the parsed content
        if (!parsed.title || !parsed.content || !parsed.excerpt) {
          throw new Error('Missing required fields in AI response');
        }
        
        return {
          title: parsed.title.substring(0, 60), // Ensure title length limit
          content: parsed.content,
          excerpt: parsed.excerpt.substring(0, 160) // Ensure excerpt length limit
        };
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.log('Attempting fallback parsing...');
        
        // Fallback: extract title and use content as-is
        const lines = content.split('\n').filter(line => line.trim());
        let title = 'Generated Blog Post';
        let excerpt = '';
        let mainContent = content;
        
        // Try to find a title (look for # heading or "title" field)
        for (const line of lines) {
          if (line.startsWith('#') && !line.startsWith('##')) {
            title = line.replace('#', '').trim();
            break;
          }
          if (line.includes('"title"') && line.includes(':')) {
            const titleMatch = line.match(/"title":\s*"([^"]+)"/);
            if (titleMatch) {
              title = titleMatch[1];
              break;
            }
          }
        }
        
        // Generate excerpt from first paragraph
        const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));
        if (paragraphs.length > 0) {
          excerpt = paragraphs[0].substring(0, 160) + '...';
        } else {
          excerpt = content.substring(0, 160) + '...';
        }
        
        return { 
          title: title.substring(0, 60), 
          content: mainContent, 
          excerpt: excerpt.substring(0, 160)
        };
      }
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content. Please check your Mistral API key and try again.');
    }
  },

  async generateImage(theme: string): Promise<string> {
    try {
      console.log('🎨 Generating image with Imagen4 for theme:', theme);
      
      // Create an atmospheric, narrative-style prompt based on the blog theme
      const atmosphericPrompt = this.createAtmosphericPrompt(theme);
      
      console.log('🖼️ Generated atmospheric prompt:', atmosphericPrompt);

      const response = await axios.post(
        FAL_API_URL,
        {
          prompt: atmosphericPrompt,
          aspect_ratio: "16:9",
          num_images: 1
        },
        {
          headers: {
            'Authorization': `Key ${import.meta.env.VITE_FAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const imageUrl = response.data.images[0].url;
      console.log('✅ Imagen4 generated image URL:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error generating image with Imagen4:', error);
      // Return a placeholder image if generation fails
      return `https://picsum.photos/1200/630?random=${Date.now()}`;
    }
  },

  createAtmosphericPrompt(theme: string): string {
    // Analyze the theme and create contextual atmospheric prompts
    const lowerTheme = theme.toLowerCase();
    
    // Base atmospheric elements inspired by the example
    const baseStyle = "Atmospheric narrative illustration with clean linework and textured color fields, evoking a sense of place and story. Soft, warm lighting creates gentle highlights and soft-edged shadows. The style blends detailed environmental elements with expressive character work.";
    
    // Theme-specific scene generation
    let sceneDescription = '';
    let colorPalette = '';
    let mood = '';
    let environmentDetails = '';
    
    if (lowerTheme.includes('travel') || lowerTheme.includes('city') || lowerTheme.includes('cities') || lowerTheme.includes('destination')) {
      sceneDescription = "A thoughtful traveler with a backpack sitting at a small café table, studying a map or guidebook";
      environmentDetails = "bustling street scene with local architecture, street signs in foreign languages, vintage travel posters on walls, steam rising from coffee cups, glimpses of other travelers and locals";
      colorPalette = "muted earth tones and warm ochres with pops of vibrant blues in signage, golden sunset lighting, and rich burgundy accents";
      mood = "wanderlust and discovery amidst vibrant cultural surroundings";
    } else if (lowerTheme.includes('food') || lowerTheme.includes('cooking') || lowerTheme.includes('recipe') || lowerTheme.includes('cuisine')) {
      sceneDescription = "A person carefully preparing or enjoying a meal at a rustic wooden table";
      environmentDetails = "cozy kitchen or intimate restaurant setting with hanging herbs, vintage cookware, steam rising from dishes, warm pendant lighting, shelves lined with spices and ingredients";
      colorPalette = "warm terracotta and cream tones with pops of fresh green herbs, golden lighting, and rich amber accents";
      mood = "culinary passion and comfort amidst aromatic surroundings";
    } else if (lowerTheme.includes('tech') || lowerTheme.includes('digital') || lowerTheme.includes('ai') || lowerTheme.includes('future')) {
      sceneDescription = "A focused individual working at a sleek desk with modern devices, surrounded by subtle holographic displays";
      environmentDetails = "contemporary workspace with clean lines, soft ambient lighting from hidden sources, floating interface elements, plants adding organic warmth, city lights visible through large windows";
      colorPalette = "cool blues and teals with warm accent lighting, metallic silver details, and pops of electric cyan";
      mood = "innovation and contemplation in a harmonious tech environment";
    } else if (lowerTheme.includes('nature') || lowerTheme.includes('mountain') || lowerTheme.includes('hiking') || lowerTheme.includes('outdoor')) {
      sceneDescription = "An adventurer resting at a scenic overlook, consulting a trail map or enjoying a simple meal";
      environmentDetails = "mountain vista or forest clearing with detailed flora, weathered trail markers, camping gear, golden hour lighting filtering through trees, distant peaks or valleys";
      colorPalette = "forest greens and earth browns with warm golden sunlight, deep blue sky accents, and rich sunset oranges";
      mood = "peaceful adventure and connection with nature";
    } else if (lowerTheme.includes('business') || lowerTheme.includes('work') || lowerTheme.includes('career') || lowerTheme.includes('professional')) {
      sceneDescription = "A professional in a thoughtful moment, reviewing documents or planning at a well-organized workspace";
      environmentDetails = "modern office or co-working space with natural light, plants, organized shelving, quality materials, subtle technology integration, inspiring artwork";
      colorPalette = "sophisticated grays and whites with warm wood accents, pops of professional blue, and soft natural lighting";
      mood = "focused determination and professional growth";
    } else if (lowerTheme.includes('health') || lowerTheme.includes('wellness') || lowerTheme.includes('fitness') || lowerTheme.includes('lifestyle')) {
      sceneDescription = "A person in a moment of wellness - stretching, meditating, or preparing healthy food";
      environmentDetails = "serene space with natural elements, yoga mats or exercise equipment, fresh plants, natural lighting, water bottles, healthy ingredients";
      colorPalette = "calming sage greens and soft whites with natural wood tones, gentle blue accents, and warm natural lighting";
      mood = "tranquil self-care and mindful living";
    } else if (lowerTheme.includes('art') || lowerTheme.includes('creative') || lowerTheme.includes('design') || lowerTheme.includes('culture')) {
      sceneDescription = "An artist or creative person working intently at their craft, surrounded by tools and inspiration";
      environmentDetails = "artistic studio or creative space with easels, brushes, sketches on walls, natural light from large windows, organized chaos of creative materials";
      colorPalette = "rich artistic colors with paint-splattered surfaces, warm studio lighting, vibrant accent colors, and textured backgrounds";
      mood = "creative flow and artistic inspiration";
    } else {
      // Default atmospheric scene for any other theme
      sceneDescription = "A contemplative person engaged with the subject matter, reading or working at a comfortable setting";
      environmentDetails = "thoughtfully designed environment with books, plants, warm lighting, personal touches, and atmospheric details that suggest depth and story";
      colorPalette = "balanced warm and cool tones with soft lighting, natural textures, and harmonious color relationships";
      mood = "quiet focus and intellectual engagement";
    }
    
    // Construct the final atmospheric prompt
    const atmosphericPrompt = `${baseStyle} ${sceneDescription} in ${environmentDetails}. The mood is ${mood}. ${colorPalette}. The composition uses a slightly elevated perspective with sharp focus on the main subject and their immediate environment, while background elements are subtly detailed for depth. Subtle paper texture or digital grain is visible throughout, creating an illustrative, story-book quality that invites the viewer into the narrative.`;
    
    return atmosphericPrompt;
  }
};