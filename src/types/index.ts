export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  theme: string;
  tone: 'professional' | 'casual' | 'humorous';
  length: 'short' | 'medium' | 'long';
  status: 'draft' | 'generated' | 'published';
  createdAt: string;
  publishedAt?: string;
  storyblokId?: string;
}

export interface GenerationRequest {
  theme: string;
  tone: 'professional' | 'casual' | 'humorous';
  length: 'short' | 'medium' | 'long';
}

export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug?: string;
  content: {
    title?: string;
    content?: string;
    excerpt?: string;
    image?: string;
    theme?: string;
    tone?: string;
  };
  published_at?: string;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}