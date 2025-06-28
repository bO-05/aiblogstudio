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
    const lowerTheme = theme.toLowerCase();
    
    // Base atmospheric style following the original example structure
    const baseStyle = "Atmospheric narrative illustration with clean linework and textured color fields, evoking a sense of place and story. Soft, warm lighting creates gentle highlights and soft-edged shadows. The style blends detailed environmental elements with expressive character work.";
    
    // Advanced theme analysis with multiple keyword detection
    let sceneConfig = this.analyzeThemeForScene(lowerTheme);
    
    // Construct the final atmospheric prompt following the original structure
    const atmosphericPrompt = `${baseStyle} ${sceneConfig.mainSubject} in ${sceneConfig.environment}. The mood is ${sceneConfig.mood}. ${sceneConfig.lighting} The background features ${sceneConfig.backgroundElements}. ${sceneConfig.characterDescription} The color palette ${sceneConfig.colorPalette}. Subtle paper texture or digital grain is visible throughout. ${sceneConfig.focusDescription}`;
    
    return atmosphericPrompt;
  },

  analyzeThemeForScene(theme: string) {
    // Financial/Money themes
    if (theme.includes('passive income') || theme.includes('investment') || theme.includes('financial')) {
      return {
        mainSubject: "A confident person reviewing financial charts and documents at an elegant home office setup with multiple monitors displaying growth graphs",
        environment: "a sophisticated home office with floor-to-ceiling windows overlooking a city skyline, modern furniture, and subtle luxury touches like a leather chair and premium coffee setup",
        mood: "ambitious success and financial confidence",
        lighting: "Natural daylight streaming through large windows creates dynamic shadows across the desk surface and illuminates the glowing screens.",
        backgroundElements: "detailed elements like stock market tickers on wall-mounted screens, a bookshelf with financial literature, a vintage globe, plants adding life to the space, and glimpses of the bustling city below through the windows.",
        characterDescription: "The person, viewed from a three-quarter angle, leans back thoughtfully in their chair while holding a tablet, rendered with confident posture and focused expression.",
        colorPalette: "combines deep navy and charcoal tones with warm gold accents from the screens, pops of green from financial growth indicators, and natural wood textures, creating a sophisticated yet approachable atmosphere.",
        focusDescription: "Focus is sharp on the character and their immediate workspace with the financial displays clearly visible."
      };
    }
    
    // Productivity/Efficiency themes
    else if (theme.includes('productivity') || theme.includes('efficiency') || theme.includes('hack') || theme.includes('time management')) {
      return {
        mainSubject: "An energetic person organizing colorful sticky notes and task boards in a bright, minimalist workspace with analog and digital planning tools",
        environment: "a clean, organized creative studio with natural light, cork boards covered in colorful planning materials, and a mix of analog tools like notebooks and digital devices",
        mood: "focused energy and systematic organization",
        lighting: "Bright natural light from a large window creates crisp shadows and highlights the vibrant colors of the planning materials.",
        backgroundElements: "detailed elements like color-coded calendars on the wall, a collection of different colored pens and markers in holders, a sleek laptop displaying a productivity app, plants on floating shelves, and a minimalist clock showing optimal timing.",
        characterDescription: "The person, captured from a slightly elevated angle, stands while arranging materials on a standing desk, with dynamic body language suggesting active engagement and movement.",
        colorPalette: "features bright whites and light grays as a base with vibrant pops of orange, blue, and yellow from the organizational tools, creating an energetic and motivating environment.",
        focusDescription: "Focus is sharp on the planning materials and the person's hands actively organizing, with the workspace tools clearly detailed."
      };
    }
    
    // Technology/Digital themes
    else if (theme.includes('tech') || theme.includes('digital') || theme.includes('ai') || theme.includes('software') || theme.includes('app')) {
      return {
        mainSubject: "A tech-savvy individual coding on multiple screens in a futuristic workspace with holographic displays and ambient lighting",
        environment: "a cutting-edge tech lab with curved monitors, LED strip lighting, and sleek surfaces reflecting the glow of various displays and interfaces",
        mood: "innovative focus and digital mastery",
        lighting: "Ambient LED lighting in cool blues and purples creates a futuristic atmosphere, with screen glow providing key lighting on the person's face.",
        backgroundElements: "detailed elements like floating interface elements, code streaming across screens, a collection of the latest tech gadgets, cable management systems, and subtle holographic projections in the background.",
        characterDescription: "The person, shown from a side angle, types rapidly with both hands while looking at multiple screens, demonstrating fluid interaction with technology.",
        colorPalette: "dominated by cool blues and teals with electric cyan accents from the screens, metallic silver surfaces, and warm amber highlights from accent lighting, creating a high-tech yet human environment.",
        focusDescription: "Focus is sharp on the person's hands on the keyboard and the nearest screen displaying code, with other screens softly blurred for depth."
      };
    }
    
    // Health/Wellness themes
    else if (theme.includes('health') || theme.includes('wellness') || theme.includes('fitness') || theme.includes('mental health') || theme.includes('meditation')) {
      return {
        mainSubject: "A serene person practicing yoga or meditation in a peaceful outdoor setting surrounded by nature",
        environment: "a tranquil garden terrace or rooftop space with lush plants, natural materials like bamboo and stone, and a view of distant mountains or trees",
        mood: "peaceful mindfulness and inner balance",
        lighting: "Golden hour sunlight filters through leaves creating dappled light patterns on the yoga mat and surrounding surfaces.",
        backgroundElements: "detailed elements like a variety of green plants in natural planters, a small water feature creating gentle sounds, meditation cushions, essential oil diffusers with visible mist, and birds or butterflies adding life to the scene.",
        characterDescription: "The person, captured in a graceful yoga pose from a respectful distance, embodies calm concentration with flowing, natural movement.",
        colorPalette: "features calming sage greens and earth browns with soft cream tones, accented by the warm golden light and touches of lavender from flowering plants, creating a naturally harmonious palette.",
        focusDescription: "Focus is on the person's pose and the immediate natural environment, with background elements softly detailed to maintain the peaceful atmosphere."
      };
    }
    
    // Travel/Adventure themes
    else if (theme.includes('travel') || theme.includes('destination') || theme.includes('city') || theme.includes('adventure') || theme.includes('nomad')) {
      return {
        mainSubject: "An adventurous traveler exploring a vibrant local market or street scene with authentic cultural elements",
        environment: "a bustling international marketplace with colorful stalls, local architecture, street art, and authentic cultural details that suggest a specific but welcoming location",
        mood: "curious exploration and cultural discovery",
        lighting: "Warm, natural sunlight creates interesting shadows between market stalls and highlights the textures of local crafts and foods.",
        backgroundElements: "detailed elements like vendors with traditional clothing, colorful textiles and crafts hanging from stalls, street food with steam rising, local signage in foreign scripts, and other travelers and locals creating a lively atmosphere.",
        characterDescription: "The traveler, shown from behind or in profile, examines local goods with genuine interest, wearing practical travel gear and carrying a camera or guidebook.",
        colorPalette: "rich with warm earth tones and vibrant market colors - deep reds, golden yellows, and turquoise blues from textiles and crafts, creating an authentic and inviting cultural atmosphere.",
        focusDescription: "Focus is on the traveler's interaction with the local environment, with market details and cultural elements clearly visible and inviting."
      };
    }
    
    // Food/Cooking themes
    else if (theme.includes('food') || theme.includes('cooking') || theme.includes('recipe') || theme.includes('cuisine') || theme.includes('restaurant')) {
      return {
        mainSubject: "A passionate chef or home cook preparing an elaborate meal in a warm, inviting kitchen filled with fresh ingredients",
        environment: "a rustic-modern kitchen with natural wood surfaces, hanging herbs, copper pots, and windows showing an herb garden outside",
        mood: "culinary passion and creative satisfaction",
        lighting: "Warm pendant lighting over the cooking area combines with natural light from windows to create an inviting glow on the ingredients and cooking surfaces.",
        backgroundElements: "detailed elements like fresh vegetables and herbs scattered artfully, steam rising from pans, shelves lined with spices in glass jars, vintage cookbooks, and a collection of well-used cooking tools.",
        characterDescription: "The cook, captured mid-preparation with flour-dusted hands, demonstrates skilled technique while tasting or seasoning, showing genuine enjoyment of the cooking process.",
        colorPalette: "warm terracotta and cream tones with rich browns from wooden surfaces, vibrant greens from fresh herbs, and golden highlights from the lighting, creating a cozy and appetizing atmosphere.",
        focusDescription: "Focus is sharp on the cooking action and fresh ingredients, with kitchen details providing rich context and depth."
      };
    }
    
    // Business/Career themes
    else if (theme.includes('business') || theme.includes('career') || theme.includes('leadership') || theme.includes('entrepreneur') || theme.includes('startup')) {
      return {
        mainSubject: "A confident professional presenting ideas to a diverse team in a modern collaborative workspace",
        environment: "a contemporary co-working space with glass walls, natural materials, and flexible furniture arrangements that encourage collaboration and creativity",
        mood: "dynamic leadership and collaborative innovation",
        lighting: "Natural light from large windows is supplemented by modern pendant lights, creating a bright, energetic atmosphere perfect for productive meetings.",
        backgroundElements: "detailed elements like whiteboards with strategic diagrams, laptops displaying presentations, plants adding warmth to the modern space, coffee cups suggesting long productive sessions, and city views through windows.",
        characterDescription: "The presenter, captured mid-gesture while explaining concepts, demonstrates confident body language and engaging communication style, with team members visible showing active participation.",
        colorPalette: "sophisticated grays and whites with warm wood accents, pops of corporate blue from technology, and green from plants, creating a professional yet approachable business environment.",
        focusDescription: "Focus is on the presenter and the immediate presentation area, with team dynamics and workspace details clearly supporting the collaborative narrative."
      };
    }
    
    // Creative/Art themes
    else if (theme.includes('creative') || theme.includes('art') || theme.includes('design') || theme.includes('writing') || theme.includes('music')) {
      return {
        mainSubject: "An inspired artist working on a large canvas in a light-filled studio space surrounded by creative materials and works in progress",
        environment: "an artist's studio with high ceilings, large north-facing windows, easels with paintings at various stages, and organized chaos of creative supplies",
        mood: "artistic inspiration and creative flow",
        lighting: "Soft, even north light from large windows provides ideal conditions for color work, with some warm accent lighting for evening sessions.",
        backgroundElements: "detailed elements like paint palettes with mixed colors, brushes in jars, sketches pinned to walls, sculptures or pottery on shelves, and canvases leaning against walls showing the artist's range.",
        characterDescription: "The artist, captured in a moment of focused creation, holds a brush while stepping back to evaluate their work, showing the contemplative nature of the creative process.",
        colorPalette: "rich artistic colors with paint-splattered surfaces, warm studio lighting mixing with cool natural light, and vibrant accent colors from artworks, creating an inspiring and authentic creative environment.",
        focusDescription: "Focus is on the artist and their current work, with studio details and other artworks providing rich creative context."
      };
    }
    
    // Default fallback for any other theme
    else {
      return {
        mainSubject: "A thoughtful individual engaged in research and planning at a comfortable workspace with books and digital resources",
        environment: "a cozy study or library corner with built-in bookshelves, comfortable seating, and a mix of traditional and modern elements",
        mood: "quiet contemplation and intellectual curiosity",
        lighting: "Warm reading light from a desk lamp combines with soft natural light from a nearby window, creating perfect conditions for focused work.",
        backgroundElements: "detailed elements like open books with visible text, notebooks with handwritten notes, a steaming cup of tea, reading glasses, and plants adding life to the scholarly environment.",
        characterDescription: "The person, shown in a natural reading pose, demonstrates deep engagement with their material, whether taking notes or thoughtfully considering information.",
        colorPalette: "warm browns and creams from books and wood furniture, soft greens from plants, and golden light creating a timeless, scholarly atmosphere.",
        focusDescription: "Focus is on the person and their immediate reading materials, with the scholarly environment providing rich contextual detail."
      };
    }
  }
};