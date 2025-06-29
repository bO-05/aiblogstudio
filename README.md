# AI Blog Studio

A comprehensive AI-powered blog generation and management system with multimedia capabilities. Generate engaging blog posts with Mistral LLM, stunning images with Imagen4 AI, natural speech audio with ElevenLabs, and publish directly to Storyblok CMS.

## Features

### Core AI Capabilities
- **AI Content Generation**: Create compelling blog posts using Mistral LLM with customizable tone and length
- **AI Image Generation**: Generate beautiful, relevant images using Imagen4 AI (FAL AI)
- **AI Text-to-Speech**: Convert content to natural-sounding audio using ElevenLabs
- **Storyblok Integration**: Seamlessly publish multimedia content to Storyblok CMS

### Content Management
- **Timeline Management**: Track and manage all your generated content with audio status
- **Live Audio Playback**: Audio player component for blog posts with download functionality
- **Rate Limiting**: Protect API usage with rate limiting
- **Real-time Publishing**: Automatic deployment triggers via Storyblok webhooks

### User Experience
- **Responsive Design**: Modern interface that works on all devices
- **Authentication**: Secure admin access with session management
- **Multi-modal Content**: Support for text, images, and audio in a single workflow
- **Content Warnings**: Built-in AI hallucination warnings for responsible content consumption

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **CMS**: Storyblok
- **AI Services**: 
  - Mistral LLM (`mistral-large-latest`) for content generation
  - Imagen4 AI (`hidream-i1-full`) via FAL AI for image generation
  - ElevenLabs for text-to-speech audio generation
- **Storage**: LocalStorage (for MVP simplicity)
- **Authentication**: Custom session-based auth
- **Deployment**: Netlify (with serverless functions)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/bO-05/aiblogstudio.git
   cd aiblogstudio
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and configure:
   ```env
   # Storyblok Configuration
   VITE_STORYBLOK_TOKEN=your_storyblok_preview_token
   VITE_STORYBLOK_MANAGEMENT_TOKEN=your_storyblok_management_token
   VITE_STORYBLOK_SPACE_ID=your_space_id

   # AI Service Configuration
   VITE_MISTRAL_API_KEY=your_mistral_api_key
   VITE_FAL_API_KEY=your_fal_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # Authentication
   VITE_ADMIN_PASSWORD=your_admin_password

   # Rate Limiting
   VITE_MAX_REQUESTS_PER_HOUR=10

   # For Netlify Functions (Production)
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   STORYBLOK_MANAGEMENT_TOKEN=your_storyblok_management_token
   PRODUCTION_DOMAIN=https://your-domain.netlify.app
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## Setup Requirements

### Storyblok Setup
1. Create a Storyblok account and space
2. Create a `blog_post` content type with fields:
   - `title` (Text)
   - `content` (Rich Text)
   - `excerpt` (Text)
   - `image` (Asset) - allow external URL
   - `audio` (Asset)
   - `theme` (Text)
   - `tone` (Text)
3. Get your Preview Token and Management Token
4. Set up webhooks for automatic deployment

### AI Service Setup
- **Mistral API**: Get your API key from [Mistral AI](https://console.mistral.ai/)
- **FAL AI**: Get your API key from [FAL AI](https://fal.ai/)
- **ElevenLabs**: Get your API key from [ElevenLabs](https://elevenlabs.io/)

### Netlify Deployment
1. Connect your repository to Netlify
2. Add all environment variables to Netlify
3. The `netlify/functions/text-to-speech.js` function will handle audio generation in production

## Usage

### Content Creation Workflow
1. **Access Admin Panel**: Visit `/login` and enter your admin password
2. **Generate Content**: Use the generation form to create blog posts with AI
3. **Add Audio**: Generate text-to-speech audio for accessibility and engagement
4. **Manage Posts**: View and edit posts in the Timeline with audio status indicators
5. **Publish**: Send multimedia posts to Storyblok with one click
6. **View Live**: Published posts appear on your homepage and blog with audio playback

### Audio Features
- **Timeline Audio Generation**: Generate audio for any post in the timeline
- **Live Blog Audio**: Audio players automatically appear on published blog posts
- **Retroactive Audio**: Add audio to previously published posts
- **Download Support**: Users can download audio files for offline listening

## Deployment

### Netlify Deployment
1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Add environment variables (including serverless function variables)
   - Deploy

3. **Configure Storyblok Webhooks**
   - Add your Netlify deploy hook URL to Storyblok
   - Enable auto-deployment on content changes

### Environment Variables for Production
Ensure these are set in Netlify:
```
VITE_STORYBLOK_TOKEN=your_preview_token
VITE_STORYBLOK_MANAGEMENT_TOKEN=your_management_token
VITE_STORYBLOK_SPACE_ID=your_space_id
VITE_MISTRAL_API_KEY=your_mistral_key
VITE_FAL_API_KEY=your_fal_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_ADMIN_PASSWORD=your_password
VITE_MAX_REQUESTS_PER_HOUR=10

# For serverless functions
ELEVENLABS_API_KEY=your_elevenlabs_key
STORYBLOK_MANAGEMENT_TOKEN=your_management_token
PRODUCTION_DOMAIN=https://your-domain.netlify.app
```

## Design Philosophy

- **Modern Aesthetics**: Clean, professional design with subtle animations
- **Accessibility First**: Audio support and proper contrast ratios
- **User Experience**: Intuitive workflow from generation to multimedia publication
- **Performance**: Optimized for speed and responsiveness
- **Responsible AI**: Clear warnings about AI-generated content limitations

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── AudioPlayer.tsx  # Audio playback component
│   ├── BlogLayout.tsx   # Blog post layout with audio support
│   └── ...
├── pages/              # Route components
├── services/           # API integrations
│   ├── aiService.ts    # Mistral LLM + Imagen4 AI
│   ├── elevenLabsService.ts # Text-to-speech
│   └── storyblokService.ts  # CMS integration
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── App.tsx             # Main application

netlify/
└── functions/
    └── text-to-speech.js # Serverless audio generation
```

## Project Structure

```
├── .env.example
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── netlify.toml
├── netlify/
│   └── functions/
│       └── text-to-speech.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   └── _redirects
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── BlogLayout.tsx
│   │   ├── BlogPostCard.tsx
│   │   ├── EditPostModal.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RichTextRenderer.tsx
│   │   └── SuccessModal.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── pages/
│   │   ├── Admin.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   └── Timeline.tsx
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── debug.ts
│   │   ├── elevenLabsService.ts
│   │   └── storyblokService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── rateLimiter.ts
│   │   └── storage.ts
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Future Enhancements

- Multi-user support with role-based access
- Advanced analytics and engagement metrics
- Social media integration and sharing
- Content scheduling and automation
- SEO optimization tools with audio transcripts
- Custom AI model fine-tuning
- Podcast generation from blog content
- Multi-language support with voice cloning

## Important Notes

### AI Content Disclaimer
This application generates content using AI models. Users should be aware that:
- AI can sometimes produce incorrect information or "hallucinate" facts
- All AI-generated content should be reviewed and fact-checked
- The application includes built-in warnings about AI limitations
- Users are responsible for verifying information before publication

### Audio Generation
- ElevenLabs integration works in both development and production
- Audio files are generated as blob URLs for local storage
- Production uses Netlify serverless functions for audio generation
- Audio can be added to existing published posts retroactively

## Highlights

This project showcases:
- **Complete AI Integration**: Text, image, and audio generation in one workflow
- **Storyblok Mastery**: Full CRUD operations with the Management API
- **Multimedia Publishing**: Seamless handling of text, images, and audio
- **Production Ready**: Professional-grade code with serverless architecture
- **Accessibility Focus**: Audio support for inclusive content consumption
- **Responsible AI**: Proper warnings and disclaimers for AI-generated content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [bO-05](https://github.com/bO-05) 2025

**Experience the future of multimedia content creation with AI-powered blogging!**