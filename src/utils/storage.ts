import { BlogPost } from '../types';

const STORAGE_KEY = 'ai-blog-studio-posts';
const AUTH_KEY = 'ai-blog-studio-auth';

export const storage = {
  getPosts: (): BlogPost[] => {
    try {
      const posts = localStorage.getItem(STORAGE_KEY);
      return posts ? JSON.parse(posts) : [];
    } catch {
      return [];
    }
  },

  savePosts: (posts: BlogPost[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  addPost: (post: BlogPost) => {
    const posts = storage.getPosts();
    posts.unshift(post);
    storage.savePosts(posts);
  },

  updatePost: (id: string, updates: Partial<BlogPost>) => {
    const posts = storage.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      storage.savePosts(posts);
    }
  },

  deletePost: (id: string) => {
    const posts = storage.getPosts();
    const filtered = posts.filter(p => p.id !== id);
    storage.savePosts(filtered);
  },

  isAuthenticated: (): boolean => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (!auth) return false;
    
    try {
      const { timestamp } = JSON.parse(auth);
      // Session expires after 24 hours
      return Date.now() - timestamp < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  },

  setAuthenticated: () => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ timestamp: Date.now() }));
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};