import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface BlogLayoutProps {
  children: React.ReactNode;
  title?: string;
  excerpt?: string;
  image?: string;
  publishedAt?: string;
  theme?: string;
  tone?: string;
  showBackButton?: boolean;
}

export default function BlogLayout({ 
  children, 
  title, 
  excerpt, 
  image, 
  publishedAt, 
  theme, 
  tone,
  showBackButton = false 
}: BlogLayoutProps) {
  // Debug image URL with more detailed logging
  React.useEffect(() => {
    if (image) {
      console.log('🖼️ BlogLayout - Image Debug:');
      console.log('  - Raw image value:', image);
      console.log('  - Type:', typeof image);
      console.log('  - Length:', image.length);
      console.log('  - Starts with http:', image.startsWith('http'));
      console.log('  - Is valid URL:', (() => {
        try {
          new URL(image);
          return true;
        } catch {
          return false;
        }
      })());
      
      // Test if the image URL is accessible
      const testImage = new Image();
      testImage.onload = () => {
        console.log('✅ Image URL is accessible and loads correctly:', image);
      };
      testImage.onerror = (e) => {
        console.error('❌ Image URL failed to load:', image);
        console.error('Error details:', e);
      };
      testImage.src = image;
    } else {
      console.log('⚠️ BlogLayout - No image provided');
    }
  }, [image]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showBackButton && (
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 text-purple-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Link>
          )}
          
          <div className="text-center">
            <Link to="/" className="inline-block mb-4">
              <h1 className="text-2xl font-bold">AI Blog Studio</h1>
            </Link>
            <nav className="flex justify-center space-x-6 text-sm">
              <Link to="/" className="hover:text-purple-200 transition-colors">Home</Link>
              <Link to="/blog" className="hover:text-purple-200 transition-colors">Blog</Link>
              <Link to="/login" className="hover:text-purple-200 transition-colors">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section for Individual Posts */}
      {title && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {image && (
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8 relative">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                  onLoad={(e) => {
                    console.log('✅ BlogLayout - Image loaded successfully:', image);
                    // Hide the fallback placeholder
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    console.error('❌ BlogLayout - Image failed to load:', image);
                    console.error('Error event:', e);
                    // Hide the image and show placeholder
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                  style={{ display: 'block' }}
                />
                {/* Fallback placeholder - hidden by default */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100 text-gray-500"
                  style={{ display: 'none' }}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">Image not available</p>
                    <p className="text-sm mt-1">The image could not be loaded</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              
              {excerpt && (
                <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                  {excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center space-x-6 text-sm text-gray-500">
                {publishedAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(publishedAt), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>AI Generated</span>
                </div>
                
                {theme && (
                  <div className="flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span className="capitalize">{theme}</span>
                  </div>
                )}
                
                {tone && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                    {tone} tone
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Powered by AI Blog Studio</p>
            <p className="text-sm">
              Content generated with Mistral LLM • Images by FAL AI • Published via Storyblok
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}