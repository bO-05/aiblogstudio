# AI Blog Studio

A beautiful AI-powered blog generation and management system. Generate engaging blog posts with Mistral LLM and stunning images with FAL AI, then publish directly to Storyblok CMS.

## 🚀 Features

- **AI Content Generation**: Create compelling blog posts using Mistral LLM with customizable tone and length
- **AI Image Generation**: Generate beautiful, relevant images using FAL AI
- **Storyblok Integration**: Seamlessly publish content to Storyblok CMS
- **Timeline Management**: Track and manage all your generated content
- **Rate Limiting**: Protect API usage with intelligent rate limiting
- **Responsive Design**: Beautiful, modern interface that works on all devices
- **Authentication**: Secure admin access with session management
- **Real-time Publishing**: Automatic deployment triggers via Storyblok webhooks

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **CMS**: Storyblok
- **AI Services**: 
  - Mistral LLM (`mistral-large-latest`) for content generation
  - FAL AI (`hidream-i1-full`) for image generation
- **Storage**: LocalStorage (for MVP simplicity)
- **Authentication**: Custom session-based auth
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ai-blog-studio
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

   # Authentication
   VITE_ADMIN_PASSWORD=your_admin_password

   # Rate Limiting
   VITE_MAX_REQUESTS_PER_HOUR=10
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Setup Requirements

### Storyblok Setup
1. Create a Storyblok account and space
2. Create a `blog_post` content type with fields:
   - `title` (Text)
   - `content` (Rich Text)
   - `excerpt` (Text)
   - `image` (Asset)
   - `theme` (Text)
   - `tone` (Text)
3. Get your Preview Token and Management Token
4. Set up webhooks for automatic deployment

### AI Service Setup
- **Mistral API**: Get your API key from [Mistral AI](https://console.mistral.ai/)
- **FAL AI**: Get your API key from [FAL AI](https://fal.ai/)

## 🎯 Usage

1. **Access Admin Panel**: Visit `/login` and enter your admin password
2. **Generate Content**: Use the generation form to create blog posts
3. **Manage Posts**: View and edit posts in the Timeline
4. **Publish**: Send posts to Storyblok with one click
5. **View Live**: Published posts appear on your homepage

## 🔄 Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Add environment variables
   - Deploy

3. **Configure Storyblok Webhooks**
   - Add your Vercel deploy hook URL to Storyblok
   - Enable auto-deployment on content changes

## 🎨 Design Philosophy

- **Modern Aesthetics**: Clean, professional design with subtle animations
- **User Experience**: Intuitive workflow from generation to publication
- **Performance**: Optimized for speed and responsiveness
- **Accessibility**: WCAG-compliant design patterns

## 🔧 Architecture

```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── services/           # API integrations
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── App.tsx             # Main application
```

## 🚀 Future Enhancements

- Multi-user support
- Advanced analytics
- Social media integration
- Content scheduling
- SEO optimization tools
- Custom AI model fine-tuning

## 🏆 Highlights

This project showcases:
- **Storyblok Integration**: Full CRUD operations with the Management API
- **AI Innovation**: Dual AI services for comprehensive content creation
- **Production Ready**: Professional-grade code and design
- **User Experience**: Smooth, intuitive interface
- **Technical Excellence**: Modern React patterns and TypeScript

Built with ❤️ by [async-dime](https://dev.to/async_dime) 2025